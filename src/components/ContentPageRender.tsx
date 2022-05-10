import { useDataset, useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { checkAndCreatePrefLink, getPrefLink, recordDefaultFolder } from "../services/SolidPod";
import FolderPickerOrContent from "./FolderPickerOrContent";
import NoteCreator from "./NoteCreator";
interface Props {
    active : string;
}
const ContentPageRender = ({active}:Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [editing, setEditing] = useState(true);
    const { dataset, error } = useDataset();
    const [prefLink, setPrefLink] = useState<string | null>("");
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [defaultFolderUrl, setDefaultFolderUrl] = useState("");
    const [defaultFolderUrlValue, setDefaultFolderUrlValue] = useState(false);
    
        return (
            <div className="container-fluid">
                <div className="row h-100">
                    <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center">
                        <FolderPickerOrContent active={active} />
                    </div>
                    <div className="col h-100 border border-5">
                        <NoteCreator />
                    </div>
                </div>
            </div>
        );
    
}

export default ContentPageRender;