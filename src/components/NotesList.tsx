import { getInteger, getStringNoLocale, Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import { schema } from "rdf-namespaces";
import { useState } from "react";
import SaveModal from "./SaveModal";

interface Props {
  notesArray: Thing[];
  setNotesArray: React.Dispatch<React.SetStateAction<Thing[]>>;
  thingToView: Thing | null;
  setThingToView: React.Dispatch<React.SetStateAction<Thing | null>>;
  viewerStatus: boolean;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotesList = ({ notesArray, setNotesArray, thingToView, setThingToView,
  viewerStatus, setViewerStatus, setCreatorStatus, isEdit, setIsEdit }: Props) => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [saveModalState, setSaveModalState] = useState<boolean>(false);

  const handleCreate = () => {
    if (isEdit) {
      setSaveModalState(true);
    }
    else {
      setViewerStatus(false);
      setCreatorStatus(true);
    }
  }

  return (
    <div className="list-group w-100 h-100">
      {
        notesArray.map((note) => (
          <a
            key={`${getInteger(note, schema.identifier)}${Date.now()}`}
            className={`list-group-item list-group-item-action ${activeNote === getInteger(note, schema.identifier) ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setIsEdit(false);
              setActiveNote(getInteger(note, schema.identifier));
              setThingToView(note);
              setViewerStatus(true);
              setCreatorStatus(false);
            }}
          >{getStringNoLocale(note, DCTERMS.title)}</a>
        ))
      }
      <a className="btn btn-primary" onClick={handleCreate}>create</a>
      <SaveModal saveModalState={saveModalState} setSaveModalState={setSaveModalState}
        setCreatorStatus={setCreatorStatus}
        setViewerStatus={setViewerStatus} />
    </div>
  )
}

export default NotesList;