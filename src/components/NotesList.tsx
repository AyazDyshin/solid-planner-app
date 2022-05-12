import { getInteger, getStringNoLocale, Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import { schema } from "rdf-namespaces";
import { useState } from "react";

interface Props {
  notesArray: Thing[];
  setNotesArray: React.Dispatch<React.SetStateAction<Thing[]>>;
  thingToView: Thing | null;
  setThingToView: React.Dispatch<React.SetStateAction<Thing | null>>;
  viewerStatus: boolean;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
const NotesList = ({ notesArray, setNotesArray, thingToView, setThingToView,
   viewerStatus, setViewerStatus,setCreatorStatus }: Props) => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  const [activeNote, setActiveNote] = useState<number | null>(null);
  //  console.log(getInteger(notesArray[0],schema.identifier));

  return (
    <div className="list-group w-100 h-100">
      {
        notesArray.map((note) => (
          <a
            key={`${getInteger(note, schema.identifier)}${Date.now()}`}
            className={`list-group-item list-group-item-action ${activeNote === getInteger(note, schema.identifier) ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveNote(getInteger(note, schema.identifier));
              setThingToView(note);
              setViewerStatus(true);
              setCreatorStatus(false);
            }}
          >{getStringNoLocale(note, DCTERMS.title)}</a>
        ))
      }
    </div>
  )
}

export default NotesList;