import { useSession } from '@inrupt/solid-ui-react';
import React, { useEffect, useState } from 'react';
import { fetchAllEntries, thingToHabit, editHabit, deleteEntry } from '../../services/SolidPod';
import { BsCircle } from "react-icons/bs";
import { Habit } from '../../services/types';
import { capitalizeFirstLetter, extractCategories, filterByAccess, filterByCategory, setStreaks, getHabitsToday } from '../../services/helpers';
import { OverlayTrigger, Popover, Badge, Spinner, Button, ButtonGroup, Container, Nav, Navbar, NavDropdown }
  from 'react-bootstrap';
import { BiFolder } from 'react-icons/bi';
import { GoPrimitiveDot, GoCheck, GoX } from 'react-icons/go';
import { RiArrowDropDownLine, RiArrowGoBackFill } from 'react-icons/ri';
import { VscTypeHierarchySuper } from 'react-icons/vsc';
import { RiDeleteBin6Line } from "react-icons/ri";
import DeleteModal from '../../modals/DeleteModal';
import { MdCreate } from 'react-icons/md';
import { FiClock } from 'react-icons/fi';
import CalendarModal from '../../modals/CalendarModal';
import { BsCalendar3Event } from 'react-icons/bs';

interface Props {
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
  habitsFetched: boolean;
  setHabitsFetched: React.Dispatch<React.SetStateAction<boolean>>;
  habitsArray: Habit[];
  setHabitsArray: React.Dispatch<React.SetStateAction<Habit[]>>;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  setHabitToView: React.Dispatch<React.SetStateAction<Habit | null>>;
  newEntryCr: boolean;
  setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
  categoryArray: string[];
  setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
  currentView: string;
  setCurrentView: React.Dispatch<React.SetStateAction<string>>;
  storagePref: string;
  prefFileLocation: string;
  publicTypeIndexUrl: string;
  podType: string;
  defFolder: string | null;
  habitUpdInProgress: boolean;
  setHabitModalState: React.Dispatch<React.SetStateAction<boolean>>;
  refetchHabits: boolean;
}

/**
 * Fetches user's habits list if not fetched and renders it
 *
 * @category Habits components
 */
