import {
  createThing, getSolidDataset, getThing, getThingAll, getUrl,
  addUrl, setThing, saveSolidDatasetAt, createContainerAt, Thing, getInteger,
  getStringNoLocale, removeThing, getContainedResourceUrlAll, deleteSolidDataset,
  setStringNoLocale, addStringNoLocale, isContainer, addInteger, buildThing, setDate, getDate, getBoolean,
  addBoolean, setInteger, setBoolean, addDate, getDateAll, SolidDataset, WithServerResourceInfo, ThingPersisted, getIri,
  getStringNoLocaleAll,
  createSolidDataset,
  saveSolidDatasetInContainer
} from '@inrupt/solid-client';
import { DCTERMS, RDF } from '@inrupt/vocab-common-rdf';
import { solid, schema, foaf, vcard } from 'rdf-namespaces';
import { Note, fetcher, Habit, voc, otherV, accessObject, appNotification } from './types';
import { determineAccess, initializeAcl, setPubAccess } from './access';
import { updUrlForFolder } from './helpers';
import { getAllUrlFromPublicIndex, getInboxUrl } from './podGetters';

export const thingToNotification = (toChange: Thing) => {
  const updStatus = getBoolean(toChange, solid.read);
  const updSender = getIri(toChange, schema.sender);
  const updAccess = getStringNoLocaleAll(toChange, "http://purl.org/dc/terms/accessRights");
  let updEntryType = getIri(toChange, solid.forClass);
  const updId = getInteger(toChange, schema.identifier);
  const updUrl = getIri(toChange, schema.url);

  if (updStatus || updStatus === null || !updSender || !updEntryType || !updId || updAccess.length === 0 || !updUrl) {
    return null;
  }
  if (!updAccess.includes("read") && !updAccess.includes("append") && !updAccess.includes("write")) return null;


  else {
    if (updEntryType === schema.TextDigitalDocument) updEntryType = 'note'
    else updEntryType = 'habit'
    const accObj: accessObject = { read: false, append: false, write: false };
    if (updAccess.includes("read")) {
      accObj.read = true;
    }
    if (updAccess.includes("append")) {
      accObj.append = true;
    }
    if (updAccess.includes("write")) {
      accObj.write = true;
    }

    const notification: appNotification = {
      id: updId,
      url: updUrl,
      status: updStatus,
      sender: updSender,
      entryType: updEntryType,
      access: accObj
    }
    return notification;
  }
}
/**
 * returns a note from a given thing
 * @param   {Thing | null} toChange thing to transform
 * @param   {string} webId webId of the user
 * @param   {fetcher} fetch fetch function
 * @param   {string} storagePref url of user's preferred storage location
 * @param   {string} prefFileLocation url of user's preference file location
 * @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
 * @return  {Promise<Note | null>} Note generated from a given thing
 */
export const thingToNote = async (toChange: Thing | null, webId: string, fetch: fetcher, storagePref: string,
  prefFileLocation: string, podType: string): Promise<Note | null> => {
  if (!toChange) {
    return null;
  }
  const updTitle = getStringNoLocale(toChange, DCTERMS.title) ? getStringNoLocale(toChange, DCTERMS.title) : "";
  const updContent = getStringNoLocale(toChange, schema.text) ? getStringNoLocale(toChange, schema.text) : "";
  const updId = getInteger(toChange, schema.identifier) ? getInteger(toChange, schema.identifier) :
    Date.now() + Math.floor(Math.random() * 1000);
  const updCategory = getStringNoLocale(toChange, otherV.category);
  let getAcc;
  try {
    getAcc = await determineAccess(webId, toChange.url, fetch, storagePref, prefFileLocation, podType);
  }
  catch {
    getAcc = [null];
  }
  const note: Note = {
    id: updId,
    title: updTitle,
    content: updContent,
    category: updCategory,
    url: toChange.url,
    access: getAcc[0] ? getAcc[0] : null,
    ...(getAcc[1] && { shareList: getAcc[1] })
  };
  return note;
}

/**
 * returns a habit from a given thing
 * @param   {Thing | null} toChange thing to transform
 * @param   {string} webId webId of the user
 * @param   {fetcher} fetch fetch function
 * @param   {string} storagePref url of user's preferred storage location
 * @param   {string} prefFileLocation url of user's preference file location
 * @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
 * @return  {Promise<Habit | null>} habit generated from a given thing
 */
