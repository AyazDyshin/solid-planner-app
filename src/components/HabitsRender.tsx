import { AccessModes } from '@inrupt/solid-client/dist/acp/policy';
import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
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
    refetchHabits: boolean;
}

const HabitsRender = ({ habitsFetched, setHabitsFetched, habitsArray, setHabitsArray, storagePref, prefFileLocation,
    publicTypeIndexUrl, podType, defFolder, contactsFdrStatus, setContactsFdrStatus, refetchHabits, 
    contactsArr, setContactsArr, contactsFetched }: Props) => {
    const [viewerStatus, setViewerStatus] = useState<boolean>(false);
    const [creatorStatus, setCreatorStatus] = useState<boolean>(false);
    const [newEntryCr, setNewEntryCr] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [habitToView, setHabitToView] = useState<Habit | null>(null);
    const [accUpdObj, setAccUpdObj] = useState<{ [x: string]: boolean; }>({});
    const [publicAccess, setPublicAccess] = useState<accessObject>({ read: false, append: false, write: false });
    const [agentsToUpd, setAgentsToUpd] = useState<{ [x: string]: AccessModes; }>({});
    const [categoryArray, setCategoryArray] = useState<string[]>([]);
    const [habitInp, setHabitInp] = useState<Habit>({
        id: null, title: "", content: "", startDate: null, lastCheckInDate: null, recurrence: "daily", bestStreak: null,
        currentStreak: null, stat: null, category: "", url: "", access: null, prevBestStreak: null, prevLastCheckIn: null,
        checkInList: null, color: "#3e619b"
    });
    const [currentView, setCurrentView] = useState<string>("today");
    const [habitUpdInProgress, setHabitUpdInProgress] = useState<boolean>(false);
    const [habitModalState, setHabitModalState] = useState<boolean>(false);

    return (
        <div className="container-fluid pad h-100 w-100 d-flex justify-content-center" style={{ "backgroundColor": "#F8F8F8" }}>
            <div id="setWidth" style={{ "backgroundColor": "#fff" }} className="h-100 w-100  adjust-me-based-on-size  d-flex justify-content-center align-items-center p-0">
                <HabitsList
                    refetchHabits={refetchHabits}
                    setHabitModalState={setHabitModalState}
                    habitUpdInProgress={habitUpdInProgress}
                    defFolder={defFolder}
                    podType={podType}
                    publicTypeIndexUrl={publicTypeIndexUrl}
                    prefFileLocation={prefFileLocation}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    categoryArray={categoryArray}
                    setCategoryArray={setCategoryArray}
                    newEntryCr={newEntryCr}
                    setNewEntryCr={setNewEntryCr}
                    setHabitToView={setHabitToView}
                    habitsFetched={habitsFetched}
                    setHabitsFetched={setHabitsFetched}
                    habitsArray={habitsArray}
                    setHabitsArray={setHabitsArray}
                    setViewerStatus={setViewerStatus}
                    setCreatorStatus={setCreatorStatus}
                    setIsEdit={setIsEdit}
                    storagePref={storagePref}
                />
            </div>
            {(viewerStatus || creatorStatus) &&
                <Modal id="viewerModal" show={habitModalState} style={{ "height": "90vh" }}
                    size="lg"
                    onHide={() => { setHabitModalState(false) }}>
                    <Modal.Header closeButton>
                        {creatorStatus ? "Create a habit" : "Edit a habit"}
                    </Modal.Header>
                    <Modal.Body id="viewerModal">
                        <HabitsCreator
                            contactsArr={contactsArr}
                            setContactsArr={setContactsArr}
                            contactsFetched={contactsFetched}
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
                            categoryArray={categoryArray}
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
                            creatorStatus={creatorStatus}
                            setCreatorStatus={setCreatorStatus}
                            habitInp={habitInp}
                            setHabitInp={setHabitInp}
                            viewerStatus={viewerStatus}
                            setViewerStatus={setViewerStatus}
                            isEdit={isEdit}
                            setIsEdit={setIsEdit}
                        />
                    </Modal.Body>
                </Modal>
            }
        </div>
    )
}

export default HabitsRender