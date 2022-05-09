import { useState } from "react";
import FolderSelector from "./FolderSelector";

const NotesPage = () => {
 const [defaultFolderUrl, setDefaultFolderUrl] = useState("");
    return (
        <div className="container-fluid">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center">
                    <FolderSelector defaultFolderUrl={defaultFolderUrl} setDefaultFolderUrl={setDefaultFolderUrl}/>
                </div>
                <div className="col h-100 border border-5"></div>
            </div>
        </div>
    );
}

export default NotesPage;