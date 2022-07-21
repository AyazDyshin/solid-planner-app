import {
    createAclFromFallbackAcl, getSolidDatasetWithAcl, hasAccessibleAcl, hasFallbackAcl,
    hasResourceAcl, universalAccess, getResourceAcl, saveAclFor, acp_ess_2, createContainerAt, deleteContainer
} from "@inrupt/solid-client";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { ACP } from "@inrupt/vocab-solid";
import { accessObject, fetcher } from "./types";
import { changeAccessAcp, getAcpAccess } from "./helperAccess";
import { getAccessType } from "./podGetters";
import { createEntryInInbox } from "./SolidPod";

/**
* initialzes ACL for resources contained in a WAC POD
* @category Access functions
* @param   {string} url url of the resource to initialze ACL for
* @param   {fetcher} fetch fetch function
* @return  {Promise<void>}
*/
export const initializeAcl = async (url: string, fetch: fetcher): Promise<void> => {
    let myDatasetWithAcl
    try {
        myDatasetWithAcl = await getSolidDatasetWithAcl(url, { fetch: fetch });
    }

    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        throw new Error(`Error when fetching dataset, url: ${url} error: ${message}`);
    }
    let resourceAcl;
    if (!hasResourceAcl(myDatasetWithAcl)) {
        if (!hasAccessibleAcl(myDatasetWithAcl)) {
            throw new Error(
                `The current user does not have permission to change access rights to this resource, url: ${url}`
            );
        }
        if (!hasFallbackAcl(myDatasetWithAcl)) {

            throw new Error(
                `The current user does not have permission to see who currently has access to this resource, url: ${url}`
            );
        }
        resourceAcl = createAclFromFallbackAcl(myDatasetWithAcl);
    } else {
        resourceAcl = getResourceAcl(myDatasetWithAcl);
    }
    await saveAclFor(myDatasetWithAcl, resourceAcl, { fetch: fetch });
}

/**
* Wrapper function that calls @see getPubAccess and @see getSharedList to get public access and agents access of a given resource
* @category Access functions
* @param   {string} webId webId of the user
* @param   {string} url url of the resource to get access for
* @param   {fetcher} fetch fetch function
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<Array>} returns an array of object containing information about resource's public and agents access or null
*/
export const determineAccess = async (webId: string, url: string, fetch: fetcher, storagePref: string, prefFileLocation: string,
    podType: string): Promise<(Record<string, AccessModes> | null)[]> => {
    let accType;
    const pubAcc = await getPubAccess(webId, url, fetch, storagePref, prefFileLocation, podType);
    pubAcc.read ? accType = { "public": pubAcc } : accType = { "private": pubAcc };
    let retShared = null;
    const sharedList = await getSharedList(webId, url, fetch, storagePref, prefFileLocation, podType);
    if (!(Object.keys(sharedList).length === 0)) retShared = sharedList;
    return [accType, retShared];
}

/**
* Sets given public access rights for a given resource
* @category Access functions
* @param   {string} webId webId of the user
* @param   {accessObject} accessObj the access rights to set 
* @param   {string} url url of the resource to set public access for
* @param   {fetcher} fetch fetch function
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<void>}
*/
export const setPubAccess = async (webId: string, accessObj: accessObject, url: string, fetch: fetcher,
    storagePref: string, prefFileLocation: string, podType: string) => {
    const type = await getAccessType(webId, fetch, storagePref, prefFileLocation, podType);
    if (type === "wac") {
        try {
            const upd = await universalAccess.setPublicAccess(url, {
                read: accessObj.read,
                append: accessObj.append,
                write: accessObj.write
            }, { fetch: fetch });
            if (!upd) {
                throw new Error(`You don't have permissions to changes the access type of this resource, url: ${url}`);
            }
        }
        catch {
            try {
                await initializeAcl(url, fetch);
                const upd = await universalAccess.setPublicAccess(url, {
                    read: accessObj.read,
                    append: accessObj.append,
                    write: accessObj.write
                }, { fetch: fetch });
                if (!upd) {
                    throw new Error(`You don't have permissions to changes the access type of this resource, url: ${url}`);
                }
            }
            catch {
                throw new Error(`You don't have permissions to change the access type of this resource, url: ${url}`);
            }
        }
    }
    else {
        await changeAccessAcp(url, accessObj, ACP.PublicAgent, fetch);
    }
}

/**
* Sets given access rights for a given agent for a given resource
* @category Access functions
* @param   {string} webId webId of the user
* @param   {string} url url of the resource to set agent access for
* @param   {fetcher} fetch fetch function
* @param   {accessObject} accessObj the access rights to set 
* @param   {string} shareWith agent's WebID to set the access right for
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @param   {string} entry entry type to set the access rights for, can be note or habit
* @return  {Promise<void>}
*/
export const shareWith = async (webId: string, url: string, fetch: fetcher, accessObj: accessObject,
    shareWith: string, storagePref: string, prefFileLocation: string, podType: string, entry: string) => {
    const type = await getAccessType(webId, fetch, storagePref, prefFileLocation, podType);
    if (type === "wac") {
        try {
            const upd = await universalAccess.setAgentAccess(url, shareWith, {
                read: accessObj.read,
                append: accessObj.append,
                write: accessObj.write
            }, { fetch: fetch });
            if (!upd) {
                throw new Error(`The current user does not have permission to change access rights to this resource, url: ${url}`);
            }
        }
        catch {
            try {
                await initializeAcl(url, fetch);

                const upd = await universalAccess.setAgentAccess(url, shareWith, {
                    read: accessObj.read,
                    append: accessObj.append,
                    write: accessObj.write
                }, { fetch: fetch });
                if (!upd) {
                    throw new Error(`The current user does not have permission to change access rights to this resource, url: ${url}`);
                }
            }

            catch {
                throw new Error(`The current user does not have permission to change access rights to this resource, url: ${url}`);
            }
        }
        if (accessObj.read) {
            await createEntryInInbox(webId, shareWith, fetch, entry, accessObj, url);
        }
    }
    else {
        await changeAccessAcp(url, accessObj, shareWith, fetch);
    }
}

