import { getInteger, getStringNoLocale, Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import { schema } from "rdf-namespaces";
import { useState } from "react";
import { Dropdown, DropdownButton, Badge } from "react-bootstrap";
import SaveModal from "./SaveModal";
import { Note } from "./types";

interface Props {
  notesArray: (Note | null)[];
  setNotesArray: React.Dispatch<React.SetStateAction<(Note | null)[]>>;
  noteToView: Note | null;
  setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
  viewerStatus: boolean;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  categoryArray: string[];
  setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
  setCurrentCategory: React.Dispatch<React.SetStateAction<string | null>>;
  currentCategory: string | null;
}

const NotesList = ({ notesArray, setNotesArray, noteToView, setNoteToView,
  viewerStatus, setViewerStatus, setCreatorStatus, isEdit, setIsEdit, categoryArray, setCategoryArray,
  setCurrentCategory, currentCategory }: Props) => {
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
    <div className="w-100 h-100">
      <DropdownButton
        variant="outline-secondary"
        title="Dropdown"
      >
        {
          categoryArray.map((category) => {
            return <Dropdown.Item href="" onClick={() => setCurrentCategory(category)}>{category}</Dropdown.Item>
          })
        }
      </DropdownButton>
      <div className="list-group w-100 h-100">
        {
          notesArray.map((note) => {
            if (note) {
              return <a
                key={`${note.id}${Date.now()}`}
                className={`list-group-item list-group-item-action ${activeNote === note.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setIsEdit(false);
                  setActiveNote(note.id);
                  setNoteToView(note);
                  setViewerStatus(true);
                  setCreatorStatus(false);
                }}
              >{note.category && <Badge pill bg="primary" className="me-3">
                {note.category}</Badge>}{!note.category && <Badge pill bg="secondary" className="me-3">
                  no category</Badge>}{note.title} </a>
            }
          })
        }
        <a className="btn btn-primary" onClick={handleCreate}>create</a>
        <SaveModal saveModalState={saveModalState} setSaveModalState={setSaveModalState}
          setCreatorStatus={setCreatorStatus}
          setViewerStatus={setViewerStatus} />
      </div>
    </div>
  )
}

export default NotesList;