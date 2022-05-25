import { CombinedDataProvider, useSession, Image, Text, useDataset } from '@inrupt/solid-ui-react';
import { Button, Form } from 'react-bootstrap';
import { Note } from './types';
import { FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import { useEffect, useState } from 'react';
import { buildThing, createContainerInContainer, createSolidDataset, createThing, getContainedResourceUrlAll, getDatetime, getInteger, getSolidDataset, getStringNoLocale, getStringNoLocaleAll, getThing, getThingAll, getUrl, saveSolidDatasetAt, saveSolidDatasetInContainer, setThing, Thing } from '@inrupt/solid-client';
import { SCHEMA_INRUPT, RDF, DCTERMS } from '@inrupt/vocab-common-rdf';
import { first } from 'lodash';
import { schema, space, vcard } from 'rdf-namespaces';
import { pim } from '@inrupt/solid-client/dist/constants';
import { getPrefLink, recordDefaultFolder, fetchAllNotes, saveNote, createDefFolder, createEntriesInTypeIndex, getAllNotesUrlFromPublicIndex } from '../services/SolidPod';
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
    await getAllNotesUrlFromPublicIndex(webId ?? "", fetch);
  }



  return (
    <div>

    </div>
  );
};

export default Test;




