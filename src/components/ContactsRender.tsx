import { ThingPersisted } from "@inrupt/solid-client";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import { checkContacts, fetchAllEntries, fetchContacts, thingToNote } from "../services/SolidPod";
import ContactsList from "./ContactsList";
import NoContacts from "./NoContacts";
import NotesList from "./NotesList";
import NoteViewer from "./NoteViewer";
import { Note } from "./types";
import ViewNotes from "./ViewNotes";
interface Props {
    storagePref: string;
    publicTypeIndexUrl: string;
    prefFileLocation: string;
    podType: string;
    contactsArr: (string | null)[][];
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    contactsFetched: boolean;
    setContactsFetched: React.Dispatch<React.SetStateAction<boolean>>;
    contactsFdrStatus: boolean;
    setContactsFdrStatus: React.Dispatch<React.SetStateAction<boolean>>;
}
const ContactsRender = ({ storagePref, publicTypeIndexUrl, prefFileLocation, podType, contactsArr, setContactsArr,
    contactsFetched, setContactsFetched, contactsFdrStatus, setContactsFdrStatus
}: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [otherWebId, setOtherWebId] = useState<string | null>(null);
    const [notesArray, setNotesArray] = useState<(Note | null)[]>([]);
    const [noteToView, setNoteToView] = useState<Note | null>(null);
    const [viewerStatus, setViewerStatus] = useState<boolean>(false);

    if (webId === undefined) {
        throw new Error(`Error, couldn't get user's WebId`);
    }

    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            if (!contactsFetched) {
                let contactsStatus = await checkContacts(webId, fetch, storagePref);
                setContactsFdrStatus(contactsStatus);
                if (contactsStatus) {
                    const namesAndIds = await fetchContacts(webId, fetch, storagePref);
                    setContactsArr(namesAndIds);
                    const namesArr = namesAndIds.map((pair) => pair[0] ? pair[0] : pair[1]);
                    setContactsFetched(true);
                }
            }
            if (otherWebId) {
                let notesArrUpd = await fetchAllEntries(otherWebId, fetch, "note", storagePref, prefFileLocation,
                    publicTypeIndexUrl, podType, true);
                let transformedArr = await Promise.all(notesArrUpd.map(async (thing) => {
                    return await thingToNote(thing, otherWebId, fetch, storagePref, prefFileLocation, podType);
                }));
                setNotesArray(transformedArr.filter((item) => item !== null));
            }
            setIsLoading(false);
        };
        initialize();
    }, [otherWebId]);

    return (
        <div className="container-fluid pad">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center p-0">
                    {
                        isLoading && <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </Spinner>
                    }

                    {
                        !isLoading && contactsFdrStatus && !otherWebId &&
                        <ContactsList
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                            contactsArr={contactsArr}
                            setContactsArr={setContactsArr}
                            otherWebId={otherWebId}
                            setOtherWebId={setOtherWebId}
                        />
                    }
                    {
                        notesArray.length !== 0 && !isLoading && contactsFdrStatus && otherWebId &&
                        <ViewNotes
                            isLoading={isLoading}
                            setIsLoading={setIsLoading}
                            viewerStatus={viewerStatus}
                            setViewerStatus={setViewerStatus}
                            noteToView={noteToView}
                            setNoteToView={setNoteToView}
                            notesArray={notesArray}
                            setNotesArray={setNotesArray}
                            otherWebId={otherWebId}
                            setOtherWebId={setOtherWebId}
                        />
                    }
                    {
                        notesArray.length === 0 && !isLoading && otherWebId && contactsFdrStatus &&
                        <div>
                            <div className="card text-center">
                                <div className="card-body">
                                    <h5 className="card-title">Oooops...</h5>
                                    <p className="card-text">Seems like there is no content that you can view</p>
                                    <Button onClick={() => {
                                        setIsLoading(true);
                                        setOtherWebId(null);
                                    }}>Go Back</Button>
                                </div>
                            </div>
                        </div>

                    }
                    {
                        !isLoading && !contactsFdrStatus && <NoContacts />
                    }

                </div>
                <div className="col h-100 border border-5">
                    {
                        otherWebId && viewerStatus &&
                        <NoteViewer
                            noteToView={noteToView}
                            setNoteToView={setNoteToView}
                        />
                    }
                </div>
            </div>

        </div>
    )
}


export default ContactsRender;
