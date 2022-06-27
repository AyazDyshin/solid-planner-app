import {
  createThing, getSolidDataset, getThing, getThingAll, getUrl, ThingPersisted,
  addUrl, setThing, saveSolidDatasetAt, createContainerAt, Thing, getInteger,
  getStringNoLocale, removeThing, getContainedResourceUrlAll, deleteSolidDataset,
  setStringNoLocale, addStringNoLocale, isContainer, addInteger,
  buildThing
} from '@inrupt/solid-client';
import { DCTERMS, RDF } from '@inrupt/vocab-common-rdf';
import { solid, schema, foaf, vcard } from 'rdf-namespaces';
import { Note, fetcher, Habit, voc } from '../components/types';
import { determineAccess, getPubAccess, getSharedList, initializeAcl, isWacOrAcp, setPubAccess } from './access';
import { updUrlForFolder } from './helpers';
import { getStoragePref, getPrefLink, getPublicTypeIndexUrl, getAllUrlFromPublicIndex, getDefaultFolder, getAccessType } from './podGetters';

//function that transforms var of type Thing to var of Type Note
export const thingToNote = async (toChange: Thing | null, webId: string, fetch: fetcher) => {
  if (!toChange) {
    return null;
  }
  let updTitle = getStringNoLocale(toChange, DCTERMS.title) ? getStringNoLocale(toChange, DCTERMS.title) : "";
  let updContent = getStringNoLocale(toChange, schema.text) ? getStringNoLocale(toChange, schema.text) : "";
  let updId = getInteger(toChange, schema.identifier) ? getInteger(toChange, schema.identifier) :
    Date.now() + Math.floor(Math.random() * 1000);
  let updCategory = getStringNoLocale(toChange, "http://dbpedia.org/ontology/category");
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

export const recordDefaultFolder = async (webId: string, fetch: fetcher) => {
  const storagePref = await getStoragePref(webId, fetch);
  let defaultFolderPath = `${storagePref}SolidPlannerApp`;
  let notesPath = `${defaultFolderPath}/notes/`;
  let habitsPath = `${defaultFolderPath}/habits/`;
  const prefFileLocation = await getPrefLink(webId, fetch);
  //handle
  let dataSet;
  try {
    dataSet = await getSolidDataset(prefFileLocation, {
      fetch: fetch
    });
  }
  catch (error) {
    throw new Error("error when fetching preference file, it either doesn't exist, or has different location from the one specified in the webId");
  }
  let aThing = getThing(dataSet, prefFileLocation);
  if (!aThing) {
    throw new Error("preference file does not exist");
  }
  //handle
  aThing = addUrl(aThing, voc.defaultFolder, updUrlForFolder(defaultFolderPath));
  dataSet = setThing(dataSet, aThing);
  await createDefFolder(webId, defaultFolderPath, fetch);
  const updDataSet = await saveSolidDatasetAt(prefFileLocation!, dataSet, { fetch: fetch });
  await createEntriesInTypeIndex(webId, fetch, notesPath, "note");
  await createEntriesInTypeIndex(webId, fetch, habitsPath, "habit");
}


export const createEntriesInTypeIndex = async (webId: string, fetch: fetcher, url: string, entryType: string) => {
  const pubicTypeIndexUrl = await getPublicTypeIndexUrl(webId, fetch);
  let dataSet;
  try {
    dataSet = await getSolidDataset(pubicTypeIndexUrl, {
      fetch: fetch
    });
  }
  catch (error) {
    throw new Error("error when fetching public type index file, it either doesn't exist, or has different location from the one specified in the webId");
  }
  let aThing = buildThing(createThing())
    .addIri(solid.forClass, entryType === "note" ? schema.TextDigitalDocument : voc.Habit)
    .addIri(solid.instance, url)
    .build();
  dataSet = setThing(dataSet, aThing);
  const updDataSet = await saveSolidDatasetAt(pubicTypeIndexUrl, dataSet, { fetch: fetch });
}


export const recordAccessType = async (webId: string, fetch: fetcher, type: string) => {
  const prefFileLocation = await getPrefLink(webId, fetch);
  //handle
  let dataSet;
  try {
    dataSet = await getSolidDataset(prefFileLocation, {
      fetch: fetch
    });
  }
  catch (error) {
    throw new Error("error when fetching preference file, it either doesn't exist, or has different location from the one specified in the webId");
  }
  let aThing = getThing(dataSet, prefFileLocation);
  //handle
  if (!aThing) {
    throw new Error("preference file does not exist");
  }

  //handle
  aThing = addStringNoLocale(aThing, voc.accessType, type);
  dataSet = setThing(dataSet, aThing);
  const updDataSet = await saveSolidDatasetAt(prefFileLocation!, dataSet, { fetch: fetch });
}


export const createDefFolder = async (webId: string, defFolderUrl: string, fetch: fetcher) => {
  try {
    await createContainerAt(`${updUrlForFolder(defFolderUrl)}`, {
      fetch: fetch
    });
  }
  catch (error) {
    throw new Error("error when trying to create a folder for notes in specified folder");
  }
  let type = await isWacOrAcp(`${updUrlForFolder(defFolderUrl)}`, fetch);
  await recordAccessType(webId, fetch, type);
  await setPubAccess(webId, { read: true, append: false, write: false }, `${updUrlForFolder(defFolderUrl)}`, fetch);
  try {
    await createContainerAt(`${updUrlForFolder(defFolderUrl)}notes/`, {
      fetch: fetch
    });
  }
  catch (error) {
    throw new Error("error when trying to create a folder for notes in specified folder");
  }
  if (type === "wac") {
    await initializeAcl(`${updUrlForFolder(defFolderUrl)}notes/`, fetch);
  }
  await setPubAccess(webId, { read: true, append: false, write: false }, `${updUrlForFolder(defFolderUrl)}notes/`, fetch);
  try {
    await createContainerAt(`${updUrlForFolder(defFolderUrl)}habits/`, {
      fetch: fetch
    });
  }
  catch (error) {
    throw new Error("error when trying to create a folder for habits in specified folder");
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
      throw new Error("Couldn't fetch notes from your public type index");
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
        throw new Error(`Couldn't fetch a resource that is listed in your Public type index ${url} this might happen because it 
      is listed in public type index, but doesn't exist in your POD`);
      }
    }
    if (isContainer(data)) {
      let allNotes = getContainedResourceUrlAll(data);
      let updArr = await Promise.all(allNotes.map(async (noteUrl) => {
        let newDs = await getSolidDataset(noteUrl, { fetch: fetch });
        try {
          newDs = await getSolidDataset(noteUrl, { fetch: fetch });
        }
        catch (error) {
          if (other) return null;
          else {
            throw new Error(`error while fetching on of the notes in container: ${url} note url: ${noteUrl}`);
          }
        }
        let newThing = getThing(newDs, noteUrl);
        // if (newThing) {
        //   let categoryOfCurrNote = getStringNoLocale(newThing, "http://dbpedia.org/ontology/category");
        //   if (categoryOfCurrNote && !arrayOfCategories.includes(categoryOfCurrNote)) arrayOfCategories.push(categoryOfCurrNote);
        //   if (categoryFilter || accessFilter) {
        //     let toReturn: ThingPersisted | null;
        //     toReturn = newThing;
        //     if (categoryFilter) {
        //       toReturn = (categoryOfCurrNote === categoryFilter ? newThing : null);
        //     }
        //     if (accessFilter) {
        //       switch (accessFilter) {
        //         case "public": {
        //           const acc = await getPubAccess(webId, noteUrl, fetch);
        //           if (!toReturn) {
        //             break;
        //           }
        //           else {
        //             toReturn = (acc!.read ? newThing : null);
        //             break;
        //           }
        //         }
        //         case "private": {
        //           const acc = await getPubAccess(webId, noteUrl, fetch);
        //           if (!toReturn) {
        //             break;
        //           }
        //           else {
        //             toReturn = (acc!.read ? null : newThing);
        //             break;
        //           }
        //         }
        //       }
        //     }
        //     return toReturn;
        //   }

        // }
        return newThing;
      }));
      return updArr;
    }
    else {
      let arrOf = getThingAll(data);
      arrOf.forEach((thing) => {
        let categoryOfCurrNote = getStringNoLocale(thing, "http://dbpedia.org/ontology/category");
        if (categoryOfCurrNote && !arrayOfCategories.includes(categoryOfCurrNote)) arrayOfCategories.push(categoryOfCurrNote);
        if (!getInteger(thing, schema.identifier)) {
          let newThing = addInteger(thing, schema.identifier, Date.now() + Math.floor(Math.random() * 1000));
          let newData = setThing(data, newThing);
          const updDataSet = saveSolidDatasetAt(url, newData, { fetch: fetch });
        }
      });
      // if (categoryFilter) {
      //   let newArr = arrOf.map((thing) => {
      //     let categoryOfCurrNote = getStringNoLocale(thing, "http://dbpedia.org/ontology/category");
      //     if (categoryFilter) {
      //       return categoryOfCurrNote === categoryFilter ? thing : null;
      //     }
      //   });
      // }
      return arrOf;
    }
  }));
  //let retValue: [(ThingPersisted | null)[], string[]] = [updUrlsArr.flat(), arrayOfCategories]
  let retValue = updUrlsArr.flat();
  if (!retValue) return [];
  return retValue;
}

