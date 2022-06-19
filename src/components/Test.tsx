import { CombinedDataProvider, useSession, Image, Text, useDataset } from '@inrupt/solid-ui-react';
import { Button, Form } from 'react-bootstrap';
import { Note } from './types';
import { useEffect, useState } from 'react';
import {
  buildThing, createContainerInContainer, createSolidDataset, createThing, getContainedResourceUrlAll, getDatetime,
  getInteger, getSolidDataset, getSolidDatasetWithAcl, getStringNoLocale, getStringNoLocaleAll, getThing, getThingAll, getUrl,
  hasAccessibleAcl, hasFallbackAcl, hasResourceAcl, saveSolidDatasetAt, saveSolidDatasetInContainer,
  setThing, Thing, createAclFromFallbackAcl, getResourceAcl, setPublicResourceAccess, saveAclFor, getAgentAccessAll,
  getAgentResourceAccessAll, createContainerAt, getPublicAccess, acp_ess_2, asUrl, solidDatasetAsTurtle, acp_ess_1
} from '@inrupt/solid-client';
import { SCHEMA_INRUPT, RDF, DCTERMS } from '@inrupt/vocab-common-rdf';
import { first } from 'lodash';
import { schema, space, vcard } from 'rdf-namespaces';
import { pim } from '@inrupt/solid-client/dist/constants';
import {
  getPrefLink, recordDefaultFolder, fetchAllNotes, saveNote, createDefFolder,
  createEntriesInTypeIndex, getAllNotesUrlFromPublicIndex, getDefaultFolder, getStoragePref, fetchContacts
} from '../services/SolidPod';
import { access } from "@inrupt/solid-client";
import { object, updated } from 'rdf-namespaces/dist/as';
import { universalAccess } from "@inrupt/solid-client";
import { AccessControlResource } from '@inrupt/solid-client/dist/acp/control';
import {
  checkPermissions, getPubAccess, getSharedList, initializeAcl,
  isWacOrAcp, setPubAccess, shareWith, unShareWith
} from '../services/access';
import { getPolicyAll } from '@inrupt/solid-client/dist/acp/policy';
import { ACP } from '@inrupt/vocab-solid';
import { changeAccessAcp, initializePolicies, setAccessForResource } from '../services/helperAccess';
import { fdatasync } from 'fs';
import { WithAccessibleAcr } from '@inrupt/solid-client/dist/acp/acp';


const Test = () => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  const [editing, setEditing] = useState(true);
  const { dataset, error } = useDataset();
  const [stat, setStat] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const gets = async () => {
   // await createContainerAt("https://pod.inrupt.com/podsptester/tee/", { fetch: fetch });
    // await setAccessForResource(webId ?? "", fetch, "https://pod.inrupt.com/podsptester/tee/", { read: true, append: false, write: false }, ACP.PublicAgent);
    // let ds = await acp_ess_1.getSolidDatasetWithAcr("https://pod.inrupt.com/podsptester/tee/", { fetch: fetch });
    // console.log(bob);
    //   await setPubAccess(webId ?? "", { read: true, append: true }, "https://pod.inrupt.com/podsptester/testyy/", fetch);
    //  // let ds = await getSolidDataset("https://pod.inrupt.com/podsptester/testy/", {fetch: fetch});
    //   let resourceWithAcr = await acp_ess_2.getSolidDatasetWithAcr(
    //     "https://pod.inrupt.com/podsptester/testyy/",              // Resource for which to set up the policies1
    //     { fetch: fetch }          // fetch from the authenticated session
    //   );
    //   console.log("heehhehehe");
    //    console.log(resourceWithAcr);
    // let b = await getStoragePref(webId ?? "", fetch);
    // let url = `${b}policies/`;
    // let myRulesAndPoliciesSolidDataset = await getSolidDataset(
    //   url,
    //   { fetch: fetch }      // fetch from the authenticated session
    // );
    // let publicRule = acp_ess_1.createRule(`${url}#defaultAccessControlAgentMatcherAppendPolicyMatcher`);
    // publicRule = acp_ess_1.setPublic(publicRule);
    // myRulesAndPoliciesSolidDataset = acp_ess_1.setRule(myRulesAndPoliciesSolidDataset, publicRule);
    // const savedSolidDataset = await saveSolidDatasetAt(
    //   url,
    //   myRulesAndPoliciesSolidDataset,
    //   { fetch: fetch }        // fetch from the authenticated session
    // );
    // await initializePolicies(webId ?? "", fetch);
    // await getAllRules(webId ?? "", fetch);
  }
  gets();


  return (
    <div>
    </div>
  );
}
export default Test;

