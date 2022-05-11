import { useState } from "react";
import CreatorToRender from "./CreatorToRender";
import FolderPickerOrContent from "./FolderPickerOrContent";

interface Props {
    active: string;
}
// Component that is responsible for rendering content of notes and habits tab
// splits the content in two halves, left half: "FolderPickerOrContent"
// right half: "CreatorToRender"
// "newEntryCr" and "setNewEntryCr" are indicating if a new entry was created
// this is needed to update the left side view, ie list of entries existing in the user's pod
// "creatorStatus" and "setCreatorStatus" are hooks to monitor if create button was pressed,
// this is needed to render the respective creator component
const ContentPageRender = ({ active }: Props) => {

    const [creatorStatus, setCreatorStatus] = useState<boolean>(false);
    const [newEntryCr, setNewEntryCr] = useState<boolean>(false);

    return (
        <div className="container-fluid">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center">
                    <FolderPickerOrContent active={active} creatorStatus={creatorStatus}
                        setCreatorStatus={setCreatorStatus}
                        newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr} />
                </div>
                <div className="col h-100 border border-5">
                    <CreatorToRender active={active} creatorStatus={creatorStatus} newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr} />
                </div>
            </div>
        </div>
    );
}

export default ContentPageRender;