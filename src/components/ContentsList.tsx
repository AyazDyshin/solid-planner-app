import { getStringNoLocale, Thing, ThingPersisted } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
//import { Note } from "rdf-namespaces/dist/as";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { fetchAllNotes, getDefaultFolder, recordDefaultFolder, thingToNote, saveNote, editNote } from "../services/SolidPod";
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

    const [notesArray, setNotesArray] = useState<(Note | null)[]>([]);
    const [habitsArray, setHabitsArray] = useState<Thing[]>([]);
    const [currentCategory, setCurrentCategory] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentAccess, setCurrentAccess] = useState<string | null>(null);
    useEffect(() => {
        const perfSave = async () => {
            if (doNoteSave || arrOfChanges.length !== 0) {
                if (creatorStatus) {
                    await saveNote(webId ?? "", fetch, NoteInp);
                }
                else if (arrOfChanges.length !== 0) {
                    await editNote(webId ?? "", fetch, NoteInp, arrOfChanges);
                }
                setCreatorStatus(false);
                setNoteInp({ id: null, title: "", content: "", category: "", url: "" });
                setIsEdit(false);
                setArrOfChanges([]);
                setDoNoteSave(false);
            }
        }
        const fetchNotes = async () => {
            setIsLoading(true);
            const defFolderUpd = await getDefaultFolder(webId ?? "", fetch);
            if (!defFolderUpd) {
                let heh = await recordDefaultFolder(webId ?? "", fetch);
            }
            await perfSave();
            const [updNotesArray, updCategoriesArray] = await fetchAllNotes(webId ?? "", fetch,
                ((currentCategory) ? currentCategory : undefined), ((currentAccess) ? currentAccess : undefined));

            let transformedArr = updNotesArray.map((thing) => {
                return thingToNote(thing);
            });
            // add fetch all habits here
            setNotesArray(transformedArr);
            setCategoryArray(updCategoriesArray);
            setDoNoteSave(false);
            setIsLoading(false);
        }
        if (active === "notes") {
            fetchNotes();
        }
    }, [newEntryCr, currentCategory, currentAccess]);

    if (isLoading) {
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
        else {
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
    }
}

export default ContentsList;

{/* <Button onClick={() => { setModalState(true) }}>Change Default Folder</Button> */ }