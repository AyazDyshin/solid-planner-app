import { CombinedDataProvider, useSession, Image, Text, useDataset } from '@inrupt/solid-ui-react';
import { Button, Form } from 'react-bootstrap';
import { Note } from './types';
import { FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import { useEffect, useState } from 'react';
import {
  buildThing, createContainerInContainer, createSolidDataset, createThing, getContainedResourceUrlAll, getDatetime,
  getInteger, getSolidDataset, getSolidDatasetWithAcl, getStringNoLocale, getStringNoLocaleAll, getThing, getThingAll, getUrl,
  hasAccessibleAcl, hasFallbackAcl, hasResourceAcl, saveSolidDatasetAt, saveSolidDatasetInContainer,
  setThing, Thing, createAclFromFallbackAcl, getResourceAcl, setPublicResourceAccess, saveAclFor, getAgentAccessAll, getAgentResourceAccessAll, createContainerAt
} from '@inrupt/solid-client';
import { SCHEMA_INRUPT, RDF, DCTERMS } from '@inrupt/vocab-common-rdf';
import { first } from 'lodash';
import { schema, space, vcard } from 'rdf-namespaces';
import { pim } from '@inrupt/solid-client/dist/constants';
import {
  getPrefLink, recordDefaultFolder, fetchAllNotes, saveNote, createDefFolder,
  createEntriesInTypeIndex, getAllNotesUrlFromPublicIndex, getDefaultFolder, initializeAcl
} from '../services/SolidPod';
import { access } from "@inrupt/solid-client";
import { getSolidDatasetWithAccessDatasets } from '@inrupt/solid-client/dist/acp/acp';
import { updated } from 'rdf-namespaces/dist/as';
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
    // const defFolder = await getDefaultFolder(webId ?? "", fetch);
    // console.log("before ds");
    // let myDatasetWithAcl = await getSolidDatasetWithAcl(defFolder!, { fetch: fetch });
    // let resourceAcl;
    // if (!hasResourceAcl(myDatasetWithAcl)) {
    //   if (!hasAccessibleAcl(myDatasetWithAcl)) {
    //     throw new Error(
    //       "The current user does not have permission to change access rights to this Resource."
    //     );
    //   }
    //   if (!hasFallbackAcl(myDatasetWithAcl)) {
    //     throw new Error(
    //       "The current user does not have permission to see who currently has access to this Resource."
    //     );
    //   }
    //   resourceAcl = createAclFromFallbackAcl(myDatasetWithAcl);
    // } else {
    //   resourceAcl = getResourceAcl(myDatasetWithAcl);
    // }
    // const updatedAcl = setPublicResourceAccess(
    //   resourceAcl,
    //   { read: true, append: true, write: false, control: false },
    // );
    // await saveAclFor(myDatasetWithAcl, updatedAcl, { fetch: fetch });


    // console.log(getAgentAccessAll(myDatasetWithAcl));
    // console.log(getAgentAccessAll(myDatasetWithAcl)![webId ?? ""]);
    // // console.log(getAgentResourceAccessAll(myDatasetWithAcl));
    // let uniPub = await access.getPublicAccess(defFolder!, { fetch: fetch });
    // let uniAgent = await access.getAgentAccess(defFolder!, "https://inrtester.inrupt.net/profile/card#me", { fetch: fetch });
    // console.log("this is uniPub");
    // console.log(uniPub);
    // console.log("this is uniAgent");
    // console.log(uniAgent);

   // await initializeAcl(`https://inrtester2.inrupt.net/t/`, fetch);

    try {
      await createContainerAt(`https://inrtester2.inrupt.net/test/`, {
        fetch: fetch
      });
    }
    catch (error) {
      throw new Error("error when trying to create a container");
    }
    let myDatasetWithAcl
    try {
      myDatasetWithAcl = await getSolidDatasetWithAcl(`https://inrtester2.inrupt.net/test/`, {fetch : fetch});
    }
    catch (error){
      console.log("error when fetching dataset with acl");
    }
    console.log(myDatasetWithAcl);


    // let heh = await universalAccess.setPublicAccess(`https://inrtester2.inrupt.net/t/`, { read: true, write: false }, {
    //   fetch: fetch
    // });

    // let acc = universalAccess.getPublicAccess(`https://inrtester2.inrupt.net/t/`, {
    //   fetch: fetch
    // });
    // console.log("this is acc");
    // console.log(acc);

  
    //   console.log("we are here");
    //   let upd = await access.setPublicAccess(`https://inrtester2.inrupt.net/t/`, {
    //     read: true,
    //     append: false,
    //     write: false,
    //     controlRead: false,
    //     controlWrite: false
    //   }, { fetch: fetch });
    //   if (!upd) {
    //     throw new Error("You don't have permissions to changes the access type of this resource");
    //   }
    //   console.log("this is upd:");
    //   console.log(upd);
  }

//  gets();


  return (
    <div>

    </div>
  );
};

export default Test;




// const defFolder = await getDefaultFolder(webId ?? "", fetch);
// let ds = await getSolidDatasetWithAcl(defFolder!, { fetch: fetch });
// let lul = ds.internal_acl.fallbackAcl;
// if (lul) {
//   console.log("this is just inrupt");
// }
// else {
//   console.log("this is pod.inrupt");
// }