import { useState } from "react";
import "../styles.css";
import React from 'react';
import { accessObject, Note } from "./types";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import NoteCreator from "./NoteCreator";
import NotesList from "./NotesList";
import { Modal } from "react-bootstrap";

interface Props {
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    notesArray: Note[];
    setNotesArray: React.Dispatch<React.SetStateAction<Note[]>>;
    notesFetched: boolean;
    setNotesFetched: React.Dispatch<React.SetStateAction<boolean>>;
    storagePref: string;
    defFolder: string | null;
    prefFileLocation: string;
    podType: string;
    publicTypeIndexUrl: string;
    contactsFdrStatus: boolean;
    setContactsFdrStatus: React.Dispatch<React.SetStateAction<boolean>>;
    contactsArr: (string | null)[][];
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    contactsFetched: boolean;
    refetchNotes: boolean;
}
// Component that is responsible for rendering content of notes and habits tab
// splits the content in two halves, left half: "FolderPickerOrContent"
// right half: "CreatorToRender"
// "newEntryCr" and "setNewEntryCr" are indicating if a new entry was created
// this is needed to update the left side view, ie list of entries existing in the user's pod
// "creatorStatus" and "setCreatorStatus" are hooks to monitor if create button was pressed,
// this is needed to render the respective creator component
const NotesRender = ({ viewerStatus, setViewerStatus, creatorStatus, setCreatorStatus, isEdit, storagePref, defFolder,
    setIsEdit, notesArray, setNotesArray, notesFetched, setNotesFetched, podType,
    prefFileLocation, publicTypeIndexUrl, contactsFdrStatus, setContactsFdrStatus, contactsArr, setContactsArr,
    contactsFetched, refetchNotes
}: Props) => {
    const [newEntryCr, setNewEntryCr] = useState<boolean>(false);
    const [noteToView, setNoteToView] = useState<Note | null>(null);
    const [categoryArray, setCategoryArray] = useState<string[]>([]);
    const [NoteInp, setNoteInp] = useState<Note>({ id: null, title: "", content: "", category: "", url: "", access: null });
    const [publicAccess, setPublicAccess] = useState<accessObject>({ read: false, append: false, write: false });
    const [accUpdObj, setAccUpdObj] = useState<{ [x: string]: boolean; }>({});
    const [agentsToUpd, setAgentsToUpd] = useState<{ [x: string]: AccessModes; }>({});
    const [noteUpdInProgress, setNoteUpdInProgress] = useState<boolean>(false);
    const [noteModalState, setNoteModalState] = useState<boolean>(false);

    return (
        <div className="container-fluid pad h-100 w-100 d-flex justify-content-center" style={{ "backgroundColor": "#F8F8F8" }}>
            <div id="setWidth" style={{ "backgroundColor": "#fff" }}
                className="h-100 w-100  adjust-me-based-on-size  d-flex justify-content-center align-items-center p-0">
                <NotesList
                    refetchNotes={refetchNotes}
                    setNoteModalState={setNoteModalState}
                    noteUpdInProgress={noteUpdInProgress}
                    podType={podType}
                    prefFileLocation={prefFileLocation}
                    publicTypeIndexUrl={publicTypeIndexUrl}
                    storagePref={storagePref}
                    notesFetched={notesFetched}
                    setNotesFetched={setNotesFetched}
                    notesArray={notesArray}
                    setNotesArray={setNotesArray}
                    setCreatorStatus={setCreatorStatus}
                    newEntryCr={newEntryCr}
                    setNewEntryCr={setNewEntryCr}
                    setNoteToView={setNoteToView}
                    setViewerStatus={setViewerStatus}
                    setIsEdit={setIsEdit}
                    categoryArray={categoryArray}
                    setCategoryArray={setCategoryArray}
                />
            </div>
            {(viewerStatus || creatorStatus) &&
                <Modal id="viewerModal" show={noteModalState} style={{ "height": "90vh" }}
                    size="lg"
                    onHide={() => { setNoteModalState(false) }}>
                    <Modal.Header closeButton>
                        {creatorStatus ? "Create a note" : "Edit a note"}
                    </Modal.Header>
                    <Modal.Body id="viewerModal">
                        <NoteCreator
                            contactsArr={contactsArr}
                            setContactsArr={setContactsArr}
                            contactsFetched={contactsFetched}
                            contactsFdrStatus={contactsFdrStatus}
                            setContactsFdrStatus={setContactsFdrStatus}
                            noteUpdInProgress={noteUpdInProgress}
                            setNoteUpdInProgress={setNoteUpdInProgress}
                            publicTypeIndexUrl={publicTypeIndexUrl}
                            podType={podType}
                            prefFileLocation={prefFileLocation}
                            defFolder={defFolder}
                            storagePref={storagePref}
                            notesArray={notesArray}
                            setNotesArray={setNotesArray}
                            agentsToUpd={agentsToUpd}
                            setAgentsToUpd={setAgentsToUpd}
                            accUpdObj={accUpdObj}
                            setAccUpdObj={setAccUpdObj}
                            publicAccess={publicAccess}
                            setPublicAccess={setPublicAccess}
                            newEntryCr={newEntryCr}
                            setNewEntryCr={setNewEntryCr}
                            noteToView={noteToView}
                            viewerStatus={viewerStatus}
                            setViewerStatus={setViewerStatus}
                            isEdit={isEdit}
                            setIsEdit={setIsEdit}
                            creatorStatus={creatorStatus}
                            setCreatorStatus={setCreatorStatus}
                            categoryArray={categoryArray}
                            NoteInp={NoteInp}
                            setNoteInp={setNoteInp}
                        />
                    </Modal.Body>
                </Modal>
            }
        </div>
    );
}

export default NotesRender;