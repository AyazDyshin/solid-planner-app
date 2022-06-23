import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { useSession } from "@inrupt/solid-ui-react";
import { useState, useEffect, SetStateAction } from "react";
import { Modal, Button, Form, FormControl, InputGroup, DropdownButton, Dropdown, Collapse, Spinner } from "react-bootstrap";
import { Note } from "../components/types";
import { getPubAccess, getSharedList, setPubAccess, shareWith } from "../services/access";
import { checkContacts, fetchContacts, modifyWebId } from "../services/SolidPod";
import "../styles.css";
import AccessElement from "./AccessElement";
import { accessObject } from "../components/types";
import NoContacts from "../components/NoContacts";

interface Props {
    accessModalState: boolean;
    setAccessModalState: React.Dispatch<React.SetStateAction<boolean>>;
    setNoteInp: React.Dispatch<React.SetStateAction<Note>>;
    noteInp: Note;
    viewerStatus: boolean;
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
    noteToView: Note | null;
    setNoteToView: React.Dispatch<React.SetStateAction<Note | null>>;
    publicAccess: accessObject;
    setPublicAccess: React.Dispatch<React.SetStateAction<accessObject>>;
    contactsList: {
        [x: string]: AccessModes;
    };
    setContactsList: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
    webIdToSave: {
        [x: string]: AccessModes;
    };
    setWebIdToSave: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
    sharedList: Record<string, AccessModes>;
    setSharedList: React.Dispatch<React.SetStateAction<Record<string, AccessModes>>>;
    fullContacts: {
        [x: string]: string | null;
    };
    setFullContacts: React.Dispatch<React.SetStateAction<{
        [x: string]: string | null;
    }>>;
    accUpdObj: {
        [x: string]: boolean;
    };
    setAccUpdObj: React.Dispatch<React.SetStateAction<{
        [x: string]: boolean;
    }>>;
    agentsToUpd: {
        [x: string]: AccessModes;
    };
    setAgentsToUpd: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
}
//a popup window to prompt user to set access type
const AccessModal = ({ accessModalState, setAccessModalState, setNoteInp, contactsList, setContactsList, accUpdObj, setAccUpdObj,
    noteInp, viewerStatus, setArrOfChanges, noteToView, setNoteToView, publicAccess, setPublicAccess,
    sharedList, setSharedList, webIdToSave, setWebIdToSave, fullContacts, setFullContacts, agentsToUpd, setAgentsToUpd }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (!webId) {
        throw new Error("couldn't get your webId");
    }
    const [sharedOpen, setSharedOpen] = useState<boolean>(false);
    const [sharingOpen, setSharingOpen] = useState<boolean>(false);
    const [contactsOpen, setContactsOpen] = useState<boolean>(false);
    const [webIdOpen, setWebIdOpen] = useState<boolean>(false);
    const [contactsStat, setContactsStat] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [currentWebId, setCurrentWebId] = useState<string>("");
    const [webIdReady, setWebIdReady] = useState<boolean>(false);
    const [workingWebId, setWorkingWebId] = useState<string>("");

    useEffect(() => {
        const fetchAccess = async () => {

            setIsLoading(true);
            setSharedOpen(false);
            setSharingOpen(false);
            setContactsOpen(false);
            setWebIdOpen(false);
            //handle
            let key = Object.keys(noteToView!.access!)[0];
            let pubAccess = noteToView!.access![key];
            setPublicAccess({ read: pubAccess.read, append: pubAccess.append, write: pubAccess.write });
            //let shList = await getSharedList(webId, noteToView!.url, fetch);
            let shList: Record<string, AccessModes>;
            if (noteToView!.shareList) shList = noteToView!.shareList;
            else shList = {};
            setSharedList(shList);
            let contactsStatus = await checkContacts(webId, fetch);
            setContactsStat(contactsStatus);
            if (contactsStatus) {
                const namesAndIds = await fetchContacts(webId, fetch);
                let contObj: { [x: string]: string | null; } = {};

                namesAndIds.map((pair) => {
                    if (pair[0]) contObj[pair[0]] = pair[1];
                });

                setFullContacts(contObj);
                let testObj: { [x: string]: AccessModes; } = {};
                const namesArr = namesAndIds.filter((pair) => pair !== [null, null])
                    .map((pair) => {
                        let contName = pair[0] ? pair[0] : pair[1];
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
                                    {!contactsStat && <div>
                                        {
                                            Object.entries(contactsList).map(([key, value]) => {
                                                return (
                                                    <AccessElement
                                                        key={Date.now() + Math.floor(Math.random() * 1000)}
                                                        title={key}
                                                        readOnChange={() => {
                                                            let wId = (fullContacts[key]) ? fullContacts[key] : key;
                                                            setAgentsToUpd(prevState => ({ ...prevState, [wId!]: { read: !value.read, append: value.append, write: value.write } }));
                                                            setContactsList(prevState => ({ ...prevState, [key]: { read: !value.read, append: value.append, write: value.write } }));
                                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                                        }}
                                                        appendOnChange={() => {
                                                            let wId = (fullContacts[key]) ? fullContacts[key] : key;
                                                            setAgentsToUpd(prevState => ({ ...prevState, [wId!]: { read: value.read, append: !value.append, write: value.write } }));
                                                            setContactsList(prevState => ({ ...prevState, [key]: { read: value.read, append: !value.append, write: value.write } }));
                                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                                        }}
                                                        writeOnChange={() => {
                                                            let wId = (fullContacts[key]) ? fullContacts[key] : key;
                                                            setAgentsToUpd(prevState => ({ ...prevState, [wId!]: { read: value.read, append: value.append, write: !value.write } }));
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
                                        contactsStat && <NoContacts />
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
                            }}>Go Back</Button>
                        <Button variant="primary" onClick={() => {
                            setAccessModalState(false);
                        }}>set</Button>
                    </Modal.Footer>
                </div>
            }
        </Modal>
    );
}


export default AccessModal;

