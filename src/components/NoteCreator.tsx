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
import { setPubAccess, shareWith } from "../services/access";

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
    notesArray: Note[];
    setNotesArray: React.Dispatch<React.SetStateAction<Note[]>>;
}
//component of creation and saving a note the user's pod
const NoteCreator = ({ newEntryCr, setNewEntryCr, noteToView,
    setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit,
    setCreatorStatus, creatorStatus, categoryArray, setCategoryArray, doNoteSave, setDoNoteSave, NoteInp,
    setNoteInp, arrOfChanges, setArrOfChanges, accUpdObj, setAccUpdObj, agentsToUpd, setAgentsToUpd,
    publicAccess, setPublicAccess, notesArray, setNotesArray
}: Props) => {

    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (!webId) {
        throw new Error("Error, couldn't get your webId");
    }
    const [categoryModalState, setCategoryModalState] = useState<boolean>(false);
    const [accessModalState, setAccessModalState] = useState<boolean>(false);
    const [sharedModalState, setSharedModalState] = useState<boolean>(false);
    const [contactsList, setContactsList] = useState<{ [x: string]: AccessModes; }>({});

    useEffect(() => {

        if (arrOfChanges.length !== 0) {
            handleSave();
        }
        if (viewerStatus) {
            // handle 
            setNoteInp(noteToView!);
        }
        else {
            setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
            setIsEdit(true);
        }
    }, [viewerStatus, noteToView, creatorStatus]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNoteInp(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
        if (!arrOfChanges.includes(e.target.name)) {
            setArrOfChanges((prevState) => ([...prevState, e.target.name]));
        }
    };

    const handleSave = async () => {
        setIsEdit(false);
        setViewerStatus(false);
        if (creatorStatus) {
            setCreatorStatus(false);
            let newNote = { ...NoteInp, id: Date.now() + Math.floor(Math.random() * 1000), access: { "private": { read: false, append: false, write: false } } }
            setNoteInp(newNote);
            setNotesArray((prevState) => ([...prevState, newNote]));
            setNewEntryCr(!newEntryCr);
            setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
            setArrOfChanges([]);
            await saveNote(webId, fetch, NoteInp);
        }
        else if (arrOfChanges.length !== 0 || Object.keys(accUpdObj).length !== 0) {
            let noteToUpd = NoteInp;
            if (Object.keys(accUpdObj).length !== 0) {
                if (accUpdObj["public"]) {
                    let newAccess: Record<string, AccessModes>;
                    if (!publicAccess.read && !publicAccess.append && !publicAccess.write) {
                        newAccess = { "private": publicAccess };

                    }
                    else {
                        newAccess = { "public": publicAccess };
                    }
                    noteToUpd = { ...noteToUpd, access: newAccess };
                }
                if (accUpdObj["agent"]) {
                    let updShareList: Record<string, AccessModes> | undefined;
                    if (noteToUpd.shareList) {
                        updShareList = { ...noteToUpd.shareList, ...agentsToUpd };
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

                    noteToUpd = { ...noteToUpd, shareList: updShareList }
                }
                setAccUpdObj({});
            }
            let index = notesArray.findIndex(item => item.id === noteToUpd.id);
            let updArr = notesArray;
            updArr[index] = noteToUpd;
            setNotesArray(updArr);
            setNewEntryCr(!newEntryCr);
            setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
            setArrOfChanges([]);
            if (arrOfChanges.length !== 0) {
                await editNote(webId, fetch, NoteInp, arrOfChanges);
            }
        }

        if (Object.keys(accUpdObj).length !== 0) {
            if (accUpdObj["public"]) {
                await setPubAccess(webId, publicAccess, NoteInp!.url, fetch);
            }
            else if (accUpdObj["agent"]) {

                for (let item in agentsToUpd) {
                    await shareWith(webId, NoteInp!.url, fetch, agentsToUpd[item], item);

                }
            }
        }
    };

    const handleEdit = () => {
        isEdit ? setIsEdit(false) : setIsEdit(true);
    }

    const handleDelete = async () => {
        setIsEdit(false);
        setViewerStatus(false);
        setCreatorStatus(false);
        let updArr = notesArray.filter((note) => note.id !== NoteInp.id);
        setNotesArray(updArr);
        newEntryCr ? setNewEntryCr(false) : setNewEntryCr(true);
        await deleteNote(webId ?? "", fetch, NoteInp.id!);


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
                        <Dropdown.Item onClick={() => (setCategoryModalState(true))}>
                            <BiFolderPlus /> set category
                        </Dropdown.Item>
                        {viewerStatus && <Dropdown.Item onClick={() => (setAccessModalState(true))}><BsShare /> share</Dropdown.Item>}
                        {viewerStatus && noteToView?.shareList &&
                            <Dropdown.Item onClick={() => (setSharedModalState(true))}>
                                <RiUserSharedLine /> shared list
                            </Dropdown.Item>}
                        {viewerStatus && <Dropdown.Item onClick={handleDelete}
                            style={{ color: "red" }}
                        ><RiDeleteBin6Line /> delete</Dropdown.Item>}
                    </DropdownButton>
                </ButtonGroup>

            </InputGroup>
            <FormControl {...(!isEdit && { disabled: true })} as="textarea" aria-label="textarea" style={{ 'resize': 'none', 'height': '80%' }}
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
                publicAccess={publicAccess}
                setPublicAccess={setPublicAccess}
                contactsList={contactsList}
                setContactsList={setContactsList}
                accessModalState={accessModalState}
                setAccessModalState={setAccessModalState}
                setNoteInp={setNoteInp}
                NoteInp={NoteInp}
                setArrOfChanges={setArrOfChanges}
            />
            <SharedModal
                agentsToUpd={agentsToUpd}
                setAgentsToUpd={setAgentsToUpd}
                accUpdObj={accUpdObj}
                setAccUpdObj={setAccUpdObj}
                publicAccess={publicAccess}
                setPublicAccess={setPublicAccess}
                noteToView={noteToView}
                setNoteToView={setNoteToView}
                sharedModalState={sharedModalState}
                setSharedModalState={setSharedModalState}
                setNoteInp={setNoteInp}
                NoteInp={NoteInp}
                setArrOfChanges={setArrOfChanges}
                viewerStatus={viewerStatus}
                categoryArray={categoryArray}
                setCategoryArray={setCategoryArray}
            />
        </div>
    )
}

export default NoteCreator;

