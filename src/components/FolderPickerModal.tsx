import { useSession } from "@inrupt/solid-ui-react";
import { useState } from "react";
import { Modal, Button, Form, FormControl, InputGroup } from "react-bootstrap";
import { modifyWebId } from "../services/SolidPod";
interface Props {
    modalState: boolean;
    setModalState: React.Dispatch<React.SetStateAction<boolean>>;
    defFolderUrlToUp: string;
    setDefFolderUrlToUp: React.Dispatch<React.SetStateAction<string>>;
    setDefFolderStatus : React.Dispatch<React.SetStateAction<boolean>>;
}

const FolderPickerModal = ({ modalState, setModalState, defFolderUrlToUp, setDefFolderUrlToUp,setDefFolderStatus }: Props) => {
    const { session } = useSession();
    const { webId } = session.info;
    const [input, setInput] = useState<string>("");
    const urlToShow = modifyWebId(webId ?? "Error, no webId");
    return (
        <Modal show={modalState}>
            <Modal.Header closeButton onClick={() => { setModalState(false) }}>
                <Modal.Title>Specify your folder location:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <InputGroup.Text id="basic-addon3" className="">
                    {urlToShow}
                </InputGroup.Text>
                <FormControl className="mt-1" aria-describedby="basic-addon3" value={input} onChange={e => setInput(e.target.value)} />
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" value={input} onClick={() => setModalState(false)}>Close</Button>
                <Button variant="primary" onClick={() => {
                    setDefFolderUrlToUp(`${urlToShow}${input}`);
                    setDefFolderStatus(true);
                    setModalState(false);
                }}>Save changes</Button>
            </Modal.Footer>
        </Modal>
    );
}
export default FolderPickerModal;