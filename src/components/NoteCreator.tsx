import { Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { InputGroup, FormControl, Button, ButtonGroup } from "react-bootstrap";
import { deleteNote, saveNote, thingToNote } from "../services/SolidPod";
import { Note } from "./types";

interface Props {
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    thingToView: Thing | null;
    setThingToView: React.Dispatch<React.SetStateAction<Thing | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
//component of creation and saving a note the user's pod
const NoteCreator = ({ newEntryCr, setNewEntryCr, thingToView,
    setThingToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, setCreatorStatus }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [NoteInp, setNoteInp] = useState<Note>({ id: null, title: "", content: "" });

    useEffect(() => {
        if (viewerStatus) {
            // handle 
            setNoteInp(thingToNote(thingToView!));
        }
        else {
            setNoteInp({ id: null, title: "", content: "" });
            setIsEdit(true);
        }
    }, [viewerStatus, thingToView]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNoteInp(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
    };

    const handleSave = () => {
        saveNote(webId ?? "", fetch, NoteInp);
        setNoteInp({ id: null, title: "", content: "" });
        setNewEntryCr(true);
        setIsEdit(false);
        setViewerStatus(false);
        setCreatorStatus(false);
    };

    const handleEdit = () => {
        isEdit ? setIsEdit(false) : setIsEdit(true);
    }

    const handleDelete = () => {
        deleteNote(webId ?? "", fetch, thingToView!);
        setNewEntryCr(true);
        setIsEdit(false);
        setViewerStatus(false);
        setCreatorStatus(false);
    }

    return (
        <div>
            <div className="h-100">
                <InputGroup className="mb-2 mt-2">
                    <InputGroup.Text id="basic-addon1">Title:</InputGroup.Text>
                    <FormControl
                        name="title"
                        aria-label="title"
                        value={NoteInp.title}
                        {...(!isEdit && { disabled: true })}
                        onChange={handleChange} />
                    <ButtonGroup aria-label="Basic example">
                        <Button onClick={handleSave}>save</Button>
                        {viewerStatus && <Button onClick={handleEdit}>edit</Button>}
                        {viewerStatus && <Button onClick={handleDelete}>delete</Button>}
                    </ButtonGroup>
                </InputGroup>
                <FormControl {...(!isEdit && { disabled: true })} as="textarea" aria-label="textarea" style={{ 'resize': 'none', 'height': '91%' }}
                    name="content"
                    value={NoteInp.content}
                    onChange={handleChange}
                />
            </div>
        </div>
    )
}

export default NoteCreator;

