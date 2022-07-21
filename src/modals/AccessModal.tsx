import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { useSession } from "@inrupt/solid-ui-react";
import React, { useState, useEffect } from "react";
import { Modal, Button, Collapse, Spinner } from "react-bootstrap";
import { Habit, Note } from "../services/types";
import { checkContacts, fetchContacts } from "../services/SolidPod";
import "../styles.css";
import AccessElement from "./AccessElement";
import { accessObject } from "../services/types";
import NoContacts from "../components/ContactsComponents/NoContacts";

interface Props {
    accessModalState: boolean;
    setAccessModalState: React.Dispatch<React.SetStateAction<boolean>>;
    NoteInp?: Note;
    publicAccess: accessObject;
    setPublicAccess: React.Dispatch<React.SetStateAction<accessObject>>;
    contactsList: {
        [x: string]: AccessModes;
    };
    setContactsList: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
    setAccUpdObj: React.Dispatch<React.SetStateAction<{
        [x: string]: boolean;
    }>>;

    setAgentsToUpd: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
    storagePref: string;
    contactsFdrStatus: boolean;
    setContactsFdrStatus: React.Dispatch<React.SetStateAction<boolean>>;
    habitInp?: Habit;
    contactsArr: (string | null)[][];
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    contactsFetched: boolean;
}

/**
 * Component that renders access rights setting modal
 *
 * @category Modals
 * @component
 */
