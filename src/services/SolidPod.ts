import {
  createThing, getSolidDataset, getThing, getThingAll, getUrl, ThingPersisted,
  addUrl, setThing, saveSolidDatasetAt, createContainerAt, createSolidDataset, Thing, getInteger,
  getStringNoLocale, removeThing, saveSolidDatasetInContainer, setUrl, getContainedResourceUrlAll, deleteSolidDataset,
  setStringNoLocale, getResourceInfo, addStringNoLocale, isContainer, getContentType, addInteger,
  buildThing, getSolidDatasetWithAcl, hasResourceAcl, hasAccessibleAcl, hasFallbackAcl, createAclFromFallbackAcl,
  getResourceAcl, saveAclFor, setPublicResourceAccess, getPublicAccess, getStringNoLocaleAll
} from '@inrupt/solid-client';
import { pim } from '@inrupt/solid-client/dist/constants';
import { useSession } from '@inrupt/solid-ui-react';
import { DCTERMS, RDF } from '@inrupt/vocab-common-rdf';
import { solid, schema, space, foaf } from 'rdf-namespaces';
import { category } from 'rdf-namespaces/dist/qu';
import { dataset } from 'rdf-namespaces/dist/schema';
import { Note } from '../components/types';
import { universalAccess } from "@inrupt/solid-client";
import { getPubAccess, initializeAcl, isWacOrAcp, setPubAccess } from './access';
import { fetchWithVc } from '@inrupt/solid-client-access-grants';

type fetcher = (((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>)) | undefined;

//function that transforms var of type Thing to var of Type Note
export const thingToNote = (toChange: Thing | null): Note | null => {

  if (!toChange) {
    return null;
  }
  let updTitle = getStringNoLocale(toChange, DCTERMS.title) ? getStringNoLocale(toChange, DCTERMS.title) : "";
  let updContent = getStringNoLocale(toChange, schema.text) ? getStringNoLocale(toChange, schema.text) : "";
  let updId = getInteger(toChange, schema.identifier) ? getInteger(toChange, schema.identifier) : Date.now() + Math.floor(Math.random() * 1000);
  let updCategory = getStringNoLocale(toChange, "http://dbpedia.org/ontology/category");

  const note: Note = {
    id: updId,
    title: updTitle,
    content: updContent,
    category: updCategory,
    url: toChange.url
  };
  return note;
}

//function that extracts main part from the user's webId
export const modifyWebId = (webId: string): string => {
  const arr = webId.split("/");
  const updArr = [...arr.slice(0, 3)];
  return `${updArr.join("/")}/`;
}

//  adds '/' to Url's end if it is missing
export const updUrlForFolder = (url: string) => {
  if (url.charAt(url.length - 1) !== '/') return url += '/'
  return url;
}

// returns 
export const getPrefLink = async (webId: string, fetch: fetcher) => {
  let dataSet;
  try {
    dataSet = await getSolidDataset(webId, {
      fetch: fetch
    });
  }
  catch (error) {
    throw new Error("Error when fetching a dataset containing user's profile/card#me");
  }

  const aThing = getThing(dataSet, webId);
  if (aThing) {
    const firstData = getUrl(aThing, space.preferencesFile);
    if (firstData) {
      return firstData;
    }
    throw new Error("a link to preferred storage folder is missing from your profile");
  }
  else {
    throw new Error("error when trying to get data of your profile/card#me, the data is missing");
  }
}

//returns user's storage preference url
export const getStoragePref = async (webId: string, fetch: fetcher) => {
  let dataSet;
  try {
    dataSet = await getSolidDataset(webId, {
      fetch: fetch
    });
  }
  catch (error) {
    throw new Error("error occurred when trying to fetch user's webId");
  }

  let aThing = getThing(dataSet, webId);

  if (aThing) {
    const firstData = getUrl(aThing, space.storage);
    if (firstData) {
      return firstData;
    }
    throw new Error("error, for some reason you webId profile does not contain info about your preferred storage location");
  }
  else {
    throw new Error("error, user's profile/card#me doesn't exist");
  }
}

export const getPublicTypeIndexUrl = async (webId: string, fetch: fetcher) => {
  let dataSet;
  try {
    dataSet = await getSolidDataset(webId, {
      fetch: fetch
    });
  }
  catch (error) {
    throw new Error("error occurred when trying to fetch user's webId");
  }

  let aThing = getThing(dataSet, webId);

  if (aThing) {
    const firstData = getUrl(aThing, solid.publicTypeIndex);
    if (firstData) {
      return firstData;
    }
    throw new Error("error, for some reason you webId profile does not contain a link to public type index folder");
  }
  else {
    throw new Error("error, user's profile/card#me doesn't exist");
  }
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
  //const defFolderUpd = await getDefaultFolder(webId, fetch);
  const storagePref = await getStoragePref(webId, fetch);
  let defaultFolderPath = `${storagePref}SolidPlannerApp`;
  let notesPath = `${defaultFolderPath}/notes/`;
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
  aThing = addUrl(aThing, "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#defaultFolder", updUrlForFolder(defaultFolderPath));
  dataSet = setThing(dataSet, aThing);
  await createDefFolder(webId, defaultFolderPath, fetch);
  const updDataSet = await saveSolidDatasetAt(prefFileLocation!, dataSet, { fetch: fetch });
  await createEntriesInTypeIndex(webId, fetch, notesPath);
}

export const createEntriesInTypeIndex = async (webId: string, fetch: fetcher, url: string) => {
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
    .addIri(solid.forClass, schema.TextDigitalDocument)
    .addIri(solid.instance, url)
    .build();
  dataSet = setThing(dataSet, aThing);
  const updDataSet = await saveSolidDatasetAt(pubicTypeIndexUrl, dataSet, { fetch: fetch });
}

export const getDefaultFolder = async (webId: string, fetch: fetcher): Promise<string | null> => {
  //await checkAndCreatePrefLink(webId, fetch);  
  const prefFileLocation = await getPrefLink(webId, fetch);
  //handle
  let dataSet = await getSolidDataset(prefFileLocation!, {
    fetch: fetch
  });
  //handle
  let aThing = await getThing(dataSet, prefFileLocation!);
  //handle
  let defFolderUrl = await getUrl(aThing!, "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#defaultFolder");
  return defFolderUrl;
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
  aThing = addStringNoLocale(aThing, "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#accessType", type);
  dataSet = setThing(dataSet, aThing);
  const updDataSet = await saveSolidDatasetAt(prefFileLocation!, dataSet, { fetch: fetch });
}

export const getAccessType = async (webId: string, fetch: fetcher) => {
  const prefFileLocation = await getPrefLink(webId, fetch);
  let dataSet
  try {
    dataSet = await getSolidDataset(prefFileLocation, {
      fetch: fetch
    });
  }
  catch {
    throw new Error("couldn't fetch preference file, this might be due to the fact that it doesn't exist");
  }
  //handle
  let aThing = await getThing(dataSet, prefFileLocation);
  console.log("pref file");
  console.log(aThing);
  if (aThing === null) {
    throw new Error("preference file is empty");
  }
  //handle
  let type = await getStringNoLocale(aThing, "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#accessType");
  if (type === null) {
    // add try repair here
    throw new Error("access type is not recorded in pref file");
  }
  return type;
}
// export const makePrivate = async (url: string, fetch: fetcher) => {
//   let upd = await universalAccess.setPublicAccess(url, {
//     read: false,
//     append: false,
//     write: false,
//     controlRead: false,
//     controlWrite: false
//   }, { fetch: fetch });
//   if (!upd) {
//     throw new Error("You don't have permissions to changes the access type of this resource");
//   }
// }
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
  if (type === "wac") {
    console.log("after wac 1");
  }

  await setPubAccess(webId, { read: true, write: false }, `${updUrlForFolder(defFolderUrl)}`, fetch);

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
  await setPubAccess(webId, { read: true, write: false }, `${updUrlForFolder(defFolderUrl)}notes/`, fetch);



  // try {
  //   await createContainerAt(`${updUrlForFolder(defFolderUrl)}habits/`, {
  //     fetch: fetch
  //   });
  // }
  // catch (error) {
  //   console.log("error when trying to create a folder for habits in specified folder");
  // }
}

