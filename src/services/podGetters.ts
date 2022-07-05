import { getSolidDataset, getThing, getUrl, getStringNoLocale, getThingAll } from "@inrupt/solid-client";
import { space, solid, schema } from "rdf-namespaces";
import { fetcher, voc } from "../components/types";
import { createEntriesInTypeIndex, recordAccessType, repairDefaultFolder } from "./SolidPod";
//const throwError = useAsyncError();
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


export const getDefaultFolder = async (webId: string, fetch: fetcher, prefFileLocation: string): Promise<string | null> => {

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
    let aThing = await getThing(dataSet, prefFileLocation);
    if (!aThing) {
        throw new Error("preference file is empty");
    }
    let defFolderUrl = await getUrl(aThing, voc.defaultFolder);
    // if (!defFolderUrl) {
    //     await repairDefaultFolder(webId, fetch);
    //     try {
    //         dataSet = await getSolidDataset(prefFileLocation, {
    //             fetch: fetch
    //         });
    //     }
    //     catch (error) {
    //         let message = 'Unknown Error';
    //         if (error instanceof Error) message = error.message;
    //         throw new Error(`couldn't fetch preference file, this might be due to the fact that it doesn't exist, error: ${message}`);
    //     }
    //     let aThing = await getThing(dataSet, prefFileLocation);
    //     if (!aThing) {
    //         throw new Error("preference file is empty");
    //     }
    //     defFolderUrl = await getUrl(aThing, voc.defaultFolder);
    //     if (!defFolderUrl) {
    //         throw new Error("couldn't get default folder file location from user's preference file");
    //     }
    // }
    return defFolderUrl;
}


export const getAccessType = async (webId: string, fetch: fetcher, storagePref: string, prefFileLocation: string) => {
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
    let aThing = await getThing(dataSet, prefFileLocation);
    if (aThing === null) {
        throw new Error("preference file is empty");
    }
    let type = await getStringNoLocale(aThing, voc.accessType);
    if (type === null) {
        await recordAccessType(webId, fetch, storagePref,prefFileLocation);
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
        let aThing = await getThing(dataSet, prefFileLocation);
        if (aThing === null) {
            throw new Error("preference file is empty");
        }
        type = await getStringNoLocale(aThing, voc.accessType);
        if (type === null) {
            throw new Error("access type is not recorded in pref file");
        }
    }
    return type;
}


export const getAllUrlFromPublicIndex = async (webId: string, fetch: fetcher, type: string, storagePref: string) => {
    let typeToGet = (type === "note" ? schema.TextDigitalDocument : voc.Habit);
    const publicTypeIndexUrl = await getPublicTypeIndexUrl(webId, fetch);
    let dataSet;
    try {
        dataSet = await getSolidDataset(publicTypeIndexUrl, { fetch: fetch });
    }
    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        throw new Error(`Error when fetching dataset url: ${publicTypeIndexUrl} error: ${message}`);
    }
    let allThing = getThingAll(dataSet);
    let updThings = allThing.filter((thing) => getUrl(thing, solid.forClass) === typeToGet)
        .map((thing) => getUrl(thing, solid.instance)).filter((url) => url) as string[];
    if (updThings === []) {
        if (type === 'note') {
            await createEntriesInTypeIndex(webId, fetch, "note", storagePref);
        }
        else {
            await createEntriesInTypeIndex(webId, fetch, "habit", storagePref);
        }
        try {
            dataSet = await getSolidDataset(publicTypeIndexUrl, { fetch: fetch });
        }
        catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            throw new Error(`Error when fetching dataset url: ${publicTypeIndexUrl} error: ${message}`);
        }
        let allThing = getThingAll(dataSet);
        updThings = allThing.filter((thing) => getUrl(thing, solid.forClass) === typeToGet)
            .map((thing) => getUrl(thing, solid.instance)).filter((url) => url) as string[];
        if (updThings === []) {
            throw new Error("error,reference to solid planner app's folder is missing from you public type index files");
        }
    }
    return updThings;
}
