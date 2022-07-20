import React, { useEffect, useState } from "react";
import { Modal, Button, FormControl, InputGroup, Form } from "react-bootstrap";
import { Note, Habit } from "../services/types";

interface Props {
    setEntryChanged: React.Dispatch<React.SetStateAction<boolean>>;
    categoryModalState: boolean;
    setCategoryModalState: React.Dispatch<React.SetStateAction<boolean>>;
    setNoteInp?: React.Dispatch<React.SetStateAction<Note>>;
    noteInp?: Note;
    habitInp?: Habit;
    setHabitInp?: React.Dispatch<React.SetStateAction<Habit>>;
    viewerStatus: boolean;
    categoryArray: string[];
}
//a popup window to prompt user to pick a folder
const CategoryModal = ({ categoryModalState, setCategoryModalState, setNoteInp,
    noteInp, viewerStatus, categoryArray, habitInp, setHabitInp, setEntryChanged }: Props) => {
    const [input, setInput] = useState<string>("");
    const [areaValue, setAreaValue] = useState<string>("");

    useEffect(() => {
        if (noteInp) {
            if (noteInp.category !== null && noteInp.category !== '') {
                setInput(noteInp.category);
            }
        }
        if (habitInp) {
            if (habitInp.category !== null && habitInp.category !== '') {
                setInput(habitInp.category);
            }
        }
    }, [habitInp, noteInp]);
    const handleSave = () => {
        if (noteInp && setNoteInp) {
            if (noteInp.category !== input.trim()) {
                if (viewerStatus) setEntryChanged(true);
                setNoteInp({ ...noteInp, category: input.trim() });
                setInput("");
            }
        }
        else if (habitInp && setHabitInp) {
            if (habitInp.category !== input.trim()) {
                if (viewerStatus) setEntryChanged(true);
                setHabitInp({ ...habitInp, category: input.trim() });
                setInput("");
            }
        }
        setCategoryModalState(false);
    }
    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value === 'no category') {
            setInput("");
        }
        else {
            setInput(e.target.value);
        }
    }
    return (
        <Modal show={categoryModalState}>
            <Modal.Header closeButton onClick={() => { setCategoryModalState(false) }}>
                <Modal.Title>Set Category:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-center mb-3">
                    {
                        categoryArray.length !== 0 && <Form.Select
                            value={input}
                            onChange={handleSelectChange}
                        >
                            <option value="no category">No category</option>
                            {
                                categoryArray.map((category, index) => {
                                    return <option key={Date.now() + index + Math.floor(Math.random() * 1000)} value={category}
                                    >{category}</option>
                                })
                            }
                        </Form.Select>
                    }
                </div>
                <InputGroup>
                    <InputGroup.Text>
                        New:
                    </InputGroup.Text>
                    <FormControl className="category-input" aria-describedby="basic-addon3" value={areaValue} onChange={e => {
                        setInput(e.target.value)
                        setAreaValue(e.target.value);
                    }} />
                </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => setCategoryModalState(false)}>Go Back</Button>
                <Button className="set-category" variant="primary" onClick={handleSave}>Set</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CategoryModal;