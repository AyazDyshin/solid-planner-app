import ContactsRender from "./ContactsRender";
import NotesHabitsRender from "./NotesHabitsRender";
import SettingsPage from "./SettingsPage";
import { Note } from "./types";

interface Props {
    active: string;
    otherWebId: string | null;
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    notesArray: (Note | null)[];
    setNotesArray: React.Dispatch<React.SetStateAction<(Note | null)[]>>;
    contactsArr: (string | null)[][];
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    isLoadingContents: boolean;
    setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
}
// this component decides what to render based on "active" property ie clicked tab
// while seems redundant at the moment will be useful once other tabs will be implemented
const ContentToRender = ({ active, otherWebId, setOtherWebId, viewerStatus, setViewerStatus,
    creatorStatus, setCreatorStatus, isEdit, setIsEdit, notesArray,
    setNotesArray, contactsArr, setContactsArr, isLoadingContents, setIsLoadingContents }: Props) => {

    switch (active) {
        case "notes":
        case "habits":
        case "contacts":
            return (
                <NotesHabitsRender
                    isLoadingContents={isLoadingContents}
                    setIsLoadingContents={setIsLoadingContents}
                    contactsArr={contactsArr}
                    setContactsArr={setContactsArr}
                    notesArray={notesArray}
                    setNotesArray={setNotesArray}
                    creatorStatus={creatorStatus}
                    setCreatorStatus={setCreatorStatus}
                    viewerStatus={viewerStatus}
                    setViewerStatus={setViewerStatus}
                    otherWebId={otherWebId}
                    setOtherWebId={setOtherWebId}
                    active={active}
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                />);
        case "settings":
            return (<SettingsPage />);
        default:
            return (<div>Error</div>);
    }
}

export default ContentToRender;