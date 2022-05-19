import { buildThing, createThing, getSolidDataset, getThing, getThingAll, getUrl, ThingPersisted, addUrl, setThing, saveSolidDatasetAt, createContainerAt, createSolidDataset, Thing, getInteger, getStringNoLocale, removeThing, saveSolidDatasetInContainer, setUrl, getContainedResourceUrlAll, deleteSolidDataset, setStringNoLocale, getResourceInfo } from '@inrupt/solid-client';
import { pim } from '@inrupt/solid-client/dist/constants';
import { useSession } from '@inrupt/solid-ui-react';
import { DCTERMS, RDF } from '@inrupt/vocab-common-rdf';
import { solid, schema, space } from 'rdf-namespaces';
import { dataset } from 'rdf-namespaces/dist/schema';
import { Note } from '../components/types';

type fetcher = ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>);

//function that transforms var of type Thing to var of Type Note
export const thingToNote = (toChange: Thing): Note | null => {
  let updTitle = getStringNoLocale(toChange, DCTERMS.title);
  let updContent = getStringNoLocale(toChange, schema.text);
  let updId = getInteger(toChange, schema.identifier);
  if (updTitle === null || updContent === null || updId === null) {
    console.log("error, Thing provided have required fileds as null");
    return null;
  }
  const note: Note = {
    id: updId,
    //handle
    title: updTitle,
    content: updContent
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
    console.log(`error, couldn't fetch a dataset at: ${webId}`);
    return;
  }

  const aThing = getThing(dataSet, webId);
  if (aThing) {
    const firstData = getUrl(aThing, space.preferencesFile);
    return firstData;
  }
  console.log("error, user's profile/card#me doesn't exist");
  return null;
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
    console.log("error couldn't fetch dataset at user's webId");
    return;
  }

  let aThing;
  try {
    aThing = getThing(dataSet, webId);
  }
  catch (error) {
    console.log("error couldn't fetch a thing from user's webId dataset");
    return;
  }
  if (aThing) {
    const firstData = getUrl(aThing, space.storage);
    return firstData;
  }

  console.log("error, user's profile/card#me doesn't exist");
  return null;

}
// creates a link to preference file in user's webId card #here
export const createPrefLink = async (webId: string, fetch: fetcher) => {
  let dataSet;
  dataSet = await getSolidDataset(webId, {
    fetch: fetch
  });
  let aThing = getThing(dataSet, webId);
  const urlToPrefs = `${modifyWebId(webId)}settings/prefs.ttl`;
  aThing = addUrl(aThing!, space.preferencesFile, urlToPrefs);
  dataSet = setThing(dataSet, aThing);
  const updDataSet = saveSolidDatasetAt(webId, dataSet, { fetch: fetch });
}

export const checkAndCreatePrefLink = async (webId: string, fetch: fetcher) => {
  const checkedPrefLink = await getPrefLink(webId, fetch);
  if (!checkedPrefLink) {
    createPrefLink(webId, fetch);
  }
}

