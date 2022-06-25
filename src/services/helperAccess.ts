import { access, acp_ess_1, acp_ess_2, addUrl, getSolidDataset, getSourceUrl, getThingAll, getUrl, getUrlAll, saveSolidDatasetAt, setThing, Thing, ThingPersisted, universalAccess } from "@inrupt/solid-client";
import { WithAccessibleAcr } from "@inrupt/solid-client/dist/acp/acp";
import { AccessControlResource } from "@inrupt/solid-client/dist/acp/control";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { RDF } from "@inrupt/vocab-common-rdf";
import { ACL, ACP } from "@inrupt/vocab-solid";
import { accessObject, fetcher } from "../components/types";
import { getStoragePref } from "./podGetters";

export const initializePolicies = async (webId: string, fetch: fetcher, url: string, access: accessObject, agent: string) => {
    let storagePref = await getStoragePref(webId, fetch);
    let policiesUrl = `${storagePref}policies/`;
    let myRulesAndPoliciesSolidDataset = await getSolidDataset(
        policiesUrl,
        { fetch: fetch }
    );
    let readRule = acp_ess_1.getRule(myRulesAndPoliciesSolidDataset, `${policiesUrl}#defaultAccessControlAgentReadPolicyRule${url}`);
    if (!readRule) {
        readRule = acp_ess_1.createRule(`${policiesUrl}#defaultAccessControlAgentReadPolicyRule${url}`);
    }
    let appendRule = acp_ess_1.getRule(myRulesAndPoliciesSolidDataset, `${policiesUrl}#defaultAccessControlAgentAppendPolicyRule${url}`);
    if (!appendRule) {
        appendRule = acp_ess_1.createRule(`${policiesUrl}#defaultAccessControlAgentAppendPolicyRule${url}`);

    }
    let writeRule = acp_ess_1.getRule(myRulesAndPoliciesSolidDataset, `${policiesUrl}#defaultAccessControlAgentWritePolicyRule${url}`);
    if (!writeRule) {
        writeRule = acp_ess_1.createRule(`${policiesUrl}#defaultAccessControlAgentWritePolicyRule${url}`);

    }

    let readPolicy = acp_ess_1.getPolicy(myRulesAndPoliciesSolidDataset, `${policiesUrl}#defaultAccessControlAgentReadPolicy${url}`);

    if (!readPolicy) {
        readPolicy = acp_ess_1.createPolicy(`${policiesUrl}#defaultAccessControlAgentReadPolicy${url}`);
        readPolicy = acp_ess_1.addAnyOfRuleUrl(
            readPolicy,
            `${policiesUrl}#defaultAccessControlAgentReadPolicyRule${url}`
        );
        readPolicy = acp_ess_1.setAllowModes(
            readPolicy,
            { read: true, append: false, write: false },
        );

        myRulesAndPoliciesSolidDataset = acp_ess_1.setPolicy(myRulesAndPoliciesSolidDataset, readPolicy);
    }

    let appendPolicy = acp_ess_1.getPolicy(myRulesAndPoliciesSolidDataset, `${policiesUrl}#defaultAccessControlAgentAppendPolicy${url}`);

    if (!appendPolicy) {
        appendPolicy = acp_ess_1.createPolicy(`${policiesUrl}#defaultAccessControlAgentAppendPolicy${url}`);
        appendPolicy = acp_ess_1.addAnyOfRuleUrl(
            appendPolicy,
            `${policiesUrl}#defaultAccessControlAgentAppendPolicyRule${url}`
        );
        appendPolicy = acp_ess_1.setAllowModes(
            appendPolicy,
            { read: false, append: true, write: false },
        );

        myRulesAndPoliciesSolidDataset = acp_ess_1.setPolicy(myRulesAndPoliciesSolidDataset, appendPolicy);

    }

    let writePolicy = acp_ess_1.getPolicy(myRulesAndPoliciesSolidDataset, `${policiesUrl}#defaultAccessControlAgentWritePolicy${url}`);

    if (!writePolicy) {
        writePolicy = acp_ess_1.createPolicy(`${policiesUrl}#defaultAccessControlAgentWritePolicy${url}`);
        writePolicy = acp_ess_1.addAnyOfRuleUrl(
            writePolicy,
            `${policiesUrl}#defaultAccessControlAgentWritePolicyRule${url}`
        );
        writePolicy = acp_ess_1.setAllowModes(
            writePolicy,
            { read: false, append: false, write: true },
        );

        myRulesAndPoliciesSolidDataset = acp_ess_1.setPolicy(myRulesAndPoliciesSolidDataset, writePolicy);
    }

    access.read ? acp_ess_1.addAgent(readRule!, agent) : acp_ess_1.removeAgent(readRule!, agent);
    access.append ? acp_ess_1.addAgent(appendRule!, agent) : acp_ess_1.removeAgent(appendRule!, agent);
    access.write ? acp_ess_1.addAgent(writeRule!, agent) : acp_ess_1.removeAgent(writeRule!, agent);

    myRulesAndPoliciesSolidDataset = acp_ess_1.setRule(myRulesAndPoliciesSolidDataset, readRule);
    myRulesAndPoliciesSolidDataset = acp_ess_1.setRule(myRulesAndPoliciesSolidDataset, appendRule);
    myRulesAndPoliciesSolidDataset = acp_ess_1.setRule(myRulesAndPoliciesSolidDataset, writeRule);

    const savedSolidDataset = await saveSolidDatasetAt(
        policiesUrl,
        myRulesAndPoliciesSolidDataset,
        { fetch: fetch }      // fetch from the authenticated session
    );
}