const AccessModal = ({ accessModalState, setAccessModalState, NoteInp, contactsList, setContactsList,
    setAccUpdObj, publicAccess, setPublicAccess, habitInp, storagePref, contactsFdrStatus, setContactsFdrStatus,
    setAgentsToUpd, contactsArr, setContactsArr, contactsFetched
}: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (!webId) {
        throw new Error(`Error, couldn't get user's WebId`);
    }
    const [contactsOpen, setContactsOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [fullContacts, setFullContacts] = useState<{ [x: string]: string | null; }>({});

    useEffect(() => {
        const fetchAccess = async () => {
            setIsLoading(true);
            setContactsOpen(false);
            const inputToUse = NoteInp ? NoteInp : habitInp;
            if (!inputToUse) {
                throw new Error("Error, entry to set access for wasn't provided");
            }
            if (!inputToUse.access) {
                throw new Error("Error, entry to set access for wasn't provided");
            }
            const key = Object.keys(inputToUse.access)[0];
            const pubAccess = inputToUse.access[key];
            setPublicAccess({ read: pubAccess.read, append: pubAccess.append, write: pubAccess.write });
            let shList: Record<string, AccessModes>;
            if (inputToUse.shareList) shList = inputToUse.shareList;
            else shList = {};
            let namesAndIds: (string | null)[][] = [];
            let contactsStatus = false;
            if (!contactsFetched) {
                contactsStatus = await checkContacts(fetch, storagePref);
                setContactsFdrStatus(contactsStatus);
                if (contactsStatus) {
                    namesAndIds = await fetchContacts(fetch, storagePref);
                    setContactsArr(namesAndIds);
                }
            }

            if (contactsFdrStatus || contactsStatus) {
                if (namesAndIds.length === 0) {
                    namesAndIds = contactsArr;
                }
                const contObj: { [x: string]: string | null; } = {};
                namesAndIds.map((pair) => {
                    if (pair[0]) contObj[pair[0]] = pair[1];
                });
                setFullContacts(contObj);
                const testObj: { [x: string]: AccessModes; } = {};
                namesAndIds.filter((pair) => pair !== [null, null])
                    .map((pair) => {
                        const contName = pair[0] ? pair[0] : pair[1];
                        let acc;
                        if (pair[1] && shList[pair[1]]) {
                            acc = shList[pair[1]];
                        }
                        else {
                            acc = { read: false, append: false, write: false };
                        }
                        if (contName) {
                            testObj[contName] = acc;
                        }
                    });
                setContactsList(testObj);
            }
            setIsLoading(false);
        }
        if (accessModalState) fetchAccess();
    }, [accessModalState]);

    return (
        <Modal show={accessModalState} >
            {isLoading && <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                <div >
                    <Spinner animation="border" role="status" >
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            </div>}
            {
                !isLoading && <div>
                    <Modal.Header closeButton onClick={() => {
                        setAccUpdObj({});
                        setAccessModalState(false);
                    }}>
                        <Modal.Title>Set Access:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body >
                        <AccessElement
                            title={"Public access"}
                            readOnChange={() => {
                                setPublicAccess(prevState => ({ ...prevState, read: !publicAccess.read }));
                                setAccUpdObj(prevState => ({ ...prevState, "public": true }));
                            }}
                            appendOnChange={() => {
                                setPublicAccess(prevState => ({ ...prevState, append: !publicAccess.append }));
                                setAccUpdObj(prevState => ({ ...prevState, "public": true }));
                            }}
                            writeOnChange={() => {
                                setPublicAccess(prevState => ({ ...prevState, write: !publicAccess.write }));
                                setAccUpdObj(prevState => ({ ...prevState, "public": true }));
                            }}
                            readStatus={publicAccess.read}
                            appendStatus={publicAccess.append}
                            writeStatus={publicAccess.write}
                        />
                        <div>
                            <div className="d-flex justify-content-center"><h5>Set Access:</h5></div>
                            <div className="d-flex justify-content-around my-3">
                                <Button
                                    onClick={() => {
                                        setContactsOpen(!contactsOpen);
                                    }}
                                    aria-controls="example-collapse-text"
                                >
                                    Contacts:
                                </Button>
                            </div>
                            <Collapse in={contactsOpen}>
                                <div>
                                    {contactsFdrStatus && <div>
                                        {
                                            Object.entries(contactsList).map(([key, value], index) => {
                                                return (
                                                    <AccessElement
                                                        key={Date.now() + index + Math.floor(Math.random() * 1000)}
                                                        title={key}
                                                        readOnChange={() => {
                                                            const wId = (fullContacts[key]) ? fullContacts[key] : key;
                                                            setAgentsToUpd(prevState => (
                                                                {
                                                                    ...prevState, [wId ? wId : ""]:
                                                                        { read: !value.read, append: value.append, write: value.write }
                                                                }));
                                                            setContactsList(prevState => (
                                                                {
                                                                    ...prevState, [key]:
                                                                        { read: !value.read, append: value.append, write: value.write }
                                                                }));
                                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                                        }}
                                                        appendOnChange={() => {
                                                            const wId = (fullContacts[key]) ? fullContacts[key] : key;
                                                            setAgentsToUpd(prevState =>
                                                            ({
                                                                ...prevState, [wId ? wId : ""]:
                                                                    { read: value.read, append: !value.append, write: value.write }
                                                            }));
                                                            setContactsList(prevState =>
                                                            ({
                                                                ...prevState, [key]:
                                                                    { read: value.read, append: !value.append, write: value.write }
                                                            }));
                                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                                        }}
                                                        writeOnChange={() => {
                                                            const wId = (fullContacts[key]) ? fullContacts[key] : key;
                                                            setAgentsToUpd(prevState => (
                                                                {
                                                                    ...prevState, [wId ? wId : ""]:
                                                                        { read: value.read, append: value.append, write: !value.write }
                                                                }));
                                                            setContactsList(prevState => (
                                                                {
                                                                    ...prevState, [key]:
                                                                        { read: value.read, append: value.append, write: !value.write }
                                                                }));
                                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                                        }}
                                                        readStatus={contactsList[key].read}
                                                        appendStatus={contactsList[key].append}
                                                        writeStatus={contactsList[key].write}
                                                    />
                                                )
                                            })
                                        }
                                    </div>}
                                    {
                                        !contactsFdrStatus && <NoContacts />
                                    }
                                </div>
                            </Collapse>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary"
                            onClick={() => {
                                setAccUpdObj({});
                                setAccessModalState(false);
                            }}>Go back</Button>
                        <Button
                            className="set-access"
                            variant="primary" onClick={() => {
                                setAccessModalState(false);
                            }}>Set</Button>
                    </Modal.Footer>
                </div>
            }
        </Modal>
    );
}


export default AccessModal;

