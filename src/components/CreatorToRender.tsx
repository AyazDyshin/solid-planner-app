import { Thing } from "@inrupt/solid-client";
import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { useEffect } from "react";
import NoteCreator from "./NoteCreator";
import { accessObject, Note } from "./types";

interface Props {
    active: string;
    creatorStatus: boolean;
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    noteToView: Note | null;
    setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    categoryArray: string[];
    setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
    doNoteSave: boolean;
    setDoNoteSave: React.Dispatch<React.SetStateAction<boolean>>;
    NoteInp: Note;
    setNoteInp: React.Dispatch<React.SetStateAction<Note>>;
    arrOfChanges: string[];
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
    otherWebId: string | null;
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    publicAccess: accessObject;
    setPublicAccess: React.Dispatch<React.SetStateAction<accessObject>>;
    contactsList: {
        [x: string]: AccessModes;
    };
    setContactsList: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
    webIdToSave: {
        [x: string]: AccessModes;
    };
    setWebIdToSave: React.Dispatch<React.SetStateAction<{
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
}
// component that renders entry creator, based on the "active" value
const CreatorToRender = ({ active, creatorStatus, newEntryCr, setNewEntryCr,
    noteToView, setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, setCreatorStatus, categoryArray,
    setCategoryArray, doNoteSave, setDoNoteSave, NoteInp, setNoteInp, arrOfChanges, setArrOfChanges, otherWebId, setOtherWebId,
    publicAccess, setPublicAccess, contactsList, setContactsList, webIdToSave, setWebIdToSave, sharedList, setSharedList,
    fullContacts, setFullContacts
}: Props) => {

    useEffect(() => {
    }, [creatorStatus, viewerStatus]);

    if (creatorStatus || viewerStatus) {
        switch (active) {
            case "notes":
            case "contacts":
                return (
                    <NoteCreator
                        fullContacts={fullContacts}
                        setFullContacts={setFullContacts}
                        publicAccess={publicAccess}
                        setPublicAccess={setPublicAccess}
                        contactsList={contactsList}
                        setContactsList={setContactsList}
                        webIdToSave={webIdToSave}
                        setWebIdToSave={setWebIdToSave}
                        sharedList={sharedList}
                        setSharedList={setSharedList}
                        otherWebId={otherWebId}
                        setOtherWebId={setOtherWebId}
                        newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr}
                        noteToView={noteToView}
                        setNoteToView={setNoteToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                        creatorStatus={creatorStatus}
                        setCreatorStatus={setCreatorStatus}
                        categoryArray={categoryArray}
                        setCategoryArray={setCategoryArray}
                        doNoteSave={doNoteSave}
                        setDoNoteSave={setDoNoteSave}
                        NoteInp={NoteInp}
                        setNoteInp={setNoteInp}
                        arrOfChanges={arrOfChanges}
                        setArrOfChanges={setArrOfChanges}
                    />);
                break;
            case "habits":
                return (<div>Ooopps, not here yet</div>);
                break;
            default:
                return (<div></div>);
        }
    }
    else {
        return (<div></div>);
    }
}

export default CreatorToRender;