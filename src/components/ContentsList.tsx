import { Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
//import { Note } from "rdf-namespaces/dist/as";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
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
    otherWebId: string | null;
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    notesArray: (Note | null)[];
    setNotesArray: React.Dispatch<React.SetStateAction<(Note | null)[]>>;
    contactsArr: (string | null)[][];
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    isLoadingContents: boolean;
    setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContentsList = ({ creatorStatus, setCreatorStatus, active, newEntryCr, setNewEntryCr,
    noteToView, setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, categoryArray, setCategoryArray, doNoteSave,
    setDoNoteSave, NoteInp, setNoteInp, arrOfChanges, setArrOfChanges,
    otherWebId, setOtherWebId, notesArray, setNotesArray, contactsArr, setContactsArr, isLoadingContents, setIsLoadingContents }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error("error when trying to get webId");
    }
    const [habitsArray, setHabitsArray] = useState<Thing[]>([]);
    const [currentCategory, setCurrentCategory] = useState<string | null>(null);
    const [currentAccess, setCurrentAccess] = useState<string | null>(null);
    const [contactsFdrStatus, setContactsFdrStatus] = useState<boolean>(false);
    const [otherStatus, setOtherStatus] = useState<boolean>(false);

    useEffect(() => {
        console.log("we are in use effect");
        console.log("active:");
        console.log(active);
        console.log("otherWebId:");
        console.log(otherWebId);
        console.log("notesArray");
        console.log(notesArray);
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

            let currentWebId = otherId ? otherId : webId;
            // const defFolderUpd = await getDefaultFolder(currentWebId, fetch);
            // if (!defFolderUpd) {
            //     let heh = await recordDefaultFolder(currentWebId, fetch);
            // }
            await perfSave();
            let ret = await fetchAllNotes(currentWebId, fetch,
                ((currentCategory) ? currentCategory : undefined), ((currentAccess) ? currentAccess : undefined), ((otherId) ? true : undefined));
            const [updNotesArray, updCategoriesArray] = ret!;
            let transformedArr = await Promise.all(updNotesArray.map(async (thing) => {
                return await thingToNote(thing, currentWebId, fetch);
            }));
            // add fetch all habits here
            setNotesArray(transformedArr.filter((item) => item !== null));
            setCategoryArray(updCategoriesArray);
            setDoNoteSave(false);
            setIsLoadingContents(false);

        }

        const getContacts = async () => {
            setIsLoadingContents(true);
            let contactsStatus = await checkContacts(webId, fetch);
            setContactsFdrStatus(contactsStatus);
            if (contactsStatus) {
                const namesAndIds = await fetchContacts(webId, fetch);
                setContactsArr(namesAndIds);
                const namesArr = namesAndIds.map((pair) => pair[0] ? pair[0] : pair[1]);

            }
            setIsLoadingContents(false);
        }
        if (active === "notes") {
            setIsLoadingContents(true);
            fetchNotes();
        }
        else if (active === "contacts") {
            setIsLoadingContents(true);
           // setNotesArray([]);
            if (!otherWebId) {
                getContacts();
            }
            else {
                fetchNotes(otherWebId);
            }
        }
        
    }, [newEntryCr, currentCategory, currentAccess, active, otherWebId]);

    if (isLoadingContents) {    
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    }
    else {
        if (active === "notes" || (active === "contacts" && otherWebId)) {
            if (notesArray.length === 0) {
                if (active === "contacts") {
                    return (
                        <div>

                            <div className="card text-center">
                                <div className="card-body">
                                    <h5 className="card-title">Oooops...</h5>
                                    <p className="card-text">Seems like there is no content that you can view</p>
                                    <Button onClick={() => {
                                        setOtherWebId(null);
                                        setIsLoadingContents(true);
                                    }}>Go Back</Button>
                                </div>
                            </div>
                        </div>
                    );
                }
                else {
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
            }
            else {
                return (
                    <NotesList
                        isLoadingContents={isLoadingContents}
                        setIsLoadingContents={setIsLoadingContents}
                        otherWebId={otherWebId}
                        setOtherWebId={setOtherWebId}
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
                return (
                    <ContactsList
                        notesArray={notesArray}
                        setNotesArray={setNotesArray}
                        isLoadingContents={isLoadingContents}
                        setIsLoadingContents={setIsLoadingContents}
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