import { Thing } from "@inrupt/solid-client";
import { useEffect } from "react";
import NoteCreator from "./NoteCreator";
import { Note } from "./types";

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
    NoteInp : Note;
    setNoteInp : React.Dispatch<React.SetStateAction<Note>>;
    arrOfChanges: string[];
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
}
// component that renders entry creator, based on the "active" value
const CreatorToRender = ({ active, creatorStatus, newEntryCr, setNewEntryCr,
    noteToView, setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, setCreatorStatus, categoryArray,
    setCategoryArray, doNoteSave, setDoNoteSave,NoteInp, setNoteInp, arrOfChanges, setArrOfChanges}: Props) => {

    useEffect(() => {
    }, [creatorStatus, viewerStatus]);

    if (creatorStatus || viewerStatus) {
        switch (active) {
            case "notes":
                return (
                    <NoteCreator
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