import { Thing, ThingPersisted } from "@inrupt/solid-client";
import { WebsocketNotification } from "@inrupt/solid-client-notifications";
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
// need to upgrade for habits case
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
}

const ContentsList = ({ creatorStatus, setCreatorStatus, active, newEntryCr, setNewEntryCr,
    noteToView, setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, categoryArray, setCategoryArray, doNoteSave,
    setDoNoteSave, NoteInp, setNoteInp, arrOfChanges, setArrOfChanges, agentsToUpd, setAgentsToUpd, notesArray, setNotesArray,
    isLoadingContents, setIsLoadingContents, publicAccess, accUpdObj, setAccUpdObj, notesFetched, setNotesFetched
}: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error("error when trying to get webId");
    }
    const [currentCategory, setCurrentCategory] = useState<string | null>(null);
    const [currentAccess, setCurrentAccess] = useState<string | null>(null);
    const [notesToShow, setNotesToShow] = useState<Note[]>([]);
    const [refetch, setRefetch] = useState<boolean>(true);
    const [isLoading,setIsLoading] = useState<boolean>(true);
    useEffect(() => {
        setIsLoading(true);
        const perfSave = async () => {
            if (doNoteSave || arrOfChanges.length !== 0) {
                if (doNoteSave) {
                    await saveNote(webId, fetch, NoteInp);
                }
                else if (arrOfChanges.length !== 0) {
                    await editNote(webId, fetch, NoteInp, arrOfChanges);
                }
                if (Object.keys(accUpdObj).length !== 0) {
                    if (accUpdObj["public"]) {
                        await setPubAccess(webId, publicAccess, noteToView!.url, fetch);
                    }
                    else if (accUpdObj["agent"]) {

                        for (let item in agentsToUpd) {
                            await shareWith(webId, noteToView!.url, fetch, agentsToUpd[item], item);

                        }
                    }
                }
                setCreatorStatus(false);
                setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
                setIsEdit(false);
                setArrOfChanges([]);
                setDoNoteSave(false);
            }
        }
        const fetchNotes = async () => {
            let filteredNotes: Note[]
            if (!notesFetched) {
                let noteArr = await fetchAllEntries(webId, fetch, "note");
                let transformedArr = await Promise.all(noteArr.map(async (thing) => {
                    return await thingToNote(thing, webId, fetch);
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
        // const fetchNotes = async (otherId?: string) => {
        //     await perfSave();
        //     let ret: never[] | [(ThingPersisted | null)[], string[]] = [];
        //     let transformedArr = [];
        //     if (refetch) {
        //         ret = await fetchAllEntries(webId, fetch, "note",
        //             ((currentCategory) ? currentCategory : undefined), ((currentAccess) ? currentAccess : undefined));
        //         setRefetch(false);
        //         const [updNotesArray, updCategoriesArray] = ret!;
        //         transformedArr = await Promise.all(updNotesArray.map(async (thing) => {
        //             return await thingToNote(thing, webId, fetch);
        //         }));
        //         transformedArr = transformedArr.filter((item) => item !== null);
        //         setAllNotes(transformedArr as Note[]);
        //     }
        //     else {
        //         transformedArr = allNotes;
        //     }
        //     //handle

        //     if (currentAccess || currentCategory) {
        //         if (currentCategory) {
        //             transformedArr
        //         }
        //     }

        //     // add fetch all habits here
        //     setNotesArray(transformedArr);

        //     setCategoryArray(updCategoriesArray);
        //     setDoNoteSave(false);
        //     setIsLoadingContents(false);

        // }
        // if (active === "notes") {
        //     setIsLoadingContents(true);
        //     fetchNotes();
        // }
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
        if ((notesToShow.length === 0) &&!(currentAccess || currentCategory)){

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