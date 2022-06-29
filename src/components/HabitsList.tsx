import { useSession } from '@inrupt/solid-ui-react';
import { useEffect, useState } from 'react';
import { fetchAllEntries, thingToHabit } from '../services/SolidPod';
import { BsPlusLg } from "react-icons/bs";
import { Habit } from './types';
import { extractCategories, filterByAccess, filterByCategory, getHabitsToday } from '../services/helpers';
import { DropdownButton, Dropdown, OverlayTrigger, Popover, Badge, Spinner } from 'react-bootstrap';
import { BiFolder } from 'react-icons/bi';
import { GoPrimitiveDot, GoCheck, GoX } from 'react-icons/go';
import { RiArrowDropDownLine, RiArrowGoBackFill } from 'react-icons/ri';
import { VscTypeHierarchySuper } from 'react-icons/vsc';

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
}
const HabitsList = ({ viewerStatus, setViewerStatus, creatorStatus, setCreatorStatus, habitsFetched, setHabitsFetched,
  habitsArray, setHabitsArray, isEdit, setIsEdit, habitToView, setHabitToView, newEntryCr, setNewEntryCr,
  habitsToday, setHabitsToday
}: Props) => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  if (webId === undefined) {
    throw new Error("error when trying to get webId");
  }
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentAccess, setCurrentAccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [habitsToShow, setHabitsToShow] = useState<Habit[]>([]);
  const [categoryArray, setCategoryArray] = useState<string[]>([]);
  const [activeHabit, setActiveHabit] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<string>("today");
  const accessArray = ["public", "private", "shared"];
  useEffect(() => {

    // const perfSave = async () => {
    //   if (doNoteSave || arrOfChanges.length !== 0) {
    //     if (doNoteSave) {
    //       await saveNote(webId, fetch, NoteInp);
    //     }
    //     else if (arrOfChanges.length !== 0) {
    //       await editNote(webId, fetch, NoteInp, arrOfChanges);
    //     }

    //     if (Object.keys(accUpdObj).length !== 0) {
    //       if (accUpdObj["public"]) {
    //         await setPubAccess(webId, publicAccess, noteToView!.url, fetch);
    //       }
    //       else if (accUpdObj["agent"]) {
    //         for (let item in agentsToUpd) {
    //           await shareWith(webId, noteToView!.url, fetch, agentsToUpd[item], item);

    //         }
    //       }

    //     }

    //     setCreatorStatus(false);
    //     setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
    //     setIsEdit(false);
    //     setArrOfChanges([]);
    //     setDoNoteSave(false);
    //   }
    // }
    const fetchNotes = async (otherId?: string) => {
      let filteredHabits: Habit[]
      if (!habitsFetched) {
        let habitArr = await fetchAllEntries(webId, fetch, "habit");
        let transformedArr = await Promise.all(habitArr.map(async (thing) => {
          return await thingToHabit(thing, webId, fetch);
        }));
        transformedArr = transformedArr.filter((item) => item !== null) as Habit[];
        let updType = transformedArr as Habit[];
        setHabitsArray(updType);
        setHabitsFetched(true);
        filteredHabits = updType;
      }
      else {
        filteredHabits = habitsArray;
      }
      let extr = extractCategories(filteredHabits);
      setCategoryArray(extr);
      if (currentCategory || currentAccess) {
        if (currentCategory) filteredHabits = filterByCategory(filteredHabits, currentCategory);
        if (currentAccess) filteredHabits = filterByAccess(filteredHabits, currentAccess);

        if (currentView === 'today') {
          filteredHabits = getHabitsToday(filteredHabits);
          let temp = habitsArray;
          filteredHabits.forEach((habit) => {
            temp.map((habit2) => {
              if (habit.id === habit2.id) habit2.status = habit.status;
              return habit2;
            });
          });
          setHabitsArray(temp);
        }
      }
      setHabitsToShow(filteredHabits);
      setIsLoading(false);

    }

    fetchNotes();

  }, [newEntryCr, currentCategory, currentAccess, currentView]);
  const handleCreate = () => {
    setViewerStatus(false);
    setCreatorStatus(true);
  };

  if (!habitsFetched || isLoading) {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    )
  }
  else {
    if ((habitsToShow.length === 0) && !(currentAccess || currentCategory)) {

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
              title={<div><VscTypeHierarchySuper /> {currentAccess ? currentAccess : "access type"} <RiArrowDropDownLine /></div>}
            >
              {
                accessArray.map((access) => {
                  return <Dropdown.Item href="" key={Date.now() + Math.floor(Math.random() * 1000)}
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
                  categoryArray.map((category) => {
                    return <Dropdown.Item href="" key={Date.now() + Math.floor(Math.random() * 1000)}
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
            <OverlayTrigger placement="left" overlay={
              <Popover>
                <Popover.Body className="py-1 px-1">
                  Create a new note
                </Popover.Body>
              </Popover>}>
              <a className="btn btn-secondary ms-auto my-1 d-flex align-items-center justify-content-center" onClick={handleCreate}><BsPlusLg /></a>
            </OverlayTrigger>
          </div>
          <div className="list-group w-100 h-80">
            {
              habitsToShow.length !== 0 && <div className="list-group" style={{ maxHeight: '80%', overflow: 'auto' }}>
                {
                  habitsToShow.map((habit) => {
                    return <a
                      key={`${habit.id}${Date.now() + Math.floor(Math.random() * 1000)}`}
                      className={`list-group-item px-1 list-group-item-action ${activeHabit === habit.id ? 'active' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEdit(false);
                        setActiveHabit(habit.id);
                        setHabitToView(habit);
                        setViewerStatus(true);
                        setCreatorStatus(false);
                      }}
                    >
                      <div style={{ display: "inline-block" }}>
                        {habit.category && <Badge pill bg="info" className="me-1">{habit.category}</Badge>}
                      </div>
                      <div style={{ display: "inline-block" }}>
                        {!habit.category && <Badge pill bg="info" className="me-1">no category</Badge>}
                      </div>
                      {habit.access && <OverlayTrigger placement="right" overlay={
                        <Popover>
                          <Popover.Body className="py-1 px-1">
                            {(habit!.access![Object.keys(habit!.access!)[0]].read) ?
                              (<div>read: <GoCheck /></div>) : (<div>read: <GoX /></div>)}
                            {(habit!.access![Object.keys(habit!.access!)[0]].append) ?
                              (<div>append: <GoCheck /></div>) : (<div>append: <GoX /></div>)}
                            {(habit!.access![Object.keys(habit!.access!)[0]].write) ?
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
                                Object.keys(habit!.shareList!).map((key, index) => {
                                  return <div key={Date.now() + Math.floor(Math.random() * 1000)}>
                                    <div> {key} :</div>
                                    <div className="d-flex justify-content-between">
                                      {(habit!.shareList![key].read) ?
                                        (<div style={{ display: "inline" }}>read: <GoCheck /></div>) : (<div style={{ display: "inline" }}>read: <GoX /></div>)}
                                      {(habit!.shareList![key].append) ?
                                        (<div style={{ display: "inline" }}>append: <GoCheck /></div>) : (<div style={{ display: "inline" }}>append: <GoX /></div>)}
                                      {(habit!.shareList![key].write) ?
                                        (<div style={{ display: "inline" }}>write: <GoCheck /></div>) : (<div style={{ display: "inline" }}>write: <GoX /></div>)}
                                    </div>
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
                    </a>

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
        </div>
      )
    }
  }
}

export default HabitsList