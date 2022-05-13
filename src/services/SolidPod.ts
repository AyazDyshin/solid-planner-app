import { buildThing, createThing, getSolidDataset, getThing, getThingAll, getUrl, ThingPersisted, addUrl, setThing, saveSolidDatasetAt, createContainerAt, createSolidDataset, Thing, getInteger, getStringNoLocale, removeThing } from '@inrupt/solid-client';
import { pim } from '@inrupt/solid-client/dist/constants';
import { useSession } from '@inrupt/solid-ui-react';
import { DCTERMS, RDF } from '@inrupt/vocab-common-rdf';
import { solid, schema, space } from 'rdf-namespaces';
import { dataset } from 'rdf-namespaces/dist/schema';
import { Note } from '../components/types';

type fetcher = ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>);

export const thingToNote = (toChange: Thing): Note => {
  const note: Note = {
    id: getInteger(toChange, schema.identifier),
    //handle
    title: getStringNoLocale(toChange, DCTERMS.title)!,
    content: getStringNoLocale(toChange, schema.text)!
  };
  return note;
}

export const modifyWebId = (webId: string): string => {
  const arr = webId.split("/");
  const updArr = [...arr.slice(0, 3)];
  return `${updArr.join("/")}/`;
}

export const updUrlForFolder = (url: string) => {
  if (url.charAt(url.length - 1) !== '/') return url += '/'
  return url;
}

export const getPrefLink = async (webId: string, fetch: fetcher) => {
  const dataSet = await getSolidDataset(webId, {
    fetch: fetch
  });
  const aThing = getThing(dataSet, webId);
  const firstData = getUrl(aThing!, space.preferencesFile);
  return firstData;
}

export const createPrefLink = async (webId: string, fetch: fetcher) => {
  let dataSet = await getSolidDataset(webId, {
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
  const prefFileLocation = await getPrefLink(webId, fetch);
  let dataSet = await getSolidDataset(prefFileLocation!, {
    fetch: fetch
  });
  let aThing = await getThing(dataSet, webId);
  aThing = addUrl(aThing!, "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#defaultFolder", updUrlForFolder(defaultFolderPath));
  dataSet = setThing(dataSet, aThing);
  createDefFolder(defaultFolderPath, fetch);
  const updDataSet = saveSolidDatasetAt(prefFileLocation!, dataSet, { fetch: fetch });
}

export const getDefaultFolder = async (webId: string, fetch: fetcher): Promise<string | null> => {
  const prefFileLocation = await getPrefLink(webId, fetch);
  //handle
  let dataSet = await getSolidDataset(prefFileLocation!, {
    fetch: fetch
  });
  let aThing = await getThing(dataSet, webId);
  //handle
  let defFolderUrl = await getUrl(aThing!, "https://ayazdyshin.inrupt.net/plannerApp/vocab.ttl#defaultFolder");
  return defFolderUrl;
}

export const createDefFolder = async (defFolderUrl: string, fetch: fetcher) => {
  saveSolidDatasetAt(`${updUrlForFolder(defFolderUrl)}notes.ttl`, createSolidDataset(), {
    fetch: fetch
  });
  saveSolidDatasetAt(`${updUrlForFolder(defFolderUrl)}habits.ttl`, createSolidDataset(), {
    fetch: fetch
  });
}

export const fetchAllNotes = async (webId: string, fetch: fetcher) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  //handle
  const dataSet = await getSolidDataset(`${defFolder}notes.ttl`, {
    fetch: fetch
  });
  const allNotes = await getThingAll(dataSet);
  return allNotes;
}

export const saveNote = async (webId: string, fetch: fetcher, note: Note) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const notesFolder = `${defFolder}notes.ttl`;
  let dataSet = await getSolidDataset(notesFolder, {
    fetch: fetch
  });

  const id = note.id === null ? Date.now() : note.id;
  const newNote = buildThing(createThing({ name: `${id}` })).addUrl(RDF.type, schema.TextDigitalDocument)
    .addStringNoLocale(DCTERMS.title, note.title)
    .addStringNoLocale(schema.text, note.content)
    .addInteger(schema.identifier, id)
    .build();
  dataSet = setThing(dataSet, newNote);
  const updDataSet = saveSolidDatasetAt(notesFolder, dataSet, { fetch: fetch });
}

export const deleteNote = async (webId: string, fetch: fetcher, thing: Thing) => {
  const defFolder = await getDefaultFolder(webId, fetch);
  const notesFolder = `${defFolder}notes.ttl`;
  let dataSet = await getSolidDataset(notesFolder, {
    fetch: fetch
  });
  dataSet = removeThing(dataSet, thing);
  const updDataSet = saveSolidDatasetAt(notesFolder, dataSet, { fetch: fetch });
}