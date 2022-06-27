import React, { useState } from 'react'
import HabitsCreator from './HabitsCreator'
import HabitsList from './HabitsList'
import { Habit } from './types';

const HabitsRender = () => {
    const [viewerStatus, setViewerStatus] = useState<boolean>(false);
    const [creatorStatus, setCreatorStatus] = useState<boolean>(false);
    const [arrOfChanges, setArrOfChanges] = useState<string[]>([]);
    const [habitInp, setHabitInp] = useState<Habit>({
        id: null, title: null, content: null, startDate: null, lastCheckInDate: null, recurrence: null, bestStreak: null,
        currentStreak: null, status: null, category: null, url: null, access: null
    });
    const [isEdit, setIsEdit] = useState<boolean>(false);
    
    return (
        <div className="container-fluid pad">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center p-0">
                    <HabitsList
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        creatorStatus={creatorStatus}
                        setCreatorStatus={setCreatorStatus}
                    />
                </div>
                <div className="col h-100 border border-5">
                    <HabitsCreator
                        habitInp={habitInp}
                        setHabitInp={setHabitInp}
                        arrOfChanges={arrOfChanges}
                        setArrOfChanges={setArrOfChanges}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                    />
                </div>
            </div>
        </div>
    )
}

export default HabitsRender