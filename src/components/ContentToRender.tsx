import { Contact } from "rdf-namespaces/dist/vcard";
import ContactsRender from "./ContactsRender";
import HabitsRender from "./HabitsRender";
import NotesHabitsRender from "./NotesHabitsRender";
import SettingsPage from "./SettingsPage";
import { Habit, Note } from "./types";

interface Props {
    active: string;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    notesArray: Note[];
    setNotesArray: React.Dispatch<React.SetStateAction<Note[]>>;
    isLoadingContents: boolean;
    setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
    notesFetched: boolean;
    setNotesFetched: React.Dispatch<React.SetStateAction<boolean>>;
    habitsFetched: boolean;
    setHabitsFetched: React.Dispatch<React.SetStateAction<boolean>>;
    habitsArray: Habit[];
    setHabitsArray: React.Dispatch<React.SetStateAction<Habit[]>>;
}
// this component decides what to render based on "active" property ie clicked tab
// while seems redundant at the moment will be useful once other tabs will be implemented
const ContentToRender = ({ active, viewerStatus, setViewerStatus, habitsFetched, setHabitsFetched, habitsArray, setHabitsArray,
    creatorStatus, setCreatorStatus, isEdit, setIsEdit, notesArray,
    setNotesArray, isLoadingContents, setIsLoadingContents, notesFetched, setNotesFetched }: Props) => {

    switch (active) {
        case "notes":
            return (
                <NotesHabitsRender
                    notesFetched={notesFetched}
                    setNotesFetched={setNotesFetched}
                    isLoadingContents={isLoadingContents}
                    setIsLoadingContents={setIsLoadingContents}
                    notesArray={notesArray}
                    setNotesArray={setNotesArray}
                    creatorStatus={creatorStatus}
                    setCreatorStatus={setCreatorStatus}
                    viewerStatus={viewerStatus}
                    setViewerStatus={setViewerStatus}
                    active={active}
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                />);
        case "habits":
            return (
                <HabitsRender
                    habitsFetched={habitsFetched}
                    setHabitsFetched={setHabitsFetched}
                    habitsArray={habitsArray}
                    setHabitsArray={setHabitsArray}
                />
            )
        case "contacts":
            return (
                <ContactsRender />
            );
        case "settings":
            return (<SettingsPage />);
        default:
            return (<div>Error</div>);
    }
}

export default ContentToRender;