import { getStringNoLocale, Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { fetchAllNotes, thingToNote } from "../services/SolidPod";
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
    setModalState: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContentsList = ({ creatorStatus, setCreatorStatus, active, newEntryCr, setNewEntryCr,
    noteToView, setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, setModalState }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notesArray, setNotesArray] = useState<(Note | null)[]>([]);
    const [habitsArray, setHabitsArray] = useState<Thing[]>([]);

    // this procs twice due to setting newentrycr to false inside
    useEffect(() => {
        console.log(`we are in useEffect value of newEntryCr is: ${newEntryCr}`);
        const fetchData = async () => {

            const updNotesArray = await fetchAllNotes(webId ?? "", fetch);
            let transformedArr = updNotesArray.map((thing) => {
                return thingToNote(thing);
            });
            //console.log(transformedArr);
            // add fetch all habits here
            setNotesArray(transformedArr);
            setIsLoading(false);
        }
        fetchData();
    }, [newEntryCr]);

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
                        setIsEdit={setIsEdit} />
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