const HabitsList = ({ setViewerStatus, setCreatorStatus, habitsFetched, setHabitsFetched, habitsArray, setHabitsArray,
  setIsEdit, setHabitToView, newEntryCr, setNewEntryCr, storagePref, categoryArray, setCategoryArray, currentView,
  setCurrentView, prefFileLocation, publicTypeIndexUrl, podType, defFolder, habitUpdInProgress, setHabitModalState, refetchHabits
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
  const accessArray = ["public", "private", "shared"];
  const [currentStatus, setCurrentStatus] = useState<string | null>("undone");
  const [objOfStates, setObjOfStates] = useState<{ [x: number]: boolean | null; }>({});
  const [performDelete, setPerformDelete] = useState<boolean>(false);
  const [urlToDelete, setUrlToDelete] = useState<string | null>(null);
  const [deleteModalState, setDeleteModalState] = useState<boolean>(false);
  const [calendarModalState, setCalendarModalState] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  useEffect(() => {
    const fetchHabits = async () => {
      let filteredHabits: Habit[] = [];
      if (!habitsFetched) {
        const habitArr = await fetchAllEntries(webId, fetch, "habit", storagePref, prefFileLocation, publicTypeIndexUrl, podType);
        for (let i = 0; i < habitArr.length; i++) {
          const item = await thingToHabit(habitArr[i], webId, fetch, storagePref, prefFileLocation, podType);
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
      const extr = extractCategories(filteredHabits);
      setCategoryArray(extr);
      if (currentCategory || currentAccess || currentView || currentStatus) {
        const temp = filteredHabits;
        if (currentCategory) filteredHabits = filterByCategory(filteredHabits, currentCategory);
        if (currentAccess) filteredHabits = filterByAccess(filteredHabits, currentAccess);
        if (currentView === 'today') {
          filteredHabits = getHabitsToday(filteredHabits);
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
  }, [newEntryCr, currentCategory, currentAccess, currentView, currentStatus, refetchHabits]);

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
    setHabitModalState(true);
  };



  const handleSave = async (toSave: Habit) => {
    const updHabit = setStreaks(toSave);
    setNewEntryCr(!newEntryCr);
    setIsSaving(true);
    await editHabit(webId, fetch, updHabit, storagePref, defFolder, prefFileLocation, publicTypeIndexUrl, podType);
    setIsSaving(false);
  };
  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, url: string | null) => {
    e.stopPropagation();
    if (url) {
      setUrlToDelete(url);
    }
    else {
      throw new Error("habit that you want to delete doesn't have a url attached to it");
    }
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
    if (habitsArray.length === 0) {
      return (
        <div className="card text-center">
          <div className="card-body">
            <h5 className="card-title">You don&apos;t have any habits yet!</h5>
            <p className="card-text">Let&apos;s fix this</p>
            <a className="create-habit-button btn btn-primary" onClick={() => {
              setCreatorStatus(true);
              setViewerStatus(false);
              setHabitModalState(true);
            }}>Create</a>
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="w-100 h-100">
          <div className="d-flex">
            <Navbar expand="lg" bg="warning" variant="light" className="w-100">
              <Container>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <Nav className="me-auto">
                    <NavDropdown
                      menuVariant="dark"
                      title={<div><FiClock /> {capitalizeFirstLetter(currentView)} <RiArrowDropDownLine /></div>}
                    >
                      <NavDropdown.Item onClick={() => {
                        setViewerStatus(false);
                        setCreatorStatus(false);
                        setCurrentView('today');
                      }}><GoPrimitiveDot /> Today</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => {
                        setViewerStatus(false);
                        setCreatorStatus(false);
                        setCurrentView('all habits');
                      }}><GoPrimitiveDot /> All habits</NavDropdown.Item>
                    </NavDropdown>
                    <NavDropdown
                      className="habit-status-filter"
                      as={ButtonGroup}
                      menuVariant="dark"
                      variant="secondary"
                      title={<div><BsCircle /> {capitalizeFirstLetter(currentStatus)} <RiArrowDropDownLine /></div>}
                    >
                      <NavDropdown.Item
                        className="habit-status-done-filter"
                        onClick={() => {
                          setViewerStatus(false);
                          setCreatorStatus(false);
                          setCurrentStatus('done');
                        }}><GoPrimitiveDot /> Done</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => {
                        setViewerStatus(false);
                        setCreatorStatus(false);
                        setCurrentStatus('undone');
                      }}><GoPrimitiveDot /> Undone</NavDropdown.Item>
                      <NavDropdown.Item onClick={() => {
                        setViewerStatus(false);
                        setCreatorStatus(false);
                        setCurrentStatus('all');
                      }}><GoPrimitiveDot /> All</NavDropdown.Item>
                    </NavDropdown>
                    {
                      (podType !== "acp") &&
                      <NavDropdown
                        menuVariant="dark"
                        title={<div><VscTypeHierarchySuper />
                          {capitalizeFirstLetter(currentAccess ? currentAccess : "access type")}
                          <RiArrowDropDownLine /></div>}
                      >
                        {
                          accessArray.map((access, key) => {
                            return <NavDropdown.Item href="" key={Date.now() + key + Math.floor(Math.random() * 1000)}
                              onClick={() => {
                                setViewerStatus(false);
                                setCreatorStatus(false);
                                setCurrentAccess(access);
                              }}><GoPrimitiveDot /> {capitalizeFirstLetter(access)}</NavDropdown.Item>
                          })
                        }
                        {currentAccess && (
                          <><NavDropdown.Divider /><NavDropdown.Item
                            onClick={() => setCurrentAccess(null)}><RiArrowGoBackFill /> reset</NavDropdown.Item></>)}
                      </NavDropdown>
                    }
                    {
                      categoryArray.length !== 0 && <NavDropdown
                        as={ButtonGroup}
                        variant="secondary"
                        menuVariant="dark"
                        title={<div><BiFolder /> {currentCategory ? currentCategory : "Category"} <RiArrowDropDownLine /></div>}
                      >
                        {
                          categoryArray.map((category, key) => {
                            return <NavDropdown.Item key={Date.now() + key + Math.floor(Math.random() * 1000)}
                              onClick={() => {
                                setViewerStatus(false);
                                setCreatorStatus(false);
                                setCurrentCategory(category);

                              }}><GoPrimitiveDot /> {category}</NavDropdown.Item>
                          })
                        }
                        <><NavDropdown.Divider /><NavDropdown.Item
                          onClick={() => setCurrentCategory("without category")}
                        ><GoPrimitiveDot /> Without category</NavDropdown.Item></>
                        {currentCategory && (
                          <><NavDropdown.Divider /><NavDropdown.Item
                            onClick={() => setCurrentCategory(null)}><RiArrowGoBackFill /> reset</NavDropdown.Item></>)}
                      </NavDropdown>
                    }
                    {
                      (currentCategory || currentAccess) && (podType !== "acp") &&
                      <OverlayTrigger placement="right" overlay={
                        <Popover>
                          <Popover.Body className="py-1 px-1">
                            Reset category and access filters
                          </Popover.Body>
                        </Popover>}>
                        <Nav.Link
                          className="me-auto"
                          onClick={() => {
                            setCurrentCategory(null);
                            setCurrentAccess(null);
                            setCurrentStatus("undone");
                            setCurrentView("today");

                          }
                          }><RiArrowGoBackFill /> Reset all</Nav.Link>
                      </OverlayTrigger>
                    }
                    <OverlayTrigger placement="right" overlay={
                      <Popover>
                        <Popover.Body className="py-1 px-1">
                          View current list of habits in calendar
                        </Popover.Body>
                      </Popover>}>
                      <Nav.Link
                        className="calendar-view-button me-auto"
                        onClick={() => {
                          setCalendarModalState(true)
                        }}><BsCalendar3Event /> Calendar</Nav.Link>
                    </OverlayTrigger>
                    <OverlayTrigger placement="right" overlay={
                      <Popover>
                        <Popover.Body className="py-1 px-1">
                          Create a new habit
                        </Popover.Body>
                      </Popover>}>
                      <Nav.Link className="create-habit-button me-auto" onClick={handleCreate}><MdCreate /> Create</Nav.Link>
                    </OverlayTrigger>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
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
                        d-flex list-group-item-action`}
                        onClick={(e) => {
                          e.preventDefault();
                          setIsEdit(false);
                          setHabitToView(habit);
                          setViewerStatus(true);
                          setCreatorStatus(false);
                          setHabitModalState(true);
                        }}
                      >
                        {
                          (habitsToShow[key].stat !== null) && (objOfStates[key] !== null) &&
                          <div className="ms-2 me-3 mt-0 mb-1"
                            key={Date.now() + key + Math.floor(Math.random() * 1000)}
                            style={{ display: "inline-block" }}>
                            <input className="habit-check form-check-input secondary"
                              {...(!(currentView === 'today') && { disabled: true })}
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                              onChange={() => {
                                const tempArr = habitsToShow;
                                tempArr[key].stat = !habit.stat;
                                setHabitsToShow(tempArr);
                                const updToSave = tempArr[key];
                                setObjOfStates((prevState) => ({ ...prevState, [key]: !objOfStates[key] }));
                                handleSave(updToSave);
                              }}
                              type="checkbox"
                              checked={
                                (objOfStates[key]) ? true : false
                              }
                              {...((isSaving || habitUpdInProgress) && { disabled: true })}
                              style={{ "transform": "scale(1.7)" }} />
                          </div>
                        }
                        <div style={{ display: "inline-block" }}>
                          {habit.recurrence &&
                            <Badge pill className="me-1">{habit.recurrence}</Badge>
                          }
                          {habit.category && <Badge pill bg="info" className="me-1">{habit.category}</Badge>}
                        </div>
                        <div style={{ display: "inline-block" }}>
                          {!habit.category && <Badge pill bg="info" className="me-1">no category</Badge>}
                        </div>
                        {habit.access && (podType !== "acp") && <OverlayTrigger placement="right" overlay={
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
                        {habit.shareList && (podType !== "acp") && <OverlayTrigger placement="right" overlay={
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
                                            (<div style={{ display: "inline" }}>
                                              read: <GoCheck /></div>) :
                                            (<div style={{ display: "inline" }}>read: <GoX /></div>)}
                                          {(habit.shareList[key].append) ?
                                            (<div style={{ display: "inline" }}>
                                              append: <GoCheck /></div>) :
                                            (<div style={{ display: "inline" }}>append: <GoX /></div>)}
                                          {(habit.shareList[key].write) ?
                                            (<div style={{ display: "inline" }}>write: <GoCheck /></div>) :
                                            (<div style={{ display: "inline" }}>write: <GoX /></div>)}
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
                        {
                          habit.title && <div>{habit.title}</div>
                        }
                        {
                          habit.title === null && <div style={{ "color": "grey" }}>No title</div>
                        }
                        {
                          habit.id &&
                          <Button variant="outline-danger"
                            className="delete-habit px-1 py-1 ms-auto"
                            style={{ color: "red" }}
                            onClick={(e) => { handleDelete(e, habit.url) }}
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
          <CalendarModal
            calendarModalState={calendarModalState}
            setCalendarModalState={setCalendarModalState}
            habitsInp={habitsToShow}
          />
        </div >
      )
    }
  }
}

export default HabitsList

