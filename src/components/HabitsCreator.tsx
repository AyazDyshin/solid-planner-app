import "../styles.css";
import { Button, ButtonGroup, Dropdown, DropdownButton, FormControl, InputGroup } from 'react-bootstrap';
import { accessObject, Habit } from './types';
import { BsThreeDots, BsShare } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line, RiUserSharedLine } from "react-icons/ri";
import { BiFolderPlus } from "react-icons/bi";
import { MdSaveAlt } from "react-icons/md";
import { useEffect } from "react";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { publicAccess } from "rdf-namespaces/dist/schema";
import { setPubAccess, shareWith } from "../services/access";
import { saveHabit, editNote } from "../services/SolidPod";
import { useSession } from "@inrupt/solid-ui-react";
import { constructDate } from "../services/helpers";
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
}
const HabitsCreator = ({ habitInp, setHabitInp, arrOfChanges, setArrOfChanges, isEdit, setIsEdit, creatorStatus, setCreatorStatus,
  viewerStatus, setViewerStatus, habitToView, setHabitToView, habitsArray, setHabitsArray, newEntryCr, setNewEntryCr,
  accUpdObj, setAccUpdObj, publicAccess, setPublicAccess, agentsToUpd, setAgentsToUpd
}: Props) => {
  const { session, fetch } = useSession();
  const { webId } = session.info;
  if (webId === undefined) {
    throw new Error("error when trying to get webId");
  }
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
        currentStreak: null, status: false, category: null, url: null, access: null
      });
      setIsEdit(true);
    }
  }, [viewerStatus, habitToView, creatorStatus]);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHabitInp(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    if (!arrOfChanges.includes(e.target.name)) {
      setArrOfChanges((prevState) => ([...prevState, e.target.name]));
    }
  };

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
        currentStreak: null, status: false, category: null, url: null, access: null
      });
      setArrOfChanges([]);
      await saveHabit(webId, fetch, habitInp);
    }
    else if (arrOfChanges.length !== 0 || Object.keys(accUpdObj).length !== 0) {
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
      updArr[index] = habitToUpd;
      setHabitsArray(updArr);
      setNewEntryCr(!newEntryCr);
      setHabitInp({
        id: null, title: null, content: null, startDate: null, lastCheckInDate: null, recurrence: "daily", bestStreak: null,
        currentStreak: null, status: false, category: null, url: null, access: null
      });
      setArrOfChanges([]);
      if (arrOfChanges.length !== 0) {
        //  await editHabit(webId, fetch, habitInp, arrOfChanges);
      }
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

  const handleDelete = () => {

  };

  const handleEdit = () => {

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
            <Dropdown.Item href="" >
              <BiFolderPlus /> set category
            </Dropdown.Item>
            <Dropdown.Item href="" ><BsShare /> share</Dropdown.Item>
            {viewerStatus && habitInp.shareList &&
              <Dropdown.Item href="" >
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
            <InputGroup.Text id="basic-addon1" style={{ 'width': '50%' }}>{habitInp.recurrence}</InputGroup.Text>
            <div className="d-grid">
              <DropdownButton
                variant="outline-secondary"
                title="repeat"
                id="input-group-dropdown-1"
                className="w-100"
              >
                <Dropdown.Item href="#">Daily</Dropdown.Item>
                <Dropdown.Item href="#">Weekly</Dropdown.Item>
                <Dropdown.Item href="#">Custom</Dropdown.Item>
              </DropdownButton>
            </div>
          </InputGroup>
          {viewerStatus && <InputGroup className="w-100">
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>Date Created:</InputGroup.Text>
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>{constructDate(habitInp.startDate)}</InputGroup.Text>
          </InputGroup>}
          {viewerStatus && <InputGroup className="w-100">
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>Status:</InputGroup.Text>
            <div className="form-check form-switch d-flex justify-content-center align-items-center">
              <input className="form-check-input" type="checkbox" style={{ "transform": "scale(1.8)", "marginLeft": "0em" }}
                onChange={() => {
                  setHabitInp((prevState) => ({ ...prevState, status: !habitInp.status }));
                }}
                checked={habitInp.status}
                role="switch" id="flexSwitchCheckDefault" />
            </div>
          </InputGroup>}
          {viewerStatus && <InputGroup className="w-100">
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>Current streak:</InputGroup.Text>
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>{constructDate(habitInp.startDate)}</InputGroup.Text>
          </InputGroup>}
          {viewerStatus && <InputGroup className="w-100">
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>Best streak:</InputGroup.Text>
            <InputGroup.Text className="text-center" id="basic-addon1" style={{ 'width': '50%' }}>{constructDate(habitInp.startDate)}</InputGroup.Text>
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
    </div>
  );
}

export default HabitsCreator