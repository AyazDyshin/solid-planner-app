import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Modal, Button, Form, FormControl, InputGroup, DropdownButton, Dropdown } from "react-bootstrap";
import { Note, Habit } from "../components/types";

interface Props {
    categoryModalState: boolean;
    setCategoryModalState: React.Dispatch<React.SetStateAction<boolean>>;
    setNoteInp?: React.Dispatch<React.SetStateAction<Note>>;
    noteInp?: Note;
    habitInp?: Habit;
    setHabitInp?: React.Dispatch<React.SetStateAction<Habit>>;
    viewerStatus: boolean;
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
    categoryArray: string[];
    setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
}
//a popup window to prompt user to pick a folder
const CategoryModal = ({ categoryModalState, setCategoryModalState, setNoteInp,
    noteInp, viewerStatus, setArrOfChanges, categoryArray, setCategoryArray, habitInp, setHabitInp }: Props) => {
    const { session } = useSession();
    const { webId } = session.info;
    const [input, setInput] = useState<string>("");

    const handleSave = () => {
        if (noteInp && setNoteInp) {
            if (noteInp.category !== input.trim()) {
                if (viewerStatus) setArrOfChanges((prevState) => ([...prevState, "category"]));
                setNoteInp({ ...noteInp, category: input.trim() });
                setInput("");
            }
        }
        else if (habitInp && setHabitInp) {
            if (habitInp.category !== input.trim()) {
                if (viewerStatus) setArrOfChanges((prevState) => ([...prevState, "category"]));
                setHabitInp({ ...habitInp, category: input.trim() });
                setInput("");
            }
        }
        setCategoryModalState(false);
    }

    return (
        <Modal show={categoryModalState}>
            <Modal.Header closeButton onClick={() => { setCategoryModalState(false) }}>
                <Modal.Title>Set Category:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-center mb-3">
                    {
                        categoryArray.length !== 0 && <DropdownButton
                            variant="outline-secondary"
                            title="choose existing category"
                        >
                            {
                                categoryArray.map((category) => {
                                    return <Dropdown.Item href="" key={Date.now() + Math.floor(Math.random() * 1000)}
                                        onClick={() => setInput(category)}>{category}</Dropdown.Item>
                                })
                            }

                        </DropdownButton>
                    }
                </div>
                <InputGroup>
                    <InputGroup.Text>
                        Or enter new:
                    </InputGroup.Text>
                    <FormControl aria-describedby="basic-addon3" value={input} onChange={e => setInput(e.target.value)} />
                </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" value={input} onClick={() => setCategoryModalState(false)}>Go Back</Button>
                <Button variant="primary" onClick={handleSave}>save</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CategoryModal;