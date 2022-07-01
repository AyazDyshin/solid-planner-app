import "../styles.css";
import { Button, ButtonGroup, Dropdown, DropdownButton, FormControl, InputGroup } from 'react-bootstrap';
import { accessObject, Habit } from './types';
import { BsThreeDots, BsShare } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line, RiUserSharedLine } from "react-icons/ri";
import { BiFolderPlus } from "react-icons/bi";
import { MdSaveAlt } from "react-icons/md";
import { useEffect, useState } from "react";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { publicAccess } from "rdf-namespaces/dist/schema";
import { setPubAccess, shareWith } from "../services/access";
import { saveHabit, editNote, deleteEntry, editHabit } from "../services/SolidPod";
import { useSession } from "@inrupt/solid-ui-react";
import { constructDate, setStreaks } from "../services/helpers";
import AccessModal from "../modals/AccessModal";
import CustomHabitModal from "../modals/CustomHabitModal";
import CategoryModal from "../modals/CategoryModal";
import SharedModal from "../modals/SharedModal";

interface Props {
  habitInp: Habit;
  setHabitInp: React.Dispatch<React.SetStateAction<Habit>>;
  arrOfChanges: string[];
  setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  viewerStatus: boolean;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
  creatorStatus: boolean;
  setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
  habitToView: Habit | null;
  setHabitToView: React.Dispatch<React.SetStateAction<Habit | null>>;
  habitsArray: Habit[];
  setHabitsArray: React.Dispatch<React.SetStateAction<Habit[]>>;
  newEntryCr: boolean;
  setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
  accUpdObj: {
    [x: string]: boolean;
  }
  setAccUpdObj: React.Dispatch<React.SetStateAction<{
    [x: string]: boolean;
  }>>;
  publicAccess: accessObject;
  setPublicAccess: React.Dispatch<React.SetStateAction<accessObject>>;
  agentsToUpd: {
    [x: string]: AccessModes;
  };
  setAgentsToUpd: React.Dispatch<React.SetStateAction<{
    [x: string]: AccessModes;
  }>>;
  categoryArray: string[];
  setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
}
const HabitsCreator = ({ habitInp, setHabitInp, arrOfChanges, setArrOfChanges, isEdit, setIsEdit, creatorStatus, setCreatorStatus,
  viewerStatus, setViewerStatus, habitToView, setHabitToView, habitsArray, setHabitsArray, newEntryCr, setNewEntryCr,
  accUpdObj, setAccUpdObj, publicAccess, setPublicAccess, agentsToUpd, setAgentsToUpd, categoryArray, setCategoryArray
}: Props) => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  if (webId === undefined) {
    throw new Error("error when trying to get webId");
  }
  const [customHabitModalState, setCustomHabitModalState] = useState<boolean>(false);
  const [categoryModalState, setCategoryModalState] = useState<boolean>(false);
  const [habitChanged, setHabitChanged] = useState<boolean>(false);
  const [accessModalState, setAccessModalState] = useState<boolean>(false);
  const [contactsList, setContactsList] = useState<{ [x: string]: AccessModes; }>({});
  const [sharedModalState, setSharedModalState] = useState<boolean>(false);
  useEffect(() => {
    if (arrOfChanges.length !== 0) {
      handleSave();
    }
    if (viewerStatus) {
      // handle 
      setHabitInp(habitToView!);
    }
    else {
      setHabitInp({
        id: null, title: null, content: null, startDate: null, lastCheckInDate: null, recurrence: "daily", bestStreak: null,
        currentStreak: null, stat: false, category: null, url: null, access: null
      });
      setIsEdit(true);
    }
  }, [viewerStatus, habitToView, creatorStatus]);


  const handleSave = async () => {
    setIsEdit(false);
    setViewerStatus(false);
    if (creatorStatus) {
      setCreatorStatus(false);
      let date = new Date();
      let newHabit = {
        ...habitInp, id: Date.now() + Math.floor(Math.random() * 1000), startDate: date,
        access: { "private": { read: false, append: false, write: false } }
      }
      setHabitInp(newHabit);
      setHabitsArray((prevState) => ([...prevState, newHabit]));
      setNewEntryCr(!newEntryCr);
      setHabitInp({
        id: null, title: null, content: null, startDate: null, lastCheckInDate: null, recurrence: "daily", bestStreak: null,
        currentStreak: null, stat: false, category: null, url: null, access: null
      });
      setArrOfChanges([]);
      await saveHabit(webId, fetch, habitInp);
    }
    else if (arrOfChanges.length !== 0 || Object.keys(accUpdObj).length !== 0 || habitChanged) {
      let habitToUpd = habitInp;
      if (Object.keys(accUpdObj).length !== 0) {
        if (accUpdObj["public"]) {
          let newAccess: Record<string, AccessModes>;
          if (!publicAccess.read && !publicAccess.append && !publicAccess.write) {
            newAccess = { "private": publicAccess };

          }
          else {
            newAccess = { "public": publicAccess };
          }
          habitToUpd = { ...habitToUpd, access: newAccess };
        }
        if (accUpdObj["agent"]) {
          let updShareList: Record<string, AccessModes> | undefined;
          if (habitToUpd.shareList) {
            updShareList = { ...habitToUpd.shareList, ...agentsToUpd };
          }
          else {
            updShareList = agentsToUpd;
          }
          let b = Object.keys(updShareList);
          Object.keys(updShareList).map((key) => {
            if (!updShareList![key].read && !updShareList![key].append && !updShareList![key].write) {
              delete updShareList![key];
            }
          });
          if (Object.keys(updShareList).length === 0) updShareList = undefined;

          habitToUpd = { ...habitToUpd, shareList: updShareList }
        }
        setAccUpdObj({});
      }
      let index = habitsArray.findIndex(item => item.id === habitToUpd.id);
      let updArr = habitsArray;
      habitToUpd = setStreaks(habitToUpd);
      updArr[index] = habitToUpd;
      setHabitsArray(updArr);
      setNewEntryCr(!newEntryCr);

      if (arrOfChanges.length !== 0 || habitChanged) {
        await editHabit(webId, fetch, habitInp);
      }
      setHabitInp({
        id: null, title: null, content: null, startDate: null, lastCheckInDate: null, recurrence: "daily", bestStreak: null,
        currentStreak: null, stat: null, category: null, url: null, access: null
      });
      setArrOfChanges([]);
    }

    if (Object.keys(accUpdObj).length !== 0) {
      if (accUpdObj["public"]) {
        await setPubAccess(webId, publicAccess, habitInp!.url!, fetch);
      }
      else if (accUpdObj["agent"]) {

        for (let item in agentsToUpd) {
          await shareWith(webId, habitInp!.url!, fetch, agentsToUpd[item], item);

        }
      }
    }
  };

  const handleDelete = async () => {
    setIsEdit(false);
    setViewerStatus(false);
    setCreatorStatus(false);
    let updArr = habitsArray.filter((habit) => habit.id !== habitInp.id);
    setHabitsArray(updArr);
    newEntryCr ? setNewEntryCr(false) : setNewEntryCr(true);
    await deleteEntry(webId ?? "", fetch, habitInp.id!, "habit");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHabitInp(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    if (!arrOfChanges.includes(e.target.name)) {
      setArrOfChanges((prevState) => ([...prevState, e.target.name]));
    }
  };

  const handleEdit = () => {
    isEdit ? setIsEdit(false) : setIsEdit(true);

  };

  return (
    <div className="h-100">
      <InputGroup className="mb-2 mt-2">
        <InputGroup.Text id="basic-addon1">Title:</InputGroup.Text>
        <FormControl
          name="title"
          aria-label="title"
          value={habitInp.title === null ? "" : habitInp.title}
          {...(!isEdit && { disabled: true })}
          onChange={handleChange} />

        <ButtonGroup>
          <Button variant="secondary" onClick={handleSave}><MdSaveAlt /> save</Button>
          <DropdownButton className="dropNoIcon"
            variant="outline-secondary"
            title={<BsThreeDots />}
            id="input-group-dropdown-1"
          >
            {viewerStatus && <Dropdown.Item onClick={handleEdit}><FiEdit /> edit</Dropdown.Item>}
            <Dropdown.Item onClick={() => (setCategoryModalState(true))}>
              <BiFolderPlus /> set category
            </Dropdown.Item>
            {viewerStatus && <Dropdown.Item onClick={() => { setAccessModalState(true) }} ><BsShare /> share</Dropdown.Item>}
            {viewerStatus && habitInp.shareList &&
              <Dropdown.Item onClick={() => (setSharedModalState(true))} >
                <RiUserSharedLine /> shared list
              </Dropdown.Item>}
            {viewerStatus && <Dropdown.Item onClick={handleDelete}
              style={{ color: "red" }}
            ><RiDeleteBin6Line /> delete</Dropdown.Item>}
          </DropdownButton>
        </ButtonGroup>

      </InputGroup>
      <div className="d-flex">
        <div className="d-flex-column w-50">
          <InputGroup className="w-100">
            <InputGroup.Text id="basic-addon1" style={{ 'width': '50%' }}>repeat</InputGroup.Text>
            <div className="d-grid">
              <DropdownButton
                variant="outline-secondary"
                title={habitInp.recurrence}
                id="input-group-dropdown-1"
                className="w-100"
                {...(!isEdit && { disabled: true })}
              >
                <Dropdown.Item onClick={() => {
                  setHabitInp(prevState => ({ ...prevState, recurrence: 'daily' }));
                  setHabitInp(prevState => ({ ...prevState, custom: null }));

                  setHabitChanged(true);
                }}>daily</Dropdown.Item>
                <Dropdown.Item onClick={() => {
                  setHabitInp(prevState => ({ ...prevState, recurrence: 'weekly' }));
                  setHabitInp(prevState => ({ ...prevState, custom: null }));
                  setHabitChanged(true);
                }}>weekly</Dropdown.Item>
                <Dropdown.Item onClick={() => {
                  setHabitInp(prevState => ({ ...prevState, recurrence: 'monthly' }));
                  setHabitInp(prevState => ({ ...prevState, custom: null }));
                  setHabitChanged(true);
                }}>monthly</Dropdown.Item>
                <Dropdown.Item onClick={() => {
                  setHabitInp(prevState => ({ ...prevState, recurrence: 'yearly' }));
                  setHabitInp(prevState => ({ ...prevState, custom: null }));
                  setHabitChanged(true);
                }}>yearly</Dropdown.Item>
                <Dropdown.Item onClick={() => {
                  setHabitInp(prevState => ({ ...prevState, recurrence: 'custom' }))
                  setCustomHabitModalState(true);
                  setHabitChanged(true);
                }}>custom</Dropdown.Item>
              </DropdownButton>
            </div>
          </InputGroup>
          {viewerStatus && <InputGroup className="w-100">
            <InputGroup.Text  {...(!isEdit && { disabled: true })}
              className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>Date Created:</InputGroup.Text>
            <InputGroup.Text style={{ 'width': '50%' }}>
              {habitInp.startDate ? constructDate(habitInp.startDate) : constructDate(new Date())}</InputGroup.Text>
          </InputGroup>}
          {viewerStatus && <InputGroup className="w-100">
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>Status:</InputGroup.Text>
            <div className="form-check form-switch d-flex justify-content-center align-items-center disabled">
              <input className="form-check-input" {...(!isEdit && { disabled: true })} type="checkbox" style={{ "transform": "scale(1.6)", "marginLeft": "-0.5em" }}
                onChange={() => {
                  setHabitInp((prevState) => ({ ...prevState, stat: !habitInp.stat }));
                  console.log("hereeee");
                  console.log(habitInp.stat);
                  setHabitChanged(true);
                }}
                checked={habitInp.stat!}
                role="switch" id="flexSwitchCheckDefault" />
            </div>
          </InputGroup>}
          {viewerStatus && <InputGroup className="w-100">
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>Current streak:</InputGroup.Text>
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>
              {habitInp.currentStreak ? habitInp.currentStreak : "0"}
            </InputGroup.Text>
          </InputGroup>}
          {viewerStatus && <InputGroup className="w-100">
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>Best streak:</InputGroup.Text>
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>
              {habitInp.bestStreak ? habitInp.bestStreak : "0"}
            </InputGroup.Text>
          </InputGroup>}
        </div>
        <FormControl {...(!isEdit && { disabled: true })} as="textarea" aria-label="textarea"
          style={{ 'resize': 'none', 'height': '80%', 'boxSizing': 'border-box', 'width': '50%' }}
          name="content"
          className="ms-2"
          value={habitInp.content === null ? "" : habitInp.content}
          onChange={handleChange}
        />
      </div>
      <CustomHabitModal
        customHabitModalState={customHabitModalState}
        setCustomHabitModalState={setCustomHabitModalState}
        habitInp={habitInp}
        setHabitInp={setHabitInp}
      />
      <CategoryModal
        setArrOfChanges={setArrOfChanges}
        categoryArray={categoryArray}
        setCategoryArray={setCategoryArray}
        habitInp={habitInp}
        setHabitInp={setHabitInp}
        viewerStatus={viewerStatus}
        categoryModalState={categoryModalState}
        setCategoryModalState={setCategoryModalState}
      />
      <AccessModal
        agentsToUpd={agentsToUpd}
        setAgentsToUpd={setAgentsToUpd}
        accUpdObj={accUpdObj}
        contactsList={contactsList}
        setContactsList={setContactsList}
        setAccUpdObj={setAccUpdObj}
        publicAccess={publicAccess}
        setPublicAccess={setPublicAccess}
        accessModalState={accessModalState}
        setAccessModalState={setAccessModalState}
        setHabitInp={setHabitInp}
        habitInp={habitInp}
        setArrOfChanges={setArrOfChanges}
      />

      <SharedModal
        agentsToUpd={agentsToUpd}
        setAgentsToUpd={setAgentsToUpd}
        accUpdObj={accUpdObj}
        setAccUpdObj={setAccUpdObj}
        publicAccess={publicAccess}
        setPublicAccess={setPublicAccess}
        sharedModalState={sharedModalState}
        setSharedModalState={setSharedModalState}
        setHabitInp={setHabitInp}
        habitInp={habitInp}
        setArrOfChanges={setArrOfChanges}
        viewerStatus={viewerStatus}
        categoryArray={categoryArray}
        setCategoryArray={setCategoryArray}
      />
    </div>
  );
}

export default HabitsCreator