export const saveHabit = async (webId: string, fetch: fetcher, habit: Habit) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const habitsFolder = `${defFolder}habits/`;
  let dataSet = await getSolidDataset(habitsFolder, {
    fetch: fetch
  });
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
    .addDate("http://example.org/date", startDate)
    .addStringNoLocale("http://example.org/recurrence", habit.recurrence!)
    .build();

  if (habit.category) newHabit = addStringNoLocale(newHabit, "http://dbpedia.org/ontology/category", habit.category);

  if (habit.custom) newHabit = addStringNoLocale(newHabit, "http://example.org/custom", habit.custom.join(" "));

  dataSet = setThing(dataSet, newHabit);
  await saveSolidDatasetAt(habitUrl, dataSet, { fetch: fetch });
  let type = await getAccessType(webId, fetch);
  if (type === "wac") {
    await initializeAcl(habitUrl, fetch);
  };
  await setPubAccess(webId, { read: false, append: false, write: false }, habitUrl, fetch);
  //lastCheckInDate, bestStreak, currentStreak, status
}

export const saveNote = async (webId: string, fetch: fetcher, note: Note) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const notesFolder = `${defFolder}notes/`;
  let dataSet = await getSolidDataset(notesFolder, {
    fetch: fetch
  });
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
  if (note.category) newNote = addStringNoLocale(newNote, "http://dbpedia.org/ontology/category", note.category);

  dataSet = setThing(dataSet, newNote);
  await saveSolidDatasetAt(noteUrl, dataSet, { fetch: fetch });
  let type = await getAccessType(webId, fetch);
  if (type === "wac") {
    await initializeAcl(noteUrl, fetch);
  };
  await setPubAccess(webId, { read: false, append: false, write: false }, noteUrl, fetch);
  //let p = await getPubAccess(webId, noteUrl, fetch);
}


