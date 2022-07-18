import { useSession } from "@inrupt/solid-ui-react";
import React, { useEffect, useState } from "react";
import { Button, Modal, Spinner } from "react-bootstrap";
import { checkContacts, fetchAllEntries, fetchContacts, thingToNote } from "../services/SolidPod";
import ContactsList from "./ContactsList";
import NoContacts from "./NoContacts";
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
    const [contactModalState, setContactModalState] = useState<boolean>(false);

    if (webId === undefined) {
        throw new Error(`Error, couldn't get user's WebId`);
    }

    useEffect(() => {
        const initialize = async () => {
            setIsLoading(true);
            if (!contactsFetched) {
                const contactsStatus = await checkContacts(fetch, storagePref);
                setContactsFdrStatus(contactsStatus);
                if (contactsStatus) {
                    const namesAndIds = await fetchContacts(fetch, storagePref);
                    setContactsArr(namesAndIds);
                    namesAndIds.map((pair) => pair[0] ? pair[0] : pair[1]);
                }
                setContactsFetched(true);
            }
            if (otherWebId) {
                const notesArrUpd = await fetchAllEntries(otherWebId, fetch, "note", storagePref, prefFileLocation,
                    publicTypeIndexUrl, podType, true);
                const transformedArr = await Promise.all(notesArrUpd.map(async (thing) => {
                    return await thingToNote(thing, otherWebId, fetch, storagePref, prefFileLocation, podType);
                }));
                setNotesArray(transformedArr.filter((item) => item !== null));
            }
            setIsLoading(false);
        };
        initialize();
    }, [otherWebId, contactsFetched]);

    return (
        <div className="container-fluid pad h-100 w-100 d-flex justify-content-center" style={{ "backgroundColor": "#F8F8F8" }}>
            <div id="setWidth" style={{ "backgroundColor": "#fff" }}
                className="h-100 w-100 adjust-me-based-on-size  d-flex justify-content-center align-items-center p-0">
                {
                    isLoading && <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                }
                {
                    !isLoading && contactsFdrStatus && !otherWebId && contactsArr.length !== 0 &&
                    <ContactsList
                        setIsLoading={setIsLoading}
                        contactsArr={contactsArr}
                        setOtherWebId={setOtherWebId}
                    />
                }
                {
                    notesArray.length !== 0 && !isLoading && contactsFdrStatus && otherWebId &&
                    <ViewNotes
                        setContactModalState={setContactModalState}
                        setIsLoading={setIsLoading}
                        setViewerStatus={setViewerStatus}
                        setNoteToView={setNoteToView}
                        notesArray={notesArray}
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
                    !isLoading && ((!contactsFdrStatus) || (contactsFdrStatus && contactsArr.length === 0)) && <NoContacts />
                }
            </div>
            {
                otherWebId && viewerStatus &&
                <Modal id="viewerModal" show={contactModalState} style={{ "height": "90vh" }}
                    size="lg"
                    onHide={() => { setContactModalState(false) }}>
                    <Modal.Header closeButton>
                        Note viewer
                    </Modal.Header>
                    <Modal.Body id="viewerModal">
                        <NoteViewer
                            noteToView={noteToView}
                        />
                    </Modal.Body>
                </Modal>
            }
        </div>
    )
}

export default ContactsRender;
