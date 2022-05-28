import { buildThing, createThing, getSolidDataset, getThing, getThingAll, getUrl, ThingPersisted, addUrl, setThing, saveSolidDatasetAt, createContainerAt, createSolidDataset, Thing, getInteger, getStringNoLocale, removeThing, saveSolidDatasetInContainer, setUrl, getContainedResourceUrlAll, deleteSolidDataset, setStringNoLocale, getResourceInfo, addStringNoLocale, isContainer, getContentType, addInteger } from '@inrupt/solid-client';
import { pim } from '@inrupt/solid-client/dist/constants';
import { useSession } from '@inrupt/solid-ui-react';
import { DCTERMS, RDF } from '@inrupt/vocab-common-rdf';
import { solid, schema, space } from 'rdf-namespaces';
import { category } from 'rdf-namespaces/dist/qu';
import { dataset } from 'rdf-namespaces/dist/schema';
import { Note } from '../components/types';

type fetcher = ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>);

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
    category: updCategory
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
  createDefFolder(defaultFolderPath, fetch);
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

export const createDefFolder = async (defFolderUrl: string, fetch: fetcher) => {
  try {
    await createContainerAt(`${updUrlForFolder(defFolderUrl)}notes/`, {
      fetch: fetch
    });

  }
  catch (error) {
    console.log("error when trying to create a folder for notes in specified folder");
  }
  try {
    await createContainerAt(`${updUrlForFolder(defFolderUrl)}habits/`, {
      fetch: fetch
    });
  }
  catch (error) {
    console.log("error when trying to create a folder for habits in specified folder");
  }
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

export const fetchAllNotes = async (webId: string, fetch: fetcher, categoryFilter?: string) => {
 
  let arrayOfCategories: string[] = [];
  let urlsArr = await getAllNotesUrlFromPublicIndex(webId, fetch);
  let updUrlsArr = await Promise.all(urlsArr.map(async (url) => {
    const data = await getSolidDataset(url, { fetch: fetch });
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
          if (categoryFilter) {
            return categoryOfCurrNote === categoryFilter ? newThing : null;
          }
        }

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
  const updDataSet = saveSolidDatasetAt(noteUrl, dataSet, { fetch: fetch });
}
export const editNote = async (webId: string, fetch: fetcher, note: Note, changes: string[]) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const notesFolder = `${defFolder}notes/`;
  const noteId = note.id;

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
          if (thingId === note.id) {
            let updArr = changes.map((change) => {
              switch (change) {
                case "title":
                  newThing = setStringNoLocale(newThing!, DCTERMS.title, note.title!);
                  break;
                case "content":
                  newThing = setStringNoLocale(newThing!, schema.text, note.content!);
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