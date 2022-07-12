import { Contact } from "rdf-namespaces/dist/vcard";
import ContactsRender from "./ContactsRender";
import HabitsRender from "./HabitsRender";
import NotesRender from "./NotesRender";
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
    storagePref: string;
    defFolder: string | null;
    prefFileLocation: string;
    podType: string;
    publicTypeIndexUrl: string;
}
// this component decides what to render based on "active" property ie clicked tab
// while seems redundant at the moment will be useful once other tabs will be implemented
const ContentToRender = ({ active, viewerStatus, setViewerStatus, habitsFetched, setHabitsFetched, habitsArray, setHabitsArray,
    creatorStatus, setCreatorStatus, isEdit, setIsEdit, notesArray, storagePref, defFolder, prefFileLocation, podType,
    setNotesArray, isLoadingContents, setIsLoadingContents, notesFetched, setNotesFetched, publicTypeIndexUrl }: Props) => {
    
    switch (active) {
        case "notes":
            return (
                <NotesRender
                    publicTypeIndexUrl={publicTypeIndexUrl}
                    podType={podType}
                    prefFileLocation={prefFileLocation}
                    defFolder={defFolder}
                    storagePref={storagePref}
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
                    defFolder={defFolder}
                    podType={podType}
                    publicTypeIndexUrl={publicTypeIndexUrl}
                    prefFileLocation={prefFileLocation}
                    storagePref={storagePref}
                    habitsFetched={habitsFetched}
                    setHabitsFetched={setHabitsFetched}
                    habitsArray={habitsArray}
                    setHabitsArray={setHabitsArray}
                />
            )
        case "contacts":
            return (
                <ContactsRender
                    podType={podType}
                    prefFileLocation={prefFileLocation}
                    publicTypeIndexUrl={publicTypeIndexUrl}
                    storagePref={storagePref}
                />
            );
        default:
            return (<div>Error</div>);
    }
}

export default ContentToRender;