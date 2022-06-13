import { CombinedDataProvider, useSession, Image, Text, useDataset } from '@inrupt/solid-ui-react';
import { Button, Form } from 'react-bootstrap';
import { Note } from './types';
import { FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import { useEffect, useState } from 'react';
import {
  buildThing, createContainerInContainer, createSolidDataset, createThing, getContainedResourceUrlAll, getDatetime,
  getInteger, getSolidDataset, getSolidDatasetWithAcl, getStringNoLocale, getStringNoLocaleAll, getThing, getThingAll, getUrl,
  hasAccessibleAcl, hasFallbackAcl, hasResourceAcl, saveSolidDatasetAt, saveSolidDatasetInContainer,
  setThing, Thing, createAclFromFallbackAcl, getResourceAcl, setPublicResourceAccess, saveAclFor, getAgentAccessAll, getAgentResourceAccessAll, createContainerAt, getPublicAccess, acp_ess_2, asUrl, solidDatasetAsTurtle
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
import { getSolidDatasetWithAccessDatasets, WithAccessibleAcr } from '@inrupt/solid-client/dist/acp/acp';
import { object, updated } from 'rdf-namespaces/dist/as';
import { universalAccess } from "@inrupt/solid-client";
import { issueAccessRequest } from '@inrupt/solid-client-access-grants';
import { AccessControlResource } from '@inrupt/solid-client/dist/acp/control';
import { checkPermissions, getPubAccess, getSharedList, initializeAcl, isWacOrAcp, setPubAccess, shareWith, unShareWith } from '../services/access';

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
    await fetchContacts(webId ?? "", fetch);
  }
  gets();


  return (
    <div>

    </div>
  );
  ;
}
export default Test;