export const setAccessForResource = async (webId: string, fetch: fetcher, url: string, access: accessObject, agent: string) => {
    let storagePref = await getStoragePref(webId, fetch);
    let policiesUrl = `${storagePref}policies/`;
    await initializePolicies(webId, fetch, url, access, agent);

    const resourceWithAcr = await acp_ess_1.getSolidDatasetWithAcr(
        url,
        { fetch: fetch }            // fetch from the authenticated session
    );

    let updResource = resourceWithAcr as WithAccessibleAcr;
    let changedResourceWithAcr = acp_ess_1.addPolicyUrl(
        updResource,
        `${policiesUrl}#defaultAccessControlAgentReadPolicy${url}`
    );

    changedResourceWithAcr = acp_ess_1.addPolicyUrl(
        updResource,
        `${policiesUrl}#defaultAccessControlAgentAppendPolicy${url}`
    );

    changedResourceWithAcr = acp_ess_1.addPolicyUrl(
        updResource,
        `${policiesUrl}#defaultAccessControlWriteReadPolicy${url}`
    );


    // const updatedResourceWithAcr = await acp_ess_1.saveAcrFor(
    //     changedResourceWithAcr, 
    //     { fetch: fetch }           
    //   );
    //     const updatedResourceWithAcr = await saveSolidDatasetAt(url, updatedResourceWithAcr, {fetch: fetch});
}

// export const getAllRules = async (webId: string, fetch: fetcher) => {
//     let storagePref = await getStoragePref(webId, fetch);
//     let policiesUrl = `${storagePref}policies/`;
//     let myRulesAndPoliciesSolidDataset = await getSolidDataset(
//         policiesUrl,
//         { fetch: fetch }
//     );
//     let readRule = acp_ess_1.getRule(myRulesAndPoliciesSolidDataset, `${policiesUrl}#defaultAccessControlAgentReadPolicyRule`);
//     let appendRule = acp_ess_1.getRule(myRulesAndPoliciesSolidDataset, `${policiesUrl}#defaultAccessControlAgentAppendPolicyRule`);
//     let writeRule = acp_ess_1.getRule(myRulesAndPoliciesSolidDataset, `${policiesUrl}#defaultAccessControlAgentWritePolicyRule`);

//     if (!readRule || !appendRule || !writeRule) await initializePolicies(webId, fetch);
//     return [readRule, appendRule, writeRule];
// }

// export const setAgentAccess = async (webId: string, fetch: fetcher, access: accessObject, agent: string) => {
//     let storagePref = await getStoragePref(webId, fetch);
//     let policiesUrl = `${storagePref}policies/`;
//     let myRulesAndPoliciesSolidDataset = await getSolidDataset(
//         policiesUrl,
//         { fetch: fetch }
//     );
//     let [readRule, appendRule, writeRule] = await getAllRules(webId, fetch);
//     access.read ? acp_ess_1.addAgent(readRule!, agent) : acp_ess_1.removeAgent(readRule!, agent);
//     access.append ? acp_ess_1.addAgent(appendRule!, agent) : acp_ess_1.removeAgent(appendRule!, agent);
//     access.write ? acp_ess_1.addAgent(writeRule!, agent) : acp_ess_1.removeAgent(writeRule!, agent);

//     myRulesAndPoliciesSolidDataset = acp_ess_1.setRule(myRulesAndPoliciesSolidDataset, readRule!);
//     myRulesAndPoliciesSolidDataset = acp_ess_1.setRule(myRulesAndPoliciesSolidDataset, appendRule!);
//     myRulesAndPoliciesSolidDataset = acp_ess_1.setRule(myRulesAndPoliciesSolidDataset, writeRule!);

