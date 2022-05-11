import { CombinedDataProvider, useSession, Image, Text, useDataset } from '@inrupt/solid-ui-react';
import { Button, Form } from 'react-bootstrap';
import { Note } from './types';
import { FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import { useEffect, useState } from 'react';
import { buildThing, createContainerInContainer, createSolidDataset, createThing, getContainedResourceUrlAll, getDatetime, getSolidDataset, getThing, getThingAll, getUrl, saveSolidDatasetAt, saveSolidDatasetInContainer, setThing } from '@inrupt/solid-client';
import { SCHEMA_INRUPT, RDF } from '@inrupt/vocab-common-rdf';
import { first } from 'lodash';
import { space, vcard } from 'rdf-namespaces';
import { pim } from '@inrupt/solid-client/dist/constants';
import { getPrefLink, checkAndCreatePrefLink, recordDefaultFolder, fetchAllNotes, saveNote } from '../services/SolidPod';
interface Props {

}

const Test = () => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  const [editing, setEditing] = useState(true);
  const { dataset, error } = useDataset();
  const [stat, setStat] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  useEffect(() => {
    async function fetchData() {
      let heh = await fetchAllNotes(webId??"", fetch);
      console.log(heh);
      //let note = await saveNote(webId??"", fetch, {id: null , title:"heh", content:"fgdsfshdh"});
    }
    fetchData();
  }, [])


  // console.log(stat);

  // const getDataset = async () => {
  //   if (typeof webId === 'string') {
  //     const newUrl= `${modifyWebId(webId)}profile/card`;
  //     const dataSet = await getSolidDataset(newUrl, {
  //       fetch: fetch
  //     });
  //      const thingstoGet = getThingAll(dataSet);
  //     console.log(thingstoGet);
  //     // const testURls = getContainedResourceUrlAll(dataSet);
  //     // const thingtoGet = getThing(dataSet,testURls[0]);

  //      const firstData = getDatetime(thingstoGet[0],vcard.bday);
  //     // console.log(vcard.bday);
  //      console.log(firstData);
  //   }
  // }

  // const load = async (document: $rdf.NamedNode) => {
  //     try {
  //       return await fetch(document.value);
  //     } catch (err) {
  //       return Promise.reject(new Error("Could not fetch the document."));
  //     }
  //   }


  return (
    <div>

    </div>
  );
};

export default Test;




