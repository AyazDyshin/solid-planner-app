import "../styles.css";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { InputGroup, FormControl, Button, ButtonGroup, DropdownButton, Dropdown } from "react-bootstrap";
import CategoryModal from "../modals/CategoryModal";
import { deleteNote, editNote, saveNote, thingToNote } from "../services/SolidPod";
import { accessObject, Note } from "./types";
import { BsThreeDots, BsShare } from "react-icons/bs";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBin6Line, RiUserSharedLine } from "react-icons/ri";
import { BiFolderPlus } from "react-icons/bi";
import { MdSaveAlt } from "react-icons/md";
import AccessModal from "../modals/AccessModal";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import SharedModal from "../modals/SharedModal";

interface Props {
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    noteToView: Note | null;
    setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    creatorStatus: boolean;
    categoryArray: string[];
    setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
    doNoteSave: boolean;
    setDoNoteSave: React.Dispatch<React.SetStateAction<boolean>>;
    NoteInp: Note;
    setNoteInp: React.Dispatch<React.SetStateAction<Note>>;
    arrOfChanges: string[];
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
    publicAccess: accessObject;
    setPublicAccess: React.Dispatch<React.SetStateAction<accessObject>>;
    contactsList: {
        [x: string]: AccessModes;
    };
    setContactsList: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
    sharedList: Record<string, AccessModes>;
    setSharedList: React.Dispatch<React.SetStateAction<Record<string, AccessModes>>>;
    fullContacts: {
        [x: string]: string | null;
    };
    setFullContacts: React.Dispatch<React.SetStateAction<{
        [x: string]: string | null;
    }>>;
    accUpdObj: {
        [x: string]: boolean;
    };
    setAccUpdObj: React.Dispatch<React.SetStateAction<{
        [x: string]: boolean;
    }>>;
    agentsToUpd: {
        [x: string]: AccessModes;
    };
    setAgentsToUpd: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
}
//component of creation and saving a note the user's pod
const NoteCreator = ({ newEntryCr, setNewEntryCr, noteToView,
    setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit,
    setCreatorStatus, creatorStatus, categoryArray, setCategoryArray, doNoteSave, setDoNoteSave, NoteInp,
    setNoteInp, arrOfChanges, setArrOfChanges, accUpdObj, setAccUpdObj, agentsToUpd, setAgentsToUpd,
    publicAccess, setPublicAccess, contactsList, setContactsList, sharedList, setSharedList,
    fullContacts, setFullContacts
}: Props) => {

    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [categoryModalState, setCategoryModalState] = useState<boolean>(false);
    const [accessModalState, setAccessModalState] = useState<boolean>(false);
    const [sharedModalState, setSharedModalState] = useState<boolean>(false);

    useEffect(() => {

        if (arrOfChanges.length !== 0) {
            handleSave();
        }
        if (arrOfChanges.length === 0) {
            if (viewerStatus) {
                // handle 
                setNoteInp(noteToView!);
            }
            else {
                setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
                setIsEdit(true);
            }
        }
    }, [viewerStatus, noteToView]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNoteInp(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
        if (!arrOfChanges.includes(e.target.name)) {
            setArrOfChanges((prevState) => ([...prevState, e.target.name]));
        }

    };

    const handleSave = () => {
        setIsEdit(false);
        setCreatorStatus(false);
        setViewerStatus(false);
        setDoNoteSave(true);
        newEntryCr ? setNewEntryCr(false) : setNewEntryCr(true);
    };

    const handleEdit = () => {
        isEdit ? setIsEdit(false) : setIsEdit(true);
    }

    const handleDelete = async () => {
        await deleteNote(webId ?? "", fetch, NoteInp.id!);
        newEntryCr ? setNewEntryCr(false) : setNewEntryCr(true);
        setIsEdit(false);
        setViewerStatus(false);
        setCreatorStatus(false);
    }

    return (
        <div>
            <InputGroup className="mb-2 mt-2">
                <InputGroup.Text id="basic-addon1">Title:</InputGroup.Text>
                <FormControl
                    name="title"
                    aria-label="title"
                    value={NoteInp.title === null ? "" : NoteInp.title}
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
                        <Dropdown.Item href="" onClick={() => (setCategoryModalState(true))}>
                            <BiFolderPlus /> set category
                        </Dropdown.Item>
                        <Dropdown.Item href="" onClick={() => (setAccessModalState(true))}><BsShare /> share</Dropdown.Item>
                        {viewerStatus && noteToView?.shareList &&
                            <Dropdown.Item href="" onClick={() => (setSharedModalState(true))}>
                                <RiUserSharedLine /> shared list
                            </Dropdown.Item>}
                        {viewerStatus && <Dropdown.Item onClick={handleDelete}
                            style={{ color: "red" }}
                        ><RiDeleteBin6Line /> delete</Dropdown.Item>}
                    </DropdownButton>
                </ButtonGroup>

            </InputGroup>
            <FormControl {...(!isEdit && { disabled: true })} as="textarea" aria-label="textarea" style={{ 'resize': 'none', 'height': '91%' }}
                name="content"
                value={NoteInp.content === null ? "" : NoteInp.content}
                onChange={handleChange}
            />
            <CategoryModal
                categoryModalState={categoryModalState}
                setCategoryModalState={setCategoryModalState}
                setNoteInp={setNoteInp}
                noteInp={NoteInp}
                setArrOfChanges={setArrOfChanges}
                viewerStatus={viewerStatus}
                categoryArray={categoryArray}
                setCategoryArray={setCategoryArray}
            />
            <AccessModal
                agentsToUpd={agentsToUpd}
                setAgentsToUpd={setAgentsToUpd}
                accUpdObj={accUpdObj}
                setAccUpdObj={setAccUpdObj}
                fullContacts={fullContacts}
                setFullContacts={setFullContacts}
                publicAccess={publicAccess}
                setPublicAccess={setPublicAccess}
                contactsList={contactsList}
                setContactsList={setContactsList}
                sharedList={sharedList}
                setSharedList={setSharedList}
                accessModalState={accessModalState}
                setAccessModalState={setAccessModalState}
                setNoteInp={setNoteInp}
                noteInp={NoteInp}
                setArrOfChanges={setArrOfChanges}
                viewerStatus={viewerStatus}
                noteToView={noteToView}
                setNoteToView={setNoteToView}
            />
            <SharedModal
                agentsToUpd={agentsToUpd}
                setAgentsToUpd={setAgentsToUpd}
                accUpdObj={accUpdObj}
                setAccUpdObj={setAccUpdObj}
                sharedList={sharedList}
                setSharedList={setSharedList}
                publicAccess={publicAccess}
                setPublicAccess={setPublicAccess}
                noteToView={noteToView}
                setNoteToView={setNoteToView}
                sharedModalState={sharedModalState}
                setSharedModalState={setSharedModalState}
                setNoteInp={setNoteInp}
                noteInp={NoteInp}
                setArrOfChanges={setArrOfChanges}
                viewerStatus={viewerStatus}
                categoryArray={categoryArray}
                setCategoryArray={setCategoryArray}
            />
        </div>
    )
}

export default NoteCreator;

