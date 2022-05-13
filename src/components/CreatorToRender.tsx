import { Thing } from "@inrupt/solid-client";
import { useEffect } from "react";
import NoteCreator from "./NoteCreator";

interface Props {
    active: string;
    creatorStatus: boolean;
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    thingToView: Thing | null;
    setThingToView: React.Dispatch<React.SetStateAction<Thing | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
// component that renders entry creator, based on the "active" value
const CreatorToRender = ({ active, creatorStatus, newEntryCr, setNewEntryCr,
    thingToView, setThingToView, viewerStatus, setViewerStatus, isEdit, setIsEdit, setCreatorStatus }: Props) => {

    useEffect(() => {
    }, [creatorStatus, viewerStatus]);

    if (creatorStatus || viewerStatus) {
        switch (active) {
            case "notes":
                return (
                    <NoteCreator
                        newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr}
                        thingToView={thingToView}
                        setThingToView={setThingToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                        setCreatorStatus={setCreatorStatus}
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