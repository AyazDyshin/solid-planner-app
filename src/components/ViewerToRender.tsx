import { Thing } from "@inrupt/solid-client";

interface Props {
    active: string;
    thingToView: Thing | null;
    setThingToView: React.Dispatch<React.SetStateAction<Thing | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewerToRender = ({ active, thingToView, setThingToView, viewerStatus, setViewerStatus }: Props) => {


    if (viewerStatus) {
        return (
            <div>

            </div>
        );
    }
    else {
        return (<div></div>);
    }
}

export default ViewerToRender;