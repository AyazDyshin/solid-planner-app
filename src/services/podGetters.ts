import { getSolidDataset, getThing, getUrl, getStringNoLocale, getThingAll } from "@inrupt/solid-client";
import { space, solid, schema } from "rdf-namespaces";
import { fetcher, voc } from "./types";
import { createEntriesInTypeIndex, recordAccessType } from "./SolidPod";

/**
* Returns user's preference application folder location
* @category Pod getter functions
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @return  {Promise<string>} returns url of the preference folder location
*/
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


/**
* Returns user's preference storage location
* @category Pod getter functions
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @return  {Promise<string>} url of the preference storage location
*/
export const getStoragePref = async (webId: string, fetch: fetcher): Promise<string> => {
    let dataSet;
    try {
        dataSet = await getSolidDataset(webId, {
            fetch: fetch
        });
    }
    catch (error) {
        throw new Error("error occurred when trying to fetch user's webId");
    }
    const aThing = getThing(dataSet, webId);
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

/**
* Returns user's inbox folder location
* @category Pod getter functions
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @return  {Promise<string>} url of the inbox folder location
*/
export const getInboxUrl = async (webId: string, fetch: fetcher): Promise<string> => {
    let dataSet;
    try {
        dataSet = await getSolidDataset(webId, {
            fetch: fetch
        });
    }
    catch (error) {
        throw new Error("error occurred when trying to fetch user's webId");
    }
    const aThing = getThing(dataSet, webId);
    if (aThing) {
        const firstData = getUrl(aThing, "http://www.w3.org/ns/ldp#inbox");
        if (firstData) {
            return firstData;
        }
        throw new Error("error, for some reason you webId profile does not contain info about your inbox location");
    }
    else {
        throw new Error("error, user's profile/card#me doesn't exist");
    }
}

/**
* Returns user's public type index file location
* @category Pod getter functions
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @return  {Promise<string>} url of the user's public type index file
*/
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
    const aThing = getThing(dataSet, webId);
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

/**
* Returns user's preference storage location
* @category Pod getter functions
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @return  {Promise<string>} url of the preference storage location
*/
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
    const aThing = await getThing(dataSet, prefFileLocation);
    if (!aThing) {
        throw new Error("preference file is empty");
    }
    const defFolderUrl = await getUrl(aThing, voc.defaultFolder);
    return defFolderUrl;
}

/**
 * returns POD's access mechanism's type
 * @category Pod getter functions
 * @param   {string} webId webId of the user
 * @param   {fetcher} fetch fetch function
 * @param   {string} storagePref url of user's preferred storage location
 * @param   {string} prefFileLocation url of user's preference file location
 * @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
 * @return  {Promise<string>} POD's access mechanism type, can be 'wac' or 'acp
 */
export const getAccessType = async (webId: string, fetch: fetcher, storagePref: string, prefFileLocation: string,
    podType: string): Promise<string> => {
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
    const aThing = await getThing(dataSet, prefFileLocation);
    if (aThing === null) {
        throw new Error("preference file is empty");
    }
    let type = await getStringNoLocale(aThing, voc.accessType);
    if (type === null) {
        await recordAccessType(fetch, prefFileLocation, podType);
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
        const aThing = await getThing(dataSet, prefFileLocation);
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

/**
 * returns all urls contained in the user's public type index file for a given entry type
 * @category Pod getter functions
 * @param   {string} webId webId of the user
 * @param   {fetcher} fetch fetch function
 * @param   {string} entry entry type to get urls for
 * @param   {string} storagePref url of user's preferred storage location
 * @param   {string} publicTypeIndexUrl url of the user's public type index file location
 * @return  {Promise<Array>} an array of urls of locations of files of the given entry's type
 */
export const getAllUrlFromPublicIndex = async (webId: string, fetch: fetcher, entry: string, storagePref: string,
    publicTypeIndexUrl: string, other?: boolean
): Promise<string[]> => {
    if (other) {
        let newPublicTypeUrl = "";
        try {
            newPublicTypeUrl = await getPublicTypeIndexUrl(webId, fetch);
        }
        catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            throw new Error(`couldn't fetch other user's publicTypeIndex file this might be due to the fact that you don't have access to it, error: ${message}`);
        }
        publicTypeIndexUrl = newPublicTypeUrl;
    }
    const typeToGet = (entry === "note" ? schema.TextDigitalDocument : voc.Habit);
    let dataSet;
    try {
        dataSet = await getSolidDataset(publicTypeIndexUrl, { fetch: fetch });
    }
    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        throw new Error(`Error when fetching dataset url: ${publicTypeIndexUrl} error: ${message}`);
    }
    const allThing = getThingAll(dataSet);
    let updThings = allThing.filter((thing) => getUrl(thing, solid.forClass) === typeToGet)
        .map((thing) => getUrl(thing, solid.instance)).filter((url) => url) as string[];
    if (updThings === []) {
        if (entry === 'note') {
            await createEntriesInTypeIndex(fetch, "note", storagePref, publicTypeIndexUrl);
        }
        else {
            await createEntriesInTypeIndex(fetch, "habit", storagePref, publicTypeIndexUrl);
        }
        try {
            dataSet = await getSolidDataset(publicTypeIndexUrl, { fetch: fetch });
        }
        catch (error) {
            let message = 'Unknown Error';
            if (error instanceof Error) message = error.message;
            throw new Error(`Error when fetching dataset url: ${publicTypeIndexUrl} error: ${message}`);
        }
        const allThing = getThingAll(dataSet);
        updThings = allThing.filter((thing) => getUrl(thing, solid.forClass) === typeToGet)
            .map((thing) => getUrl(thing, solid.instance)).filter((url) => url) as string[];
        if (updThings === []) {
            throw new Error("error,reference to solid planner app's folder is missing from you public type index files");
        }
    }
    return updThings;
}
