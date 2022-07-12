import { useSession } from '@inrupt/solid-ui-react';
import { useEffect, useState } from 'react';
import { fetchAllEntries, thingToHabit, editHabit, deleteEntry } from '../services/SolidPod';
import { BsPlusLg } from "react-icons/bs";
import { Habit } from './types';
import { extractCategories, filterByAccess, filterByCategory, getHabitsToday, setStreaks } from '../services/helpers';
import { DropdownButton, Dropdown, OverlayTrigger, Popover, Badge, Spinner, Button } from 'react-bootstrap';
import { BiFolder } from 'react-icons/bi';
import { GoPrimitiveDot, GoCheck, GoX } from 'react-icons/go';
import { RiArrowDropDownLine, RiArrowGoBackFill } from 'react-icons/ri';
import { VscTypeHierarchySuper } from 'react-icons/vsc';
import { MdSaveAlt } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import DeleteModal from '../modals/DeleteModal';

interface Props {
  viewerStatus: boolean;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  creatorStatus: boolean;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
  habitsFetched: boolean;
  setHabitsFetched: React.Dispatch<React.SetStateAction<boolean>>;
  habitsArray: Habit[];
  setHabitsArray: React.Dispatch<React.SetStateAction<Habit[]>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  habitToView: Habit | null;
  setHabitToView: React.Dispatch<React.SetStateAction<Habit | null>>;
  newEntryCr: boolean;
  setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
  habitsToday: Habit[];
  setHabitsToday: React.Dispatch<React.SetStateAction<Habit[]>>;
  categoryArray: string[];
  setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
  habitInp: Habit;
  setHabitInp: React.Dispatch<React.SetStateAction<Habit>>;
  habitDoSave: boolean;
  setHabitDoSave: React.Dispatch<React.SetStateAction<boolean>>;
  currentView: string;
  setCurrentView: React.Dispatch<React.SetStateAction<string>>;
  storagePref: string;
  prefFileLocation: string;
  publicTypeIndexUrl: string;
  podType: string;
  defFolder: string | null;
  habitUpdInProgress: boolean;
  setHabitUpdInProgress: React.Dispatch<React.SetStateAction<boolean>>;
}
const HabitsList = ({ viewerStatus, setViewerStatus, creatorStatus, setCreatorStatus, habitsFetched, setHabitsFetched,
  habitsArray, setHabitsArray, isEdit, setIsEdit, habitToView, setHabitToView, newEntryCr, setNewEntryCr, storagePref,
  habitsToday, setHabitsToday, categoryArray, setCategoryArray, habitInp, setHabitInp, habitDoSave, setHabitDoSave, currentView,
  setCurrentView, prefFileLocation, publicTypeIndexUrl, podType, defFolder, habitUpdInProgress, setHabitUpdInProgress
}: Props) => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  if (webId === undefined) {
    throw new Error(`Error, couldn't get user's WebId`);
  }
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentAccess, setCurrentAccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [habitsToShow, setHabitsToShow] = useState<Habit[]>([]);
  const [activeHabit, setActiveHabit] = useState<number | null>(null);
  const accessArray = ["public", "private", "shared"];
  const [currentStatus, setCurrentStatus] = useState<string | null>("undone");
  const [habitsToSave, setHabitsToSave] = useState<Habit[]>([]);
  const [objOfStates, setObjOfStates] = useState<{ [x: number]: boolean | null; }>({});
  const [performDelete, setPerformDelete] = useState<boolean>(false);
  const [urlToDelete, setUrlToDelete] = useState<string | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<boolean>(false);

  useEffect(() => {
    const fetchHabits = async (otherId?: string) => {
      let filteredHabits: Habit[] = [];
      if (!habitsFetched) {
        let habitArr = await fetchAllEntries(webId, fetch, "habit", storagePref, prefFileLocation, publicTypeIndexUrl, podType);
        for (let i = 0; i < habitArr.length; i++) {
          let item = await thingToHabit(habitArr[i], webId, fetch, storagePref, prefFileLocation, podType);
          if (item) {
            filteredHabits.push(item);
          }
        }
        setHabitsArray(filteredHabits);
        setHabitsFetched(true);
      }
      else {
        filteredHabits = habitsArray;
      }
      let extr = extractCategories(filteredHabits);
      setCategoryArray(extr);


      if (currentCategory || currentAccess || currentView || currentStatus) {
        let temp = filteredHabits;
        if (currentCategory) filteredHabits = filterByCategory(filteredHabits, currentCategory);
        if (currentAccess) filteredHabits = filterByAccess(filteredHabits, currentAccess);


        if (currentView === 'today') {

          let bib = getHabitsToday(filteredHabits);
          filteredHabits.forEach((habit) => {
            temp.map((habit2) => {
              if (habit.id === habit2.id) {
                habit2.stat = habit.stat
              }
              return habit2;
            });
          });
          setHabitsArray(temp);
        }
        if (currentStatus === 'undone') {
          filteredHabits = filteredHabits.filter((habit) => { if (!habit.stat) return true });
        }
        if (currentStatus === 'done') {
          filteredHabits = filteredHabits.filter((habit) => { if (habit.stat) return true });
        }
      }
      setHabitsToShow(filteredHabits);
      filteredHabits.forEach((habit, key) => {
        setObjOfStates((prevState) => ({ ...prevState, [key]: habit.stat }));
      });
      setIsLoading(false);

    }

    fetchHabits();

  }, [newEntryCr, currentCategory, currentAccess, currentView, currentStatus]);

  useEffect(() => {
    const deleteNote = async () => {
      if (urlToDelete) {
        await deleteEntry(webId, fetch, urlToDelete, "note", storagePref, publicTypeIndexUrl);
        setPerformDelete(false);
        setUrlToDelete(null);
      }
      else {
        throw new Error("note your are trying to delete doesn't exist");
      }
    }
    if (performDelete && !habitUpdInProgress) {
      deleteNote();
    }
  }, [habitUpdInProgress, performDelete]);

  const handleCreate = () => {
    setViewerStatus(false);
    setCreatorStatus(true);
  };
  const handleSave = async (toSave: Habit) => {
    let updHabit = setStreaks(toSave);
    setNewEntryCr(!newEntryCr);
    await editHabit(webId, fetch, updHabit, storagePref, defFolder, prefFileLocation, publicTypeIndexUrl, podType);
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, url: string) => {
    e.stopPropagation();
    setUrlToDelete(url);
    setDeleteModalState(true);
  }
  if (!habitsFetched || isLoading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    )
  }
  else {
    if ((habitsToShow.length === 0) && !(currentAccess || currentCategory || currentView)) {

      return (
        <div className="card text-center">
          <div className="card-body">
            <h5 className="card-title">You don't have any habits yet!</h5>
            <p className="card-text">Let's fix this</p>
            <a className="btn btn-primary" onClick={() => {
              setCreatorStatus(true);
              setViewerStatus(false);
            }}>create</a>
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="w-100 h-100">
          <div className="d-flex">
            <DropdownButton
              className="mx-1 my-1"
              variant="secondary"
              title={currentView}
            >
              <Dropdown.Item onClick={() => {
                setViewerStatus(false);
                setCreatorStatus(false);
                setCurrentView('today');
              }}>today</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setViewerStatus(false);
                setCreatorStatus(false);
                setCurrentView('all habits');
              }}>all habits</Dropdown.Item>
            </DropdownButton>
            <DropdownButton
              className="mx-1 my-1"
              variant="secondary"
              title={currentStatus}
            >
              <Dropdown.Item onClick={() => {
                setViewerStatus(false);
                setCreatorStatus(false);
                setCurrentStatus('done');
              }}>done</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setViewerStatus(false);
                setCreatorStatus(false);
                setCurrentStatus('undone');
              }}>undone</Dropdown.Item>
              <Dropdown.Item onClick={() => {
                setViewerStatus(false);
                setCreatorStatus(false);
                setCurrentStatus('all');
              }}>all</Dropdown.Item>

            </DropdownButton>
            <DropdownButton
              className="mx-1 my-1"
              variant="secondary"
              title={<div><VscTypeHierarchySuper /> {currentAccess ? currentAccess : "access type"} <RiArrowDropDownLine /></div>}
            >
              {
                accessArray.map((access, key) => {
                  return <Dropdown.Item href="" key={Date.now() + key + Math.floor(Math.random() * 1000)}
                    onClick={() => {
                      setViewerStatus(false);
                      setCreatorStatus(false);
                      setCurrentAccess(access);
                    }}><GoPrimitiveDot /> {access}</Dropdown.Item>
                })
              }
              {currentAccess && (
                <><Dropdown.Divider /><Dropdown.Item onClick={() => setCurrentAccess(null)}><RiArrowGoBackFill /> reset</Dropdown.Item></>)}
            </DropdownButton>
            {
              categoryArray.length !== 0 && <DropdownButton
                className="mx-1 my-1"
                variant="secondary"
                title={<div><BiFolder /> {currentCategory ? currentCategory : "Category"} <RiArrowDropDownLine /></div>}
              >
                {
                  categoryArray.map((category, key) => {
                    return <Dropdown.Item key={Date.now() + key + Math.floor(Math.random() * 1000)}
                      onClick={() => {
                        setViewerStatus(false);
                        setCreatorStatus(false);
                        setCurrentCategory(category);

                      }}><GoPrimitiveDot /> {category}</Dropdown.Item>
                  })
                }

                {currentCategory && (
                  <><Dropdown.Divider /><Dropdown.Item onClick={() => setCurrentCategory(null)}><RiArrowGoBackFill /> reset</Dropdown.Item></>)}
              </DropdownButton>
            }
            <OverlayTrigger placement="right" overlay={
              <Popover>
                <Popover.Body className="py-1 px-1">
                  Create a new habit
                </Popover.Body>
              </Popover>}>
              <a className="btn btn-secondary ms-1 my-1 d-flex align-items-center justify-content-center" onClick={handleCreate}><BsPlusLg /></a>
            </OverlayTrigger>
          </div>
          <div className="list-group w-100 h-80">



            {
              habitsToShow.length !== 0 && <div className="list-group" style={{ maxHeight: '80%', overflow: 'auto' }}>
                {

                  habitsToShow.map((habit, key) => {
                    return (
                      <a
                        key={`${habit.id}${Date.now() + key + Math.floor(Math.random() * 1000)}`}
                        className={`list-group-item px-1 align-items-center 
                        d-flex list-group-item-action ${activeHabit === habit.id ? 'active' : ''}`}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsEdit(false);
                          setActiveHabit(habit.id);
                          setHabitToView(habit);
                          setViewerStatus(true);
                          setCreatorStatus(false);
                        }}
                      >
                        {
                          (habitsToShow[key].stat !== null) && (objOfStates[key] !== null) &&
                          <div className="ms-2 me-3 mt-0 mb-1"
                            key={Date.now() + key + Math.floor(Math.random() * 1000)}
                            style={{ display: "inline-block" }}>
                            <input className="form-check-input secondary"
                              {...(!(currentView === 'today') && { disabled: true })}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={() => {
                                let tempArr = habitsToShow;
                                tempArr[key].stat = !habit.stat;
                                setHabitsToShow(tempArr);
                                console.log(tempArr);
                                let toSave = tempArr[key];
                                console.log(toSave);
                                setObjOfStates((prevState) => ({ ...prevState, [key]: !objOfStates[key] }));
                                handleSave(toSave);

                              }}
                              type="checkbox" checked={objOfStates[key]!} style={{ "transform": "scale(1.7)" }} />
                          </div>
                        }
                        <div style={{ display: "inline-block" }}>
                          {habit.recurrence && <Badge style={{ "backgroundColor": 'red!important' }} className="me-1">{habit.recurrence}</Badge>}
                          {habit.category && <Badge pill bg="info" className="me-1">{habit.category}</Badge>}
                        </div>
                        <div style={{ display: "inline-block" }}>
                          {!habit.category && <Badge pill bg="info" className="me-1">no category</Badge>}
                        </div>
                        {habit.access && <OverlayTrigger placement="right" overlay={
                          <Popover>
                            <Popover.Body className="py-1 px-1">
                              {(habit.access[Object.keys(habit.access)[0]].read) ?
                                (<div>read: <GoCheck /></div>) : (<div>read: <GoX /></div>)}
                              {(habit.access[Object.keys(habit.access)[0]].append) ?
                                (<div>append: <GoCheck /></div>) : (<div>append: <GoX /></div>)}
                              {(habit.access[Object.keys(habit.access)[0]].write) ?
                                (<div>write: <GoCheck /></div>) : (<div>write: <GoX /></div>)}
                            </Popover.Body>
                          </Popover>
                        }>
                          <div style={{ display: "inline-block" }}>
                            <Badge pill bg="secondary" className="me-1 cursor">{Object.keys(habit.access)[0]}</Badge>
                          </div>
                        </OverlayTrigger>}

                        {habit.shareList && <OverlayTrigger placement="right" overlay={
                          <Popover style={{ maxWidth: "400px" }}>
                            <Popover.Body className="py-1 px-1">
                              <div >
                                {
                                  Object.keys(habit.shareList).map((key, index) => {
                                    return <div key={Date.now() + index + Math.floor(Math.random() * 1000)}>
                                      <div> {key} :</div>
                                      {
                                        habit.shareList &&
                                        <div className="d-flex justify-content-between">
                                          {(habit.shareList[key].read) ?
                                            (<div style={{ display: "inline" }}>read: <GoCheck /></div>) : (<div style={{ display: "inline" }}>read: <GoX /></div>)}
                                          {(habit.shareList[key].append) ?
                                            (<div style={{ display: "inline" }}>append: <GoCheck /></div>) : (<div style={{ display: "inline" }}>append: <GoX /></div>)}
                                          {(habit.shareList[key].write) ?
                                            (<div style={{ display: "inline" }}>write: <GoCheck /></div>) : (<div style={{ display: "inline" }}>write: <GoX /></div>)}
                                        </div>
                                      }
                                    </div>
                                  })
                                }
                              </div>
                            </Popover.Body>
                          </Popover>
                        }>
                          <div style={{ display: "inline-block" }}>
                            <Badge pill bg="secondary" className="me-1 cursor">shared</Badge>
                          </div>
                        </OverlayTrigger>}
                        {habit.title}

                        {
                          habit.id &&
                          <Button variant="outline-danger"
                            className="px-1 py-1 ms-auto"
                            style={{ color: "red" }}
                            onClick={(e) => { handleDelete(e, habit.url!) }}
                          ><RiDeleteBin6Line /></Button>
                        }
                      </a>
                    )
                  })
                }
              </div>
            }
            {
              habitsToShow.length === 0 && <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Oooops!</h5>
                  <p className="card-text">Seems like there are no habits satisfying your filters</p>
                </div>
              </div>
            }
          </div>
          <DeleteModal
            deleteModalState={deleteModalState}
            setDeleteModalState={setDeleteModalState}
            urlToDelete={urlToDelete}
            setUrlToDelete={setUrlToDelete}
            entryType={"habit"}
            storagePref={storagePref}
            newEntryCr={newEntryCr}
            setNewEntryCr={setNewEntryCr}
            publicTypeIndexUrl={publicTypeIndexUrl}
            progressCheck={habitUpdInProgress}
            habitsArray={habitsArray}
            setHabitsArray={setHabitsArray}
            setViewerStatus={setViewerStatus}
            setCreatorStatus={setCreatorStatus}
          />
        </div >
      )
    }
  }
}

export default HabitsList

