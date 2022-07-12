import 'bootstrap/dist/css/bootstrap.css';
import { useSession } from "@inrupt/solid-ui-react";
import { RefAttributes, useEffect, useState } from "react";
import "../styles.css";
import { Dropdown, DropdownButton, Badge, OverlayTrigger, Popover, PopoverProps, Button, Spinner } from "react-bootstrap";
import SaveModal from "./SaveModal";
import { Note } from "./types";
import { RiArrowDropDownLine, RiArrowGoBackFill } from "react-icons/ri";
import { BsPlusLg } from "react-icons/bs";
import { BiFolder } from "react-icons/bi";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import { GoPrimitiveDot, GoCheck, GoX } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
import { deleteEntry, fetchAllEntries, thingToNote } from '../services/SolidPod';
import DeleteModal from '../modals/DeleteModal';
import { extractCategories, filterByAccess, filterByCategory } from '../services/helpers';

interface Props {
  notesArray: Note[];
  setNotesArray: React.Dispatch<React.SetStateAction<Note[]>>;
  noteToView: Note | null;
  setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
  viewerStatus: boolean;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  categoryArray: string[];
  setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
  newEntryCr: boolean;
  setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
  storagePref: string;
  publicTypeIndexUrl: string;
  noteUpdInProgress: boolean;
  setNoteUpdInProgress: React.Dispatch<React.SetStateAction<boolean>>;
  notesFetched: boolean;
  setNotesFetched: React.Dispatch<React.SetStateAction<boolean>>;
  podType: string;
  prefFileLocation: string;
}

const NotesList = ({ notesArray, setNotesArray, noteToView, setNoteToView, storagePref,
  viewerStatus, setViewerStatus, setCreatorStatus, isEdit, setIsEdit, categoryArray, setCategoryArray, publicTypeIndexUrl,
  newEntryCr, setNewEntryCr, noteUpdInProgress, setNoteUpdInProgress, notesFetched, setNotesFetched, podType,
  prefFileLocation
}: Props) => {

  const { session, fetch } = useSession();
  const { webId } = session.info;
  if (webId === undefined) {
    throw new Error(`Error, couldn't get user's WebId`);
  }

  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentAccess, setCurrentAccess] = useState<string | null>(null);
  const [notesToShow, setNotesToShow] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeNote, setActiveNote] = useState<number | null>(null);
  const accessArray = ["public", "private", "shared"];
  const [deleteModalState, setDeleteModalState] = useState<boolean>(false);
  const [urlToDelete, setUrlToDelete] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchNotes = async () => {
      let filteredNotes: Note[]
      if (!notesFetched) {
        let noteArr = await fetchAllEntries(webId, fetch, "note", storagePref, prefFileLocation, publicTypeIndexUrl,
          podType);
        let transformedArr = await Promise.all(noteArr.map(async (thing) => {
          return await thingToNote(thing, webId, fetch, storagePref, prefFileLocation, podType);
        }));
        transformedArr = transformedArr.filter((item) => item !== null) as Note[];
        let updType = transformedArr as Note[];
        setNotesArray(updType);
        setNotesFetched(true);
        filteredNotes = updType;
      }
      else {
        filteredNotes = notesArray;
      }
      let extr = extractCategories(filteredNotes);
      setCategoryArray(extr);
      if (currentCategory || currentAccess) {
        if (currentCategory) filteredNotes = filterByCategory(filteredNotes, currentCategory);
        if (currentAccess) filteredNotes = filterByAccess(filteredNotes, currentAccess);
      }
      setNotesToShow(filteredNotes);
      setIsLoading(false);
    }
    fetchNotes();
  }, [newEntryCr, currentCategory, currentAccess]);

  const handleCreate = () => {
    setViewerStatus(false);
    setCreatorStatus(true);
  }

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, url: string) => {
    e.stopPropagation();
    setUrlToDelete(url);
    setDeleteModalState(true);
  }
  if (!notesFetched || isLoading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    )
  }
  else {
    if ((notesToShow.length === 0) && !(currentAccess || currentCategory)) {
      return (
        <div className="card text-center">
          <div className="card-body">
            <h5 className="card-title">You don't have any notes yet!</h5>
            <p className="card-text">Let's fix this</p>
            <a className="btn btn-primary" onClick={() => {
              setCreatorStatus(true);
              setViewerStatus(false);
            }}>create</a>
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="w-100 h-100">
          <div className="d-flex">
            <DropdownButton
              className="mx-1 my-1"
              variant="secondary"
              title={<div><VscTypeHierarchySuper /> {currentAccess ? currentAccess : "access type"} <RiArrowDropDownLine /></div>}
            >
              {
                accessArray.map((access, index) => {
                  return <Dropdown.Item href="" key={Date.now() + index + Math.floor(Math.random() * 1000)}
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
                  categoryArray.map((category, index) => {
                    return <Dropdown.Item href="" key={Date.now() + index + Math.floor(Math.random() * 1000)}
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
          <div className="list-group w-100 h-80">
            {
              notesToShow.length !== 0 && <div className="list-group" style={{ maxHeight: '80%', overflow: 'auto' }}>
                {
                  notesToShow.map((note, index) => {
                    return <a
                      key={`${note.id}${Date.now() + index + Math.floor(Math.random() * 1000)}`}
                      className={`list-group-item align-items-center 
                  px-1 d-flex list-group-item-action ${activeNote === note.id ? 'active' : ''}`}
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
                            {(note.access[Object.keys(note.access)[0]].read) ?
                              (<div>read: <GoCheck /></div>) : (<div>read: <GoX /></div>)}
                            {(note.access[Object.keys(note.access)[0]].append) ?
                              (<div>append: <GoCheck /></div>) : (<div>append: <GoX /></div>)}
                            {(note.access[Object.keys(note.access)[0]].write) ?
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
                                //handle
                                Object.keys(note!.shareList!).map((key, index) => {
                                  return <div key={Date.now() + index + Math.floor(Math.random() * 1000)}>
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
                      {
                        note.id &&
                        <Button variant="outline-danger"
                          className="ms-auto me-2 px-1 py-1"
                          style={{ color: "red" }}
                          onClick={(e) => { handleDelete(e, note.url!) }}
                        ><RiDeleteBin6Line /></Button>
                      }
                    </a>

                  })
                }
              </div>
            }
            {
              notesToShow.length === 0 && <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Oooops!</h5>
                  <p className="card-text">Seems like there are no notes satisfying your filters</p>
                </div>
              </div>
            }
            <DeleteModal
              setViewerStatus={setViewerStatus}
              setCreatorStatus={setCreatorStatus}
              newEntryCr={newEntryCr}
              setNewEntryCr={setNewEntryCr}
              notesArray={notesArray}
              setNotesArray={setNotesArray}
              setUrlToDelete={setUrlToDelete}
              deleteModalState={deleteModalState}
              setDeleteModalState={setDeleteModalState}
              urlToDelete={urlToDelete}
              entryType={"note"}
              storagePref={storagePref}
              publicTypeIndexUrl={publicTypeIndexUrl}
              progressCheck={noteUpdInProgress}
            />
          </div>
        </div>
      )
    }
  }
};

export default NotesList;