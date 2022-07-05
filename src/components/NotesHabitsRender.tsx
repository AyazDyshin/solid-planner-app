import { Thing } from "@inrupt/solid-client";
import { useState } from "react";
import "../styles.css";
import { accessObject, Note } from "./types";
import ContentsList from "./ContentsList";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import NoteCreator from "./NoteCreator";
interface Props {
    active: string;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    notesArray: Note[];
    setNotesArray: React.Dispatch<React.SetStateAction<Note[]>>;
    isLoadingContents: boolean;
    setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
    notesFetched: boolean;
    setNotesFetched: React.Dispatch<React.SetStateAction<boolean>>;
    storagePref: string;
    defFolder: string | null;
    prefFileLocation: string;
    podType: string;
    publicTypeIndexUrl: string;
}
// Component that is responsible for rendering content of notes and habits tab
// splits the content in two halves, left half: "FolderPickerOrContent"
// right half: "CreatorToRender"
// "newEntryCr" and "setNewEntryCr" are indicating if a new entry was created
// this is needed to update the left side view, ie list of entries existing in the user's pod
// "creatorStatus" and "setCreatorStatus" are hooks to monitor if create button was pressed,
// this is needed to render the respective creator component
const NotesHabitsRender = ({ active, viewerStatus, setViewerStatus, creatorStatus, setCreatorStatus, isEdit, storagePref, defFolder,
    setIsEdit, notesArray, setNotesArray, isLoadingContents, setIsLoadingContents, notesFetched, setNotesFetched, podType,
    prefFileLocation, publicTypeIndexUrl }: Props) => {
    const [newEntryCr, setNewEntryCr] = useState<boolean>(false);
    const [noteToView, setNoteToView] = useState<Note | null>(null);
    const [categoryArray, setCategoryArray] = useState<string[]>([]);
    const [doNoteSave, setDoNoteSave] = useState<boolean>(false);
    const [NoteInp, setNoteInp] = useState<Note>({ id: null, title: "", content: "", category: "", url: "", access: null });
    const [arrOfChanges, setArrOfChanges] = useState<string[]>([]);
    const [publicAccess, setPublicAccess] = useState<accessObject>({ read: false, append: false, write: false });
    const [accUpdObj, setAccUpdObj] = useState<{ [x: string]: boolean; }>({});
    const [agentsToUpd, setAgentsToUpd] = useState<{ [x: string]: AccessModes; }>({});

    return (
        <div className="container-fluid pad">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center p-0">
                    <ContentsList
                        podType={podType}
                        prefFileLocation={prefFileLocation}
                        publicTypeIndexUrl={publicTypeIndexUrl}
                        storagePref={storagePref}
                        notesFetched={notesFetched}
                        setNotesFetched={setNotesFetched}
                        agentsToUpd={agentsToUpd}
                        setAgentsToUpd={setAgentsToUpd}
                        accUpdObj={accUpdObj}
                        setAccUpdObj={setAccUpdObj}
                        publicAccess={publicAccess}
                        isLoadingContents={isLoadingContents}
                        setIsLoadingContents={setIsLoadingContents}
                        notesArray={notesArray}
                        setNotesArray={setNotesArray}
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

                    {(viewerStatus || creatorStatus) && <NoteCreator
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
                        setNoteToView={setNoteToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                        creatorStatus={creatorStatus}
                        setCreatorStatus={setCreatorStatus}
                        categoryArray={categoryArray}
                        setCategoryArray={setCategoryArray}
                        doNoteSave={doNoteSave}
                        setDoNoteSave={setDoNoteSave}
                        NoteInp={NoteInp}
                        setNoteInp={setNoteInp}
                        arrOfChanges={arrOfChanges}
                        setArrOfChanges={setArrOfChanges}
                    />
                    }
                </div>
            </div>
        </div>
    );
}

export default NotesHabitsRender;