export const editNote = async (webId: string, fetch: fetcher, note: Note, changes: string[]) => {
  let urlsArr = await getAllUrlFromPublicIndex(webId, fetch, "note");
  let updUrlsArr = await Promise.all(urlsArr.map(async (url) => {
    const data = await getSolidDataset(url, { fetch: fetch });
    if (isContainer(data)) {
      let allNotes = getContainedResourceUrlAll(data);
      let updArr = await Promise.all(allNotes.map(async (url) => {
        let newDs = await getSolidDataset(url, { fetch: fetch });
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
                  newThing = setStringNoLocale(newThing!, "http://dbpedia.org/ontology/category", note.category!);
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


export const deleteNote = async (webId: string, fetch: fetcher, id: number) => {
  let urlsArr = await getAllUrlFromPublicIndex(webId, fetch, "note");
  let updUrlsArr = await Promise.all(urlsArr.map(async (url) => {
    const data = await getSolidDataset(url, { fetch: fetch });
    if (isContainer(data)) {
      let allNotes = getContainedResourceUrlAll(data);
      let updArr = await Promise.all(allNotes.map(async (url) => {
        let newDs = await getSolidDataset(url, { fetch: fetch });
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
  catch {
    throw new Error("couldn't fetch file with contacts");
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
      catch {
        throw new Error(`couldn't fetch one of the contacts, file url: ${personDsUrl}`);
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