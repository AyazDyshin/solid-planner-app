import { Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { fetchAllNotes } from "../services/SolidPod";

interface Props {
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
const NotesList = ( {creatorStatus, setCreatorStatus} : Props ) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notesArray, setNotesArray] = useState<Thing[]>([]);
    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            const updNotesArray = await fetchAllNotes(webId ?? "", fetch);
            setNotesArray(updNotesArray);
            setIsLoading(false);
        }
        fetchData();
    }, []);
    if (isLoading) {
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    }
    else {
        if (notesArray.length === 0) {
            return (
                <div className="card text-center">
                    <div className="card-body">
                        <h5 className="card-title">You don't have any notes yet!</h5>
                        <p className="card-text">Let's fix this</p>
                        <a className="btn btn-primary" onClick={() => {setCreatorStatus(true)}}>create a note</a>
                    </div>
                </div>
            );
        }
        else {
            return (
                <div>this is the case for when notes actually exist!</div>
            )
        }
    }
}

export default NotesList;