import { getStringNoLocale, Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { fetchAllNotes } from "../services/SolidPod";
import NotesList from "./NotesList";
// need to upgrade for habits case
interface Props {
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    active: string;
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    thingToView: Thing | null;
    setThingToView: React.Dispatch<React.SetStateAction<Thing | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
const ContentsList = ({ creatorStatus, setCreatorStatus, active, newEntryCr, setNewEntryCr, 
    thingToView, setThingToView, viewerStatus, setViewerStatus }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notesArray, setNotesArray] = useState<Thing[]>([]);
    const [habitsArray, setHabitsArray] = useState<Thing[]>([]);

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            const updNotesArray = await fetchAllNotes(webId ?? "", fetch);
            // add fetch all habits here
            setNotesArray(updNotesArray);
            setIsLoading(false);
            setNewEntryCr(false);
        }
        fetchData();
        if (notesArray.length !== 0) {
            console.log("here");
        }

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
                                //in case if note viewer was open and edit is active,
                                // the edited content may not be saved, needs handling
                                // might actually be redundant as this is the case when
                                // notes don't exist => nothing to view
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
                        thingToView={thingToView}
                        setThingToView={setThingToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        setCreatorStatus={setCreatorStatus} />
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