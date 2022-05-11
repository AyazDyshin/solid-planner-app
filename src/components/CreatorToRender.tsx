import { useEffect } from "react";
import NoteCreator from "./NoteCreator";

interface Props {
    active: string;
    creatorStatus: boolean;
    newEntryCr: boolean;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
}
// component that renders entry creator, based on the "active" value
const CreatorToRender = ({ active, creatorStatus, newEntryCr, setNewEntryCr }: Props) => {

    useEffect(() => {
        console.log(creatorStatus);
    }, [creatorStatus]);

    if (creatorStatus) {
        switch (active) {
            case "notes":
                return (<NoteCreator newEntryCr={newEntryCr} setNewEntryCr={setNewEntryCr} />);
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