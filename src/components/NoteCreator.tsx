import { Thing } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { InputGroup, FormControl, Button, ButtonGroup, DropdownButton, Dropdown } from "react-bootstrap";
import CategoryModal from "../modals/CategoryModal";
import { deleteNote, editNote, saveNote, thingToNote } from "../services/SolidPod";
import { Note } from "./types";
import { BsThreeDots } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import "../styles.css";
import AccessModal from "../modals/AccessModal";

interface Props {
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    noteToView: Note | null;
    setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    creatorStatus: boolean;
    categoryArray: string[];
    setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
    doNoteSave: boolean;
    setDoNoteSave: React.Dispatch<React.SetStateAction<boolean>>;
    NoteInp: Note;
    setNoteInp: React.Dispatch<React.SetStateAction<Note>>;
    arrOfChanges: string[];
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
}
//component of creation and saving a note the user's pod
const NoteCreator = ({ newEntryCr, setNewEntryCr, noteToView,
    setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit,
    setCreatorStatus, creatorStatus, categoryArray, setCategoryArray, doNoteSave, setDoNoteSave, NoteInp,
    setNoteInp, arrOfChanges, setArrOfChanges }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [categoryModalState, setCategoryModalState] = useState<boolean>(false);
    const [accessModalState, setAccessModalState] = useState<boolean>(false);

    useEffect(() => {
        if (arrOfChanges.length !== 0) {
            handleSave();
        }
        if (arrOfChanges.length === 0) {
            if (viewerStatus) {
                // handle 
                setNoteInp(noteToView!);
            }
            else {
                setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
                setIsEdit(true);
            }
        }

    }, [viewerStatus, noteToView]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNoteInp(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
        if (!arrOfChanges.includes(e.target.name)) {
            console.log("we changed arr!");
            setArrOfChanges((prevState) => ([...prevState, e.target.name]));
        }

    };

    const handleSave = () => {
        setViewerStatus(false);
        setDoNoteSave(true);
        newEntryCr ? setNewEntryCr(false) : setNewEntryCr(true);
    };

    const handleEdit = () => {
        isEdit ? setIsEdit(false) : setIsEdit(true);
    }

    const handleDelete = async () => {
        await deleteNote(webId ?? "", fetch, NoteInp.id!);
        newEntryCr ? setNewEntryCr(false) : setNewEntryCr(true);
        setIsEdit(false);
        setViewerStatus(false);
        setCreatorStatus(false);
    }

    return (
        <div>
            <InputGroup className="mb-2 mt-2">
                <InputGroup.Text id="basic-addon1">Title:</InputGroup.Text>
                <FormControl
                    name="title"
                    aria-label="title"
                    value={NoteInp.title === null ? "" : NoteInp.title}
                    {...(!isEdit && { disabled: true })}
                    onChange={handleChange} />
                <ButtonGroup>
                    <Button onClick={handleSave}>save</Button>
                    <DropdownButton className="dropNoIcon"
                        variant="outline-secondary"
                        title={<BsThreeDots />}
                        id="input-group-dropdown-1"
                    >
                        {viewerStatus && <Dropdown.Item onClick={handleEdit}><FiEdit /> edit</Dropdown.Item>}
                        {viewerStatus && <Dropdown.Item onClick={handleDelete}>delete</Dropdown.Item>}
                        <Dropdown.Item href="" onClick={() => (setCategoryModalState(true))}>Set Category</Dropdown.Item>
                        <Dropdown.Item href="" onClick={() => (setAccessModalState(true))}>Set Access type</Dropdown.Item>
                    </DropdownButton>
                </ButtonGroup>
            </InputGroup>
            <FormControl {...(!isEdit && { disabled: true })} as="textarea" aria-label="textarea" style={{ 'resize': 'none', 'height': '91%' }}
                name="content"
                value={NoteInp.content === null ? "" : NoteInp.content}
                onChange={handleChange}
            />
            <CategoryModal categoryModalState={categoryModalState}
                setCategoryModalState={setCategoryModalState}
                setNoteInp={setNoteInp}
                noteInp={NoteInp}
                setArrOfChanges={setArrOfChanges}
                viewerStatus={viewerStatus}
                categoryArray={categoryArray}
                setCategoryArray={setCategoryArray}
            />
            <AccessModal
                accessModalState={accessModalState}
                setAccessModalState={setAccessModalState}
                setNoteInp={setNoteInp}
                noteInp={NoteInp}
                setArrOfChanges={setArrOfChanges}
                viewerStatus={viewerStatus}
                noteToView={noteToView}
                setNoteToView={setNoteToView}
            />
        </div>
    )
}

export default NoteCreator;

