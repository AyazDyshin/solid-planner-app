import { useEffect } from "react";
import NoteCreator from "./NoteCreator";

interface Props {
    active : string;
    creatorStatus: boolean;
}
const CreatorToRender = ({active,creatorStatus} : Props) => {
    useEffect (() => {
        console.log(creatorStatus);
    }, [creatorStatus]);
    if (creatorStatus) {
    switch (active) {
        case "notes":
        return (<NoteCreator />);
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