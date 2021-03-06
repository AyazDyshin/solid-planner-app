import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import "../../styles.css";
import { Badge, OverlayTrigger, Popover, Button, Spinner, ButtonGroup, Container, Nav, Navbar, NavDropdown }
  from "react-bootstrap";
import { Note } from "../../services/types";
import { RiArrowDropDownLine, RiArrowGoBackFill } from "react-icons/ri";
import { BiFolder } from "react-icons/bi";
import { VscTypeHierarchySuper } from "react-icons/vsc";
import { GoPrimitiveDot, GoCheck, GoX } from "react-icons/go";
import { RiDeleteBin6Line } from "react-icons/ri";
import { fetchAllEntries, thingToNote } from '../../services/SolidPod';
import DeleteModal from '../../modals/DeleteModal';
import { capitalizeFirstLetter, extractCategories, filterByAccess, filterByCategory } from '../../services/helpers';
import { MdCreate } from 'react-icons/md';

interface Props {
  notesArray: Note[];
  setNotesArray: React.Dispatch<React.SetStateAction<Note[]>>;
  setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  categoryArray: string[];
  setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
  newEntryCr: boolean;
  setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
  storagePref: string;
  publicTypeIndexUrl: string;
  noteUpdInProgress: boolean;
  notesFetched: boolean;
  setNotesFetched: React.Dispatch<React.SetStateAction<boolean>>;
  podType: string;
  prefFileLocation: string;
  setNoteModalState: React.Dispatch<React.SetStateAction<boolean>>;
  refetchNotes: boolean;
}

/**
 * Fetches user's notes list if not fetched and renders it
 *
* @category Notes components
 */