//     const savedSolidDataset = await saveSolidDatasetAt(
//         policiesUrl,
//         myRulesAndPoliciesSolidDataset,
//         { fetch: fetch }      // fetch from the authenticated session
//     );
// }

export const addPoliciesToResource = async (webId: string, fetch: fetcher, url: string) => {
    let storagePref = await getStoragePref(webId, fetch);
    let policiesUrl = `${storagePref}policies/`;
    const resourceWithAcr = await acp_ess_1.getSolidDatasetWithAcr(
        url,
        { fetch: fetch }            // fetch from the authenticated session
    );

    let updResource = resourceWithAcr as WithAccessibleAcr;

    let changedResourceWithAcr = acp_ess_1.addPolicyUrl(
        updResource,
        `${policiesUrl}#defaultAccessControlAgentReadPolicy`
    );
    changedResourceWithAcr = acp_ess_1.addPolicyUrl(
        updResource,
        `${policiesUrl}#defaultAccessControlAgentReadPolicy`
    );
    changedResourceWithAcr = acp_ess_1.addPolicyUrl(
        updResource,
        `${policiesUrl}#defaultAccessControlAgentReadPolicy`
    );
}
export function hasAccessibleAcr(resource: { internal_acp: any; }) {
    return (typeof resource.internal_acp === "object" &&
        resource.internal_acp !== null &&
        typeof resource.internal_acp.acr === "object" &&
        resource.internal_acp.acr !== null);
}
export function getAcr(
    resource: { internal_acp: { acr: AccessControlResource; }; }
): AccessControlResource {
    if (!hasAccessibleAcr(resource)) {
        throw new Error(
            ` error This could be because the current user is not allowed to see it, or because their Pod Server does not support Access Control Resources.`
        );
    }
    return resource.internal_acp.acr;
}
export function cloneResource<ResourceExt extends object>(
    resource: ResourceExt
): ResourceExt {
    let clonedResource;
    if (typeof (resource as File).slice === "function") {
        // If given Resource is a File:
        clonedResource = Object.assign((resource as File).slice(), { ...resource });
    } else {
        // If it is just a plain object containing metadata:
        clonedResource = { ...resource };
    }

    return clonedResource;
}
export function setAccessControlResourceThing<T extends WithAccessibleAcr>(
    resource: T,
    thing: ThingPersisted
): T {
    return Object.assign(cloneResource(resource), {
        internal_acp: {
            ...resource.internal_acp,
            acr: setThing(resource.internal_acp.acr, thing),
        },
    });
}

