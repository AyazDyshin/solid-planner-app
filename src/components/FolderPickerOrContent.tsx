import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { getDefaultFolder, getPrefLink, getStoragePref, modifyWebId, recordDefaultFolder } from "../services/SolidPod";
import FolderPickerModal from "./FolderPickerModal";
import ContentsList from "./ContentsList";
import { Thing } from "@inrupt/solid-client";
import { Note } from "./types";

interface Props {
    active: string;
    creatorStatus: boolean;
    newEntryCr: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    setNewEntryCr: React.Dispatch<React.SetStateAction<boolean>>;
    noteToView: Note | null;
    setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
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
    setNewEntryCr, noteToView, setNoteToView, viewerStatus, setViewerStatus, isEdit, setIsEdit }: Props) => {
    const [modalState, setModalState] = useState<boolean>(false);
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [defFolderUrlToUp, setDefFolderUrlToUp] = useState("SolidPlannerApp");
    const [defFolderStatus, setDefFolderStatus] = useState<boolean>(false);
    const [storagePref, setStoragePref] = useState<string>("");

    if (typeof webId !== "string") {
        throw new Error("error, webId does not exist");
    }

    useEffect(() => {
        setIsLoading(true);
        async function fetchData() {
            const defFolderUpd = await getDefaultFolder(webId ?? "", fetch);
            if (!defFolderUpd) {
                await recordDefaultFolder(webId ?? "", fetch);
                setDefFolderStatus(true);
            }
            setIsLoading(false);
        }

        fetchData();
    }, []);

    if (isLoading) {
        return (
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        )
    }
    else {
        //case for when def folder exists
        // might need to move this part in ContentList, depends on further
        switch (active) {
            case "habits":
            case "notes":
                return (
                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                        {/* <ContentsList
                            active={active}
                            creatorStatus={creatorStatus}
                            setCreatorStatus={setCreatorStatus}
                            newEntryCr={newEntryCr}
                            setNewEntryCr={setNewEntryCr}
                            noteToView={noteToView}
                            setNoteToView={setNoteToView}
                            viewerStatus={viewerStatus}
                            setViewerStatus={setViewerStatus}
                            isEdit={isEdit}
                            setIsEdit={setIsEdit}
                            categoryArray={categoryArray} */}
                        <FolderPickerModal modalState={modalState} setModalState={setModalState} defFolderUrlToUp={defFolderUrlToUp} setDefFolderUrlToUp={setDefFolderUrlToUp}
                            setDefFolderStatus={setDefFolderStatus} />
                    </div>
                );
                break;
            default:
                return (<div>Error</div>);
        }
    }
}

export default FolderPickerOrContent;
