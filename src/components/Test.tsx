import { CombinedDataProvider, useSession, Image, Text, useDataset } from '@inrupt/solid-ui-react';
import { Button, Form } from 'react-bootstrap';
import { Note } from './types';
import { FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import { useEffect, useState } from 'react';
import {
  buildThing, createContainerInContainer, createSolidDataset, createThing, getContainedResourceUrlAll, getDatetime,
  getInteger, getSolidDataset, getSolidDatasetWithAcl, getStringNoLocale, getStringNoLocaleAll, getThing, getThingAll, getUrl,
  hasAccessibleAcl, hasFallbackAcl, hasResourceAcl, saveSolidDatasetAt, saveSolidDatasetInContainer,
  setThing, Thing, createAclFromFallbackAcl, getResourceAcl, setPublicResourceAccess, saveAclFor, getAgentAccessAll, getAgentResourceAccessAll, createContainerAt, getPublicAccess
} from '@inrupt/solid-client';
import { SCHEMA_INRUPT, RDF, DCTERMS } from '@inrupt/vocab-common-rdf';
import { first } from 'lodash';
import { schema, space, vcard } from 'rdf-namespaces';
import { pim } from '@inrupt/solid-client/dist/constants';
import {
  getPrefLink, recordDefaultFolder, fetchAllNotes, saveNote, createDefFolder,
  createEntriesInTypeIndex, getAllNotesUrlFromPublicIndex, getDefaultFolder, initializeAcl, setAccess, shareWith, unShareWith
} from '../services/SolidPod';
import { access } from "@inrupt/solid-client";
import { getSolidDatasetWithAccessDatasets } from '@inrupt/solid-client/dist/acp/acp';
import { object, updated } from 'rdf-namespaces/dist/as';
import { universalAccess } from "@inrupt/solid-client";

interface Props {

}

const Test = () => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  const [editing, setEditing] = useState(true);
  const { dataset, error } = useDataset();
  const [stat, setStat] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const gets = async () => {


    try {
      await createContainerAt("https://pod.inrupt.com/podsptester/test/", {
        fetch: fetch
      });
    }
    catch (error) {
      throw new Error("error when trying to create a container");
    }

    let publicAcc = await universalAccess.getPublicAccess("https://pod.inrupt.com/podsptester/test/", { fetch: fetch });
    console.log("this is publicAcc:");
    console.log(publicAcc);
    let returnOfSet = await universalAccess.setPublicAccess("https://pod.inrupt.com/podsptester/test/", { read: true, write: true },
      { fetch: fetch });
    console.log("this is returnOfSet:");
    console.log(returnOfSet);
    let publicAccAfterSet = await universalAccess.getPublicAccess("https://pod.inrupt.com/podsptester/test/", { fetch: fetch });
    console.log("this is publicAccAfterSet:");
    console.log(publicAccAfterSet);
    // try {
    //   let lol = await universalAccess.getPublicAccess(`https://pod.inrupt.com/ayazdyshin/tot/`,
    //     { fetch: fetch });
    //   lul = await universalAccess.setPublicAccess(`https://pod.inrupt.com/ayazdyshin/tot/`, { read: true, write: false },
    //     { fetch: fetch });
    //   console.log(lol);
    //   console.log(lul);
    // }
    // catch (error) {
    //   await initializeAcl(`https://pod.inrupt.com/ayazdyshin/tot/`, fetch);
    //   lul = await universalAccess.setPublicAccess(`https://pod.inrupt.com/ayazdyshin/tot/`, { read: true, write: false },
    //     { fetch: fetch });
    //   console.log(lul);
    // }
    // console.log("this is heh");
    // console.log(heh);
    // await initializeAcl(`https://inrtester2.inrupt.net/ti/`, fetch);
    // //  await setAccess("public", `https://inrtester2.inrupt.net/to/`, fetch);
    // await setAccess("private", `https://inrtester2.inrupt.net/ti/`, fetch);
    // // const myDatasetWithAcl = await getSolidDatasetWithAcl(`https://inrtester2.inrupt.net/to/`, { fetch: fetch });
    // // const publicAccess = getPublicAccess(myDatasetWithAcl); 
    // await shareWith(`https://inrtester2.inrupt.net/ti/`, fetch, ["https://pod.inrupt.com/ayazdyshin/profile/card#me",
    //   "https://pod.inrupt.com/podsptester/profile/card#me"]);
    // //console.log(publicAccess);
    // let agent = await universalAccess.getAgentAccessAll(`https://inrtester2.inrupt.net/ti/`, { fetch: fetch });
    // console.log(agent);
    // await unShareWith(`https://inrtester2.inrupt.net/ti/`, fetch, ["https://pod.inrupt.com/ayazdyshin/profile/card#me"]);
    // agent = await universalAccess.getAgentAccessAll(`https://inrtester2.inrupt.net/ti/`, { fetch: fetch });
    // console.log(agent);
  }

 // gets();


  return (
    <div>

    </div>
  );
};

export default Test;


// let agent = await universalAccess.getAgentAccessAll(`https://inrtester2.inrupt.net/to/`, { fetch: fetch });
// console.log(agent);
// let b = agent!.length;
// let agOb = agent as object;
// console.log("this is agob");
// console.log(agOb);
// for (let prop in agOb) {
//   console.log(prop);
//   if (prop.substring(0, 6) === 'mailto') {
//     console.log('lol');
//     console.log(prop.substring(0, 6));
//   }

// }