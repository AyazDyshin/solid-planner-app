import { useSession } from '@inrupt/solid-ui-react';
import React from 'react'
import { Modal, Button, Spinner } from 'react-bootstrap';
import { Habit, Note } from '../services/types';
import { deleteEntry } from '../services/SolidPod';

interface Props {
    deleteModalState: boolean;
    setDeleteModalState: React.Dispatch<React.SetStateAction<boolean>>;
    urlToDelete: string | null;
    entryType: string;
    storagePref: string;
    publicTypeIndexUrl: string;
    progressCheck: boolean;
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    setUrlToDelete: React.Dispatch<React.SetStateAction<string | null>>;
    notesArray?: Note[];
    setNotesArray?: React.Dispatch<React.SetStateAction<Note[]>>;
    habitsArray?: Habit[];
    setHabitsArray?: React.Dispatch<React.SetStateAction<Habit[]>>;
}

const DeleteModal = ({ deleteModalState, setDeleteModalState, urlToDelete, setUrlToDelete, entryType, storagePref, setNewEntryCr,
    publicTypeIndexUrl, setNotesArray, newEntryCr, setViewerStatus, setCreatorStatus, notesArray, progressCheck,
    habitsArray, setHabitsArray
}: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error(`Error, couldn't get user's WebId`);
    }

    const handleClose = () => {
        setDeleteModalState(false);
    }

    const handleDelete = async () => {
        setDeleteModalState(false);
        if (notesArray && setNotesArray) {
            const updArr = notesArray.filter((note) => note.url !== urlToDelete);
            setNotesArray(updArr);
        }
        if (habitsArray && setHabitsArray) {
            const updArr = habitsArray.filter((habit) => habit.url !== urlToDelete);
            setHabitsArray(updArr);
        }
        newEntryCr ? setNewEntryCr(false) : setNewEntryCr(true);
        setViewerStatus(false);
        setCreatorStatus(false);
        setUrlToDelete(null);
        if (!urlToDelete) {
            throw new Error("item you are trying to delete doesn't have a url");
        }
        await deleteEntry(webId, fetch, urlToDelete, entryType, storagePref, publicTypeIndexUrl);
    }
    
    return (
        <Modal show={deleteModalState} onHide={handleClose}>
            {progressCheck && <div className="h-100 d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>}
            {
                !progressCheck && <div>
                    <Modal.Header closeButton>
                        <Modal.Title>Are you sure you want to delete this {entryType}?</Modal.Title>
                    </Modal.Header>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Go back
                        </Button>
                        <Button className="confirm-delete" variant="danger" onClick={handleDelete}>
                            Delete
                        </Button>
                    </Modal.Footer>
                </div>
            }
        </Modal>
    )
}

export default DeleteModal