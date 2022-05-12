import { Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { InputGroup, FormControl, Button } from "react-bootstrap";
import { saveNote, thingToNote } from "../services/SolidPod";
import { Note } from "./types";

interface Props {
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    thingToView: Thing | null;
    setThingToView: React.Dispatch<React.SetStateAction<Thing | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
//component of creation and saving a note the user's pod
const NoteCreator = ({ newEntryCr, setNewEntryCr, thingToView, setThingToView, viewerStatus, setViewerStatus }: Props) => {

    useEffect(() => {
        if (viewerStatus) {
            // handle 
            setNoteInp(thingToNote(thingToView!));
        }
    }, [viewerStatus, thingToView]);

    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [NoteInp, setNoteInp] = useState<Note>({ id: null, title: "", content: "" });
    const [isEdit, setIsEdit] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNoteInp(prevState => ({ ...prevState, [e.target.name]: e.target.value }))
        console.log(NoteInp);
    };

    const handleSave = () => {
        saveNote(webId ?? "", fetch, NoteInp);
        setNoteInp({ id: null, title: "", content: "" });
        setNewEntryCr(true);
        setViewerStatus(false);
    };

    const handleEdit = () => {
        isEdit ? setIsEdit(false) : setIsEdit(true);
    }
    return (
        <div>
            <div className="h-100">
                <InputGroup className="mb-2 mt-2">
                    <InputGroup.Text {...(!isEdit && { disabled: true })} id="basic-addon1">Title:</InputGroup.Text>
                    <FormControl
                        name="title"
                        aria-label="title"
                        value={NoteInp.title}
                        onChange={handleChange} />
                </InputGroup>
                <FormControl {...(!isEdit && { disabled: true })} as="textarea" aria-label="textarea" style={{ 'resize': 'none', 'height': '91%' }}
                    name="content"
                    value={NoteInp.content}
                    onChange={handleChange}
                />
            </div>
            <Button onClick={handleSave}>save</Button>
            {viewerStatus && <Button onClick={handleEdit}>edit</Button>}
            <Button>delete</Button>
        </div>
    )
}

export default NoteCreator;

