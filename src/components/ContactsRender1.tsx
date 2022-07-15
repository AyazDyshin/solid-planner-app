import { content } from 'rdf-namespaces/dist/as';
import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap';
import ContactsList from './ContactsList';
import NoContacts from './NoContacts';
import NoteViewer from './NoteViewer';
import { Note } from './types';
import ViewNotes from './ViewNotes';
interface Props {
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    contactsArr: (string | null)[][];
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    contactsFdrStatus: boolean;
    setContactsFdrStatus: React.Dispatch<React.SetStateAction<boolean>>;


    notesArray: (Note | null)[];
    setNotesArray: React.Dispatch<React.SetStateAction<(Note | null)[]>>;
    otherWebId: string | null;
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
}
const ContactsRender1 = ({ isLoading, setIsLoading, contactsArr, setContactsArr, notesArray, setNotesArray, otherWebId, setOtherWebId,
    contactsFdrStatus, setContactsFdrStatus
}: Props) => {
    const [noteToView, setNoteToView] = useState<Note | null>(null);
    const [viewerStatus, setViewerStatus] = useState<boolean>(false);
    const [contactModalState, setContactModalState] = useState<boolean>(false);
    let content;
    console.log("this is suk");
    console.log(contactsFdrStatus);
    if (contactsFdrStatus && !otherWebId) {
        return (
            <ContactsList
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                contactsArr={contactsArr}
                setContactsArr={setContactsArr}
                otherWebId={otherWebId}
                setOtherWebId={setOtherWebId}
            />
        )
    }
    else if (notesArray.length !== 0 && contactsFdrStatus && otherWebId) {
        return (
            <ViewNotes
                setContactModalState={setContactModalState}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                viewerStatus={viewerStatus}
                setViewerStatus={setViewerStatus}
                noteToView={noteToView}
                setNoteToView={setNoteToView}
                notesArray={notesArray}
                setNotesArray={setNotesArray}
                otherWebId={otherWebId}
                setOtherWebId={setOtherWebId}
            />
        )
    }

    else if (notesArray.length === 0 && otherWebId && contactsFdrStatus) {
        return (
            <div>
                <div className="card text-center">
                    <div className="card-body">
                        <h5 className="card-title">Oooops...</h5>
                        <p className="card-text">Seems like there is no content that you can view</p>
                        <Button onClick={() => {
                            setIsLoading(true);
                            setOtherWebId(null);
                        }}>Go Back</Button>
                    </div>
                </div>
            </div>
        )
    }
    else if (!contactsFdrStatus) {
        return (
            <NoContacts />
        )
    }
    else {
    return (
        <div>g</div>
    )
}
    // otherWebId && viewerStatus &&
    // <Modal id="viewerModal" show={contactModalState} style={{ "height": "90vh" }}
    //     size="lg"
    //     onHide={() => { setContactModalState(false) }}>
    //     <Modal.Header closeButton>
    //         Note viewer
    //     </Modal.Header>
    //     <Modal.Body id="viewerModal">
    //         <NoteViewer
    //             noteToView={noteToView}
    //             setNoteToView={setNoteToView}
    //         />
    //     </Modal.Body>
    // </Modal>
    //         }
    //     </div >
}

export default ContactsRender1