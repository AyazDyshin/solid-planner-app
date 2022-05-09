import { useState } from "react";
import FolderPickerModal from "./FolderPickerModal";
interface Props {
    defaultFolderUrl: string;
    setDefaultFolderUrl: React.Dispatch<React.SetStateAction<string>>;
}
const FolderSelector = ({ defaultFolderUrl, setDefaultFolderUrl }: Props) => {
    const [modalState, setModalState] = useState<boolean>(false);
    return (
        <div className="card text-center">
            <div className="card-body ">
                <h5 className="card-title">No default folder selected</h5>
                <p className="card-text">Please pick a default folder, where your notes will be stored</p>
                <a href="#" className="btn btn-primary" onClick={() => { setModalState(true) }}>Pick a folder</a>
            </div>
            <FolderPickerModal modalState={modalState} setModalState={setModalState} defaultFolderUrl={defaultFolderUrl} setDefaultFolderUrl={setDefaultFolderUrl} />
        </div>

    );
}

export default FolderSelector;
