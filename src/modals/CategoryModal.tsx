import { useSession } from "@inrupt/solid-ui-react";
import { useState } from "react";
import { Modal, Button, Form, FormControl, InputGroup } from "react-bootstrap";
import { Note } from "../components/types";
import { modifyWebId } from "../services/SolidPod";

interface Props {
    categoryModalState: boolean;
    setCategoryModalState: React.Dispatch<React.SetStateAction<boolean>>;
    setNoteInp: React.Dispatch<React.SetStateAction<Note>>;
    noteInp: Note;
    viewerStatus: boolean;
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
}
//a popup window to prompt user to pick a folder
const CategoryModal = ({ categoryModalState, setCategoryModalState, setNoteInp, noteInp, viewerStatus, setArrOfChanges }: Props) => {
    const { session } = useSession();
    const { webId } = session.info;
    const [input, setInput] = useState<string>("");
    const handleSave = () => {
        if (viewerStatus) setArrOfChanges((prevState) => ([...prevState, "category"]));
        setNoteInp({ ...noteInp, category: input.trim()});
        setCategoryModalState(false);
    }
    return (
        <Modal show={categoryModalState}>
            <Modal.Header closeButton onClick={() => { setCategoryModalState(false) }}>
                <Modal.Title>Enter Category Name:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <FormControl className="mt-1" aria-describedby="basic-addon3" value={input} onChange={e => setInput(e.target.value)} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" value={input} onClick={() => setCategoryModalState(false)}>Go Back</Button>
                <Button variant="primary" onClick={handleSave}>save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CategoryModal;