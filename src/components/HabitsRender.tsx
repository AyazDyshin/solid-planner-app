import { AccessModes } from '@inrupt/solid-client/dist/acp/policy';
import React, { useState } from 'react'
import HabitsCreator from './HabitsCreator'
import HabitsList from './HabitsList'
import { accessObject, Habit } from './types';

interface Props {
    habitsFetched: boolean;
    setHabitsFetched: React.Dispatch<React.SetStateAction<boolean>>;
    habitsArray: Habit[];
    setHabitsArray: React.Dispatch<React.SetStateAction<Habit[]>>;
    storagePref: string;
    prefFileLocation: string;
    publicTypeIndexUrl: string;
    podType: string;
    defFolder: string | null;
    contactsFdrStatus: boolean;
    setContactsFdrStatus: React.Dispatch<React.SetStateAction<boolean>>;
    contactsArr: (string | null)[][];
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    contactsFetched: boolean;
    setContactsFetched: React.Dispatch<React.SetStateAction<boolean>>;
}

const HabitsRender = ({ habitsFetched, setHabitsFetched, habitsArray, setHabitsArray, storagePref, prefFileLocation,
    publicTypeIndexUrl, podType, defFolder, contactsFdrStatus, setContactsFdrStatus,
    contactsArr, setContactsArr, contactsFetched, setContactsFetched }: Props) => {
    const [viewerStatus, setViewerStatus] = useState<boolean>(false);
    const [creatorStatus, setCreatorStatus] = useState<boolean>(false);
    const [arrOfChanges, setArrOfChanges] = useState<string[]>([]);
    const [newEntryCr, setNewEntryCr] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [habitToView, setHabitToView] = useState<Habit | null>(null);
    const [accUpdObj, setAccUpdObj] = useState<{ [x: string]: boolean; }>({});
    const [publicAccess, setPublicAccess] = useState<accessObject>({ read: false, append: false, write: false });
    const [agentsToUpd, setAgentsToUpd] = useState<{ [x: string]: AccessModes; }>({});
    const [habitsToday, setHabitsToday] = useState<Habit[]>([]);
    const [categoryArray, setCategoryArray] = useState<string[]>([]);
    const [habitDoSave, setHabitDoSave] = useState<boolean>(false);
    const [habitInp, setHabitInp] = useState<Habit>({
        id: null, title: "", content: "", startDate: null, lastCheckInDate: null, recurrence: "daily", bestStreak: null,
        currentStreak: null, stat: null, category: "", url: "", access: null, prevBestStreak: null, prevLastCheckIn: null,
        checkInList: null, color: "#3e619b"
    });
    const [currentView, setCurrentView] = useState<string>("today");
    const [habitUpdInProgress, setHabitUpdInProgress] = useState<boolean>(false);

    return (
        <div className="container-fluid pad">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center p-0">
                    <HabitsList
                        habitUpdInProgress={habitUpdInProgress}
                        setHabitUpdInProgress={setHabitUpdInProgress}
                        defFolder={defFolder}
                        podType={podType}
                        publicTypeIndexUrl={publicTypeIndexUrl}
                        prefFileLocation={prefFileLocation}
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        habitDoSave={habitDoSave}
                        setHabitDoSave={setHabitDoSave}
                        habitInp={habitInp}
                        setHabitInp={setHabitInp}
                        categoryArray={categoryArray}
                        setCategoryArray={setCategoryArray}
                        habitsToday={habitsToday}
                        setHabitsToday={setHabitsToday}
                        newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr}
                        habitToView={habitToView}
                        setHabitToView={setHabitToView}
                        habitsFetched={habitsFetched}
                        setHabitsFetched={setHabitsFetched}
                        habitsArray={habitsArray}
                        setHabitsArray={setHabitsArray}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        creatorStatus={creatorStatus}
                        setCreatorStatus={setCreatorStatus}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                        storagePref={storagePref}
                    />
                </div>
                <div className="col h-100 border border-5">
                    {(viewerStatus || creatorStatus) && <HabitsCreator
                        contactsArr={contactsArr}
                        setContactsArr={setContactsArr}
                        contactsFetched={contactsFetched}
                        setContactsFetched={setContactsFetched}
                        contactsFdrStatus={contactsFdrStatus}
                        setContactsFdrStatus={setContactsFdrStatus}
                        habitUpdInProgress={habitUpdInProgress}
                        setHabitUpdInProgress={setHabitUpdInProgress}
                        publicTypeIndexUrl={publicTypeIndexUrl}
                        podType={podType}
                        prefFileLocation={prefFileLocation}
                        defFolder={defFolder}
                        storagePref={storagePref}
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        habitDoSave={habitDoSave}
                        setHabitDoSave={setHabitDoSave}
                        categoryArray={categoryArray}
                        setCategoryArray={setCategoryArray}
                        agentsToUpd={agentsToUpd}
                        setAgentsToUpd={setAgentsToUpd}
                        publicAccess={publicAccess}
                        setPublicAccess={setPublicAccess}
                        accUpdObj={accUpdObj}
                        setAccUpdObj={setAccUpdObj}
                        newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr}
                        habitsArray={habitsArray}
                        setHabitsArray={setHabitsArray}
                        habitToView={habitToView}
                        setHabitToView={setHabitToView}
                        creatorStatus={creatorStatus}
                        setCreatorStatus={setCreatorStatus}
                        habitInp={habitInp}
                        setHabitInp={setHabitInp}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                    />
                    }
                </div>
            </div>
        </div>
    )
}

export default HabitsRender