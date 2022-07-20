import FullCalendar from '@fullcalendar/react';
import React from 'react'
import { Modal } from 'react-bootstrap';
import { Habit } from '../services/types';
import dayGridPlugin from '@fullcalendar/daygrid';
import { checkInsToObj } from '../services/helpers';

interface Props {
    calendarModalState: boolean;
    setCalendarModalState: React.Dispatch<React.SetStateAction<boolean>>;
    habitsInp: Habit[];
}

const CalendarModal = ({ calendarModalState, setCalendarModalState, habitsInp }: Props) => {
    const handleClose = () => {
        setCalendarModalState(false);
    }

    return (
        <Modal show={calendarModalState} onHide={handleClose} >
            <Modal.Header closeButton onClick={() => { setCalendarModalState(false) }}>
            </Modal.Header>
            <Modal.Body>
                <div>
                    <FullCalendar
                        height={"60vh"}
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        events={habitsInp.map((habit) => {
                            return checkInsToObj(habit)
                        }).flat()}
                    />
                </div>
            </Modal.Body>
        </Modal>
    )
}

export default CalendarModal;