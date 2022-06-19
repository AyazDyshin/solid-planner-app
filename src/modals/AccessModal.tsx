import { useSession } from "@inrupt/solid-ui-react";
import { useState } from "react";
import { Modal, Button, Form, FormControl, InputGroup, DropdownButton, Dropdown } from "react-bootstrap";
import { Note } from "../components/types";
import { modifyWebId } from "../services/SolidPod";

interface Props {
    accessModalState: boolean;
    setAccessModalState: React.Dispatch<React.SetStateAction<boolean>>;
    setNoteInp: React.Dispatch<React.SetStateAction<Note>>;
    noteInp: Note;
    viewerStatus: boolean;
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
}
//a popup window to prompt user to set access type
const AccessModal = ({ accessModalState, setAccessModalState, setNoteInp,
    noteInp, viewerStatus, setArrOfChanges, }: Props) => {
    const { session } = useSession();
    const { webId } = session.info;
    const [input, setInput] = useState<string>("");
    const handleSave = () => {
        if (noteInp.category !== input.trim()) {
            if (viewerStatus) setArrOfChanges((prevState) => ([...prevState, "category"]));
            setNoteInp({ ...noteInp, category: input.trim() });
        }
        setAccessModalState(false);
    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        console.log("this is checked");
        console.log(checked);
    }
    return (
        <Modal show={accessModalState}>
            <Modal.Header closeButton onClick={() => { setAccessModalState(false) }}>
                <Modal.Title>Set Access:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-check form-switch">
                    <div className="row">
                        <div className="col"></div>
                        <div className="col">Read:</div>
                        <div className="col">Write:</div>
                    </div>
                    <div className="row">
                        <label className="form-check-label col" htmlFor="flexSwitchCheckDefault">Public access:</label>
                        <div className="col">
                            <input className="form-check-input " type="checkbox"
                                role="switch" id="flexSwitchCheckDefault" onChange={handleChange}
                            />
                        </div>
                        <div className="col">
                            <input className="form-check-input " type="checkbox"
                                role="switch" id="flexSwitchCheckDefault" onChange={handleChange}
                            />
                        </div>
                    </div>


                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" value={input} onClick={() => setAccessModalState(false)}>Go Back</Button>
                <Button variant="primary" onClick={handleSave}>save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default AccessModal;
