import { buildThing, createThing, getSolidDataset, getThing, getThingAll, getUrl, ThingPersisted, addUrl, setThing, saveSolidDatasetAt } from '@inrupt/solid-client';
import { useSession } from '@inrupt/solid-ui-react';
import { solid, schema, space } from 'rdf-namespaces';

type fetcher = ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & ((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>);

export const modifyWebId = (webId: string): string => {
  const arr = webId.split("/");
  const updArr = [...arr.slice(0, 3)];
  return `${updArr.join("/")}/`;
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
  console.log(aThing);
  const urlToPrefs = `${modifyWebId(webId)}settings/prefs.ttl`;
  aThing = addUrl(aThing!, space.preferencesFile, urlToPrefs);
  dataSet = setThing(dataSet,aThing);
  const updDataSet = saveSolidDatasetAt(webId, dataSet, {fetch : fetch});
}

export const checkAndCreatePrefLink = async (webId: string, fetch: fetcher) => {
  const checkedPrefLink = await getPrefLink(webId, fetch);
  if (!checkedPrefLink) {
    createPrefLink(webId, fetch);
  }
}

export const recordDefaultFolder = async (webId: string, fetch: fetcher) => {
  const prefFileLocation = await getPrefLink(webId, fetch);
  let dataSet = await getSolidDataset(prefFileLocation!, {
    fetch: fetch
  });
  console.log(dataSet);
}