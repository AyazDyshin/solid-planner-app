import React, { useState } from "react";
import { Badge, Button } from "react-bootstrap";
import { Note } from "./types";
interface Props {
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    notesArray: (Note | null)[];
    setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setContactModalState: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewNotes = ({ setOtherWebId, notesArray, setNoteToView, setViewerStatus, setIsLoading, setContactModalState
}: Props) => {
    const [activeNote, setActiveNote] = useState<number | null>(null);

    return (
        <div className="w-100 h-100">
            <div className="d-flex">
                <Button onClick={() => {
                    setIsLoading(true);
                    setViewerStatus(false);
                    setNoteToView(null);
                    setOtherWebId(null);
                }}>Go Back</Button>
            </div>
            <div className="list-group w-100 h-100">
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