const NotesList = ({ notesArray, setNotesArray, setNoteToView, storagePref,
  setViewerStatus, setCreatorStatus, setIsEdit, categoryArray, setCategoryArray, publicTypeIndexUrl,
  newEntryCr, setNewEntryCr, noteUpdInProgress, notesFetched, setNotesFetched, podType,
  prefFileLocation, setNoteModalState, refetchNotes
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
  const accessArray = ["public", "private", "shared"];
  const [deleteModalState, setDeleteModalState] = useState<boolean>(false);
  const [urlToDelete, setUrlToDelete] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const fetchNotes = async () => {
      let filteredNotes: Note[]
      if (!notesFetched) {
        const noteArr = await fetchAllEntries(webId, fetch, "note", storagePref, prefFileLocation, publicTypeIndexUrl,
          podType);
        let transformedArr = await Promise.all(noteArr.map(async (thing) => {
          return await thingToNote(thing, webId, fetch, storagePref, prefFileLocation, podType);
        }));
        transformedArr = transformedArr.filter((item) => item !== null) as Note[];
        const updType = transformedArr as Note[];
        setNotesArray(updType);
        setNotesFetched(true);
        filteredNotes = updType;
      }
      else {
        filteredNotes = notesArray;
      }
      const extr = extractCategories(filteredNotes);
      setCategoryArray(extr);
      if (currentCategory || currentAccess) {
        if (currentCategory) filteredNotes = filterByCategory(filteredNotes, currentCategory);
        if (currentAccess) filteredNotes = filterByAccess(filteredNotes, currentAccess);
      }
      setNotesToShow(filteredNotes);
      setIsLoading(false);
    }
    fetchNotes();
  }, [newEntryCr, currentCategory, currentAccess, refetchNotes, notesFetched]);

  const handleCreate = () => {
    setViewerStatus(false);
    setCreatorStatus(true);
    setNoteModalState(true);
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
            <h5 className="card-title">You don&apos;t have any notes yet!</h5>
            <p className="card-text">Let&apos;s fix this</p>
            <a className="create-note-button btn btn-primary" onClick={() => {
              setCreatorStatus(true);
              setViewerStatus(false);
              setNoteModalState(true);
            }}>Create</a>
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="w-100 h-100" >
          <div className="d-flex">
            <Navbar expand="lg" bg="warning" variant="light" className="w-100">
              <Container>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="me-auto">
                    {
                      (podType !== "acp") &&
                      <NavDropdown
                        menuVariant="dark"
                        title={<div><VscTypeHierarchySuper />
                          {capitalizeFirstLetter(currentAccess ? currentAccess : "access type")} <RiArrowDropDownLine /></div>}
                      >
                        {
                          accessArray.map((access, index) => {
                            return <NavDropdown.Item href="" key={Date.now() + index + Math.floor(Math.random() * 1000)}
                              onClick={() => {
                                setViewerStatus(false);
                                setCreatorStatus(false);
                                setCurrentAccess(access);
                              }}><GoPrimitiveDot /> {capitalizeFirstLetter(access)}</NavDropdown.Item>
                          })
                        }
                        {currentAccess && (
                          <><NavDropdown.Divider />
                            <NavDropdown.Item onClick={() => setCurrentAccess(null)}>
                              <RiArrowGoBackFill /> Reset</NavDropdown.Item>
                          </>)}
                      </NavDropdown>
                    }
                    {
                      categoryArray.length !== 0 && <NavDropdown
                        as={ButtonGroup}
                        variant="secondary"
                        menuVariant="dark"
                        title={<div><BiFolder /> {currentCategory ? currentCategory : "Category"} <RiArrowDropDownLine /></div>}
                      >
                        {
                          categoryArray.map((category, index) => {
                            return <NavDropdown.Item href="" key={Date.now() + index + Math.floor(Math.random() * 1000)}
                              onClick={() => {
                                setViewerStatus(false);
                                setCreatorStatus(false);
                                setCurrentCategory(category);

                              }}><GoPrimitiveDot /> {category}</NavDropdown.Item>
                          })
                        }
                        <><NavDropdown.Divider /><NavDropdown.Item
                          onClick={() => setCurrentCategory("without category")}>
                          <GoPrimitiveDot /> Without category</NavDropdown.Item></>
                        {currentCategory && (
                          <><NavDropdown.Divider /><NavDropdown.Item
                            onClick={() => setCurrentCategory(null)}><RiArrowGoBackFill /> Reset</NavDropdown.Item></>)}
                      </NavDropdown>
                    }
                    {
                      (currentCategory || currentAccess) && (podType !== "acp") &&
                      <OverlayTrigger placement="right" overlay={
                        <Popover>
                          <Popover.Body className="py-1 px-1">
                            Reset category and access filters
                          </Popover.Body>
                        </Popover>}>
                        <Nav.Link
                          className="me-auto"
                          onClick={() => {
                            setCurrentCategory(null);
                            setCurrentAccess(null);
                          }
                          }><RiArrowGoBackFill /> Reset all</Nav.Link>
                      </OverlayTrigger>
                    }
                    <OverlayTrigger placement="right" overlay={
                      <Popover>
                        <Popover.Body className="py-1 px-1">
                          Create a new note
                        </Popover.Body>
                      </Popover>}>
                      <Nav.Link className="create-note-button me-auto" onClick={handleCreate}><MdCreate /> Create</Nav.Link>
                    </OverlayTrigger>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          </div>
          <div className="list-group w-100 h-80">
            {
              notesToShow.length !== 0 && <div className="list-group" style={{ maxHeight: '80%', overflow: 'auto' }}>
                {
                  notesToShow.map((note, index) => {
                    return <a
                      key={`${note.id}${Date.now() + index + Math.floor(Math.random() * 1000)}`}
                      className={`list-group-item align-items-center 
                  px-1 d-flex list-group-item-action`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEdit(false);
                        setNoteToView(note);
                        setViewerStatus(true);
                        setCreatorStatus(false);
                        setNoteModalState(true);
                      }}
                    >
                      <div style={{ display: "inline-block" }}>
                        {note.category && <Badge pill bg="info" className="me-1">{note.category}</Badge>}
                      </div>
                      <div style={{ display: "inline-block" }}>
                        {!note.category && <Badge pill bg="info" className="me-1">No category</Badge>}
                      </div>
                      {note.access && (podType !== "acp") && <OverlayTrigger placement="right" overlay={
                        <Popover>
                          <Popover.Body className="py-1 px-1">
                            {(note.access[Object.keys(note.access)[0]].read) ?
                              (<div>read: <GoCheck /></div>) : (<div>Read: <GoX /></div>)}
                            {(note.access[Object.keys(note.access)[0]].append) ?
                              (<div>append: <GoCheck /></div>) : (<div>Append: <GoX /></div>)}
                            {(note.access[Object.keys(note.access)[0]].write) ?
                              (<div>write: <GoCheck /></div>) : (<div>Write: <GoX /></div>)}
                          </Popover.Body>
                        </Popover>
                      }>
                        <div style={{ display: "inline-block" }}>
                          <Badge pill bg="secondary" className="me-1 cursor">{Object.keys(note.access)[0]}</Badge>
                        </div>
                      </OverlayTrigger>}

                      {note.shareList && (podType !== "acp") && <OverlayTrigger placement="right" overlay={
                        <Popover style={{ maxWidth: "400px" }}>
                          <Popover.Body className="py-1 px-1">
                            <div >
                              {
                                note && note.shareList && Object.keys(note.shareList).map((key, index) => {
                                  return <div key={Date.now() + index + Math.floor(Math.random() * 1000)}>
                                    <div> {key} :</div>
                                    <div className="d-flex justify-content-between">
                                      {note && note.shareList && (note.shareList[key].read) ?
                                        (<div style={{ display: "inline" }}>
                                          read: <GoCheck /></div>) : (<div style={{ display: "inline" }}>read: <GoX />
                                          </div>)}
                                      {note && note.shareList && (note.shareList[key].append) ?
                                        (<div style={{ display: "inline" }}>
                                          append: <GoCheck /></div>) : (<div style={{ display: "inline" }}>append: <GoX />
                                          </div>)}
                                      {note && note.shareList && (note.shareList[key].write) ?
                                        (<div style={{ display: "inline" }}>
                                          write: <GoCheck /></div>) : (<div style={{ display: "inline" }}>write: <GoX />
                                          </div>)}
                                    </div>
                                  </div>
                                })
                              }
                            </div>
                          </Popover.Body>
                        </Popover>
                      }>
                        <div style={{ display: "inline-block" }}>
                          <Badge pill bg="secondary" className="me-1 cursor">Shared</Badge>
                        </div>
                      </OverlayTrigger>}
                      {
                        note.title && <div >{note.title}</div>
                      }
                      {
                        ((note.title === null) || (note.title === '')) && <div style={{ "color": "grey" }}>No title</div>
                      }
                      {
                        note.id &&
                        <Button variant="outline-danger"
                          className="delete-note ms-auto me-2 px-1 py-1"
                          style={{ color: "red" }}
                          onClick={(e) => { handleDelete(e, note.url) }}
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