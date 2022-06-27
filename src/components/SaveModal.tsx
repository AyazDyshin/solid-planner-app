import { useSession } from "@inrupt/solid-ui-react";
import { useState } from "react";
import { Modal, Button, Form, FormControl, InputGroup } from "react-bootstrap";
import { modifyWebId } from "../services/helpers";

interface Props {
    saveModalState: boolean;
    setSaveModalState: React.Dispatch<React.SetStateAction<boolean>>;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
//a popup window to prompt user to pick a folder
const SaveModal = ({ saveModalState, setSaveModalState, setCreatorStatus, setViewerStatus }: Props) => {
    const { session } = useSession();
    const { webId } = session.info;
    const [input, setInput] = useState<string>("");
    const urlToShow = modifyWebId(webId ?? "Error, no webId");

    return (
        <Modal show={saveModalState}>
            <Modal.Header closeButton onClick={() => { setSaveModalState(false) }}>
                <Modal.Title>If you continues current changes will be unsaved!</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
                <Button variant="secondary" value={input} onClick={() => setSaveModalState(false)}>Go Back</Button>
                <Button variant="primary" onClick={() => {
                    setViewerStatus(false);
                    setCreatorStatus(true);
                    setSaveModalState(false);
                }}>continue</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default SaveModal;