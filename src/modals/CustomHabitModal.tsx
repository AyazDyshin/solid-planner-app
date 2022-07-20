import React, { useEffect, useState } from "react";
import { Modal, Button, Form, InputGroup, Collapse } from "react-bootstrap";
import { Habit } from "../services/types";
import { getNumberFromDay } from "../services/helpers";

interface Props {
    customHabitModalState: boolean;
    setCustomHabitModalState: React.Dispatch<React.SetStateAction<boolean>>;
    setHabitInp: React.Dispatch<React.SetStateAction<Habit>>;
    habitInp: Habit;
}

const CustomHabitModal = ({ customHabitModalState, setCustomHabitModalState, habitInp, setHabitInp }: Props) => {
    const [weekOpen, setWeekOpen] = useState<boolean>(false);
    const [dayOpen, setDayOpen] = useState<boolean>(false);
    const [objOfDays, setObjOfDays] = useState<{ [x: string]: boolean }>({
        "monday": false, "tuesday": false, "wednesday": false, "thursday": false, "friday": false, "saturday": false, "sunday": false
    });
    const [numberOfDays, setNumberOfDays] = useState<string>("");
    const [toApply, setToApply] = useState<string | null>(null);
    const daysArr = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    useEffect(() => {
        if (customHabitModalState) {
            setWeekOpen(false);
            setDayOpen(false);
            setObjOfDays({
                "monday": false, "tuesday": false, "wednesday": false, "thursday": false, "friday": false, "saturday": false, "sunday": false
            });
            setToApply(null);
            setNumberOfDays("");
            if (habitInp.custom) {
                if (typeof habitInp.custom === 'number') {
                    setNumberOfDays(habitInp.custom.toString());
                }
                else {
                    habitInp.custom.forEach((num) => {
                        switch (num) {
                            case 0:
                                setObjOfDays((prevState) => ({ ...prevState, "monday": true }));
                                break;
                            case 1:
                                setObjOfDays((prevState) => ({ ...prevState, "tuesday": true }));
                                break;
                            case 2:
                                setObjOfDays((prevState) => ({ ...prevState, "wednesday": true }));
                                break;
                            case 3:
                                setObjOfDays((prevState) => ({ ...prevState, "thursday": true }));
                                break;
                            case 4:
                                setObjOfDays((prevState) => ({ ...prevState, "friday": true }));
                                break;
                            case 5:
                                setObjOfDays((prevState) => ({ ...prevState, "saturday": true }));
                                break;
                            case 6:
                                setObjOfDays((prevState) => ({ ...prevState, "sunday": true }));
                                break;
                        }
                    });
                }
            }
        }
    }, [customHabitModalState]);

    const handleSave = () => {
        if (toApply === "day") {
            if (numberOfDays === "") {
                setHabitInp(prevState => ({ ...prevState, recurrence: "daily" }));
                setHabitInp(prevState => ({ ...prevState, custom: null }));
            }
            setHabitInp(prevState => ({ ...prevState, custom: parseInt(numberOfDays) }));
        }
        else if (toApply === "week") {
            const newCustom: number[] = [];
            daysArr.forEach((day) => {
                if (objOfDays[day]) {
                    const num = getNumberFromDay(day);
                    if (num !== undefined) newCustom.push(num);
                }
            });
            if (newCustom.length !== 0) {
                setHabitInp(prevState => ({ ...prevState, custom: newCustom }));
            }
            else {
                setHabitInp(prevState => ({ ...prevState, recurrence: "daily" }));
                setHabitInp(prevState => ({ ...prevState, custom: null }));
            }
        }
        setCustomHabitModalState(false);
    }

    return (
        <Modal show={customHabitModalState}>
            <Modal.Header closeButton onClick={() => {
                setHabitInp(prevState => ({ ...prevState, recurrence: 'daily' }));
                setCustomHabitModalState(false);
            }}>
                <Modal.Title>Set Custom Recurrence:</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-around my-3">
                    <Button
                        onClick={() => {
                            setWeekOpen(!weekOpen);
                            setDayOpen(false);
                            setToApply("week");
                        }}
                        aria-controls="example-collapse-text"
                    >
                        By week day:
                    </Button>
                    <Button
                        onClick={() => {
                            setDayOpen(!dayOpen);
                            setWeekOpen(false);
                            setToApply("day");
                        }}
                        aria-controls="example-collapse-text"
                    >
                        By number of days:
                    </Button>
                </div>
                <Collapse in={dayOpen}>
                    <InputGroup>
                        <InputGroup.Text>every</InputGroup.Text>
                        <Form.Control type="number" min="1" value={numberOfDays} onChange={e => setNumberOfDays(e.target.value)} />
                        <InputGroup.Text>days</InputGroup.Text>
                    </InputGroup>
                </Collapse>
                <Collapse in={weekOpen}>
                    <div>
                        {
                            daysArr.map((key, index) => {
                                return (
                                    <div key={Date.now() + index + Math.floor(Math.random() * 10000)}
                                        className="form-check form-switch">
                                        <label className="form-check-label"
                                            htmlFor="flexSwitchCheckDefault1">{key}</label>
                                        <input className="form-check-input" type="checkbox"
                                            onChange={() => {
                                                setObjOfDays((prevState) => ({ ...prevState, [key]: !objOfDays[key] }));
                                            }}
                                            checked={objOfDays[key]}
                                            role="switch" id="flexSwitchCheckDefault" />
                                    </div>
                                )
                            })
                        }
                    </div>
                </Collapse>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => {
                    setHabitInp(prevState => ({ ...prevState, recurrence: 'daily' }));
                    setCustomHabitModalState(false)
                }}>Go Back</Button>
                <Button variant="primary" onClick={handleSave}>Set</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default CustomHabitModal;