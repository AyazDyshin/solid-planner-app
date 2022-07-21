import React, { useState } from "react";
import { Badge, Container, Nav, Navbar } from "react-bootstrap";
import { Note } from "../../services/types";
import { MdOutlineArrowBackIosNew } from 'react-icons/md';

interface Props {
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    notesArray: (Note | null)[];
    setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setContactModalState: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Renders a list of notes of selected contacts
 *
 * @category Contacts components
 */
const ViewNotes = ({ setOtherWebId, notesArray, setNoteToView, setViewerStatus, setIsLoading, setContactModalState
}: Props) => {
    const [activeNote, setActiveNote] = useState<number | null>(null);

    return (
        <div className="w-100 h-100">
            <div className="d-flex">
                <Navbar expand="lg" bg="warning" variant="light" className="w-100">
                    <Container>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link onClick={() => {
                                    setIsLoading(true);
                                    setViewerStatus(false);
                                    setNoteToView(null);
                                    setOtherWebId(null);
                                }}><MdOutlineArrowBackIosNew /> Go Back</Nav.Link>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>
            <div className="list-group w-100 h-80">
                {
                    notesArray.map((note, index) => {
                        if (note) {
                            return <a
                                key={`${note.id}${Date.now() + index + Math.floor(Math.random() * 1000)}`}
                                className={`list-group-item px-1 list-group-item-action 
                                ${activeNote === note.id ? 'active' : ''}`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveNote(note.id);
                                    setNoteToView(note);
                                    setViewerStatus(true);
                                    setContactModalState(true)
                                }}
                            >
                                {note.category && <Badge pill bg="primary" className="me-1">{note.category}</Badge>}
                                {!note.category && <Badge pill bg="secondary" className="me-1">no category</Badge>}
                                {note.title}
                            </a>
                        }
                    })
                }
            </div>
        </div>
    )
}

export default ViewNotes;