export const thingToHabit = async (toChange: Thing | null, webId: string, fetch: fetcher, storagePref: string,
  prefFileLocation: string, podType: string): Promise<Habit | null> => {
  if (!toChange) {
    return null;
  }
  const updTitle = getStringNoLocale(toChange, DCTERMS.title) ? getStringNoLocale(toChange, DCTERMS.title) : "";
  const updContent = getStringNoLocale(toChange, schema.text) ? getStringNoLocale(toChange, schema.text) : "";
  const updId = getInteger(toChange, schema.identifier) ? getInteger(toChange, schema.identifier) :
    Date.now() + Math.floor(Math.random() * 1000);
  const updCategory = getStringNoLocale(toChange, otherV.category);
  const updStartDate = getDate(toChange, "http://www.oegov.org/core/owl/gc#startDate");
  const updLastCheckInDate = getDate(toChange, voc.lastCheckInDate);
  const updBestStreak = getInteger(toChange, voc.bestStreak);
  const updCurrentStreak = getInteger(toChange, voc.currentStreak);
  const updStatus = getBoolean(toChange, "http://dbpedia.org/ontology/status");
  const updRecurrence = getStringNoLocale(toChange, voc.recurrence);
  const updCustom = getStringNoLocale(toChange, voc.custom);
  const updCheckInList = getDateAll(toChange, voc.checkInDate);
  let newCustomValue: number[] | number | null = null;
  const getColor = getStringNoLocale(toChange, schema.color);
  const updColor = getColor ? getColor : "#3e619b";
  if (updCustom) {
    const customArr = updCustom.split(" ");
    if (customArr.length === 1 && parseInt(customArr[0])) {
      newCustomValue = parseInt(customArr[0]);
    }
    else {
      newCustomValue = customArr.map((value) => parseInt(value));
    }
  }
  let getAcc;
  try {
    getAcc = await determineAccess(webId, toChange.url, fetch, storagePref, prefFileLocation, podType);
  }
  catch {
    getAcc = [null];
  }
  const habit: Habit = {
    color: updColor,
    stat: updStatus ? true : false,
    id: updId,
    title: updTitle,
    content: updContent,
    category: updCategory,
    lastCheckInDate: updLastCheckInDate,
    bestStreak: updBestStreak,
    currentStreak: updCurrentStreak,
    recurrence: updRecurrence,
    url: toChange.url,
    startDate: updStartDate,
    custom: newCustomValue,
    checkInList: updCheckInList,
    prevBestStreak: null,
    prevLastCheckIn: null,
    access: getAcc[0] ? getAcc[0] : null,
    ...(getAcc[1] && { shareList: getAcc[1] })
  };
  return habit;
}

/**
 * creates folders used by the application, in case if they are missing
 * @param   {fetcher} fetch fetch function
 * @param   {string} storagePref url of user's preferred storage location
 * @param   {string} prefFileLocation url of user's preference file location
 * @return  {Promise<void>} 
 */
export const repairDefaultFolder = async (fetch: fetcher, storagePref: string, prefFileLocation: string): Promise<void> => {
  const defaultFolderPath = `${storagePref}SolidPlannerApp`;
  let dataSet;
  try {
    dataSet = await getSolidDataset(prefFileLocation, {
      fetch: fetch
    });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    throw new Error(`error when fetching preference file, it either doesn't exist, or has different location from the one specified in the webId, error: ${message}`);
  }
  let aThing = getThing(dataSet, prefFileLocation);
  if (!aThing) {
    throw new Error("preference file does not exist");
  }
  aThing = addUrl(aThing, voc.defaultFolder, updUrlForFolder(defaultFolderPath));
  dataSet = setThing(dataSet, aThing);
  await saveSolidDatasetAt(prefFileLocation, dataSet, { fetch: fetch });
}

/**
* wrapper function that calls @see repairDefaultFolder @see createDefFolder would create folders to 
* store notes and habit 
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} publicTypeIndexUrl url of user's public type index file
* @param   {string} podType denotes what access control mechanisms user's POD uses, can be wac or acp
* @return  {Promise<void>} 
*/
export const recordDefaultFolder = async (webId: string, fetch: fetcher, storagePref: string, prefFileLocation: string,
  publicTypeIndexUrl: string, podType: string): Promise<void> => {
  await repairDefaultFolder(fetch, storagePref, prefFileLocation);
  await createDefFolder(webId, fetch, storagePref, prefFileLocation, podType);
}

