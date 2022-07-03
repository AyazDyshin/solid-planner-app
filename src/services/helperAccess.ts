import { acp_ess_2, getThingAll, getUrl, getUrlAll, universalAccess } from "@inrupt/solid-client";
import { WithAccessibleAcr } from "@inrupt/solid-client/dist/acp/acp";
import { AccessControlResource } from "@inrupt/solid-client/dist/acp/control";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { ACL, ACP } from "@inrupt/vocab-solid";
import { accessObject, fetcher } from "../components/types";
import { useAsyncError } from "./helpers";

//const throwError = useAsyncError();

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
        // throwError(new Error(
        //     ` The current user does not have permission to see who currently has access to this resource, or the user's POD Server does not support Access Control Resources`
        // ));
        throw new Error(` The current user does not have permission to see who currently has access to this resource, or the user's POD Server does not support Access Control Resources`);
    }
    return resource.internal_acp.acr;
}

export const changeAccessAcp = async (url: string, access: accessObject, agent: string, fetch: fetcher) => {
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
       // throwError(new Error(`Error when fetching dataset url:${url} error: ${message}`));
        throw new Error(`Error when fetching dataset url:${url} error: ${message}`);
    }
    if (!hasAccessibleAcr(resourceWithAcr)) {
       // throwError(new Error(`The current user does not have permission to see who currently has access to this resource url: ${url}`));
        throw new Error(`The current user does not have permission to see who currently has access to this resource url: ${url}`);
    }

    let res = agent === ACP.PublicAgent ? await universalAccess.setPublicAccess(url, access, { fetch: fetch }) : await universalAccess.setAgentAccess(url, agent, access, { fetch: fetch });

    if (!res) {
      //  throwError(new Error(`The current user does not have permission to change access rights to this resource url: ${url}`));
        throw new Error(`The current user does not have permission to change access rights to this resource url: ${url}`);
    }
    let updResource = resourceWithAcr as WithAccessibleAcr;
    let [[readMatcher, appendMatcher, writeMatcher], [readPolicy, appendPolicy, writePolicy]] = await getAcpMatchersAndPolices(url, fetch);
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

//used
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
      //  throwError(new Error(`Error when fetching dataset url:${url} error: ${message}`));
        throw new Error(`Error when fetching dataset url:${url} error: ${message}`);
    }
    if (!hasAccessibleAcr(resourceWithAcr)) {
       // throwError(new Error(`The current user does not have permission to see who currently has access to this resource url: ${url}`));
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

//used
export const getAcpAccess = async (webId: string, url: string, fetch: fetcher, acc: string) => {
    let [[readMatcher, appendMatcher, writeMatcher], rest] = await getAcpMatchersAndPolices(url, fetch);
    let accObj: Record<string, AccessModes> = {};


    if (readMatcher) {
        let arrayOfReadAgents = getUrlAll(readMatcher, ACP.agent);
        arrayOfReadAgents.map((agentUrl) => {
            let condition = acc === "public" ? (agentUrl === ACP.PublicAgent) : (agentUrl !== ACP.PublicAgent);
            if (condition) {
                if (!accObj[agentUrl]) accObj[agentUrl] = { read: true, append: false, write: false }
                accObj[agentUrl].read = true;
            }
        });
    }

    if (appendMatcher) {
        let arrayOfAppendAgents = getUrlAll(appendMatcher, ACP.agent);
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