export const getAllNotesUrlFromPublicIndex = async (webId: string, fetch: fetcher) => {
  const publicTypeIndexUrl = await getPublicTypeIndexUrl(webId, fetch);
  const dataSet = await getSolidDataset(publicTypeIndexUrl, { fetch: fetch });
  let allThing = getThingAll(dataSet);
  let updThings = allThing.filter((thing) => getUrl(thing, solid.forClass) === schema.TextDigitalDocument)
    .map((thing) => getUrl(thing, solid.instance)).filter((url) => url) as string[];
  if (updThings === []) {
    throw new Error("error, it seems like something deleted a reference to solid planner app's folder from you public type index files ");
  }
  return updThings;
}

export const fetchAllNotes = async (webId: string, fetch: fetcher, categoryFilter?: string, accessFilter?: string) => {

  let arrayOfCategories: string[] = [];
  let urlsArr
  try {
    urlsArr = await getAllNotesUrlFromPublicIndex(webId, fetch);
  }
  catch (error) {
    throw new Error("Couldn't fetch notes from your public type index");
  }
  let updUrlsArr = await Promise.all(urlsArr.map(async (url) => {
    let data: any;
    try {
      data = await getSolidDataset(url, { fetch: fetch });
    }
    catch (error) {
      throw new Error(`Couldn't fetch a resource that is listed in your Public type index ${url} this might happen because it 
      is listed in public type index, but doesn't exist in your POD`);
    }
    if (isContainer(data)) {
      let allNotes = getContainedResourceUrlAll(data);
      let updArr = await Promise.all(allNotes.map(async (noteUrl) => {
        let newDs = await getSolidDataset(noteUrl, { fetch: fetch });
        try {
          newDs = await getSolidDataset(noteUrl, { fetch: fetch });
        }
        catch (error) {
          throw new Error(`error while fetching on of the notes in container: ${url} note url: ${noteUrl}`);
        }
        let newThing = getThing(newDs, noteUrl);
        if (newThing) {
          let categoryOfCurrNote = getStringNoLocale(newThing, "http://dbpedia.org/ontology/category");
          if (categoryOfCurrNote && !arrayOfCategories.includes(categoryOfCurrNote)) arrayOfCategories.push(categoryOfCurrNote);
          if (categoryFilter || accessFilter) {
            let toReturn: ThingPersisted | null;
            toReturn = newThing;
            if (categoryFilter) {
              toReturn = (categoryOfCurrNote === categoryFilter ? newThing : null);
            }
            if (accessFilter) {
              switch (accessFilter) {
                case "public": {
                  const acc = await getPubAccess(webId, noteUrl, fetch);
                  if (!toReturn) {
                    break;
                  }
                  else {
                    toReturn = (acc!.read ? newThing : null);
                    break;
                  }

                }
                case "private": {
                  const acc = await getPubAccess(webId, noteUrl, fetch);
                  if (!toReturn) {
                    break;
                  }
                  else {
                    toReturn = (acc!.read ? null : newThing);
                    break;
                  }
                }
              }
            }
            return toReturn;
          }

        }
        // let hh = await access.getPublicAccess(newThing!.url, { fetch: fetch });
        // console.log(hh);
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
      if (categoryFilter) {
        let newArr = arrOf.map((thing) => {
          let categoryOfCurrNote = getStringNoLocale(thing, "http://dbpedia.org/ontology/category");
          if (categoryFilter) {
            return categoryOfCurrNote === categoryFilter ? thing : null;
          }
        });
      }
      return arrOf;
    }
  }));
  let retValue: [(ThingPersisted | null)[], string[]] = [updUrlsArr.flat(), arrayOfCategories]
  return retValue;
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

  let newNote = buildThing(createThing({ url: noteUrl })).addUrl(RDF.type, schema.TextDigitalDocument)
    .addStringNoLocale(DCTERMS.title, titleUpd)
    .addStringNoLocale(schema.text, contentUpd)
    .addInteger(schema.identifier, id)
    .build();
  if (note.category) {
    newNote = addStringNoLocale(newNote, "http://dbpedia.org/ontology/category", note.category);
  }

  dataSet = setThing(dataSet, newNote);

  const updDataSet = await saveSolidDatasetAt(noteUrl, dataSet, { fetch: fetch });
  let type = await getAccessType(webId, fetch);
  if (type === "wac") {
    await initializeAcl(noteUrl, fetch);
  }
  await setPubAccess(webId, { read: false, write: false }, noteUrl, fetch);
  let p = await getPubAccess(webId, noteUrl, fetch);
  // console.log("before set");
  // await setAccess("public", noteUrl);
  // console.log("after set");
  // let hh = await universalAccess.getPublicAccess(noteUrl, { fetch: fetch });
  // console.log(hh);
}

export const editNote = async (webId: string, fetch: fetcher, note: Note, changes: string[]) => {

  let urlsArr = await getAllNotesUrlFromPublicIndex(webId, fetch);
  let updUrlsArr = await Promise.all(urlsArr.map(async (url) => {

    const data = await getSolidDataset(url, { fetch: fetch });
    if (isContainer(data)) {
      let allNotes = getContainedResourceUrlAll(data);
      let updArr = await Promise.all(allNotes.map(async (url) => {

        let newDs = await getSolidDataset(url, { fetch: fetch });
        // let testDs = await getSolidDatasetWithAcl(url, { fetch: fetch });
        let newThing = getThing(newDs, url);
        if (newThing) {

          let thingId = getInteger(newThing, schema.identifier);
          if (thingId === note.id) {
            // console.log(testDs);
            // let gg = setPublicAccess();
            // let acc = await access.getPublicAccess(url, { fetch: fetch });
            // console.log(acc);
            // let lul = access.setPublicAccess(
            //   url,  // Resource
            //   { read: true, write: false },    // Access object
            //   { fetch: fetch })
            // console.log("we are here");
            // console.log(huh);
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
  let urlsArr = await getAllNotesUrlFromPublicIndex(webId, fetch);
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
            console.log("and here");
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
    let ds = await getSolidDataset(`${storage}contacts/`, { fetch: fetch });
    return true;
  }
  catch (error)
  { 
    console.log(error);
    return false;
  }
}

export const fetchContacts = async (webId: string, fetch: fetcher) => {
  const storage = await getStoragePref(webId, fetch);
  const contactsUrl = `${storage}contacts/Person/`;
  const ds = await getSolidDataset(contactsUrl, { fetch: fetch });
  // console.log(ds);
  const allUrl = getContainedResourceUrlAll(ds);
  console.log(allUrl);
  const newDs = await getSolidDataset(`${storage}contacts/people.ttl`, { fetch: fetch });
  const allPeople = getThingAll(newDs);
  const names = allPeople.map((thing) => {
    let name = getStringNoLocale(thing, foaf.name);
    return name;
  });
  // console.log(allPeople);
  console.log(names);
  return [allUrl, names];
}