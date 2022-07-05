import {
  createThing, getSolidDataset, getThing, getThingAll, getUrl,
  addUrl, setThing, saveSolidDatasetAt, createContainerAt, Thing, getInteger,
  getStringNoLocale, removeThing, getContainedResourceUrlAll, deleteSolidDataset,
  setStringNoLocale, addStringNoLocale, isContainer, addInteger,
  buildThing, setDate, getDate, getBoolean, addBoolean, setInteger, setBoolean
} from '@inrupt/solid-client';
import { DCTERMS, RDF } from '@inrupt/vocab-common-rdf';
import { solid, schema, foaf, vcard } from 'rdf-namespaces';
import { Note, fetcher, Habit, voc, otherV } from '../components/types';
import { determineAccess, initializeAcl, isWacOrAcp, setPubAccess } from './access';
import { updUrlForFolder } from './helpers';
import { getStoragePref, getPrefLink, getPublicTypeIndexUrl, getAllUrlFromPublicIndex, getDefaultFolder, getAccessType } from './podGetters';

//const throwError = useAsyncError();
//function that transforms var of type Thing to var of Type Note
export const thingToNote = async (toChange: Thing | null, webId: string, fetch: fetcher) => {
  if (!toChange) {
    return null;
  }
  let updTitle = getStringNoLocale(toChange, DCTERMS.title) ? getStringNoLocale(toChange, DCTERMS.title) : "";
  let updContent = getStringNoLocale(toChange, schema.text) ? getStringNoLocale(toChange, schema.text) : "";
  let updId = getInteger(toChange, schema.identifier) ? getInteger(toChange, schema.identifier) :
    Date.now() + Math.floor(Math.random() * 1000);
  let updCategory = getStringNoLocale(toChange, otherV.category);
  let getAcc;
  try {
    getAcc = await determineAccess(webId, toChange.url, fetch);
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

export const thingToHabit = async (toChange: Thing | null, webId: string, fetch: fetcher) => {
  if (!toChange) {
    return null;
  }
  console.log("we are in thing to habit");
  console.log(toChange.url);
  let updTitle = getStringNoLocale(toChange, DCTERMS.title) ? getStringNoLocale(toChange, DCTERMS.title) : "";
  let updContent = getStringNoLocale(toChange, schema.text) ? getStringNoLocale(toChange, schema.text) : "";
  let updId = getInteger(toChange, schema.identifier) ? getInteger(toChange, schema.identifier) :
    Date.now() + Math.floor(Math.random() * 1000);
  let updCategory = getStringNoLocale(toChange, otherV.category);
  let updStartDate = getDate(toChange, "http://www.oegov.org/core/owl/gc#startDate");
  let updLastCheckInDate = getDate(toChange, voc.lastCheckInDate);
  let updBestStreak = getInteger(toChange, voc.bestStreak);
  let updCurrentStreak = getInteger(toChange, voc.currentStreak);
  let updStatus = getBoolean(toChange, "http://dbpedia.org/ontology/status");
  let updRecurrence = getStringNoLocale(toChange, voc.recurrence);
  let updCustom = getStringNoLocale(toChange, voc.custom);

  let newCustomValue: number[] | number | null = null;
  if (updCustom) {
    let customArr = updCustom.split(" ");
    if (customArr.length === 1 && parseInt(customArr[0])) {
      newCustomValue = parseInt(customArr[0]);
    }
    else {
      newCustomValue = customArr.map((value) => parseInt(value));
    }
  }

  let getAcc;
  try {
    getAcc = await determineAccess(webId, toChange.url, fetch);
  }
  catch {
    getAcc = [null];
  }
  const habit: Habit = {
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
    prevBestStreak: null,
    prevLastCheckIn: null,
    access: getAcc[0] ? getAcc[0] : null,
    ...(getAcc[1] && { shareList: getAcc[1] })
  };
  console.log("what we retur");
  console.log(habit);
  return habit;
  //   status
}
// creates a link to preference file in user's webId card #here
// export const createPrefLink = async (webId: string, fetch: fetcher) => {
//   let dataSet;
//   dataSet = await getSolidDataset(webId, {
//     fetch: fetch
//   });
//   let aThing = getThing(dataSet, webId);
//   const urlToPrefs = `${modifyWebId(webId)}settings/prefs.ttl`;
//   aThing = addUrl(aThing!, space.preferencesFile, urlToPrefs);
//   dataSet = setThing(dataSet, aThing);
//   const updDataSet = saveSolidDatasetAt(webId, dataSet, { fetch: fetch });
// }

// export const checkAndCreatePrefLink = async (webId: string, fetch: fetcher) => {
//   const checkedPrefLink = await getPrefLink(webId, fetch);
//   if (!checkedPrefLink) {
//     createPrefLink(webId, fetch);
//   }
// }
export const repairDefaultFolder = async (webId: string, fetch: fetcher) => {
  const storagePref = await getStoragePref(webId, fetch);
  let defaultFolderPath = `${storagePref}SolidPlannerApp`;
  const prefFileLocation = await getPrefLink(webId, fetch);
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

export const recordDefaultFolder = async (webId: string, fetch: fetcher) => {
  await repairDefaultFolder(webId, fetch);
  await createDefFolder(webId, fetch);
  await createEntriesInTypeIndex(webId, fetch, "note");
  await createEntriesInTypeIndex(webId, fetch, "habit");
}


export const createEntriesInTypeIndex = async (webId: string, fetch: fetcher, entryType: string) => {
  const storagePref = await getStoragePref(webId, fetch);
  let defaultFolderPath = `${storagePref}SolidPlannerApp`;
  let url = "";
  if (entryType === 'note') {
    url = `${defaultFolderPath}/notes/`;
  }
  else {
    url = `${defaultFolderPath}/habits/`;
  }
  const pubicTypeIndexUrl = await getPublicTypeIndexUrl(webId, fetch);
  let dataSet;
  try {
    dataSet = await getSolidDataset(pubicTypeIndexUrl, {
      fetch: fetch
    });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    throw new Error(`error when fetching public type index file, it either doesn't exist, or has different location from the one specified in the webId, error: ${message}`);
  }
  let aThing = buildThing(createThing())
    .addIri(solid.forClass, entryType === "note" ? schema.TextDigitalDocument : voc.Habit)
    .addIri(solid.instance, url)
    .build();
  dataSet = setThing(dataSet, aThing);
  const updDataSet = await saveSolidDatasetAt(pubicTypeIndexUrl, dataSet, { fetch: fetch });
}


export const recordAccessType = async (webId: string, fetch: fetcher) => {
  const storagePref = await getStoragePref(webId, fetch);
  let defFolderUrl = `${storagePref}SolidPlannerApp`;
  let type = await isWacOrAcp(`${updUrlForFolder(defFolderUrl)}`, fetch);

  const prefFileLocation = await getPrefLink(webId, fetch);
  let dataSet;
  try {
    dataSet = await getSolidDataset(prefFileLocation, {
      fetch: fetch
    });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    //throwError(new Error(`error when fetching preference file, it either doesn't exist, or has different location from the one specified in the webId, error: ${message}`));
    throw new Error(`error when fetching preference file, it either doesn't exist, or has different location from the one specified in the webId, error: ${message}`);
  }
  let aThing = getThing(dataSet, prefFileLocation);

  if (!aThing) {
    // throwError(new Error("preference file does not exist"));
    throw new Error("preference file does not exist");
  }

  aThing = addStringNoLocale(aThing, voc.accessType, type);
  dataSet = setThing(dataSet, aThing);
  const updDataSet = await saveSolidDatasetAt(prefFileLocation!, dataSet, { fetch: fetch });
}


export const createDefFolder = async (webId: string, fetch: fetcher) => {
  const storagePref = await getStoragePref(webId, fetch);
  let defFolderUrl = `${storagePref}SolidPlannerApp`;
  try {
    let b = await getSolidDataset(`${updUrlForFolder(defFolderUrl)}`, { fetch: fetch });
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

  let type = await isWacOrAcp(`${updUrlForFolder(defFolderUrl)}`, fetch);
  await recordAccessType(webId, fetch);
  await setPubAccess(webId, { read: true, append: false, write: false }, `${updUrlForFolder(defFolderUrl)}`, fetch);
  try {
    let s = await getSolidDataset(`${updUrlForFolder(defFolderUrl)}notes/`, {
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

  if (type === "wac") {
    await initializeAcl(`${updUrlForFolder(defFolderUrl)}notes/`, fetch);
  }
  await setPubAccess(webId, { read: true, append: false, write: false }, `${updUrlForFolder(defFolderUrl)}notes/`, fetch);
  try {
    let b = await getSolidDataset(`${updUrlForFolder(defFolderUrl)}habits/`, {
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
      //  throwError(new Error(`error when trying to create a folder for habits in specified folder, error: ${message}`));
      throw new Error(`error when trying to create a folder for habits in specified folder, error: ${message}`);
    }
  }

  if (type === "wac") {
    await initializeAcl(`${updUrlForFolder(defFolderUrl)}habits/`, fetch);
  }
  await setPubAccess(webId, { read: true, append: false, write: false }, `${updUrlForFolder(defFolderUrl)}habits/`, fetch);
}


export const fetchAllEntries = async (webId: string, fetch: fetcher, entry: string, other?: boolean) => {
  let arrayOfCategories: string[] = [];
  let urlsArr
  try {
    urlsArr = await getAllUrlFromPublicIndex(webId, fetch, entry);
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
  let updUrlsArr = await Promise.all(urlsArr.map(async (url) => {
    let data: any;
    try {
      data = await getSolidDataset(url, { fetch: fetch });
    }
    catch (error) {
      if (other) return null;
      else {
        try {
          await createDefFolder(webId, fetch);
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
      let allNotes = getContainedResourceUrlAll(data);
      let updArr = await Promise.all(allNotes.map(async (noteUrl) => {
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
        let newThing = getThing(newDs, noteUrl);
        return newThing;
      }));
      return updArr;
    }
    else {
      let arrOf = getThingAll(data);
      arrOf.forEach((thing, index) => {
        let categoryOfCurrNote = getStringNoLocale(thing, otherV.category);
        if (categoryOfCurrNote && !arrayOfCategories.includes(categoryOfCurrNote)) arrayOfCategories.push(categoryOfCurrNote);
        if (!getInteger(thing, schema.identifier)) {
          let newThing = addInteger(thing, schema.identifier, Date.now() + index + Math.floor(Math.random() * 1000));
          let newData = setThing(data, newThing);
          const updDataSet = saveSolidDatasetAt(url, newData, { fetch: fetch });
        }
      });
      return arrOf;
    }
  }));
  let retValue = updUrlsArr.flat();
  if (!retValue) return [];
  return retValue;
}


export const saveNote = async (webId: string, fetch: fetcher, note: Note) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const notesFolder = `${defFolder}notes/`;
  let dataSet;
  try {
    dataSet = await getSolidDataset(notesFolder, {
      fetch: fetch
    });
  }
  catch (error) {
    try {
      await createDefFolder(webId, fetch);
      dataSet = await getSolidDataset(notesFolder, {
        fetch: fetch
      });
    }
    catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      throw new Error(`Error when trying to fetch notes folder,url: ${notesFolder} error: ${message}`);
    }
  }
  const id = note.id === null ? Date.now() + Math.floor(Math.random() * 1000) : note.id;
  const noteUrl = `${notesFolder}${id}.ttl`;
  const titleUpd = note.title === null ? "" : note.title;
  const contentUpd = note.content === null ? "" : note.content;
  let newNote = buildThing(createThing({ url: noteUrl }))
    .addUrl(RDF.type, schema.TextDigitalDocument)
    .addStringNoLocale(DCTERMS.title, titleUpd)
    .addStringNoLocale(schema.text, contentUpd)
    .addInteger(schema.identifier, id)
    .build();
  if (note.category) newNote = addStringNoLocale(newNote, otherV.category, note.category);

  dataSet = setThing(dataSet, newNote);
  await saveSolidDatasetAt(noteUrl, dataSet, { fetch: fetch });
  let type = await getAccessType(webId, fetch);
  if (type === "wac") {
    await initializeAcl(noteUrl, fetch);
  };
  await setPubAccess(webId, { read: false, append: false, write: false }, noteUrl, fetch);
}

export const saveHabit = async (webId: string, fetch: fetcher, habit: Habit) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const habitsFolder = `${defFolder}habits/`;
  let dataSet;
  try {
    dataSet = await getSolidDataset(habitsFolder, {
      fetch: fetch
    });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    //  throwError(new Error(`Error when trying to fetch habits folder, url: ${habitsFolder} error: ${message}`));
    throw new Error(`Error when trying to fetch habits folder, url: ${habitsFolder} error: ${message}`);
  }
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
  };
  if (habit.stat) {
    newHabit = addBoolean(newHabit, "http://dbpedia.org/ontology/status", habit.stat)
  }
  dataSet = setThing(dataSet, newHabit);
  await saveSolidDatasetAt(habitUrl, dataSet, { fetch: fetch });
  let type = await getAccessType(webId, fetch);
  if (type === "wac") {
    await initializeAcl(habitUrl, fetch);
  };
  await setPubAccess(webId, { read: false, append: false, write: false }, habitUrl, fetch);
  //lastCheckInDate, bestStreak, currentStreak, status
}

export const editHabit = async (webId: string, fetch: fetcher, habitToSave: Habit) => {
  if (!habitToSave.id) {
    await saveHabit(webId, fetch, habitToSave);
    return;
  }
  let urlsArr = await getAllUrlFromPublicIndex(webId, fetch, "habit");
  let updUrlsArr = await Promise.all(urlsArr.map(async (url) => {
    let data: any;
    try {
      data = await getSolidDataset(url, { fetch: fetch });
    }
    catch (error) {
      let message = 'Unknown Error';
      if (error instanceof Error) message = error.message;
      // throwError(new Error(`Error when fetching dataset url: ${url} error: ${message}`));
      throw new Error(`Error when fetching dataset url: ${url} error: ${message}`);
    }
    if (isContainer(data)) {
      let allNotes = getContainedResourceUrlAll(data);
      let updArr = await Promise.all(allNotes.map(async (url) => {
        let newDs
        try {
          newDs = await getSolidDataset(url, { fetch: fetch });
        }
        catch (error) {
          let message = 'Unknown Error';
          if (error instanceof Error) message = error.message;
          //  throwError(new Error(`Error when fetching dataset url: ${url} error: ${message}`));
          throw new Error(`Error when fetching dataset url: ${url} error: ${message}`);
        }
        let newThing = getThing(newDs, url);
        if (newThing) {
          let thingId = getInteger(newThing, schema.identifier);
          if (thingId === habitToSave.id) {
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
            if (habitToSave.stat) {
              newThing = setBoolean(newThing, "http://dbpedia.org/ontology/status", habitToSave.stat);
            }
            if (habitToSave.category) {
              newThing = setStringNoLocale(newThing, otherV.category, habitToSave.category);
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
            };
            //handle?
            let updDataSet = setThing(newDs, newThing!);
            const savedDataSet = await saveSolidDatasetAt(url, updDataSet,
              { fetch: fetch });
          }
        }
      }));
      return updArr;
    }
    else {
      let newThingArr = getThingAll(data);
      if (newThingArr) {
        newThingArr.forEach(async (newThing) => {
          let thingId = getInteger(newThing, schema.identifier);
          if (thingId === habitToSave.id) {
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
            if (habitToSave.stat) {
              newThing = setBoolean(newThing, "http://dbpedia.org/ontology/status", habitToSave.stat);
            }
            if (habitToSave.category) {
              newThing = setStringNoLocale(newThing, otherV.category, habitToSave.category);
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
            };
            let updDataSet = setThing(data, newThing!);
            await saveSolidDatasetAt(url, updDataSet, { fetch: fetch });
          }
        });
      }
    }
  }));
};

export const editNote = async (webId: string, fetch: fetcher, note: Note, changes: string[]) => {
  let urlsArr = await getAllUrlFromPublicIndex(webId, fetch, "note");
  let updUrlsArr = await Promise.all(urlsArr.map(async (url) => {
    //handle?
    let data = await getSolidDataset(url, { fetch: fetch });

    if (isContainer(data)) {
      let allNotes = getContainedResourceUrlAll(data);
      let updArr = await Promise.all(allNotes.map(async (url) => {
        let newDs;
        try {
          newDs = await getSolidDataset(url, { fetch: fetch });
        }
        catch (error) {
          let message = 'Unknown Error';
          if (error instanceof Error) message = error.message;
          throw new Error(`Error when fetching dataset url: ${url} error: ${message}`);
        }
        let newThing = getThing(newDs, url);
        if (newThing) {
          let thingId = getInteger(newThing, schema.identifier);
          if (thingId === note.id) {
            let updArr = changes.map((change) => {
              switch (change) {
                case "title":
                  newThing = setStringNoLocale(newThing!, DCTERMS.title, note.title!);
                  break;
                case "content":
                  newThing = setStringNoLocale(newThing!, schema.text, note.content!);
                  break;
                case "category":
                  newThing = setStringNoLocale(newThing!, otherV.category, note.category!);
              }
            });
            //handle?
            let updDataSet = setThing(newDs, newThing!);
            const savedDataSet = await saveSolidDatasetAt(url, updDataSet,
              { fetch: fetch });
          }
        }
      }));
      return updArr;
    }
    else {
      let newThingArr = getThingAll(data);
      if (newThingArr) {
        newThingArr.forEach(async (newThing) => {
          let thingId = getInteger(newThing, schema.identifier);
          if (thingId === note.id) {
            let updArr = changes.map((change) => {
              switch (change) {
                case "title":
                  newThing = setStringNoLocale(newThing!, DCTERMS.title, note.title!);
                  break;
                case "content":
                  newThing = setStringNoLocale(newThing!, schema.text, note.content!);
              }
            });
            let updDataSet = setThing(data, newThing!);
            await saveSolidDatasetAt(url, updDataSet, { fetch: fetch });
          }
        });
      }
    }
  }));
}

export const deleteEntry = async (webId: string, fetch: fetcher, id: number, type: string) => {
  let urlsArr = await getAllUrlFromPublicIndex(webId, fetch, type);
  let updUrlsArr = await Promise.all(urlsArr.map(async (url) => {
    //handle??
    let data = await getSolidDataset(url, { fetch: fetch });
    if (isContainer(data)) {
      let allNotes = getContainedResourceUrlAll(data);
      let updArr = await Promise.all(allNotes.map(async (url) => {
        let newDs;
        try {
          newDs = await getSolidDataset(url, { fetch: fetch });
        }
        catch (error) {
          let message = 'Unknown Error';
          if (error instanceof Error) message = error.message;
          //  throwError(new Error(`Error when fetching dataset url: ${url} error: ${message}`));
          throw new Error(`Error when fetching dataset url: ${url} error: ${message}`);
        }
        let newThing = getThing(newDs, url);
        if (newThing) {
          let thingId = getInteger(newThing, schema.identifier);
          if (thingId === id) {
            await deleteSolidDataset(newDs, { fetch: fetch });
          }
        }
      }));
      return updArr;
    }
    else {
      let newThingArr = getThingAll(data);
      if (newThingArr) {
        newThingArr.forEach(async (newThing) => {
          let thingId = getInteger(newThing, schema.identifier);
          if (thingId === id) {
            let newData = removeThing(data, newThing);
            await saveSolidDatasetAt(url, newData, { fetch: fetch });
          }
        });
      }
    }
  }));
}


export const checkContacts = async (webId: string, fetch: fetcher) => {
  try {
    const storage = await getStoragePref(webId, fetch);
    await getSolidDataset(`${storage}contacts/`, { fetch: fetch });
    const contactsUrl = `${storage}contacts/Person/`;
    await getSolidDataset(contactsUrl, { fetch: fetch });
    return true;
  }
  catch (error) {
    return false;
  }
}

export const fetchContacts = async (webId: string, fetch: fetcher) => {
  const storage = await getStoragePref(webId, fetch);
  let newDs
  try {
    newDs = await getSolidDataset(`${storage}contacts/people.ttl`, { fetch: fetch });
  }
  catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    throw new Error(`couldn't fetch file with contacts, ${message}`);
  }
  const allPeople = getThingAll(newDs);
  let finalArr = await Promise.all(allPeople.map(async (personThing) => {
    let personThingUrl = personThing.url;
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

      let name = getStringNoLocale(personThing, foaf.name);
      if (name && personWebId) return [name, personWebId];
      if (!name && personWebId) return [null, personWebId];
      return null;
    }
  }));
  finalArr = finalArr.filter((item) => (item));
  finalArr = finalArr as ((string | null)[])[]
  let ret: ((string | null)[])[] = finalArr as ((string | null)[])[];;
  return ret;
}