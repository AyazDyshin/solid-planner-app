import {
    createAclFromFallbackAcl, getSolidDatasetWithAcl, hasAccessibleAcl, hasFallbackAcl,
    hasResourceAcl, universalAccess, getResourceAcl, saveAclFor, acp_ess_2, createContainerAt, deleteContainer
} from "@inrupt/solid-client";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { ACP } from "@inrupt/vocab-solid";
import { accessObject, fetcher } from "../components/types";
import { changeAccessAcp, getAcpAccess } from "./helperAccess";
import { getAccessType } from "./podGetters";

/* 
this function is used to defaultAccessControlAgentMatcherAppendPolicyialize Acl for resources stored on PODs utilizing WAC access type that don't have acl attached,
once getPublicAccess function from universalAccess module will be fixed, this function won't be needed.
ref: https://github.com/inrupt/solid-client-js/issues/1549
*/
export const initializeAcl = async (url: string, fetch: fetcher) => {
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
            // throwError(new Error(
            //     `The current user does not have permission to see who currently has access to this resource, url: ${url}`
            // ));
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

export const determineAccess = async (webId: string, url: string, fetch: fetcher, storagePref: string, prefFileLocation: string,
    podType: string) => {
    console.log("in det Access");
    let accType;
    const pubAcc = await getPubAccess(webId, url, fetch, storagePref, prefFileLocation, podType);
    pubAcc.read ? accType = { "public": pubAcc } : accType = { "private": pubAcc };
    let retShared = null;
    const sharedList = await getSharedList(webId, url, fetch, storagePref, prefFileLocation, podType);
    if (!(Object.keys(sharedList).length === 0)) retShared = sharedList;
    return [accType, retShared];
}
// This function is used to set public Access type for both WAC and ACP PODs, sets access type to either public or private
// ie give read permission to general public or not.
export const setPubAccess = async (webId: string, accessObj: accessObject, url: string, fetch: fetcher,
    storagePref: string, prefFileLocation: string, podType: string) => {
    let type = await getAccessType(webId, fetch, storagePref, prefFileLocation, podType);
    if (type === "wac") {
        try {
            let upd = await universalAccess.setPublicAccess(url, {
                read: accessObj.read,
                append: accessObj.append,
                write: accessObj.write
            }, { fetch: fetch });
            if (!upd) {
                //  throwError(new Error(`You don't have permissions to changes the access type of this resource, url: ${url}`));
                throw new Error(`You don't have permissions to changes the access type of this resource, url: ${url}`);
            };
        }
        catch {
            try {
                await initializeAcl(url, fetch);
                let upd = await universalAccess.setPublicAccess(url, {
                    read: accessObj.read,
                    append: accessObj.append,
                    write: accessObj.write
                }, { fetch: fetch });
                if (!upd) {
                    //  throwError(new Error(`You don't have permissions to changes the access type of this resource, url: ${url}`));
                    throw new Error(`You don't have permissions to changes the access type of this resource, url: ${url}`);
                };
            }
            catch {
                // throwError(new Error(`You don't have permissions to change the access type of this resource, url: ${url}`));
                throw new Error(`You don't have permissions to change the access type of this resource, url: ${url}`);
            }
        }
    }
    else {
        await changeAccessAcp(url, accessObj, ACP.PublicAgent, fetch);
    }
}

// this function is used to give read permission to specific Agents. Used for both WAC and ACP PODs
export const shareWith = async (webId: string, url: string, fetch: fetcher, accessObj: accessObject,
    shareWith: string, storagePref: string, prefFileLocation: string, podType: string) => {

    let type = await getAccessType(webId, fetch, storagePref, prefFileLocation, podType);

    if (type === "wac") {
        try {

            let upd = await universalAccess.setAgentAccess(url, shareWith, {
                read: accessObj.read,
                append: accessObj.append,
                write: accessObj.write
            }, { fetch: fetch });
            if (!upd) {
                //throwError(new Error(`The current user does not have permission to change access rights to this resource, url: ${url}`));
                throw new Error(`The current user does not have permission to change access rights to this resource, url: ${url}`);
            }
        }
        catch {
            try {
                await initializeAcl(url, fetch);

                let upd = await universalAccess.setAgentAccess(url, shareWith, {
                    read: accessObj.read,
                    append: accessObj.append,
                    write: accessObj.write
                }, { fetch: fetch });
                if (!upd) {
                    //   throwError(new Error(`The current user does not have permission to change access rights to this resource, url: ${url}`));
                    throw new Error(`The current user does not have permission to change access rights to this resource, url: ${url}`);
                }
            }

            catch {
                //  throwError(new Error(`The current user does not have permission to change access rights to this resource, url: ${url}`));
                throw new Error(`The current user does not have permission to change access rights to this resource, url: ${url}`);
            }
        }
    }

    else {
        await changeAccessAcp(url, accessObj, shareWith, fetch);
    }
}

export const getSharedList = async (webId: string, url: string, fetch: fetcher, storagePref: string, prefFileLocation: string,
    podType: string) => {

    if (podType === "wac") {
        try {
            const allAgents = await universalAccess.getAgentAccessAll(url, { fetch: fetch });
            if (!allAgents) {
                //  throwError(new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`));
                throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
            }
            let accObj: Record<string, AccessModes> = {};
            for (let obj in allAgents) {
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
                    //  throwError(new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`));
                    throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
                }
                let accObj: Record<string, AccessModes> = {};
                for (let obj in allAgents) {
                    if (!(obj === webId || obj.substring(0, 8) !== 'https://')) {
                        accObj[obj] = allAgents[obj];
                    }
                }
                return accObj;
            }
            catch {
                // throwError(new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`));
                throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
            }
        }
    }
    else {
        return getAcpAccess(webId, url, fetch, "agent");
    }
}




export const getPubAccess = async (webId: string, url: string, fetch: fetcher, storagePref: string, prefFileLocation: string,
    podType: string) => {
    if (podType === "wac") {
        try {
            let pubAcc = await universalAccess.getPublicAccess(url, { fetch: fetch });
            if (!pubAcc) {
                // throwError(new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`));
                throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
            }
            return pubAcc;
        }
        catch {
            try {
                await initializeAcl(url, fetch);
                let pubAcc = await universalAccess.getPublicAccess(url, { fetch: fetch });
                if (!pubAcc) {
                    //  throwError(new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`));
                    throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
                }
                return pubAcc;
            }
            catch (error) {
                // throwError(new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`));
                throw new Error(`The current user does not have permission to see who currently has access to this resource, url: ${url}`);
            }
        }
    }
    else {
        let retOfCall = await getAcpAccess(webId, url, fetch, "public");
        if (!retOfCall[ACP.PublicAgent]) return { read: false, append: false, write: false }
        return retOfCall[ACP.PublicAgent];
    }
}

export const isWacOrAcp = async (url: string, fetch: fetcher) => {
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
            // throwError(new Error(`Couldn't fetch a dataSet from user's POD, this might be due to server error, or due to not having permission`));
            throw new Error(`Couldn't fetch a dataSet from user's POD, this might be due to server error, or due to not having permission`);

        }
    }
    if (!dataSetWithAcr.internal_acp.acr) return "wac";
    return "acp";
}

export const checkPermissions = async (webId: string, fetch: fetcher, storage: string, type: string) => {

    try {
        if (type === "acp") {
            return true;
        }
        else {
            await createContainerAt(`${storage}planerAppTester1/`, { fetch: fetch });
            await initializeAcl(`${storage}planerAppTester1/`, fetch);
            let upd = await universalAccess.setPublicAccess(`${storage}planerAppTester1/`, {
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