/**
* Function that returns a list of agents that for whom access rights are defined for a give resource
* @category Access functions
* @param   {string} webId webId of the user
* @param   {string} url url of the resource to get the agent's access for
* @param   {fetcher} fetch fetch function
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<Record<string, AccessModes>>} returns an object with all agents and their access rights to the given resource
*/
export const getSharedList = async (webId: string, url: string, fetch: fetcher, storagePref: string, prefFileLocation: string,
    podType: string): Promise<Record<string, AccessModes>> => {

    if (podType === "wac") {
        try {
            const allAgents = await universalAccess.getAgentAccessAll(url, { fetch: fetch });
            if (!allAgents) {
                throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
            }
            const accObj: Record<string, AccessModes> = {};
            for (const obj in allAgents) {
                if (!(obj === webId || obj.substring(0, 8) !== 'https://')) {
                    accObj[obj] = allAgents[obj];
                }
            }
            return accObj;
        }
        catch {
            try {
                await initializeAcl(url, fetch);
                const allAgents = await universalAccess.getAgentAccessAll(url, { fetch: fetch });
                if (!allAgents) {
                    throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
                }
                const accObj: Record<string, AccessModes> = {};
                for (const obj in allAgents) {
                    if (!(obj === webId || obj.substring(0, 8) !== 'https://')) {
                        accObj[obj] = allAgents[obj];
                    }
                }
                return accObj;
            }
            catch {
                throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
            }
        }
    }
    else {
        return getAcpAccess(webId, url, fetch, "agent");
    }
}

/**
* Function that returns public access rights of a given resource
* @category Access functions
* @param   {string} webId webId of the user
* @param   {string} url url of the resource to get the agent's access for
* @param   {fetcher} fetch fetch function
* @param   {accessObject} accessObj the access rights to set 
* @param   {string} storagePref url of user's preferred storage location
* @param   {string} prefFileLocation url of user's preference file location
* @param   {string} podType denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<Object>} returns an object with public access rights for a given resource
*/
export const getPubAccess = async (webId: string, url: string, fetch: fetcher, storagePref: string, prefFileLocation: string,
    podType: string): Promise<AccessModes | {
        read: boolean;
        append: boolean;
        write: boolean;
    }> => {
    if (podType === "wac") {
        try {
            const pubAcc = await universalAccess.getPublicAccess(url, { fetch: fetch });
            if (!pubAcc) {
                throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
            }
            return pubAcc;
        }
        catch {
            try {
                await initializeAcl(url, fetch);
                const pubAcc = await universalAccess.getPublicAccess(url, { fetch: fetch });
                if (!pubAcc) {
                    throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
                }
                return pubAcc;
            }
            catch (error) {
                throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
            }
        }
    }
    else {
        const retOfCall = await getAcpAccess(webId, url, fetch, "public");
        if (!retOfCall[ACP.PublicAgent]) return { read: false, append: false, write: false }
        return retOfCall[ACP.PublicAgent];
    }
}

/**
* Function that gets the PODs access mechanism
* @category Access functions
* @param   {string} url url of the resource to get the agent's access for
* @param   {fetcher} fetch fetch function
* @return  {Promise<"wac" | "acp">} returns "wac" or "acp"
*/
export const isWacOrAcp = async (url: string, fetch: fetcher): Promise<"wac" | "acp"> => {
    let dataSetWithAcr;
    try {
        dataSetWithAcr = await acp_ess_2.getSolidDatasetWithAcr(url, { fetch: fetch });
    }
    catch (error) {
        try {
            await initializeAcl(url, fetch);
            dataSetWithAcr = await acp_ess_2.getSolidDatasetWithAcr(url, { fetch: fetch });
        }
        catch {
            throw new Error(`Couldn't fetch a dataSet from user's POD, this might be due to server error, or due to not having permission`);

        }
    }
    if (!dataSetWithAcr.internal_acp.acr) return "wac";
    return "acp";
}

/**
* Checks application's permission for the user's POD
* @category Access functions
* @param   {string} webId webId of the user
* @param   {fetcher} fetch fetch function
* @param   {string} storage url of user's preferred storage location
* @param   {string} type denotes what access control mechanism user's POD uses, can be wac or acp
* @return  {Promise<boolean>} returns true if the application has all the needed rights and false otherwise
*/
export const checkPermissions = async (webId: string, fetch: fetcher, storage: string, type: string): Promise<boolean> => {

    try {
        if (type === "acp") {
            return true;
        }
        else {
            await createContainerAt(`${storage}planerAppTester1/`, { fetch: fetch });
            await initializeAcl(`${storage}planerAppTester1/`, fetch);
            const upd = await universalAccess.setPublicAccess(`${storage}planerAppTester1/`, {
                read: true,
                append: true,
                write: true,
                controlRead: true,
                controlWrite: true
            }, { fetch: fetch });
            if (upd === null) {
                return false;
            }
            if ((upd.read && upd.write && upd.append && upd.controlRead && upd.controlWrite) === false) {
                return false;
            }
            await deleteContainer(`${storage}planerAppTester1/`, { fetch: fetch });
        }
    }
    catch (error) {
        return false;
    }
    return true;
}
