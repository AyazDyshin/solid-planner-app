import {
    createAclFromFallbackAcl, getSolidDatasetWithAcl, hasAccessibleAcl, hasFallbackAcl,
    hasResourceAcl, universalAccess, getResourceAcl, saveAclFor, acp_ess_2, createContainerAt, deleteContainer
} from "@inrupt/solid-client";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { getAccessType, getPrefLink, getStoragePref } from "./SolidPod";
import { ACP } from "@inrupt/vocab-solid";
import { accessObject, fetcher } from "../components/types";
import { changeAccessAcp, getAcpAccess } from "./helperAccess";


// export function getAcrPolicyUrlAll<ResourceExt extends WithAccessibleAcr>(
//     resourceWithAcr: ResourceExt
// ) {
//     // const acr = internal_getAcr(resourceWithAcr);
//     const allAcrPolicies = getResourceAcrPolicyAll(resourceWithAcr);
//     // const acrUrl = getSourceUrl(acr);
//     return allAcrPolicies.map((thing) => {
//         return thing.url;
//     });
// }

// function isPolicy(thing: ThingPersisted): thing is Policy {
//     let b = getIriAll(thing, rdf.type).includes(ACP.Policy);
//     return getIriAll(thing, rdf.type).includes(ACP.Policy);
// }
// export function getAllPolicy(
//     resourceWithAcr: { internal_acp: { acr: AccessControlResource; }; }
// ): ResourcePolicy[] {
//     const acr = getAcr(resourceWithAcr);
//     console.log("here1");
//     console.log(acr);
//     const foundThings = getThingAll(acr);
//     console.log("here2");
//     console.log(foundThings);
//     const foundPolicies = foundThings.filter(
//         (thing) => thing !== null && isPolicy(thing)
//     ) as ResourcePolicy[];
//     return foundPolicies;
// }

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
        throw new Error("Couldn't fetch a dataset with Acl");
    }
    let resourceAcl;
    if (!hasResourceAcl(myDatasetWithAcl)) {
        if (!hasAccessibleAcl(myDatasetWithAcl)) {
            throw new Error(
                "The current user does not have permission to change access rights to this Resource."
            );
        }
        if (!hasFallbackAcl(myDatasetWithAcl)) {
            throw new Error(
                "The current user does not have permission to see who currently has access to this Resource."
            );
        }
        resourceAcl = createAclFromFallbackAcl(myDatasetWithAcl);
    } else {
        resourceAcl = getResourceAcl(myDatasetWithAcl);
    }
    await saveAclFor(myDatasetWithAcl, resourceAcl, { fetch: fetch });
}

export const determineAccess = async (webId: string, url: string, fetch: fetcher) => {
    console.log("this5?");

    let accType;
    const pubAcc = await getPubAccess(webId, url, fetch);
    pubAcc.read ? accType = { "public": pubAcc } : accType = { "private": pubAcc };
    let retShared = null;
    const sharedList = await getSharedList(webId, url, fetch);
    if (!(Object.keys(sharedList).length === 0)) retShared = sharedList;
    return [accType, retShared];
}
// This function is used to set public Access type for both WAC and ACP PODs, sets access type to either public or private
// ie give read permission to general public or not.
export const setPubAccess = async (webId: string, accessObj: accessObject, url: string, fetch: fetcher) => {
    console.log("this1?");
    let type = await getAccessType(webId, fetch);
    if (type === "wac") {
        try {
            let upd = await universalAccess.setPublicAccess(url, {
                read: accessObj.read,
                append: accessObj.append,
                write: accessObj.write
            }, { fetch: fetch });
            if (!upd) {
                throw new Error("You don't have permissions to changes the access type of this resource");
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
                    throw new Error("You don't have permissions to changes the access type of this resource");
                };
            }
            catch {
                throw new Error("You don't have permissions to change the access type of this resource");
            }
        }
    }
    else {
        await changeAccessAcp(url, accessObj, ACP.PublicAgent, fetch);
    }
}

// this function is used to give read permission to specific Agents. Used for both WAC and ACP PODs
export const shareWith = async (webId: string, url: string, fetch: fetcher, accessObj: accessObject, shareWith: string) => {
    console.log("this2?");

    let type = await getAccessType(webId, fetch);

    if (type === "wac") {
        try {

            let upd = await universalAccess.setAgentAccess(url, shareWith, {
                read: accessObj.read,
                append: accessObj.append,
                write: accessObj.write
            }, { fetch: fetch });
            if (!upd) {
                throw new Error("You don't have permissions to changes the access type of this resource");
            }
            // return upd;

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
                    throw new Error("You don't have permissions to changes the access type of this resource");
                }
                // return upd;

            }

            catch {
                throw new Error("you don't have permissions to change the access type of this resource");
            }
        }
    }

    else {

        await changeAccessAcp(url, accessObj, shareWith, fetch);

    }
}






export const getSharedList = async (webId: string, url: string, fetch: fetcher) => {
    console.log("this3?");

    let type = await getAccessType(webId, fetch);

    if (type === "wac") {
        try {
            const allAgents = await universalAccess.getAgentAccessAll(url, { fetch: fetch });
            if (!allAgents) {
                throw new Error(`you don't have right to read access object of ${url}`);
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
                    throw new Error(`you don't have right to read access object of ${url}`);
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
                throw new Error(`you don't have right to read access object of ${url}`);
            }
        }
    }
    else {
        return getAcpAccess(webId, url, fetch, "agent");
    }
}




export const getPubAccess = async (webId: string, url: string, fetch: fetcher) => {
    console.log("this4?");

    let type = await getAccessType(webId, fetch);
    if (type === "wac") {
        try {
            let pubAcc = await universalAccess.getPublicAccess(url, { fetch: fetch });
            if (!pubAcc) {
                throw new Error(`you don't have right to read access object of ${url}`);
            }
            return pubAcc;
        }
        catch {
            try {
                await initializeAcl(url, fetch);
                let pubAcc = await universalAccess.getPublicAccess(url, { fetch: fetch });
                if (!pubAcc) {
                    throw new Error(`you don't have right to read access object of ${url}`);
                }
                return pubAcc;
            }
            catch (error) {
                throw new Error(`you don't have right to read access object of ${url}`);
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
            throw new Error("Couldn't fetch a dataSet from a given Pod, this might be due to server error, or due to not having permission");

        }
    }
    if (!dataSetWithAcr.internal_acp.acr) return "wac";
    return "acp";
}

export const checkPermissions = async (webId: string, fetch: fetcher) => {

    try {
        let storage = await getStoragePref(webId, fetch);
        let type = await isWacOrAcp(storage, fetch);
        if (type === "acp") {
            return true;
        }
        else {
            let b = await createContainerAt(`${storage}planerAppTester1/`, { fetch: fetch });
            await initializeAcl(`${storage}planerAppTester1/`, fetch);
            // await setAccess("public",`${storage}planerAppTester1/`,fetch);
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
            let h = await deleteContainer(`${storage}planerAppTester1/`, { fetch: fetch });
        }
    }
    catch (error) {
        return false;
    }
    return true;
}
