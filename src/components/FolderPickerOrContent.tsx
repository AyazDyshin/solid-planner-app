import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { checkAndCreatePrefLink, getDefaultFolder, getPrefLink, recordDefaultFolder } from "../services/SolidPod";
import FolderPickerModal from "./FolderPickerModal";

const FolderPickerOrContent = () => {
    const [modalState, setModalState] = useState<boolean>(false);
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [prefLink, setPrefLink] = useState<string | null>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [defFolderUrlToUp, setDefFolderUrlToUp] = useState("");
    const [defFolderStatus, setDefFolderStatus] = useState<boolean>(false);
    const [defFolderUrl, setDefFolderUrl] = useState<string>("");
    // const [defaultFolderUrlValue, setDefaultFolderUrlValue] = useState(false);
    useEffect(() => {
        setIsLoading(true);
        async function checkDef() {
            const defFolderUpd = await getDefaultFolder(webId ?? "", fetch);
            //console.log(`this is def folder: ${defFolderUpd}`);
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
        //setIsLoading(false);
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
            return (
                <div>
                    YOU HAVE DEF FOLDER!!
                </div>
            );
        }
        else {
            return (
                <div className="card text-center">
                    <div className="card-body ">
                        <h5 className="card-title">No default folder selected</h5>
                        <p className="card-text">Please pick a default folder, where your notes will be stored</p>
                        <a href="#" className="btn btn-primary" onClick={() => { setModalState(true) }}>Pick a folder</a>
                    </div>
                    <FolderPickerModal modalState={modalState} setModalState={setModalState} defFolderUrlToUp={defFolderUrlToUp} setDefFolderUrlToUp={setDefFolderUrlToUp}
                    setDefFolderStatus={setDefFolderStatus} />
                </div>

            );
        }
    }

}

export default FolderPickerOrContent;
