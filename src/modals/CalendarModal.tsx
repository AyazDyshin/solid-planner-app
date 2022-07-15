import FullCalendar from '@fullcalendar/react';
import React from 'react'
import { Modal } from 'react-bootstrap';
import { Habit } from '../components/types';
import dayGridPlugin from '@fullcalendar/daygrid';
import { checkInsToObj } from '../services/helpers';

interface Props {
    calendarModalState: boolean;
    setCalendarModalState: React.Dispatch<React.SetStateAction<boolean>>;
    habitInp: Habit;
}
const CalendarModal = ({ calendarModalState, setCalendarModalState, habitInp }: Props) => {
    const handleClose = () => {
        setCalendarModalState(false);
    }
    return (
        <Modal show={calendarModalState} onHide={handleClose}>
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={checkInsToObj(habitInp)}
            />
        </Modal>
    )
}

export default CalendarModal;