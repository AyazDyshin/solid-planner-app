import { Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
//import { Note } from "rdf-namespaces/dist/as";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import {
    fetchAllNotes, getDefaultFolder, recordDefaultFolder, thingToNote, saveNote,
    editNote, fetchContacts, checkContacts
} from "../services/SolidPod";
import ContactsList from "./ContactsList";
import NoContacts from "./NoContacts";
import NotesList from "./NotesList";
import { Note } from "./types";
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
}

const ContentsList = ({ creatorStatus, setCreatorStatus, active, newEntryCr, setNewEntryCr,
    noteToView, setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, categoryArray, setCategoryArray, doNoteSave,
    setDoNoteSave, NoteInp, setNoteInp, arrOfChanges, setArrOfChanges }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error("error when trying to get webId");
    }
    const [notesArray, setNotesArray] = useState<(Note | null)[]>([]);
    const [habitsArray, setHabitsArray] = useState<Thing[]>([]);
    const [currentCategory, setCurrentCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentAccess, setCurrentAccess] = useState<string | null>(null);
    const [contactsFdrStatus, setContactsFdrStatus] = useState<boolean>(false);
    const [contactsArr, setContactsArr] = useState<(string | null)[][]>([]);
    const [otherWebId, setOtherWebId] = useState<string | null>(null);

    useEffect(() => {
        console.log("this is other");
        console.log(otherWebId);
        const perfSave = async () => {
            if (doNoteSave || arrOfChanges.length !== 0) {
                if (creatorStatus) {
                    await saveNote(webId, fetch, NoteInp);
                }
                else if (arrOfChanges.length !== 0) {
                    await editNote(webId, fetch, NoteInp, arrOfChanges);
                }
                setCreatorStatus(false);
                setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
                setIsEdit(false);
                setArrOfChanges([]);
                setDoNoteSave(false);
            }
        }
        const fetchNotes = async (otherId?: string) => {
            setIsLoading(true);
            let currentWebId = otherId ? otherId : webId;
            // const defFolderUpd = await getDefaultFolder(currentWebId, fetch);
            // if (!defFolderUpd) {
            //     let heh = await recordDefaultFolder(currentWebId, fetch);
            // }
            await perfSave();
            const [updNotesArray, updCategoriesArray] = await fetchAllNotes(currentWebId, fetch,
                ((currentCategory) ? currentCategory : undefined), ((currentAccess) ? currentAccess : undefined));

            let transformedArr = await Promise.all(updNotesArray.map(async (thing) => {
                return await thingToNote(thing, currentWebId, fetch);
            }));
            console.log("this is notes array:")
            console.log(transformedArr);
            // add fetch all habits here
            setNotesArray(transformedArr);
            setCategoryArray(updCategoriesArray);
            setDoNoteSave(false);
            setIsLoading(false);
        }

        const getContacts = async () => {
            setIsLoading(true);
            let contactsStatus = await checkContacts(webId, fetch);
            console.log("this is frd start");
            console.log(contactsStatus);
            setContactsFdrStatus(contactsStatus);
            if (contactsStatus) {
                const namesAndIds = await fetchContacts(webId, fetch);
                setContactsArr(namesAndIds);
                const namesArr = namesAndIds.map((pair) => pair[0] ? pair[0] : pair[1]);

            }
            setIsLoading(false);
        }
        if (active === "notes") {
            fetchNotes();
        }
        else if (active === "contacts") {
            if (!otherWebId) {
                getContacts();
            }
            else {
                fetchNotes(otherWebId);
            }
        }
    }, [newEntryCr, currentCategory, currentAccess, active, otherWebId]);

    if (isLoading) {
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    }
    else {
        if (active === "notes" || (active === "contacts" && otherWebId)) {
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
                    <NotesList notesArray={notesArray}
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
        // might need to make it else if(active==="habits")
        // fetch of habitsArray is not implemented yet, so it will always fall in the 
        // habitsArray.length === 0 case
        else if (active === "habits") {
            if (habitsArray.length === 0) {
                return (
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">You don't have any {active} yet!</h5>
                            <p className="card-text">Let's fix this</p>
                            <a className="btn btn-primary" onClick={() => { setCreatorStatus(true) }}>create</a>
                        </div>
                    </div>
                )
            }
            else {
                return (
                    <div>Not implemented yet (case for when habits exist)</div>
                )
            }
        }

        else if (active === "contacts") {
            if (contactsFdrStatus) {
                return (<ContactsList
                    contactsArr={contactsArr}
                    setContactsArr={setContactsArr}
                    otherWebId={otherWebId}
                    setOtherWebId={setOtherWebId}
                />);
            }
            else {
                return (<NoContacts />);
            }
        }
        else {
            return (<div>Error</div>);
        }
    }
}

export default ContentsList;