import { Thing } from "@inrupt/solid-client";
import { WebsocketNotification } from "@inrupt/solid-client-notifications";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { setPubAccess, shareWith } from "../services/access";
import {
    fetchAllEntries, recordDefaultFolder, thingToNote, saveNote,
    editNote, fetchContacts, checkContacts
} from "../services/SolidPod";
import ContactsList from "./ContactsList";
import NoContacts from "./NoContacts";
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
    notesArray: (Note | null)[];
    setNotesArray: React.Dispatch<React.SetStateAction<(Note | null)[]>>;
    isLoadingContents: boolean;
    setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
    publicAccess: accessObject;
    setPublicAccess: React.Dispatch<React.SetStateAction<accessObject>>;
    contactsList: {
        [x: string]: AccessModes;
    };
    setContactsList: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
    sharedList: Record<string, AccessModes>;
    setSharedList: React.Dispatch<React.SetStateAction<Record<string, AccessModes>>>;
    fullContacts: {
        [x: string]: string | null;
    };
    setFullContacts: React.Dispatch<React.SetStateAction<{
        [x: string]: string | null;
    }>>;
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
}

const ContentsList = ({ creatorStatus, setCreatorStatus, active, newEntryCr, setNewEntryCr,
    noteToView, setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, categoryArray, setCategoryArray, doNoteSave,
    setDoNoteSave, NoteInp, setNoteInp, arrOfChanges, setArrOfChanges, agentsToUpd, setAgentsToUpd, notesArray, setNotesArray, isLoadingContents, setIsLoadingContents,
    publicAccess, setPublicAccess, contactsList, setContactsList, sharedList, setSharedList,
    fullContacts, setFullContacts, accUpdObj, setAccUpdObj
}: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error("error when trying to get webId");
    }
    const [currentCategory, setCurrentCategory] = useState<string | null>(null);
    const [currentAccess, setCurrentAccess] = useState<string | null>(null);

    useEffect(() => {
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
        const fetchNotes = async (otherId?: string) => {
            await perfSave();
            let ret = await fetchAllEntries(webId, fetch, "note",
                ((currentCategory) ? currentCategory : undefined), ((currentAccess) ? currentAccess : undefined));
            //handle
            const [updNotesArray, updCategoriesArray] = ret!;
            let transformedArr = await Promise.all(updNotesArray.map(async (thing) => {
                return await thingToNote(thing, webId, fetch);
            }));
            // add fetch all habits here
            setNotesArray(transformedArr.filter((item) => item !== null));

            setCategoryArray(updCategoriesArray);
            setDoNoteSave(false);
            setIsLoadingContents(false);

        }
        if (active === "notes") {
            setIsLoadingContents(true);
            fetchNotes();
        }
    }, [newEntryCr, currentCategory, currentAccess, active]);

    if (isLoadingContents) {
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    }
    else {
        if (active === "notes") {
            if (notesArray.length === 0) {
                return (
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">You don't have any {active} yet!</h5>
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
                        isLoadingContents={isLoadingContents}
                        setIsLoadingContents={setIsLoadingContents}
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
        else {
            return (<div>Error</div>);
        }
    }
}

export default ContentsList;