/**
* creates entries in user's public type index file, for voc.Habit or schema.TextDigitalDocument
* @param   {fetcher} fetch fetch function
* @param   {string} entry type of entry to create a record for: note or habit
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} publicTypeIndexUrl url of user's public type index file
* @return  {Promise<void>} 
*/
export const createEntriesInTypeIndex = async (fetch: fetcher, entry: string, storagePref: string,
  publicTypeIndexUrl: string
): Promise<void> => {
  const defaultFolderPath = `${storagePref}SolidPlannerApp`;
  let url = "";
  if (entry === 'note') {
    url = `${defaultFolderPath}/notes/`;
  }
  else {
    url = `${defaultFolderPath}/habits/`;
  }
  let dataSet;
  try {
    dataSet = await getSolidDataset(publicTypeIndexUrl, {
      fetch: fetch
    });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    throw new Error(`error when fetching public type index file, it either doesn't exist, or has different location from the one specified in the webId, error: ${message}`);
  }
  const aThing = buildThing(createThing())
    .addIri(solid.forClass, entry === "note" ? schema.TextDigitalDocument : voc.Habit)
    .addIri(solid.instance, url)
    .build();
  dataSet = setThing(dataSet, aThing);
  await saveSolidDatasetAt(publicTypeIndexUrl, dataSet, { fetch: fetch });
}

/**
* adds a record to user's preference file to denote what access control mechanism user's POD uses, can be wac or acp
* @param   {fetcher} fetch fetch function
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<void>} 
*/
export const recordAccessType = async (fetch: fetcher, prefFileLocation: string, podType: string): Promise<void> => {
  let dataSet;
  try {
    dataSet = await getSolidDataset(prefFileLocation, {
      fetch: fetch
    });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    throw new Error(`error when fetching preference file, it either doesn't exist, or has different location from the one specified in the webId, error: ${message}`);
  }
  let aThing = getThing(dataSet, prefFileLocation);
  if (!aThing) {
    throw new Error("preference file does not exist");
  }
  aThing = addStringNoLocale(aThing, voc.accessType, podType);
  dataSet = setThing(dataSet, aThing);
  await saveSolidDatasetAt(prefFileLocation, dataSet, { fetch: fetch });
}

/**
* creates the following containers in the user's POD: SolidPlannerApp/, SolidPlannerApp/Notes/, SolidPlannerApp/Habits/
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<void>} 
*/
export const createDefFolder = async (webId: string, fetch: fetcher, storagePref: string, prefFileLocation: string,
  podType: string): Promise<void> => {
  const defFolderUrl = `${storagePref}SolidPlannerApp`;
  try {
    await getSolidDataset(`${updUrlForFolder(defFolderUrl)}`, { fetch: fetch });
  }
  catch {
    try {
      await createContainerAt(`${updUrlForFolder(defFolderUrl)}`, {
        fetch: fetch
      });
    }
    catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new Error(`error when trying to create a folder for notes, error: ${message}`);
    }
  }
  await recordAccessType(fetch, prefFileLocation, podType);
  await setPubAccess(webId, { read: true, append: false, write: false }, `${updUrlForFolder(defFolderUrl)}`, fetch,
    storagePref, prefFileLocation, podType);
  try {
    await getSolidDataset(`${updUrlForFolder(defFolderUrl)}notes/`, {
      fetch: fetch
    });
  }
  catch {
    try {
      await createContainerAt(`${updUrlForFolder(defFolderUrl)}notes/`, {
        fetch: fetch
      });
    }
    catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new Error(`error when trying to create a folder for notes, error: ${message}`);
    }
  }
  if (podType === "wac") {
    await initializeAcl(`${updUrlForFolder(defFolderUrl)}notes/`, fetch);
  }
  await setPubAccess(webId, { read: true, append: false, write: false }, `${updUrlForFolder(defFolderUrl)}notes/`, fetch,
    storagePref, prefFileLocation, podType);
  try {
    await getSolidDataset(`${updUrlForFolder(defFolderUrl)}habits/`, {
      fetch: fetch
    });
  }
  catch {
    try {
      await createContainerAt(`${updUrlForFolder(defFolderUrl)}habits/`, {
        fetch: fetch
      });
    }
    catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new Error(`error when trying to create a folder for habits in specified folder, error: ${message}`);
    }
  }
  if (podType === "wac") {
    await initializeAcl(`${updUrlForFolder(defFolderUrl)}habits/`, fetch);
  }
  await setPubAccess(webId, { read: true, append: false, write: false }, `${updUrlForFolder(defFolderUrl)}habits/`, fetch,
    storagePref, prefFileLocation, podType);
}

