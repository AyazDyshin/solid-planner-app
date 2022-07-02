import { acp_ess_1, getSolidDataset, getThingAll, getUrl, saveSolidDatasetAt } from "@inrupt/solid-client";
import { WithAccessibleAcr } from "@inrupt/solid-client/dist/acp/acp";
import { RDF } from "@inrupt/vocab-common-rdf";
import { ACP } from "@inrupt/vocab-solid";
import { accessObject, fetcher } from "../components/types";
import { getAcr } from "./helperAccess";
import { getStoragePref } from "./podGetters";

//not used
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

//not used
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


    // let updatedResourceWithAcr = await acp_ess_1.saveAcrFor(
    //     changedResourceWithAcr,
    //     { fetch: fetch }
    // );
    //  updatedResourceWithAcr = await saveSolidDatasetAt(url, updatedResourceWithAcr, { fetch: fetch });
}

// not used
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

//not used
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