export const changeAccessAcp = async (url: string, access: accessObject, agent: string, fetch: fetcher) => {
    let resourceWithAcr;
    try {
        resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
            url,
            { fetch: fetch }
        );
    }
    catch {
        throw new Error(`couldn't fetch ${url}`);
    }
    if (!hasAccessibleAcr(resourceWithAcr)) {
        throw new Error(`you do not have access to check access list of ${url}`);
    }
    let res = agent === ACP.PublicAgent ? await universalAccess.setPublicAccess(url, access, { fetch: fetch }) : await universalAccess.setAgentAccess(url, agent, access, { fetch: fetch });

    if (!res) {
        throw new Error(`you don't have rights to access or modify ${url}`);
    }


    let updResource = resourceWithAcr as WithAccessibleAcr;
    let [[readMatcher, appendMatcher, writeMatcher], [readPolicy, appendPolicy, writePolicy]] = await getAcpMatchersAndPolices(url, fetch);
    let mainAcrThing = 0;
    let bob: ThingPersisted;
    //await updateMainAcr(updResource, [readPolicy, appendPolicy, writePolicy], fetch);
    if (!access.read) {
        if (readMatcher) {
            readMatcher = acp_ess_2.removeAgent(readMatcher, agent);
            updResource = acp_ess_2.setResourceMatcher(
                updResource,
                readMatcher
            );
            const updatedResourceWithAcr = await acp_ess_2.saveAcrFor(
                updResource,
                { fetch: fetch }
            );
        }
    }
    if (!access.append) {
        if (appendMatcher) {
            appendMatcher = acp_ess_2.removeAgent(appendMatcher, agent);
            updResource = acp_ess_2.setResourceMatcher(
                updResource,
                appendMatcher
            );
            const updatedResourceWithAcr = await acp_ess_2.saveAcrFor(
                updResource,
                { fetch: fetch }
            );
        }
    }
    if (!access.write) {
        if (writeMatcher) {
            writeMatcher = acp_ess_2.removeAgent(writeMatcher, agent);
            updResource = acp_ess_2.setResourceMatcher(
                updResource,
                writeMatcher
            );
            const updatedResourceWithAcr = await acp_ess_2.saveAcrFor(
                updResource,
                { fetch: fetch }
            );
        }
    }
}
export const updateMainAcr = async (resource: WithAccessibleAcr, allPolicies: any[], fetch: fetcher) => {
    let acr = getAcr(resource);
    let allThings = getThingAll(acr);
    let mainAcr = allThings.find((thing) => getUrl(thing, RDF.type) === ACP.AccessControl);

    let allPoliciesUpd = allPolicies.filter((policy) => policy !== null);
    let changedResourceWithAcr = resource;
    allPoliciesUpd.map((policy) => {
        //handle
        changedResourceWithAcr = acp_ess_1.addPolicyUrl(
            resource,
            policy.url
        );
        // mainAcr = addUrl(mainAcr!, ACP.apply, policy.url);
    });
    // resource = acp_ess_2.setResourcePolicy(resource, mainAcr!);
    //  acr = setThing(acr, mainAcr!);
    // // resource.internal_acp = { acr };
    // resource = acp_ess_2.setResourceMatcher(resource, mainAcr!);

    // // const savedAcr = await saveSolidDatasetAt(getSourceUrl(acr), acr, {fetch : fetch});
    // let updResource = await acp_ess_2.saveAcrFor(resource, { fetch: fetch });

}
export const getAcpMatchersAndPolices = async (url: string, fetch: fetcher) => {
    let resourceWithAcr;
    try {
        resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
            url,
            { fetch: fetch }
        );
    }
    catch {
        throw new Error(`couldn't fetch ${url}`);
    }
    if (!hasAccessibleAcr(resourceWithAcr)) {
        throw new Error(`you do not have access to check access list of ${url}`);
    }
    const updResource = resourceWithAcr as WithAccessibleAcr;
    const acr = getAcr(updResource);
    const allT = getThingAll(acr);
    const readPolicy = allT.find((thing) => getUrl(thing, ACP.allow) === ACL.Read);
    const appendPolicy = allT.find((thing) => getUrl(thing, ACP.allow) === ACL.Append);
    const writePolicy = allT.find((thing) => getUrl(thing, ACP.allow) === ACL.Write);
    let readMatcher, appendMatcher, writeMatcher = null;

    if (readPolicy) {
        readMatcher = allT.find((thing) => thing.url === getUrl(readPolicy, ACP.anyOf));
    }

    if (appendPolicy) {
        appendMatcher = allT.find((thing) => thing.url === getUrl(appendPolicy, ACP.anyOf));
    }
    if (writePolicy) {
        writeMatcher = allT.find((thing) => thing.url === getUrl(writePolicy, ACP.anyOf));
    }

    return [[readMatcher ? readMatcher : null, appendMatcher ? appendMatcher : null, writeMatcher ? writeMatcher : null],
    [readPolicy ? readPolicy : null, appendPolicy ? appendPolicy : null, writePolicy ? writePolicy : null]
    ];
}


export const getAcpAccess = async (webId: string, url: string, fetch: fetcher, acc: string) => {
    let [[readMatcher, appendMatcher, writeMatcher], rest] = await getAcpMatchersAndPolices(url, fetch);
    let accObj: Record<string, AccessModes> = {};


    if (readMatcher) {
        let arrayOfReadAgents = getUrlAll(readMatcher!, ACP.agent);
        arrayOfReadAgents.map((agentUrl) => {
            let condition = acc === "public" ? (agentUrl === ACP.PublicAgent) : (agentUrl !== ACP.PublicAgent);
            if (condition) {
                if (!accObj[agentUrl]) accObj[agentUrl] = { read: true, append: false, write: false }
                accObj[agentUrl].read = true;
            }
        });
    }

    if (appendMatcher) {
        let arrayOfAppendAgents = getUrlAll(appendMatcher!, ACP.agent);
        arrayOfAppendAgents.map((agentUrl) => {
            let condition = acc === "public" ? (agentUrl === ACP.PublicAgent) : (agentUrl !== ACP.PublicAgent);
            if (condition) {
                if (!accObj[agentUrl]) accObj[agentUrl] = { read: false, append: true, write: false }
                accObj[agentUrl].append = true;
            }
        });
    }

    if (writeMatcher) {
        let arrayOfWriteAgents = getUrlAll(writeMatcher, ACP.agent);
        arrayOfWriteAgents.map((agentUrl) => {
            let condition = acc === "public" ? (agentUrl === ACP.PublicAgent) : (agentUrl !== ACP.PublicAgent);
            if (condition) {
                if (!accObj[agentUrl]) accObj[agentUrl] = { read: false, append: false, write: true }
                accObj[agentUrl].write = true;
            }
        });
    }

    return accObj;
}