/**
* fetches all things of specified entry type of a user or other webId 
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {string} entry entry type to fetch
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} publicTypeIndexUrl url of user's public type index file
* @param   {string} podType denotes what access control mechanisms user's POD uses, can be wac or acp
* @param   {boolean} [other] indicates if a fetch is perform not on the user's webId
* @return  {Promise<(ThingPersisted | null)[] | never[]>} an array of things of specified entry type or nulls, or empty array
*/
export const fetchAllEntries = async (webId: string, fetch: fetcher, entry: string, storagePref: string, prefFileLocation: string,
  publicTypeIndexUrl: string, podType: string, other?: boolean): Promise<(ThingPersisted | null)[] | never[]> => {
  const arrayOfCategories: string[] = [];
  let urlsArr
  try {
    urlsArr = await getAllUrlFromPublicIndex(webId, fetch, entry, storagePref, publicTypeIndexUrl, other ? other : undefined);
  }
  catch (error) {
    if (other) {
      return [];
    }
    else {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new Error(`Couldn't fetch notes from your public type index, error: ${message}`);
    }
  }
  const updUrlsArr = await Promise.all(urlsArr.map(async (url) => {
    let data: SolidDataset & WithServerResourceInfo;
    try {
      data = await getSolidDataset(url, { fetch: fetch });
    }
    catch (error) {
      if (other) return null;
      else {
        try {
          await createDefFolder(webId, fetch, storagePref, prefFileLocation, podType);
          data = await getSolidDataset(url, { fetch: fetch });
        }
        catch (error) {
          let message = 'Unknown Error';
          if (error instanceof Error) message = error.message;
          throw new Error(`Couldn't fetch a resource that is listed in your Public type index ${url} this might happen because it 
        is listed in public type index, but doesn't exist in your POD, error: ${message}`);
        }
      }
    }
    if (isContainer(data)) {
      const allNotes = getContainedResourceUrlAll(data);
      const updArr = await Promise.all(allNotes.map(async (noteUrl) => {
        let newDs;
        try {
          newDs = await getSolidDataset(noteUrl, { fetch: fetch });
        }
        catch (error) {
          if (other) return null;
          else {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            throw new Error(`error while fetching one of the notes in container: ${url} note url: ${noteUrl}, error: ${message}`);
          }
        }
        const newThing = getThing(newDs, noteUrl);
        return newThing;
      }));
      return updArr;
    }
    else {
      const arrOf = getThingAll(data);
      arrOf.forEach((thing, index) => {
        const categoryOfCurrNote = getStringNoLocale(thing, otherV.category);
        if (categoryOfCurrNote && !arrayOfCategories.includes(categoryOfCurrNote)) arrayOfCategories.push(categoryOfCurrNote);
        if (!getInteger(thing, schema.identifier)) {
          const newThing = addInteger(thing, schema.identifier, Date.now() + index + Math.floor(Math.random() * 1000));
          const newData = setThing(data, newThing);
          saveSolidDatasetAt(url, newData, { fetch: fetch });
        }
      });
      return arrOf;
    }
  }));
  const retValue = updUrlsArr.flat();
  if (!retValue) return [];
  return retValue;
}

/**
* checks if a dataSet with given url exists on the user's POD, if it doesn't, creates it
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @param   {string} folderUrl url of the dataSet to check
* @return  {Promise<SolidDataset>} dataSet with a given url if it exists
*/
export const checkFolderExistence = async (webId: string, fetch: fetcher, storagePref: string,
  prefFileLocation: string, podType: string, folderUrl: string): Promise<SolidDataset> => {
  let dataSet;
  try {
    dataSet = await getSolidDataset(folderUrl, {
      fetch: fetch
    });
  }
  catch (error) {
    try {
      await createDefFolder(webId, fetch, storagePref, prefFileLocation, podType);
      dataSet = await getSolidDataset(folderUrl, {
        fetch: fetch
      });
    }
    catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new Error(`Error when trying to fetch notes folder,url: ${folderUrl} error: ${message}`);
    }
  }
  return dataSet;
}

/**
* saves given note on the user's POD
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {Note} note note to save
* @param   {string} storagePref url of user's preferred storage location
* @param   {string | null} defFolder url of user's folder to store data for this application
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<void>}
*/
export const saveNote = async (webId: string, fetch: fetcher, note: Note, storagePref: string,
  defFolder: string | null, prefFileLocation: string, podType: string): Promise<void> => {
  const notesFolder = `${defFolder}notes/`;
  let dataSet = await checkFolderExistence(webId, fetch, storagePref, prefFileLocation, podType, notesFolder);
  const id = note.id === null ? Date.now() + Math.floor(Math.random() * 1000) : note.id;
  const titleUpd = note.title === null ? "" : note.title;
  const contentUpd = note.content === null ? "" : note.content;
  let newNote = buildThing(createThing({ url: note.url }))
    .addUrl(RDF.type, schema.TextDigitalDocument)
    .addStringNoLocale(DCTERMS.title, titleUpd)
    .addStringNoLocale(schema.text, contentUpd)
    .addInteger(schema.identifier, id)
    .build();
  if (note.category) newNote = addStringNoLocale(newNote, otherV.category, note.category);

  dataSet = setThing(dataSet, newNote);
  await saveSolidDatasetAt(note.url, dataSet, { fetch: fetch });
  if (podType === "wac") {
    await initializeAcl(note.url, fetch);
  }
  await setPubAccess(webId, { read: false, append: false, write: false }, note.url, fetch, storagePref,
    prefFileLocation, podType);
}

