import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { useSession } from "@inrupt/solid-ui-react";
import React, { useState, useEffect } from "react";
import { Modal, Button, FormControl, InputGroup, Collapse, Spinner } from "react-bootstrap";
import { Habit, Note } from "../components/types";
import { checkContacts, fetchContacts } from "../services/SolidPod";
import "../styles.css";
import AccessElement from "./AccessElement";
import { accessObject } from "../components/types";
import NoContacts from "../components/NoContacts";

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
//a popup window to prompt user to set access type
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
    const [webIdOpen, setWebIdOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentWebId, setCurrentWebId] = useState<string>("");
    const [webIdReady, setWebIdReady] = useState<boolean>(false);
    const [workingWebId, setWorkingWebId] = useState<string>("");
    const [webIdToSave, setWebIdToSave] = useState<{ [x: string]: AccessModes; }>({});
    const [fullContacts, setFullContacts] = useState<{ [x: string]: string | null; }>({});
    const [sharedList, setSharedList] = useState<Record<string, AccessModes>>({});

    useEffect(() => {
        const fetchAccess = async () => {

            setIsLoading(true);
            setContactsOpen(false);
            setWebIdOpen(false);
            //handle
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
            setSharedList(shList);
            let namesAndIds: (string | null)[][] = [];
            let contactsStatus = false;
            if (!contactsFetched) {
                contactsStatus = await checkContacts(webId, fetch, storagePref);
                setContactsFdrStatus(contactsStatus);
                if (contactsStatus) {
                    namesAndIds = await fetchContacts(webId, fetch, storagePref);
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
                                        setWebIdOpen(false);
                                    }}
                                    aria-controls="example-collapse-text"
                                >
                                    By Contacts:
                                </Button>
                                <Button
                                    onClick={() => {
                                        setWebIdOpen(!webIdOpen);
                                        setContactsOpen(false);
                                    }}
                                    aria-controls="example-collapse-text"
                                >
                                    By  WebId:
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
                                                            setAgentsToUpd(prevState => ({ ...prevState, [wId ? wId : ""]: { read: !value.read, append: value.append, write: value.write } }));
                                                            setContactsList(prevState => ({ ...prevState, [key]: { read: !value.read, append: value.append, write: value.write } }));
                                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                                        }}
                                                        appendOnChange={() => {
                                                            const wId = (fullContacts[key]) ? fullContacts[key] : key;
                                                            setAgentsToUpd(prevState => ({ ...prevState, [wId ? wId : ""]: { read: value.read, append: !value.append, write: value.write } }));
                                                            setContactsList(prevState => ({ ...prevState, [key]: { read: value.read, append: !value.append, write: value.write } }));
                                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                                        }}
                                                        writeOnChange={() => {
                                                            const wId = (fullContacts[key]) ? fullContacts[key] : key;
                                                            setAgentsToUpd(prevState => ({ ...prevState, [wId ? wId : ""]: { read: value.read, append: value.append, write: !value.write } }));
                                                            setContactsList(prevState => ({ ...prevState, [key]: { read: value.read, append: value.append, write: !value.write } }));
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
                            <Collapse in={webIdOpen}>
                                <div>

                                    <InputGroup>
                                        <FormControl aria-label="Text input with dropdown button" value={currentWebId}
                                            onChange={(e) => {
                                                setCurrentWebId(e.target.value);
                                            }} />
                                        <Button onClick={() => {
                                            setWorkingWebId(currentWebId);
                                            if (sharedList[currentWebId]) {
                                                setWebIdToSave({ [currentWebId]: sharedList[currentWebId] });
                                            }
                                            else setWebIdToSave({ [currentWebId]: { read: false, append: false, write: false } });
                                            setCurrentWebId("");
                                            setWebIdReady(true);
                                        }}>Ok</Button>
                                    </InputGroup>
                                    {
                                        webIdReady &&
                                        <div>
                                            <AccessElement
                                                title={workingWebId}
                                                readOnChange={() => setWebIdToSave(prevState => ({ ...prevState, [workingWebId]: { read: !webIdToSave[workingWebId].read, append: webIdToSave[workingWebId].append, write: webIdToSave[workingWebId].write } }))}
                                                appendOnChange={() => setWebIdToSave(prevState => ({ ...prevState, [workingWebId]: { read: webIdToSave[workingWebId].read, append: !webIdToSave[workingWebId].append, write: webIdToSave[workingWebId].write } }))}
                                                writeOnChange={() => setWebIdToSave(prevState => ({ ...prevState, [workingWebId]: { read: webIdToSave[workingWebId].read, append: webIdToSave[workingWebId].append, write: !webIdToSave[workingWebId].write } }))}
                                                readStatus={webIdToSave[workingWebId].read}
                                                appendStatus={webIdToSave[workingWebId].append}
                                                writeStatus={webIdToSave[workingWebId].write}
                                            />
                                            <Button onClick={() => {
                                                setAgentsToUpd(prevState => ({ ...prevState, ...webIdToSave }));
                                                setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                                setWebIdReady(false);
                                            }}>Save</Button>
                                        </div>
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
                        <Button variant="primary" onClick={() => {
                            setAccessModalState(false);
                        }}>Set</Button>
                    </Modal.Footer>
                </div>
            }
        </Modal>
    );
}


export default AccessModal;

