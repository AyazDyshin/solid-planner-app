import { Thing } from "@inrupt/solid-client";
import { useState } from "react";
import CreatorToRender from "./CreatorToRender";
import FolderPickerOrContent from "./FolderPickerOrContent";
import "../styles.css";
import { Note } from "./types";
import ContentsList from "./ContentsList";
interface Props {
    active: string;
    otherWebId: string | null;
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    notesArray: (Note | null)[];
    setNotesArray: React.Dispatch<React.SetStateAction<(Note | null)[]>>;
    contactsArr: (string | null)[][];
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    isLoadingContents: boolean;
    setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
}
// Component that is responsible for rendering content of notes and habits tab
// splits the content in two halves, left half: "FolderPickerOrContent"
// right half: "CreatorToRender"
// "newEntryCr" and "setNewEntryCr" are indicating if a new entry was created
// this is needed to update the left side view, ie list of entries existing in the user's pod
// "creatorStatus" and "setCreatorStatus" are hooks to monitor if create button was pressed,
// this is needed to render the respective creator component
const NotesHabitsRender = ({ active, otherWebId, setOtherWebId,
    viewerStatus, setViewerStatus, creatorStatus, setCreatorStatus, isEdit,
    setIsEdit, notesArray, setNotesArray, contactsArr, setContactsArr, isLoadingContents, setIsLoadingContents }: Props) => {

    const [newEntryCr, setNewEntryCr] = useState<boolean>(false);
    const [noteToView, setNoteToView] = useState<Note | null>(null);
    const [categoryArray, setCategoryArray] = useState<string[]>([]);
    const [doNoteSave, setDoNoteSave] = useState<boolean>(false);
    const [NoteInp, setNoteInp] = useState<Note>({ id: null, title: "", content: "", category: "", url: "", access: null });
    const [arrOfChanges, setArrOfChanges] = useState<string[]>([]);

    return (
        <div className="container-fluid pad">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center p-0">
                    <ContentsList
                        isLoadingContents={isLoadingContents}
                        setIsLoadingContents={setIsLoadingContents}
                        contactsArr={contactsArr}
                        setContactsArr={setContactsArr}
                        notesArray={notesArray}
                        setNotesArray={setNotesArray}
                        otherWebId={otherWebId}
                        setOtherWebId={setOtherWebId}
                        active={active}
                        creatorStatus={creatorStatus}
                        setCreatorStatus={setCreatorStatus}
                        newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr}
                        noteToView={noteToView}
                        setNoteToView={setNoteToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                        categoryArray={categoryArray}
                        setCategoryArray={setCategoryArray}
                        doNoteSave={doNoteSave}
                        setDoNoteSave={setDoNoteSave}
                        NoteInp={NoteInp}
                        setNoteInp={setNoteInp}
                        arrOfChanges={arrOfChanges}
                        setArrOfChanges={setArrOfChanges}
                    />
                </div>
                <div className="col h-100 border border-5">
                    <CreatorToRender
                        otherWebId={otherWebId}
                        setOtherWebId={setOtherWebId}
                        active={active}
                        creatorStatus={creatorStatus}
                        newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr}
                        noteToView={noteToView}
                        setNoteToView={setNoteToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                        setCreatorStatus={setCreatorStatus}
                        categoryArray={categoryArray}
                        setCategoryArray={setCategoryArray}
                        doNoteSave={doNoteSave}
                        setDoNoteSave={setDoNoteSave}
                        NoteInp={NoteInp}
                        setNoteInp={setNoteInp}
                        arrOfChanges={arrOfChanges}
                        setArrOfChanges={setArrOfChanges} />

                </div>
            </div>
        </div>
    );
}

export default NotesHabitsRender;