/**
* saves given habit on the user's POD
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {Habit} habit habit to save
* @param   {string} storagePref url of user's preferred storage location
* @param   {string | null} defFolder url of user's folder to store data for this application
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<void>}
*/
export const saveHabit = async (webId: string, fetch: fetcher, habit: Habit, storagePref: string,
  defFolder: string | null, prefFileLocation: string, podType: string): Promise<void> => {
  const habitsFolder = `${defFolder}habits/`;
  let dataSet = await checkFolderExistence(webId, fetch, storagePref, prefFileLocation, podType, habitsFolder);
  const id = habit.id === null ? Date.now() + Math.floor(Math.random() * 1000) : habit.id;
  const habitUrl = `${habitsFolder}${id}.ttl`;
  const titleUpd = habit.title === null ? "" : habit.title;
  const contentUpd = habit.content === null ? "" : habit.content;
  const startDate = new Date();

  let newHabit = buildThing(createThing({ url: habitUrl }))
    .addUrl(RDF.type, voc.Habit)
    .addInteger(schema.identifier, id)
    .addStringNoLocale(DCTERMS.title, titleUpd)
    .addStringNoLocale(schema.text, contentUpd)
    .addDate("http://www.oegov.org/core/owl/gc#startDate", startDate)
    .addStringNoLocale(voc.recurrence, habit.recurrence ? habit.recurrence : "daily")
    .build();

  if (habit.category) newHabit = addStringNoLocale(newHabit, otherV.category, habit.category);

  if (habit.custom) {
    let customToUpload;
    if (typeof habit.custom === 'number') {
      customToUpload = habit.custom.toString();
    }
    else {
      customToUpload = habit.custom.join(" ");
    }
    newHabit = addStringNoLocale(newHabit, voc.custom, customToUpload);
  }
  if (habit.stat) {
    newHabit = addBoolean(newHabit, "http://dbpedia.org/ontology/status", habit.stat)
  }

  if (habit.checkInList) {
    habit.checkInList.forEach((date) => {
      newHabit = addDate(newHabit, voc.checkInDate, date);
    });
  }
  dataSet = setThing(dataSet, newHabit);
  await saveSolidDatasetAt(habitUrl, dataSet, { fetch: fetch });
  if (podType === "wac") {
    await initializeAcl(habitUrl, fetch);
  }
  await setPubAccess(webId, { read: false, append: false, write: false }, habitUrl, fetch, storagePref, prefFileLocation, podType);
}

/**
* adds data of a given habit to a given thing
* @param   {Habit} habitToSave habit to get data from
* @param   {Thing} newThing a thing to update
* @return  {ThingPersisted} a thing with updated data from a given habit
*/
export const setHabitThing = (habitToSave: Habit, newThing: Thing): ThingPersisted => {
  if (habitToSave.title) {
    newThing = setStringNoLocale(newThing, DCTERMS.title, habitToSave.title);
  }
  if (habitToSave.content) {
    newThing = setStringNoLocale(newThing, schema.text, habitToSave.content);
  }
  if (habitToSave.recurrence) {
    newThing = setStringNoLocale(newThing, voc.recurrence, habitToSave.recurrence);
  }
  if (habitToSave.lastCheckInDate) {
    newThing = setDate(newThing, voc.lastCheckInDate, habitToSave.lastCheckInDate);
  }
  if (habitToSave.bestStreak) {
    newThing = setInteger(newThing, voc.bestStreak, habitToSave.bestStreak);
  }
  if (habitToSave.currentStreak) {
    newThing = setInteger(newThing, voc.currentStreak, habitToSave.currentStreak);
  }
  if (habitToSave.stat !== null) {
    newThing = setBoolean(newThing, "http://dbpedia.org/ontology/status", habitToSave.stat);
  }
  if (habitToSave.category) {
    newThing = setStringNoLocale(newThing, otherV.category, habitToSave.category);
  }
  if (habitToSave.checkInList && newThing) {
    habitToSave.checkInList.forEach(date => newThing = addDate(newThing, voc.checkInDate, date));
  }
  if (habitToSave.custom) {
    let customToUpload;
    if (typeof habitToSave.custom === 'number') {
      customToUpload = habitToSave.custom.toString();
    }
    else {
      customToUpload = habitToSave.custom.join(" ");
    }
    newThing = addStringNoLocale(newThing, voc.custom, customToUpload)
  }
  newThing = addStringNoLocale(newThing, schema.color, habitToSave.color);
  return newThing;
}

