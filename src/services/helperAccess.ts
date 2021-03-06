import { acp_ess_2, getThingAll, getUrl, getUrlAll, universalAccess } from "@inrupt/solid-client";
import { WithAccessibleAcr } from "@inrupt/solid-client/dist/acp/acp";
import { AccessControlResource } from "@inrupt/solid-client/dist/acp/control";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { ACL, ACP } from "@inrupt/vocab-solid";
import { accessObject, fetcher } from "./types";

/**
* Function that returns true if a given resource has accessible acr
* @category helper access functions
* @param   {Object} resource object with internal_acp property
* @return  {boolean} true if resource has accessible acr, false otherwise
*/
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function hasAccessibleAcr(resource: { internal_acp: any; }): boolean {
    return (typeof resource.internal_acp === "object" &&
        resource.internal_acp !== null &&
        typeof resource.internal_acp.acr === "object" &&
        resource.internal_acp.acr !== null);
}

/**
* Function that returns given resource's acr
* @category helper access functions
* @param   {Object} resource object with internal_acp property
* @return  { AccessControlResource} resource's acr
*/
export function getAcr(
    resource: { internal_acp: { acr: AccessControlResource; }; }
): AccessControlResource {
    if (!hasAccessibleAcr(resource)) {
        throw new Error(` The current user does not have permission to see who currently has access to this resource, or the user's POD Server does not support Access Control Resources`);
    }
    return resource.internal_acp.acr;
}

/**
* Function that changes ACP access for a given agent for a given resource
* @category helper access functions
* @param   {string} url url of the resource to change access for
* @param   {accessObject} access access rights to apply
* @param   {string} agent agent to set the access rights for
* @param   {fetcher} fetch fetch function
* @return  {Promise<void>}
*/
export const changeAccessAcp = async (url: string, access: accessObject, agent: string, fetch: fetcher): Promise<void> => {
    let resourceWithAcr;
    try {
        resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
            url,
            { fetch: fetch }
        );
    }
    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        throw new Error(`Error when fetching dataset url:${url} error: ${message}`);
    }
    if (!hasAccessibleAcr(resourceWithAcr)) {
        throw new Error(`The current user does not have permission to see who currently has access to this resource url: ${url}`);
    }

    const res = agent === ACP.PublicAgent ? await universalAccess.setPublicAccess(url, access, { fetch: fetch }) : await universalAccess.setAgentAccess(url, agent, access, { fetch: fetch });

    if (!res) {
        throw new Error(`The current user does not have permission to change access rights to this resource url: ${url}`);
    }
    let updResource = resourceWithAcr as WithAccessibleAcr;
    let [[readMatcher, appendMatcher, writeMatcher]] = await getAcpMatchersAndPolices(url, fetch);
    if (!access.read) {
        if (readMatcher) {
            readMatcher = acp_ess_2.removeAgent(readMatcher, agent);
            updResource = acp_ess_2.setResourceMatcher(
                updResource,
                readMatcher
            );
            await acp_ess_2.saveAcrFor(
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
            await acp_ess_2.saveAcrFor(
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
            await acp_ess_2.saveAcrFor(
                updResource,
                { fetch: fetch }
            );
        }
    }
}

/**
* Function that returns an array of arrays. First array contains read, append, write matchers for a given resource, second array contains read, append, write policies for a given resource
* @category helper access functions
* @param   {string} url url of the resource to get matchers and polices for 
* @param   {fetcher} fetch fetch function
*/
export const getAcpMatchersAndPolices = async (url: string, fetch: fetcher) => {
    let resourceWithAcr;
    try {
        resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
            url,
            { fetch: fetch }
        );
    }
    catch (error) {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        throw new Error(`Error when fetching dataset url:${url} error: ${message}`);
    }
    if (!hasAccessibleAcr(resourceWithAcr)) {
        throw new Error(`The current user does not have permission to see who currently has access to this resource url: ${url}`);
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

/**
* Function that get list of agents and their access rights or public access rights for a given ACP resource
* @category helper access functions
* @param   {string} webId webId of the user
* @param   {string} url url of the resource to get agents access for
* @param   {fetcher} fetch fetch function
* @param   {string} acc type of access to get, agent or public 
* @return  {Promise<Record<string, AccessModes>>} object with access rights
*/
export const getAcpAccess = async (webId: string, url: string, fetch: fetcher, acc: string): Promise<Record<string, AccessModes>> => {
    const [[readMatcher, appendMatcher, writeMatcher]] = await getAcpMatchersAndPolices(url, fetch);
    const accObj: Record<string, AccessModes> = {};


    if (readMatcher) {
        const arrayOfReadAgents = getUrlAll(readMatcher, ACP.agent);
        arrayOfReadAgents.map((agentUrl) => {
            const condition = acc === "public" ? (agentUrl === ACP.PublicAgent) : (agentUrl !== ACP.PublicAgent);
            if (condition) {
                if (!accObj[agentUrl]) accObj[agentUrl] = { read: true, append: false, write: false }
                accObj[agentUrl].read = true;
            }
        });
    }

    if (appendMatcher) {
        const arrayOfAppendAgents = getUrlAll(appendMatcher, ACP.agent);
        arrayOfAppendAgents.map((agentUrl) => {
            const condition = acc === "public" ? (agentUrl === ACP.PublicAgent) : (agentUrl !== ACP.PublicAgent);
            if (condition) {
                if (!accObj[agentUrl]) accObj[agentUrl] = { read: false, append: true, write: false }
                accObj[agentUrl].append = true;
            }
        });
    }

    if (writeMatcher) {
        const arrayOfWriteAgents = getUrlAll(writeMatcher, ACP.agent);
        arrayOfWriteAgents.map((agentUrl) => {
            const condition = acc === "public" ? (agentUrl === ACP.PublicAgent) : (agentUrl !== ACP.PublicAgent);
            if (condition) {
                if (!accObj[agentUrl]) accObj[agentUrl] = { read: false, append: false, write: true }
                accObj[agentUrl].write = true;
            }
        });
    }

    return accObj;
}