import { CombinedDataProvider, useSession, Image, Text, useDataset } from '@inrupt/solid-ui-react';
import { Button, Form } from 'react-bootstrap';
import { Note } from './types';
import { FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import { useState } from 'react';
import { buildThing, createContainerInContainer, createSolidDataset, createThing, getSolidDataset, saveSolidDatasetAt, saveSolidDatasetInContainer, setThing } from '@inrupt/solid-client';
import {SCHEMA_INRUPT, RDF} from '@inrupt/vocab-common-rdf';
import * as $rdf from "rdflib";

interface Props {

}
const Test = () => {
    const { session, fetch} = useSession();
    const { webId } = session.info;
    const [editing, setEditing] = useState(true);
    const { dataset, error } = useDataset();
    const SOLID = $rdf.Namespace("http://www.w3.org/ns/solid/terms#");
    
    const load = async (document: $rdf.NamedNode) => {
        try {
          return await fetch(document.value);
        } catch (err) {
          return Promise.reject(new Error("Could not fetch the document."));
        }
      }
      const getDataSet = async () => {
          if (typeof webId === 'string'){
      const myDataset = await getSolidDataset(
        webId, {
        fetch: fetch
      });
      console.log(myDataset);
    } 
    }
getDataSet();
    if (typeof webId === 'string' ){
        const user = $rdf.sym(webId);
        console.log(user);
        const doc = user.doc();
        console.log(doc);
        console.log(SOLID("timeline"));
       load(user)      
    }


    // const getAppFolder = async (webId: string): Promise<string> => {
    //     const user = $rdf.sym(webId);
    //     const doc = user.doc();
    //     try {
    //       await this.load(doc);
    //     } catch (err) {
    //       return Promise.reject(err);
    //     }
    //     const folder = this.store.any(user, SOLID("timeline"), null, doc);
    //     return folder ? folder.value.toString() : Promise.reject(new Error("No application folder."));
    // }

    return (
        <div>

        </div>
    );
};

export default Test;




