import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { setPubAccess, shareWith } from "../services/access";
import { extractCategories, filterByAccess, filterByCategory } from "../services/helpers";
import {
    fetchAllEntries, recordDefaultFolder, thingToNote, saveNote,
    editNote, fetchContacts, checkContacts
} from "../services/SolidPod";
import NotesList from "./NotesList";
import { accessObject, Note } from "./types";

interface Props {
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    active: string;
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    noteToView: Note | null;
    setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    categoryArray: string[];
    setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
    doNoteSave: boolean;
    setDoNoteSave: React.Dispatch<React.SetStateAction<boolean>>;
    NoteInp: Note;
    setNoteInp: React.Dispatch<React.SetStateAction<Note>>;
    arrOfChanges: string[];
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
    notesArray: Note[];
    setNotesArray: React.Dispatch<React.SetStateAction<Note[]>>;
    isLoadingContents: boolean;
    setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
    publicAccess: accessObject;
    accUpdObj: {
        [x: string]: boolean;
    };
    setAccUpdObj: React.Dispatch<React.SetStateAction<{
        [x: string]: boolean;
    }>>;
    agentsToUpd: {
        [x: string]: AccessModes;
    };
    setAgentsToUpd: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
    notesFetched: boolean;
    setNotesFetched: React.Dispatch<React.SetStateAction<boolean>>;
    storagePref: string;
    publicTypeIndexUrl: string;
    prefFileLocation: string;
    podType: string;
}

const ContentsList = ({ creatorStatus, setCreatorStatus, active, newEntryCr, setNewEntryCr, storagePref,
    noteToView, setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, categoryArray, setCategoryArray, doNoteSave,
    setDoNoteSave, NoteInp, setNoteInp, arrOfChanges, setArrOfChanges, agentsToUpd, setAgentsToUpd, notesArray, setNotesArray,
    isLoadingContents, setIsLoadingContents, publicAccess, accUpdObj, setAccUpdObj, notesFetched, setNotesFetched,
    publicTypeIndexUrl, prefFileLocation, podType
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
                <NotesList
                    publicTypeIndexUrl={publicTypeIndexUrl}
                    storagePref={storagePref}
                    newEntryCr={newEntryCr}
                    setNewEntryCr={setNewEntryCr}
                    notesToShow={notesToShow}
                    setNotesToShow={setNotesToShow}
                    notesArray={notesArray}
                    setNotesArray={setNotesArray}
                    noteToView={noteToView}
                    setNoteToView={setNoteToView}
                    viewerStatus={viewerStatus}
                    setViewerStatus={setViewerStatus}
                    setCreatorStatus={setCreatorStatus}
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                    categoryArray={categoryArray}
                    setCategoryArray={setCategoryArray}
                    setCurrentCategory={setCurrentCategory}
                    currentCategory={currentCategory}
                    currentAccess={currentAccess}
                    setCurrentAccess={setCurrentAccess}
                />
            )
        }

    }
}

export default ContentsList;