import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { checkAndCreatePrefLink, getDefaultFolder, getPrefLink, recordDefaultFolder } from "../services/SolidPod";
import FolderPickerModal from "./FolderPickerModal";
import ContentsList from "./ContentsList";
import { Thing } from "@inrupt/solid-client";

interface Props {
    active: string;
    creatorStatus: boolean;
    newEntryCr: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    thingToView: Thing | null;
    setThingToView: React.Dispatch<React.SetStateAction<Thing | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
}

// component that checks if the user has setup default folder and links to default folder
// if the default folder is setup renders content based on the active state 
// if the default folder is not setup, notifies user and suggest ot set it up
// "defFolderStatus" checks if default folder was created (needed to call a rerender)

const FolderPickerOrContent = ({ active, creatorStatus, newEntryCr, setCreatorStatus,
    setNewEntryCr, thingToView, setThingToView, viewerStatus, setViewerStatus, isEdit, setIsEdit }: Props) => {

    const [modalState, setModalState] = useState<boolean>(false);
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [defFolderUrlToUp, setDefFolderUrlToUp] = useState("");
    const [defFolderStatus, setDefFolderStatus] = useState<boolean>(false);
    const [defFolderUrl, setDefFolderUrl] = useState<string>("");

    useEffect(() => {
        setIsLoading(true);
        async function checkDef() {
            const defFolderUpd = await getDefaultFolder(webId ?? "", fetch);
            if (defFolderUpd !== null) {
                setDefFolderUrl(defFolderUpd);
                setDefFolderStatus(true);
            }
            setIsLoading(false);
        }
        async function fetchData() {
            await recordDefaultFolder(webId ?? "", fetch, defFolderUrlToUp);
            await setDefFolderUrl(defFolderUrlToUp);
            setIsLoading(false);
        }
        if (defFolderUrlToUp !== "") {
            fetchData();
        }
        checkDef();
    }, [defFolderUrlToUp, defFolderUrl]);

    if (isLoading) {
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    }
    else {
        if (defFolderStatus) {
            //case for when def folder exists
            // might need to move this part in ContentList, depends on further
            switch (active) {
                case "habits":
                case "notes":
                    return (<ContentsList active={active} creatorStatus={creatorStatus}
                        setCreatorStatus={setCreatorStatus}
                        newEntryCr={newEntryCr}
                        setNewEntryCr={setNewEntryCr}
                        thingToView={thingToView}
                        setThingToView={setThingToView}
                        viewerStatus={viewerStatus}
                        setViewerStatus={setViewerStatus}
                        isEdit={isEdit}
                        setIsEdit={setIsEdit}
                    />);
                    break;
                default:
                    return (<div>Error</div>);
            }
        }
        else {
            return (
                <div className="card text-center">
                    <div className="card-body ">
                        <h5 className="card-title">No default folder selected</h5>
                        <p className="card-text">Please pick a default folder, where your notes will be stored</p>
                        <a className="btn btn-primary" onClick={() => { setModalState(true) }}>Pick a folder</a>
                    </div>
                    <FolderPickerModal modalState={modalState} setModalState={setModalState} defFolderUrlToUp={defFolderUrlToUp} setDefFolderUrlToUp={setDefFolderUrlToUp}
                        setDefFolderStatus={setDefFolderStatus} />
                </div>

            );
        }
    }

}

export default FolderPickerOrContent;
