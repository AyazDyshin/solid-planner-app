import "../styles.css";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { InputGroup, FormControl, Button, ButtonGroup, DropdownButton, Dropdown } from "react-bootstrap";
import CategoryModal from "../modals/CategoryModal";
import { deleteEntry, editNote, saveNote } from "../services/SolidPod";
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
import React from 'react';

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
    storagePref: string;
    defFolder: string | null;
    prefFileLocation: string;
    podType: string;
    publicTypeIndexUrl: string;
}
//component of creation and saving a note the user's pod
const NoteCreator = ({ newEntryCr, setNewEntryCr, noteToView, storagePref, defFolder, podType, publicTypeIndexUrl,
    setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, prefFileLocation,
    setCreatorStatus, creatorStatus, categoryArray, setCategoryArray, doNoteSave, setDoNoteSave, NoteInp,
    setNoteInp, accUpdObj, setAccUpdObj, agentsToUpd, setAgentsToUpd,
    publicAccess, setPublicAccess, notesArray, setNotesArray
}: Props) => {

    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (!webId) {
        throw new Error(`Error, couldn't get user's WebId`);
    }
    const [categoryModalState, setCategoryModalState] = useState<boolean>(false);
    const [accessModalState, setAccessModalState] = useState<boolean>(false);
    const [sharedModalState, setSharedModalState] = useState<boolean>(false);
    const [contactsList, setContactsList] = useState<{ [x: string]: AccessModes; }>({});
    const [noteChanged, setNoteChanged] = useState<boolean>(false);
    useEffect(() => {

        if (noteChanged) {
            handleSave();
        }
        if (viewerStatus) {
            if (!noteToView) {
                throw new Error("Error, note to view wasn't provided");
            }
            setNoteInp(noteToView);
        }
        else {
            setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
            setIsEdit(true);
        }
    }, [viewerStatus, noteToView, creatorStatus]);

    const handleSave = async () => {
        setIsEdit(false);

        if (creatorStatus) {
            setViewerStatus(false);
            setCreatorStatus(false);
            let idToSave = Date.now() + Math.floor(Math.random() * 1000);
            let newNote = {
                ...NoteInp, url: `${defFolder}notes/${idToSave}.ttl`, id: idToSave,
                access: { "private": { read: false, append: false, write: false } }
            }
            // if (newNote.url === null) setNoteInp((prevState) => ({ ...prevState, url: `${defFolder}notes/${idToSave}.ttl` }));

            setNoteInp(newNote);
            setNotesArray((prevState) => ([...prevState, newNote]));
            setNewEntryCr(!newEntryCr);
            setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
            setNoteChanged(false);
            await saveNote(webId, fetch, newNote, storagePref, defFolder, prefFileLocation, podType);
        }
        else if (viewerStatus && (noteChanged || Object.keys(accUpdObj).length !== 0)) {
            setViewerStatus(false);
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
                        //handle
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
            let newNote = NoteInp;
            setNoteInp({ id: null, title: "", content: "", category: "", url: "", access: null });
            if (noteChanged) {
                setNoteChanged(false);
                if (!newNote.url) {
                    await saveNote(webId, fetch, newNote, storagePref, defFolder, prefFileLocation, podType);
                }
                else {
                    await editNote(webId, fetch, newNote, storagePref, publicTypeIndexUrl);
                }
            }

        }

        if (Object.keys(accUpdObj).length !== 0) {
            if (accUpdObj["public"]) {
                if (!NoteInp) {
                    throw new Error("Error, note to view wasn't provided");
                }
                await setPubAccess(webId, publicAccess, NoteInp.url, fetch, storagePref, prefFileLocation, podType);
            }
            else if (accUpdObj["agent"]) {

                for (const item in agentsToUpd) {
                    if (!NoteInp) {
                        throw new Error("Error, note to view wasn't provided");
                    }
                    await shareWith(webId, NoteInp!.url, fetch, agentsToUpd[item], item, storagePref, prefFileLocation, podType);

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
        const updArr = notesArray.filter((note) => note.id !== NoteInp.id);
        setNotesArray(updArr);
        newEntryCr ? setNewEntryCr(false) : setNewEntryCr(true);
        if (!NoteInp) {
            throw new Error("Error, note to view wasn't provided");
        }
        //handle
        await deleteEntry(webId ?? "", fetch, NoteInp.url!, "note", storagePref, publicTypeIndexUrl);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNoteInp(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
        setNoteChanged(true);
    };
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
                setEntryChanged={setNoteChanged}
                categoryModalState={categoryModalState}
                setCategoryModalState={setCategoryModalState}
                setNoteInp={setNoteInp}
                noteInp={NoteInp}
                viewerStatus={viewerStatus}
                categoryArray={categoryArray}
                setCategoryArray={setCategoryArray}
            />
            <AccessModal
                storagePref={storagePref}
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
                setNoteInp={setNoteInp}
                NoteInp={NoteInp}
                viewerStatus={viewerStatus}
                categoryArray={categoryArray}
                setCategoryArray={setCategoryArray}
            />
        </div>
    )
}

export default NoteCreator;

