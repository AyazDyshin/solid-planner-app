import React from 'react'
import { FormControl, InputGroup } from 'react-bootstrap';
import { Note } from './types';
interface Props {
    noteToView: Note | null;
    setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
}

const NoteViewer = ({ noteToView, setNoteToView }: Props) => {
    if (!noteToView) {
        throw new Error("Error, note to view wasn't provided");
    }
    return (
        <div>
            <InputGroup className="mb-2 mt-2">
                <InputGroup.Text id="basic-addon1">Title:</InputGroup.Text>
                <FormControl
                    name="title"
                    aria-label="title"
                    value={noteToView.title === null ? "" : noteToView.title}
                    disabled={true}
                />
            </InputGroup>
            <FormControl disabled={true} as="textarea" aria-label="textarea" style={{ 'resize': 'none', 'height': '91%' }}
                name="content"
                value={noteToView.content === null ? "" : noteToView.content}

            />

        </div>
    )
}

export default NoteViewer;