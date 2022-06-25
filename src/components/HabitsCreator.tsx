import "../styles.css";
import { Button, ButtonGroup, Dropdown, DropdownButton, FormControl, InputGroup } from 'react-bootstrap';
import { Habit } from './types';
import { BsThreeDots, BsShare } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line, RiUserSharedLine } from "react-icons/ri";
import { BiFolderPlus } from "react-icons/bi";
import { MdSaveAlt } from "react-icons/md";
import { useEffect } from "react";
interface Props {
  habitInp: Habit;
  setHabitInp: React.Dispatch<React.SetStateAction<Habit>>;
  arrOfChanges: string[];
  setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
  isEdit: boolean;
  setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
  viewerStatus: boolean;
  setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
const HabitsCreator = ({ habitInp, setHabitInp, arrOfChanges, setArrOfChanges, isEdit, setIsEdit,
  viewerStatus, setViewerStatus }: Props) => {
  useEffect(() => {
    setHabitInp({
      id: null, title: null, content: null, startDate: null, lastCheckInDate: null, recurrence: null, bestStreak: null,
      currentStreak: null, status: null, category: null, url: null, access: null
    });
    setIsEdit(true);
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHabitInp(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    if (!arrOfChanges.includes(e.target.name)) {
      setArrOfChanges((prevState) => ([...prevState, e.target.name]));
    }
  };

  const handleSave = () => {

  };

  const handleDelete = () => {

  };

  const handleEdit = () => {

  };

  return (
    <div>
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
      <InputGroup>
      <InputGroup.Text id="basic-addon1">Repeat:</InputGroup.Text>
      <DropdownButton
          variant="outline-secondary"
          title="Dropdown"
          id="input-group-dropdown-1"
        >
          <Dropdown.Item href="#">Daily</Dropdown.Item>
          <Dropdown.Item href="#">Weekly</Dropdown.Item>
          <Dropdown.Item href="#">Custom</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item href="#">Separated link</Dropdown.Item>
        </DropdownButton>
      </InputGroup>
      <FormControl {...(!isEdit && { disabled: true })} as="textarea" aria-label="textarea"
        style={{ 'resize': 'none', 'height': '91%' }}
        name="content"
        value={habitInp.content === null ? "" : habitInp.content}
        onChange={handleChange}
      />
    </div>
  );
}

export default HabitsCreator