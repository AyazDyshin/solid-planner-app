import React from 'react'
import HabitsCreator from './HabitsCreator'
import HabitsList from './HabitsList'

const HabitsRender = () => {
    return (
        <div className="container-fluid pad">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center p-0">
                    <HabitsList />
                </div>
                <div className="col h-100 border border-5">
                    <HabitsCreator />
                </div>
            </div>
        </div>
    )
}

export default HabitsRender