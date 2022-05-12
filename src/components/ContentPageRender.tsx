import { Thing } from "@inrupt/solid-client";
import { useState } from "react";
import CreatorToRender from "./CreatorToRender";
import FolderPickerOrContent from "./FolderPickerOrContent";
import ViewerToRender from "./ViewerToRender";

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
    const [viewerStatus, setViewerStatus] = useState<boolean>(false);
    const [thingToView, setThingToView] = useState<Thing | null>(null);
    return (
        <div className="container-fluid">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center p-0">
                    <FolderPickerOrContent active={active} creatorStatus={creatorStatus}
                        setCreatorStatus={setCreatorStatus}
                        newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr}
                        thingToView={thingToView}
                        setThingToView={setThingToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus} />
                </div>
                <div className="col h-100 border border-5">
                    <CreatorToRender active={active} creatorStatus={creatorStatus} newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr}
                        thingToView={thingToView}
                        setThingToView={setThingToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus} />
                    <ViewerToRender active={active}
                        thingToView={thingToView}
                        setThingToView={setThingToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                    />
                </div>
            </div>
        </div>
    );
}

export default ContentPageRender;