export const recordDefaultFolder = async (webId: string, fetch: fetcher, defaultFolderPath: string) => {
  checkAndCreatePrefLink(webId, fetch);
  const prefFileLocation = await getPrefLink(webId, fetch);
  //handle
  let dataSet = await getSolidDataset(prefFileLocation!, {
    fetch: fetch
  });

  let aThing: ThingPersisted | null;
  try {
    //handle
    aThing = await getThing(dataSet, prefFileLocation!);
  }
  catch (error) {
    console.log("error getting a thing w");
  }
  //handle
  aThing = addUrl(aThing!, "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#defaultFolder", updUrlForFolder(defaultFolderPath));
  dataSet = setThing(dataSet, aThing);
  createDefFolder(defaultFolderPath, fetch);
  const updDataSet = saveSolidDatasetAt(prefFileLocation!, dataSet, { fetch: fetch });
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
export const testing = async (webId: string, fetch: fetcher) => {
  const prefFileLocation = await getPrefLink(webId, fetch);
  console.log("location");
  console.log(prefFileLocation);


}

export const createDefFolder = async (defFolderUrl: string, fetch: fetcher) => {
  try {
    createContainerAt(`${updUrlForFolder(defFolderUrl)}notes/`, {
      fetch: fetch
    });

  }
  catch (error) {
    console.log("error when trying to create a folder for notes in specified folder");
  }
  try {
    createContainerAt(`${updUrlForFolder(defFolderUrl)}habits/`, {
      fetch: fetch
    });
  }
  catch (error) {
    console.log("error when trying to create a folder for habits in specified folder");
  }
}

export const fetchAllNotes = async (webId: string, fetch: fetcher) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  //handle
  const dataSet = await getSolidDataset(`${defFolder}notes/`, {
    fetch: fetch
  });
  console.log("this is dataset");
  console.log(dataSet);
  let allNotes = getContainedResourceUrlAll(dataSet);
 // console.log(`these are allNotes in fetch:`);
 // console.log(allNotes);
  let updArr = await Promise.all(allNotes.map(async (url) => {
    try {
      //let info = await getResourceInfo(url, {fetch : fetch});
      let newDs = await getSolidDataset(url, { fetch: fetch });
      let newThing = getThing(newDs, url);
      console.log(`just fetched : ${getStringNoLocale(newThing!, DCTERMS.title)}`);
      //handle 
      return getThing(newDs, url)!;
    }
    catch (error) {
      // console.log("error is here:");
      //console.log(error);
      return null;
    }
  }));
  return updArr;
  //const allNotes = await getThingAll(dataSet);
  //console.log("we are here");
  //allNotes.shift();
  //console.log(allNotes);
  //console.log(allNotes[0]);
  //let test = getStringNoLocale(allNotes[0], DCTERMS.title);
  //console.log("thisss");
  //console.log(test);
  //let testThing = getThingAll(allNotes[0]);
}

export const saveNote = async (webId: string, fetch: fetcher, note: Note) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const notesFolder = `${defFolder}notes/`;
  let dataSet = await getSolidDataset(notesFolder, {
    fetch: fetch
  });

  const id = note.id === null ? Date.now() : note.id;
  const noteUrl = `${notesFolder}${id}.ttl`;
  const newNote = buildThing(createThing({ url: noteUrl })).addUrl(RDF.type, schema.TextDigitalDocument)
    .addStringNoLocale(DCTERMS.title, note.title)
    .addStringNoLocale(schema.text, note.content)
    .addInteger(schema.identifier, id)
    .build();
  dataSet = setThing(dataSet, newNote);
  const updDataSet = saveSolidDatasetAt(noteUrl, dataSet, { fetch: fetch });
}
export const editNote = async (webId: string, fetch: fetcher, note: Note, changes: string[]) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const notesFolder = `${defFolder}notes/`;
  const noteId = note.id;

  let dataSet = await getSolidDataset(`${notesFolder}${noteId}.ttl`, {
    fetch: fetch
  });
  let thingToChange = getThing(dataSet, `${notesFolder}${noteId}.ttl`);
  let newThing = thingToChange;
  let updArr = changes.map((change) => {
    switch (change) {
      case "title":
        newThing = setStringNoLocale(newThing!, DCTERMS.title, note.title);
        break;
      case "content":
        newThing = setStringNoLocale(newThing!, schema.text, note.content);
    }
  });
  let updDataSet = setThing(dataSet, newThing!);
  const savedDataSet = await saveSolidDatasetAt(`${notesFolder}${noteId}.ttl`, updDataSet,
    { fetch: fetch });
}
export const deleteNote = async (webId: string, fetch: fetcher, thing: Thing) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const notesFolder = `${defFolder}notes/`;
  const noteId = await getInteger(thing, schema.identifier);
  //handle id is null
  let dataSet = await getSolidDataset(`${notesFolder}${noteId}.ttl`, {
    fetch: fetch
  });
  await deleteSolidDataset(dataSet, { fetch: fetch });
  console.log("note was deleted");
  //dataSet = removeThing(dataSet, thing);
  //const updDataSet = saveSolidDatasetAt(`${defFolder}notes/`, dataSet, { fetch: fetch });
}