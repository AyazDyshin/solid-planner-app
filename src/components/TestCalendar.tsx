import React from 'react'
import FullCalendar from '@fullcalendar/react' // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid' // a plugin!

const TestCalendar = () => {
    let d = new Date();
    return (
        <div className="h-50 w-50">
            <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                events={[
                    { title: 'event 1', date: d, startRecur: d, endRecur:'2022-07-15' },
                    { title: 'hehs', date: d, startRecur: d, endRecur:'2022-07-15' },
                    { title: 'event 2', date: '2019-04-02' }
                ]}
            />
        </div>
    )
}

export default TestCalendar