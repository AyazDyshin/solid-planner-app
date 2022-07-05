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
  fetchContacts
} from '../services/SolidPod';
import { access } from "@inrupt/solid-client";
import { object, updated } from 'rdf-namespaces/dist/as';
import { universalAccess } from "@inrupt/solid-client";
//import { AccessControlResource } from '@inrupt/solid-client/dist/acp/control';
import {
  checkPermissions, getPubAccess, getSharedList, initializeAcl,
  isWacOrAcp, setPubAccess, shareWith
} from '../services/access';
//import { getPolicyAll } from '@inrupt/solid-client/dist/acp/policy';
import { ACP } from '@inrupt/vocab-solid';
import { changeAccessAcp } from '../services/helperAccess';
import { fdatasync } from 'fs';
import { getResourceInfoWithAcr, getSolidDatasetWithAcr, WithAccessibleAcr } from '@inrupt/solid-client/dist/acp/acp';


const Test = () => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  const [editing, setEditing] = useState(true);
  const { dataset, error } = useDataset();
  const [stat, setStat] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const gets = async () => {
    //const socket = new WebSocket("wss://inrtester2.inrupt.net/SolidPlannerApp/");
    //console.log(socket);
    // await createContainerAt("https://pod.inrupt.com/podsptester/toTest/", { fetch: fetch });
    // let firstPubAccess = await universalAccess.getPublicAccess("https://pod.inrupt.com/podsptester/toTest/", { fetch: fetch });
    // await universalAccess.setPublicAccess("https://pod.inrupt.com/podsptester/toTest/",
    //   { read: true, append: true, write: true }, { fetch: fetch });
    // let secondPubAccess = await universalAccess.getPublicAccess("https://pod.inrupt.com/podsptester/toTest/", { fetch: fetch });
    // let checkResourceACR = await acp_ess_2.getSolidDatasetWithAcr("https://pod.inrupt.com/podsptester/toTest/", { fetch: fetch });
    //throwError(new Error("we are testing"));
    // setState(() => { throw new Error("we are testing") });
    // throw new Error("hhhhhh");
   // let b = await getSolidDataset(webId ?? "", { fetch: fetch });
    //let c = getThing(b, webId);
    //console.log(c);
  }


  gets();


  return (
    <div>
    </div>
  );
}
export default Test;

