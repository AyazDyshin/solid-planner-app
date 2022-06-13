import { getInteger, getStringNoLocale, Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { DCTERMS } from "@inrupt/vocab-common-rdf";
import { schema } from "rdf-namespaces";
import { useState } from "react";
import { Dropdown, DropdownButton, Badge } from "react-bootstrap";
import SaveModal from "./SaveModal";
import { Note } from "./types";
import { RiArrowDropDownLine } from "react-icons/ri";

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
  setCurrentAccess: React.Dispatch<React.SetStateAction<string | null>>;
  currentAccess: string | null;
}

const NotesList = ({ notesArray, setNotesArray, noteToView, setNoteToView,
  viewerStatus, setViewerStatus, setCreatorStatus, isEdit, setIsEdit, categoryArray, setCategoryArray,
  setCurrentCategory, currentCategory, setCurrentAccess, currentAccess }: Props) => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const [saveModalState, setSaveModalState] = useState<boolean>(false);
  let accessArray = ["public", "private", "shared"];

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
      <div className="d-flex">


        <DropdownButton
          variant="outline-secondary"
          title={<div>{currentAccess ? currentAccess : "access type"} <RiArrowDropDownLine /></div>}
        >
          {
            accessArray.map((access) => {
              return <Dropdown.Item href="" key={Date.now() + Math.floor(Math.random() * 1000)} onClick={() => setCurrentAccess(access)}>{access}</Dropdown.Item>
            })
          }

          {currentAccess && (
            <><Dropdown.Divider /><Dropdown.Item onClick={() => setCurrentAccess(null)}>Reset</Dropdown.Item></>)}
        </DropdownButton>


        {
          categoryArray.length !== 0 && <DropdownButton
            variant="outline-secondary"
            title={<div>{currentCategory ? currentCategory : "All notes"} <RiArrowDropDownLine /></div>}
          >
            {
              categoryArray.map((category) => {
                return <Dropdown.Item href="" key={Date.now() + Math.floor(Math.random() * 1000)} onClick={() => setCurrentCategory(category)}>{category}</Dropdown.Item>
              })
            }

            {currentCategory && (
              <><Dropdown.Divider /><Dropdown.Item onClick={() => setCurrentCategory(null)}>Reset</Dropdown.Item></>)}
          </DropdownButton>
        }


      </div>
      <div className="list-group w-100 h-100">
        {
          notesArray.map((note) => {
            if (note) {
              return <a
                key={`${note.id}${Date.now() + Math.floor(Math.random() * 1000)}`}
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