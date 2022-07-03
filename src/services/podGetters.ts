import { getSolidDataset, getThing, getUrl, getStringNoLocale, getThingAll } from "@inrupt/solid-client";
import { space, solid, schema } from "rdf-namespaces";
import { fetcher, voc } from "../components/types";
import { useAsyncError } from "./helpers";
//const throwError = useAsyncError();
export const getPrefLink = async (webId: string, fetch: fetcher) => {
    let dataSet;
    try {
        dataSet = await getSolidDataset(webId, {
            fetch: fetch
        });
    }
    catch (error) {
        //throwError(new Error("Error when fetching a dataset containing user's profile/card#me"));
        throw new Error("Error when fetching a dataset containing user's profile/card#me");
    }
    const aThing = getThing(dataSet, webId);
    if (aThing) {
        const firstData = getUrl(aThing, space.preferencesFile);
        if (firstData) {
            return firstData;
        }
        //repair
       // throwError(new Error("a link to preferred storage folder is missing from your profile"));
        throw new Error("a link to preferred storage folder is missing from your profile");
    }
    else {
        //throwError(new Error("error when trying to get data of your profile/card#me, the data is missing"));
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
        //throwError(new Error("error occurred when trying to fetch user's webId"));
        throw new Error("error occurred when trying to fetch user's webId");
    }
    let aThing = getThing(dataSet, webId);
    if (aThing) {
        const firstData = getUrl(aThing, space.storage);
        if (firstData) {
            return firstData;
        }
       // throwError(new Error("error, for some reason you webId profile does not contain info about your preferred storage location"));
        throw new Error("error, for some reason you webId profile does not contain info about your preferred storage location");
    }
    else {
        //throwError(new Error("error, user's profile/card#me doesn't exist"));
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
        //throwError(new Error("error occurred when trying to fetch user's webId"));
        throw new Error("error occurred when trying to fetch user's webId");
    }
    let aThing = getThing(dataSet, webId);
    if (aThing) {
        const firstData = getUrl(aThing, solid.publicTypeIndex);
        if (firstData) {
            return firstData;
        }
        //throwError(new Error("error, for some reason you webId profile does not contain a link to public type index folder"));
        throw new Error("error, for some reason you webId profile does not contain a link to public type index folder");
    }
    else {
       // throwError(new Error("error, user's profile/card#me doesn't exist"));
        throw new Error("error, user's profile/card#me doesn't exist");
    }
}


export const getDefaultFolder = async (webId: string, fetch: fetcher): Promise<string | null> => {
    const prefFileLocation = await getPrefLink(webId, fetch);
    let dataSet
    try {
        dataSet = await getSolidDataset(prefFileLocation, {
            fetch: fetch
        });
    }
    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
       // throwError(new Error(`couldn't fetch preference file, this might be due to the fact that it doesn't exist, error: ${message}`));
        throw new Error(`couldn't fetch preference file, this might be due to the fact that it doesn't exist, error: ${message}`);
    }
    let aThing = await getThing(dataSet, prefFileLocation);
    //repair?
    if (!aThing) {
       // throwError(new Error("preference file is empty"));
        throw new Error("preference file is empty");
    }
    let defFolderUrl = await getUrl(aThing, voc.defaultFolder);
    return defFolderUrl;
}


export const getAccessType = async (webId: string, fetch: fetcher) => {
    const prefFileLocation = await getPrefLink(webId, fetch);
    let dataSet
    try {
        dataSet = await getSolidDataset(prefFileLocation, {
            fetch: fetch
        });
    }
    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        throw new Error(`couldn't fetch preference file, this might be due to the fact that it doesn't exist, error: ${message}`);
    }
    //repair?
    let aThing = await getThing(dataSet, prefFileLocation);
    if (aThing === null) {
       // throwError(new Error("preference file is empty"));
        throw new Error("preference file is empty");
    }
    let type = await getStringNoLocale(aThing, voc.accessType);
    if (type === null) {
        //repair
       // throwError(new Error("access type is not recorded in pref file"));
        throw new Error("access type is not recorded in pref file");
    }
    return type;
}


export const getAllUrlFromPublicIndex = async (webId: string, fetch: fetcher, type: string) => {
    let typeToGet = (type === "note" ? schema.TextDigitalDocument : voc.Habit);
    const publicTypeIndexUrl = await getPublicTypeIndexUrl(webId, fetch);
    let dataSet;
    try {
        dataSet = await getSolidDataset(publicTypeIndexUrl, { fetch: fetch });
    }
    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
       // throwError(new Error(`Error when fetching dataset url: ${publicTypeIndexUrl} error: ${message}`));
        throw new Error(`Error when fetching dataset url: ${publicTypeIndexUrl} error: ${message}`);
    }
    let allThing = getThingAll(dataSet);
    let updThings = allThing.filter((thing) => getUrl(thing, solid.forClass) === typeToGet)
        .map((thing) => getUrl(thing, solid.instance)).filter((url) => url) as string[];
    //repair
    if (updThings === []) {
       // throwError(new Error("error,reference to solid planner app's folder is missing from you public type index files"));
        throw new Error("error,reference to solid planner app's folder is missing from you public type index files");
    }
    return updThings;
}