/**
* updates a given habit on the user's POD
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {Habit} habitToEdit habit to edit
* @param   {string} storagePref url of user's preferred storage location
* @param   {string | null} defFolder url of user's folder to store data for this application
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} publicTypeIndexUrl url of user's public type index file
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<void>}
*/
export const editHabit = async (webId: string, fetch: fetcher, habitToEdit: Habit, storagePref: string,
  defFolder: string | null, prefFileLocation: string, publicTypeIndexUrl: string, podType: string) => {
  if (!habitToEdit.id) {
    await saveHabit(webId, fetch, habitToEdit, storagePref, defFolder, prefFileLocation, podType);
    return;
  }
  const urlsArr = await getAllUrlFromPublicIndex(webId, fetch, "habit", storagePref, publicTypeIndexUrl);
  await Promise.all(urlsArr.map(async (url) => {
    let data: SolidDataset & WithServerResourceInfo;
    try {
      data = await getSolidDataset(url, { fetch: fetch });
    }
    catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new Error(`Error when fetching dataset url: ${url} error: ${message}`);
    }
    if (isContainer(data)) {
      const allNotes = getContainedResourceUrlAll(data);
      if (habitToEdit.url && allNotes.includes(habitToEdit.url)) {
        let newDs
        try {
          newDs = await getSolidDataset(habitToEdit.url, { fetch: fetch });
        }
        catch (error) {
          let message = 'Unknown Error';
          if (error instanceof Error) message = error.message;
          throw new Error(`Error when fetching dataset url: ${habitToEdit.url} error: ${message}`);
        }
        let newThing = getThing(newDs, habitToEdit.url);
        if (newThing) {
          const thingId = getInteger(newThing, schema.identifier);
          if (thingId === habitToEdit.id) {
            newThing = setHabitThing(habitToEdit, newThing);
            const updDataSet = setThing(newDs, newThing);
            await saveSolidDatasetAt(habitToEdit.url, updDataSet,
              { fetch: fetch });
          }
        }
      }
    }
    else {
      const newThingArr = getThingAll(data);
      if (newThingArr) {
        newThingArr.forEach(async (newThing) => {
          const thingId = getInteger(newThing, schema.identifier);
          if (thingId === habitToEdit.id) {
            newThing = setHabitThing(habitToEdit, newThing);
            const updDataSet = setThing(data, newThing);
            await saveSolidDatasetAt(url, updDataSet, { fetch: fetch });
          }
        });
      }
    }
  }));
};

/**
* updates a given note on the user's POD
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {Note} noteToEdit note to edit
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} publicTypeIndexUrl url of user's public type index file
* @return  {Promise<void>}
*/
export const editNote = async (webId: string, fetch: fetcher, noteToEdit: Note, storagePref: string,
  publicTypeIndexUrl: string): Promise<void> => {
  const urlsArr = await getAllUrlFromPublicIndex(webId, fetch, "note", storagePref, publicTypeIndexUrl);
  await Promise.all(urlsArr.map(async (url) => {
    let data: SolidDataset & WithServerResourceInfo;
    try {
      data = await getSolidDataset(url, { fetch: fetch });
    }
    catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new Error(`Error when fetching dataset url: ${url} error: ${message}`);
    }
    if (isContainer(data)) {
      const allNotes = getContainedResourceUrlAll(data);
      if (allNotes.includes(noteToEdit.url)) {
        let newDs;
        try {
          newDs = await getSolidDataset(noteToEdit.url, { fetch: fetch });
        }
        catch (error) {
          let message = 'Unknown Error';
          if (error instanceof Error) message = error.message;
          throw new Error(`Error when fetching dataset url: ${noteToEdit.url} error: ${message}`);
        }
        let newThing = getThing(newDs, noteToEdit.url);
        if (newThing) {
          const thingId = getInteger(newThing, schema.identifier);
          if (thingId === noteToEdit.id) {
            if (noteToEdit.title) {
              newThing = setStringNoLocale(newThing, DCTERMS.title, noteToEdit.title);
            }
            if (noteToEdit.content) {
              newThing = setStringNoLocale(newThing, schema.text, noteToEdit.content);

            }
            if (noteToEdit.category) {
              newThing = setStringNoLocale(newThing, otherV.category, noteToEdit.category);

            }
            const updDataSet = setThing(newDs, newThing);
            await saveSolidDatasetAt(noteToEdit.url, updDataSet,
              { fetch: fetch });
          }
        }
      }
      else {
        throw new Error(`Error when trying to edit note, url: ${noteToEdit.url} doesn't exist in POD`);
      }
    }
    else {
      const newThingArr = getThingAll(data);
      if (newThingArr) {
        newThingArr.forEach(async (newThing) => {
          const thingId = getInteger(newThing, schema.identifier);
          if (thingId === noteToEdit.id) {
            if (noteToEdit.title) {
              newThing = setStringNoLocale(newThing, DCTERMS.title, noteToEdit.title);
            }
            if (noteToEdit.content) {
              newThing = setStringNoLocale(newThing, schema.text, noteToEdit.content);

            }
            if (noteToEdit.category) {
              newThing = setStringNoLocale(newThing, otherV.category, noteToEdit.category);

            }
            const updDataSet = setThing(data, newThing);
            await saveSolidDatasetAt(url, updDataSet, { fetch: fetch });
          }
        });
      }
    }
  }));
}

