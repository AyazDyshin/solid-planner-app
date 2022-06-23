import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { useSession } from "@inrupt/solid-ui-react";
import { useState, useEffect } from "react";
import { Modal, Button, Form, FormControl, InputGroup, DropdownButton, Dropdown, Collapse, Spinner } from "react-bootstrap";
import { Note } from "../components/types";
import { getPubAccess, getSharedList, setPubAccess, shareWith } from "../services/access";
import { checkContacts, fetchContacts, modifyWebId } from "../services/SolidPod";
import "../styles.css";
import AccessElement from "./AccessElement";
import { accessObject } from "../components/types";

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
}
//a popup window to prompt user to set access type
const AccessModal = ({ accessModalState, setAccessModalState, setNoteInp, contactsList, setContactsList,
    noteInp, viewerStatus, setArrOfChanges, noteToView, setNoteToView, publicAccess, setPublicAccess,
    sharedList, setSharedList, webIdToSave, setWebIdToSave, fullContacts, setFullContacts }: Props) => {
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
    const [reload, setReload] = useState<boolean>(false);
    const [accUpdObj, setAccUpdObj] = useState<{ [x: string]: boolean; }>({});
    useEffect(() => {
        const fetchAccess = async () => {

            setIsLoading(true);
            setSharedOpen(false);
            setSharingOpen(false);
            setContactsOpen(false);
            setWebIdOpen(false);
            //handle
            let pubAccess = await getPubAccess(webId, noteToView!.url, fetch);
            setPublicAccess({ read: pubAccess.read, append: pubAccess.append, write: pubAccess.write });
            let shList = await getSharedList(webId, noteToView!.url, fetch);
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

    }, [accessModalState, reload]);

    const handleSave = async () => {
        //handle
        // await setPubAccess(webId, publicAccess, noteToView!.url, fetch);
        // for (let item in contactsList) {
        //     if (fullContacts[item]) {
        //         await shareWith(webId, noteToView!.url, fetch, contactsList[item], fullContacts[item]!);
        //     }
        //     else {
        //         await shareWith(webId, noteToView!.url, fetch, contactsList[item], item);
        //     }
        // }
        // for (let item in sharedList) {
        //     await shareWith(webId, noteToView!.url, fetch, sharedList[item], item);

        // }
        // for (let item in webIdToSave) {
        //     await shareWith(webId, noteToView!.url, fetch, webIdToSave[item], item);

        // }
    }


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
                    <Modal.Header closeButton onClick={() => { setAccessModalState(false) }}>
                        <Modal.Title>Set Access:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body >
                        <AccessElement
                            title={"Public access"}
                            readOnChange={() => {
                                setPublicAccess(prevState => ({ ...prevState, read: !publicAccess.read }));
                                setAccUpdObj(prevState => ({ ...prevState, "public": true }));
                            }}
                            appendOnChange={() => setPublicAccess(prevState => ({ ...prevState, append: !publicAccess.append }))}
                            writeOnChange={() => setPublicAccess(prevState => ({ ...prevState, write: !publicAccess.write }))}
                            readStatus={publicAccess.read}
                            appendStatus={publicAccess.append}
                            writeStatus={publicAccess.write}
                        />

                        <div>
                            <div className="d-flex justify-content-around my-3">
                                <Button
                                    onClick={() => {
                                        setSharedOpen(!sharedOpen);
                                        setSharingOpen(false);
                                    }}
                                    aria-controls="example-collapse-text"
                                >
                                    Shared with:
                                </Button>
                                <Button
                                    onClick={() => {
                                        setSharingOpen(!sharingOpen);
                                        setSharedOpen(false);
                                    }}
                                    aria-controls="example-collapse-text"
                                >
                                    Share:
                                </Button>
                            </div>
                            <Collapse in={sharedOpen}>
                                <div>
                                    {
                                        Object.entries(sharedList).map(([key, value]) => {
                                            return (
                                                <AccessElement
                                                    key={Date.now() + Math.floor(Math.random() * 1000)}
                                                    title={key}
                                                    readOnChange={() => setSharedList(prevState => ({ ...prevState, [key]: { read: !value.read, append: value.append, write: value.write } }))}
                                                    appendOnChange={() => setSharedList(prevState => ({ ...prevState, [key]: { read: value.read, append: !value.append, write: value.write } }))}
                                                    writeOnChange={() => setSharedList(prevState => ({ ...prevState, [key]: { read: value.read, append: value.append, write: !value.write } }))}
                                                    readStatus={sharedList[key].read}
                                                    appendStatus={sharedList[key].append}
                                                    writeStatus={sharedList[key].write}
                                                />
                                            )
                                        })
                                    }
                                </div>
                            </Collapse>

                            <Collapse in={sharingOpen}>
                                <div>
                                    <div className="d-flex justify-content-around my-3">
                                        <Button
                                            onClick={() => {
                                                setContactsOpen(!contactsOpen);
                                                setWebIdOpen(false);
                                            }}
                                            aria-controls="example-collapse-text"
                                        >
                                            Contacts:
                                        </Button>
                                        <Button
                                            onClick={() => {
                                                setWebIdOpen(!webIdOpen);
                                                setContactsOpen(false);
                                            }}
                                            aria-controls="example-collapse-text"
                                        >
                                            WebId:
                                        </Button>
                                    </div>
                                    <Collapse in={contactsOpen}>
                                        <div id="example-collapse-text">
                                            {
                                                Object.entries(contactsList).map(([key, value]) => {
                                                    return (
                                                        <AccessElement
                                                            key={Date.now() + Math.floor(Math.random() * 1000)}
                                                            title={key}
                                                            readOnChange={() => setContactsList(prevState => ({ ...prevState, [key]: { read: !value.read, append: value.append, write: value.write } }))}
                                                            appendOnChange={() => setContactsList(prevState => ({ ...prevState, [key]: { read: value.read, append: !value.append, write: value.write } }))}
                                                            writeOnChange={() => setContactsList(prevState => ({ ...prevState, [key]: { read: value.read, append: value.append, write: !value.write } }))}
                                                            readStatus={contactsList[key].read}
                                                            appendStatus={contactsList[key].append}
                                                            writeStatus={contactsList[key].write}
                                                        />
                                                    )
                                                })
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
                                                    console.log(workingWebId);
                                                    setWebIdToSave({ [currentWebId]: { read: false, append: false, write: false } })
                                                    console.log("suk");
                                                    console.log(webIdToSave);
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
                                                        handleSave();
                                                        setReload(!reload);
                                                    }}>Save</Button>
                                                </div>
                                            }
                                        </div>
                                    </Collapse>
                                </div>
                            </Collapse>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setAccessModalState(false)}>Go Back</Button>
                        <Button variant="primary" onClick={() => {
                            handleSave();
                            setAccessModalState(false);
                        }}>save</Button>
                    </Modal.Footer>
                </div>
            }
        </Modal>
    );
}


export default AccessModal;

