import {
    createAclFromFallbackAcl, getSolidDatasetWithAcl, hasAccessibleAcl, hasFallbackAcl,
    hasResourceAcl, universalAccess, getResourceAcl, saveAclFor, acp_ess_2, createSolidDataset, createContainerAt, deleteContainer, getPublicAccess, getAgentAccessAll, Access, AgentAccess, asUrl, getSolidDataset, acp_ess_1, solidDatasetAsTurtle
} from "@inrupt/solid-client";
import { WithAccessibleAcr } from "@inrupt/solid-client/dist/acp/acp";
import { access } from "fs";
import { getAccessType, getStoragePref } from "./SolidPod";

type accessObject = { read: boolean, write: boolean };
type fetcher = (((input: RequestInfo, init?: RequestInit | undefined) => Promise<Response>) & ((input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<Response>)) | undefined;
/* 
this function is used to initialize Acl for resources stored on PODs utilizing WAC access type that don't have acl attached,
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
    //  console.log(myDatasetWithAcl);
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
    // const myDatasetWithAcl2 = await getSolidDatasetWithAcl(url, { fetch: fetch });
    // console.log("here it is:");
    // console.log(getResourceAcl(myDatasetWithAcl2));
}

// This function is used to set public Access type for both WAC and ACP PODs, sets access type to either public or private
// ie give read permission to general public or not.
export const setPubAccess = async (webId: string, accessObj: accessObject, url: string, fetch: fetcher) => {
    let type = await getAccessType(webId, fetch);
    if (type === "wac") {
        try {
            let upd = await universalAccess.setPublicAccess(url, {
                read: accessObj.read,
                write: accessObj.write,
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
                    write: accessObj.write,
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
        // await universalAccess.setPublicAccess(url, { read: true, write: true }, { fetch: fetch });
        // try {
        //     // 1. Fetch the SolidDataset with its Access Control Resource (ACR).
        //     let res = await acp_ess_2.getSolidDatasetWithAcr(
        //         url,              // Resource for which to set up the policies
        //         { fetch: fetch }          // fetch from the authenticated session
        //     );
        //     if (res.internal_acp.acr) {
        //         let resourceWithAcr = res as WithAccessibleAcr;

        //         // 2. Create a Matcher for the Resource.
        //         let resourcePublicMatcher = acp_ess_2.createResourceMatcherFor(
        //             resourceWithAcr,
        //             "match-public"  // Matcher URL will be {ACR URL}#match-public
        //         );

        //         // 3. Specify that the matcher matches the Public (i.e., everyone).
        //         resourcePublicMatcher = acp_ess_2.setPublic(resourcePublicMatcher);

        //         // 4. Add Matcher to the Resource's ACR.
        //         resourceWithAcr = acp_ess_2.setResourceMatcher(
        //             resourceWithAcr,
        //             resourcePublicMatcher,
        //         );

        //         // 5. Create the Policy for the Resource.
        //         let resourcePolicy = acp_ess_2.createResourcePolicyFor(
        //             resourceWithAcr,
        //             "public-policy",  // Policy URL will be {ACR URL}#public-policy
        //         );

        //         // 6. Add the Public Matcher to the Policy as an allOf() expression.
        //         resourcePolicy = acp_ess_2.addAllOfMatcherUrl(
        //             resourcePolicy,
        //             resourcePublicMatcher
        //         );

        //         // 7. Specify the access modes for the Policy.
        //         resourcePolicy = acp_ess_2.setAllowModes(
        //             resourcePolicy,
        //             { read: true, append: false, write: false },
        //         );

        //         // 8. Apply the Policy to the Resource.
        //         resourceWithAcr = acp_ess_2.addPolicyUrl(
        //             resourceWithAcr,
        //             asUrl(resourcePolicy)
        //         );

        //         // 9. Add the Policy definition to the Resource's ACR. 
        //         resourceWithAcr = acp_ess_2.setResourcePolicy(
        //             resourceWithAcr,
        //             resourcePolicy,
        //         );
        //         console.log("this is policy:");
        //         console.log(resourcePolicy);
        //         // 10. Save the ACR for the Resource.
        //         const updatedResourceWithAcr = await acp_ess_2.saveAcrFor(
        //             resourceWithAcr,
        //             { fetch: fetch }          // fetch from the authenticated session
        //         );
        //         console.log("this is acr");
        //         console.log(updatedResourceWithAcr);
        //     }
        // } catch (error) {
        //     console.error("some error is here lul");
        // }

    }
}

// this function is used to give read permission to specific Agents. Used for both WAC and ACP PODs
export const shareWith = async (webId: string, url: string, fetch: fetcher, accessObj: accessObject, shareWith: string[]) => {
    let type = await getAccessType(webId, fetch);

    if (type === "wac") {
        try {
            let newShare = await Promise.all(shareWith.map(async (user) => {
                let upd = await universalAccess.setAgentAccess(url, user, {
                    read: accessObj.read,
                    write: accessObj.write,
                }, { fetch: fetch });
                if (!upd) {
                    throw new Error("You don't have permissions to changes the access type of this resource");
                }
                // return upd;
            }));
        }
        catch {
            try {
                await initializeAcl(url, fetch);
                let newShare = await Promise.all(shareWith.map(async (user) => {
                    let upd = await universalAccess.setAgentAccess(url, user, {
                        read: accessObj.read,
                        write: accessObj.write,
                    }, { fetch: fetch });
                    if (!upd) {
                        throw new Error("You don't have permissions to changes the access type of this resource");
                    }
                    // return upd;
                }));
            }

            catch {
                throw new Error("you don't have permissions to change the access type of this resource");
            }
        }
    }
}

// this function is used to revoke access to 
export const unShareWith = async (webId: string, url: string, fetch: fetcher, shareWith: string[]) => {
    let type = await getAccessType(webId, fetch);
    if (type === "wac") {
        try {
            let newShare = await Promise.all(shareWith.map(async (user) => {
                let upd = await universalAccess.setAgentAccess(url, user, {
                    read: false,
                    append: false,
                    write: false,
                    controlRead: false,
                    controlWrite: false
                }, { fetch: fetch });
                if (!upd) {
                    throw new Error("You don't have permissions to changes the access type of this resource");
                }
            }));
        }
        catch {
            try {
                await initializeAcl(url, fetch);
                let newShare = await Promise.all(shareWith.map(async (user) => {
                    let upd = await universalAccess.setAgentAccess(url, user, {
                        read: false,
                        append: false,
                        write: false,
                        controlRead: false,
                        controlWrite: false
                    }, { fetch: fetch });
                    if (!upd) {
                        throw new Error("You don't have permissions to changes the access type of this resource");
                    }
                }));
            }
            catch {
                throw new Error("You don't have permissions to change the access type of this resource");
            }
        }
    }
}

export const getSharedList = async (webId: string, url: string, fetch: fetcher) => {
    let type = await getAccessType(webId, fetch);

    if (type === "wac") {
        const myDatasetWithAcl = await getSolidDatasetWithAcl(url, { fetch: fetch });
        const accessByAgent = getAgentAccessAll(myDatasetWithAcl);
        if (accessByAgent === null) {
            throw new Error("you don't have access rights to view this resource's agent list");
        }
        let newObj: AgentAccess = {};
        //let updList = accessByAgent as object;
        for (let obj in accessByAgent) {
            console.log("full:");
            console.log(accessByAgent);
            console.log(obj);
            if (!(obj === webId || obj.substring(0, 8) !== 'https://')) {
                newObj[obj] = accessByAgent[obj];
            }
        }
        return newObj;
    }
    else {
        return {};
    }
}

export const getPubAccess = async (webId: string, url: string, fetch: fetcher) => {
    let type = await getAccessType(webId, fetch);
    if (type === "wac") {
        let myDatasetWithAcl
        try {
            myDatasetWithAcl = await getSolidDatasetWithAcl(url, { fetch: fetch });
        }
        catch (error) {
            throw new Error(`Couldn't fetch ${url}, this might be because you didn't give permissions to the application`);
        }
        const publicAccess = getPublicAccess(myDatasetWithAcl);
        if (publicAccess === null) {
            throw new Error(`couldn't get public access of ${url} this might be because you didn't give permissions to the application`);
        }
        let ret = { read: publicAccess.read, write: publicAccess.write };
        return ret;
    }
    else {
        //     const ds = await getSolidDataset(url, { fetch: fetch });
        //     let pol = acp_ess_1.getPolicyAll(ds);
        //    // console.log("this is pol!");
        //     //console.log(pol);
        //     const resourceWithAcr = await acp_ess_1.getSolidDatasetWithAcr(
        //         url,
        //         { fetch: fetch }            // fetch from the authenticated session
        //     );
        //     if (resourceWithAcr.internal_acp.acr) {
        //         console.log("we are here");
        //         let updResource = resourceWithAcr as WithAccessibleAcr;
        //         let hh = acp_ess_2.getPolicyUrlAll(updResource);
        //         let bb = acp_ess_2.getAcrPolicyUrlAll(updResource);
        //         let bib = acp_ess_2.getResourceMatcherAll(updResource);
        //         console.log("this is hh");
        //         console.log(hh);
        //         console.log("this is bb");
        //         console.log(bb);
        //         console.log(bib);
        //         let tt = await universalAccess.getAgentAccessAll(url, { fetch: fetch });
        //         console.log("this is tt");
        //         console.log(tt);
        //         let hihi = await universalAccess.getPublicAccess(url, { fetch: fetch });
        //         console.log("this is hihi");
        //         console.log(hihi);
        //     }
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
            console.log(storage);
            let b = await createContainerAt(`${storage}planerAppTester1/`, { fetch: fetch });
            console.log("here1");
            await initializeAcl(`${storage}planerAppTester1/`, fetch);
            console.log("here2");
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

// try {
//     let hh = await getSolidDataset(url,
//         { fetch: fetch });
//     const resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
//         url,
//         { fetch: fetch }            // fetch from the authenticated session
//     );
//     console.log(resourceWithAcr);
//     let heh = resourceWithAcr as WithAccessibleAcr;

//     if (resourceWithAcr.internal_acp.acr) {
//         let updResource = resourceWithAcr as WithAccessibleAcr;
//         const myACR = await getSolidDataset(
//             acp_ess_2.getLinkedAcrUrl(updResource),
//             { fetch: fetch }
//         );
//         console.log(await solidDatasetAsTurtle(myACR));
//         const myResourcePolicies = acp_ess_2.getResourcePolicyAll(updResource);
//         console.log("return of getResourcePolicyAll");
//         console.log(myResourcePolicies);
//         let hhh = acp_ess_2.getPolicyAll(hh);
//         console.log("return of getPolicyAll:");
//         console.log(hhh);
//         const myResourceMatchers = acp_ess_2.getResourceMatcherAll(updResource);
//         console.log("return of getResourceMatcherAll");
//         console.log(myResourceMatchers);

//         let gg = await universalAccess.getPublicAccess(
//             url,   // Resource
//             { fetch: fetch }                  // fetch function from authenticated session
//         )
//         console.log(gg);

//     }
//     else {
//         throw new Error("you don't have right to access resource acr, acr is null");
//     }

// }
// catch {

// }