/**
* deletes an entry of a given type at a given url from the user's POD
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {string} urlToDelete url of entry to delete
* @param   {string} entry type of an entry to delete, can be note or habit
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} publicTypeIndexUrl url of user's public type index file
* @return  {Promise<void>}
*/
export const deleteEntry = async (webId: string, fetch: fetcher, urlToDelete: string, entry: string, storagePref: string,
  publicTypeIndexUrl: string): Promise<void> => {
  const urlsArr = await getAllUrlFromPublicIndex(webId, fetch, entry, storagePref, publicTypeIndexUrl);
  await Promise.all(urlsArr.map(async (url) => {
    const data = await getSolidDataset(url, { fetch: fetch });
    if (isContainer(data)) {
      const allNotes = getContainedResourceUrlAll(data);
      if (allNotes.includes(urlToDelete)) {
        await deleteSolidDataset(urlToDelete, { fetch: fetch });
      }
      else {
        throw new Error(`Error when trying to edit note, url: ${urlToDelete} doesn't exist in POD`);
      }
      return url;
    }
    else {
      const newThingArr = getThingAll(data);
      if (newThingArr) {
        newThingArr.forEach(async (newThing) => {
          if (newThing.url === urlToDelete) {
            const newData = removeThing(data, newThing);
            await saveSolidDatasetAt(url, newData, { fetch: fetch });
          }
        });
      }
    }
  }));
}

/**
* checks if user's POD has contacts/ container that contains contacts that can be fetched
* @param   {fetcher} fetch fetch function
* @param   {string} storagePref url of user's preferred storage location
* @return  {Promise<boolean>}  true if user has contacts in contacts/ container that can be fetched and false otherwise
*/
export const checkContacts = async (fetch: fetcher, storagePref: string): Promise<boolean> => {
  try {
    await getSolidDataset(`${storagePref}contacts/`, { fetch: fetch });
    const contactsUrl = `${storagePref}contacts/Person/`;
    await getSolidDataset(contactsUrl, { fetch: fetch });
    return true;
  }
  catch (error) {
    return false;
  }
}

/**
* fetches all user's contacts
* @param   {fetcher} fetch fetch function
* @param   {string} storagePref url of user's preferred storage location
* @return  {Promise<(string | null)[][]>}an array of arrays, each representing a contact, contains contact's name in the 0 index and contact's webId in the 1 index
*/
export const fetchContacts = async (fetch: fetcher, storagePref: string): Promise<(string | null)[][]> => {
  let newDs
  try {
    newDs = await getSolidDataset(`${storagePref}contacts/people.ttl`, { fetch: fetch });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    throw new Error(`couldn't fetch file with contacts, ${message}`);
  }
  const allPeople = getThingAll(newDs);
  let finalArr = await Promise.all(allPeople.map(async (personThing) => {
    const personThingUrl = personThing.url;
    if (personThingUrl.slice(-5) === "#this") {
      const personDsUrl = personThingUrl.slice(0, -5);
      let personDs;
      try {
        personDs = await getSolidDataset(personDsUrl, { fetch: fetch });
      }
      catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        throw new Error(`couldn't fetch one of the contacts, file url: ${personDsUrl}, error: ${message}`);
      }
      const allThingsPersonDs = getThingAll(personDs);
      const personWebId = allThingsPersonDs.map((thing) => {
        return getUrl(thing, vcard.value);
      }).find((item) => {
        return item !== null;
      });

      const name = getStringNoLocale(personThing, foaf.name);
      if (name && personWebId) return [name, personWebId];
      if (!name && personWebId) return [null, personWebId];
      return null;
    }
  }));
  finalArr = finalArr.filter((item) => (item));
  finalArr = finalArr as ((string | null)[])[]
  const ret: ((string | null)[])[] = finalArr as ((string | null)[])[];
  return ret;
}

