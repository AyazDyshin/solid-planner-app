import 'bootstrap/dist/css/bootstrap.css';
import { getInteger, getStringNoLocale, Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { RefAttributes, useState } from "react";
import "../styles.css";
import { Dropdown, DropdownButton, Badge, Overlay, Tooltip, OverlayTrigger, TooltipProps, Popover, PopoverProps, Button } from "react-bootstrap";
import SaveModal from "./SaveModal";
import { Note } from "./types";
import { RiArrowDropDownLine, RiArrowGoBackFill } from "react-icons/ri";
import { AiOutlinePlus } from "react-icons/ai";
import { BsPlusLg } from "react-icons/bs";
import { BiFolder } from "react-icons/bi";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import { GoPrimitiveDot, GoCheck, GoX } from "react-icons/go";
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
  isLoadingContents: boolean;
  setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
}

const NotesList = ({ notesArray, setNotesArray, noteToView, setNoteToView,
  viewerStatus, setViewerStatus, setCreatorStatus, isEdit, setIsEdit, categoryArray, setCategoryArray,
  setCurrentCategory, currentCategory, setCurrentAccess, currentAccess, isLoadingContents, setIsLoadingContents }: Props) => {

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
        className="mx-1 my-1"
          variant="secondary"
          title={<div><VscTypeHierarchySuper /> {currentAccess ? currentAccess : "access type"} <RiArrowDropDownLine /></div>}
        >
          {
            accessArray.map((access) => {
              return <Dropdown.Item href="" key={Date.now() + Math.floor(Math.random() * 1000)}
                onClick={() => {
                  setViewerStatus(false);
                  setCreatorStatus(false);
                  setCurrentAccess(access);
                }}><GoPrimitiveDot /> {access}</Dropdown.Item>
            })
          }
          {currentAccess && (
            <><Dropdown.Divider /><Dropdown.Item onClick={() => setCurrentAccess(null)}><RiArrowGoBackFill /> reset</Dropdown.Item></>)}
        </DropdownButton>
        {
          categoryArray.length !== 0 && <DropdownButton
          className="mx-1 my-1"
            variant="secondary"
            title={<div><BiFolder /> {currentCategory ? currentCategory : "Category"} <RiArrowDropDownLine /></div>}
          >
            {
              categoryArray.map((category) => {
                return <Dropdown.Item href="" key={Date.now() + Math.floor(Math.random() * 1000)}
                  onClick={() => {
                    setViewerStatus(false);
                    setCreatorStatus(false);
                    setCurrentCategory(category);

                  }}><GoPrimitiveDot /> {category}</Dropdown.Item>
              })
            }

            {currentCategory && (
              <><Dropdown.Divider /><Dropdown.Item onClick={() => setCurrentCategory(null)}><RiArrowGoBackFill /> reset</Dropdown.Item></>)}
          </DropdownButton>
        }
        <OverlayTrigger placement="left" overlay={
          <Popover>
            <Popover.Body className="py-1 px-1">
              Create a new note
            </Popover.Body>
          </Popover>}>
          <a className="btn btn-secondary ms-auto my-1 d-flex align-items-center justify-content-center" onClick={handleCreate}><BsPlusLg /></a>
        </OverlayTrigger>
      </div>
      <div className="list-group w-100 h-100">
        {
          notesArray.map((note) => {
            if (note) {
              return <a
                key={`${note.id}${Date.now() + Math.floor(Math.random() * 1000)}`}
                className={`list-group-item px-1 list-group-item-action ${activeNote === note.id ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  setIsEdit(false);
                  setActiveNote(note.id);
                  setNoteToView(note);
                  setViewerStatus(true);
                  setCreatorStatus(false);
                }}
              >
                <div style={{ display: "inline-block" }}>
                  {note.category && <Badge pill bg="info" className="me-1">{note.category}</Badge>}
                </div>
                <div style={{ display: "inline-block" }}>
                  {!note.category && <Badge pill bg="info" className="me-1">no category</Badge>}
                </div>
                {note.access && <OverlayTrigger placement="right" overlay={
                  <Popover>
                    <Popover.Body className="py-1 px-1">
                      {(note!.access![Object.keys(note!.access!)[0]].read) ?
                        (<div>read: <GoCheck /></div>) : (<div>read: <GoX /></div>)}
                      {(note!.access![Object.keys(note!.access!)[0]].append) ?
                        (<div>append: <GoCheck /></div>) : (<div>append: <GoX /></div>)}
                      {(note!.access![Object.keys(note!.access!)[0]].write) ?
                        (<div>write: <GoCheck /></div>) : (<div>write: <GoX /></div>)}
                    </Popover.Body>
                  </Popover>
                }>
                  <div style={{ display: "inline-block" }}>
                    <Badge pill bg="secondary" className="me-1 cursor">{Object.keys(note.access)[0]}</Badge>
                  </div>
                </OverlayTrigger>}

                {note.shareList && <OverlayTrigger placement="right" overlay={
                  <Popover style={{ maxWidth: "400px" }}>
                    <Popover.Body className="py-1 px-1">
                      <div >
                        {
                          Object.keys(note!.shareList!).map((key, index) => {
                            return <div key={Date.now() + Math.floor(Math.random() * 1000)}>
                              <div> {key} :</div>
                              <div className="d-flex justify-content-between">
                                {(note!.shareList![key].read) ?
                                  (<div style={{ display: "inline" }}>read: <GoCheck /></div>) : (<div style={{ display: "inline" }}>read: <GoX /></div>)}
                                {(note!.shareList![key].append) ?
                                  (<div style={{ display: "inline" }}>append: <GoCheck /></div>) : (<div style={{ display: "inline" }}>append: <GoX /></div>)}
                                {(note!.shareList![key].write) ?
                                  (<div style={{ display: "inline" }}>write: <GoCheck /></div>) : (<div style={{ display: "inline" }}>write: <GoX /></div>)}
                              </div>
                            </div>
                          })
                        }
                      </div>
                    </Popover.Body>
                  </Popover>
                }>
                  <div style={{ display: "inline-block" }}>
                    <Badge pill bg="secondary" className="me-1 cursor">shared</Badge>
                  </div>
                </OverlayTrigger>}
                {note.title}
              </a>
            }
          })
        }
        <SaveModal saveModalState={saveModalState} setSaveModalState={setSaveModalState}
          setCreatorStatus={setCreatorStatus}
          setViewerStatus={setViewerStatus} />
      </div>
    </div>
  )
};

export default NotesList;