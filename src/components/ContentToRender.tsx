import { Contact } from "rdf-namespaces/dist/vcard";
import { useState } from "react";
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
    contactsFetched: boolean;
    setContactsFetched: React.Dispatch<React.SetStateAction<boolean>>;
    contactsFdrStatus: boolean;
    setContactsFdrStatus: React.Dispatch<React.SetStateAction<boolean>>;
    refetchNotes: boolean;
    setRefetchNotes: React.Dispatch<React.SetStateAction<boolean>>;
    refetchHabits: boolean;
    setRefetchHabits: React.Dispatch<React.SetStateAction<boolean>>;
    refetchContacts: boolean;
    setRefetchContacts: React.Dispatch<React.SetStateAction<boolean>>;
}
// this component decides what to render based on "active" property ie clicked tab
// while seems redundant at the moment will be useful once other tabs will be implemented
const ContentToRender = ({ active, viewerStatus, setViewerStatus, habitsFetched, setHabitsFetched, habitsArray, setHabitsArray,
    creatorStatus, setCreatorStatus, isEdit, setIsEdit, notesArray, storagePref, defFolder, prefFileLocation, podType,
    setNotesArray, isLoadingContents, setIsLoadingContents, notesFetched, setNotesFetched, publicTypeIndexUrl,
    contactsFetched, setContactsFetched, contactsFdrStatus, setContactsFdrStatus, refetchContacts, setRefetchContacts,
    refetchNotes, setRefetchNotes, refetchHabits, setRefetchHabits
}: Props) => {

    const [contactsArr, setContactsArr] = useState<(string | null)[][]>([]);

    switch (active) {
        case "notes":
            return (
                <NotesRender
                    refetchNotes={refetchNotes}
                    setRefetchNotes={setRefetchNotes}
                    contactsArr={contactsArr}
                    setContactsArr={setContactsArr}
                    contactsFetched={contactsFetched}
                    setContactsFetched={setContactsFetched}
                    contactsFdrStatus={contactsFdrStatus}
                    setContactsFdrStatus={setContactsFdrStatus}
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
                    refetchHabits={refetchHabits}
                    setRefetchHabits={setRefetchHabits}
                    contactsArr={contactsArr}
                    setContactsArr={setContactsArr}
                    contactsFetched={contactsFetched}
                    setContactsFetched={setContactsFetched}
                    contactsFdrStatus={contactsFdrStatus}
                    setContactsFdrStatus={setContactsFdrStatus}
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
                    refetchContacts={refetchContacts}
                    setRefetchContacts={setRefetchContacts}
                    contactsFdrStatus={contactsFdrStatus}
                    setContactsFdrStatus={setContactsFdrStatus}
                    contactsArr={contactsArr}
                    setContactsArr={setContactsArr}
                    contactsFetched={contactsFetched}
                    setContactsFetched={setContactsFetched}
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