/**
* creates a notification in the provided user's inbox
* @param   {string} webId webId of the user
* @param   {string} otherWebId webId of the user for which the notification is sent
* @param   {fetcher} fetch fetch function
* @param   {string} entry type of an entry that was shared, can be a note or a habit
* @param   {accessObject} acessObj access rights that are shared for the given entry
* @param   {string} url url of the shared entry
* @return  {Promise<void>}
*/
export const createEntryInInbox = async (webId: string, otherWebId: string, fetch: fetcher, entry: string,
  accessObj: accessObject, url: string): Promise<void> => {
  const otherInboxUrl = await getInboxUrl(otherWebId, fetch);
  let dataSet = createSolidDataset();
  const id = Date.now() + Math.floor(Math.random() * 1000);
  let aThing = buildThing(createThing())
    .addBoolean(solid.read, false)
    .addIri(schema.sender, webId)
    .addIri(RDF.type, solid.Notification)
    .addIri(solid.forClass, entry === "note" ? schema.TextDigitalDocument : voc.Habit)
    .addInteger(schema.identifier, id)
    .addIri(schema.url, url)
    .build();
  if (accessObj.read) {
    aThing = addStringNoLocale(aThing, "http://purl.org/dc/terms/accessRights", "read");
  }
  if (accessObj.append) {
    aThing = addStringNoLocale(aThing, "http://purl.org/dc/terms/accessRights", "append");
  }
  if (accessObj.write) {
    aThing = addStringNoLocale(aThing, "http://purl.org/dc/terms/accessRights", "write");
  }
  dataSet = setThing(dataSet, aThing);
  try {
    await saveSolidDatasetInContainer(otherInboxUrl, dataSet, { fetch: fetch });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    throw new Error(`couldn't append a message to the ${otherInboxUrl}, this might be due to the fact that it either doesn't exist or is set to private. Your entry was shared, but the user won't be notified about this, error: ${message}`);
  }
}

/**
* returns an array of thing from the user's inbox container 
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {boolean} [update] if true, then the update of existing entries is performed
* @return  {Promise<ThingPersisted[]>} returns an array of things from the user's inbox that were created by this application
*/
export const getThingsFromInbox = async (webId: string, fetch: fetcher, update?: boolean): Promise<ThingPersisted[]> => {
  const inboxUrl = await getInboxUrl(webId, fetch);
  let dataSet;
  try {
    dataSet = await getSolidDataset(inboxUrl, {
      fetch: fetch
    });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    throw new Error(`error when fetching inbox file, it either doesn't exist, or has different location from the one specified in the webId, error: ${message}`);
  }
  const allUrl = getContainedResourceUrlAll(dataSet);
  const arrOfThings = await Promise.all(allUrl.map(async (url) => {
    let ds: SolidDataset;
    try {
      ds = await getSolidDataset(url, { fetch: fetch });
    }
    catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new Error(`error when fetching a dataset with inbox file, it either doesn't exist,or it was a server error, error: ${message}`);
    }
    const allThings = getThingAll(ds);
    if (update) {
      await Promise.all(allThings.map(async (thing) => {
        if ((getBoolean(thing, solid.read) === false) && (getIri(thing, RDF.type) === solid.Notification)) {
          thing = setBoolean(thing, solid.read, true);
          ds = setThing(ds, thing);
          await saveSolidDatasetAt(url, ds, { fetch: fetch });
        }
      }));
    }
    return allThings;
  }));
  const updArr = arrOfThings.flat();
  return updArr.filter((thing) => (getBoolean(thing, solid.read) === false) && (getIri(thing, RDF.type) === solid.Notification));
}

/**
* checks public type index file and creates application's entries if those are missing
* @param   {string} publicTypeIndexUrl url of user's public type index file
* @param   {fetcher} fetch fetch function
 * @param   {string} storagePref url of user's preferred storage location
* @return  {Promise<void>}
*/
export const checkPubTypeIndex = async (publicTypeIndexUrl: string, fetch: fetcher, storagePref: string): Promise<void> => {
  let dataSet;
  try {
    dataSet = await getSolidDataset(publicTypeIndexUrl, {
      fetch: fetch
    });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    throw new Error(`error when fetching public type index file, it either doesn't exist, or has different location from the one specified in the webId, error: ${message}`);
  }

  const allThings = getThingAll(dataSet);
  const newArr = allThings.map((thing) => {
    return getIri(thing, solid.forClass);
  });
  if (!newArr.includes(schema.TextDigitalDocument)) await createEntriesInTypeIndex(fetch, "note", storagePref, publicTypeIndexUrl);
  if (!newArr.includes(voc.Habit)) await createEntriesInTypeIndex(fetch, "habit", storagePref, publicTypeIndexUrl);

}