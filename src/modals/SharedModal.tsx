import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { Modal, Button, Form, FormControl, InputGroup, DropdownButton, Dropdown, Spinner } from "react-bootstrap";
import { accessObject, Note, Habit } from "../components/types";
import { getPubAccess, getSharedList } from "../services/access";
import AccessElement from "./AccessElement";

interface Props {
    sharedModalState: boolean;
    setSharedModalState: React.Dispatch<React.SetStateAction<boolean>>;
    setNoteInp?: React.Dispatch<React.SetStateAction<Note>>;
    NoteInp?: Note;
    setHabitInp?: React.Dispatch<React.SetStateAction<Habit>>;
    habitInp?: Habit;
    viewerStatus: boolean;
    setArrOfChanges: React.Dispatch<React.SetStateAction<string[]>>;
    categoryArray: string[];
    setCategoryArray: React.Dispatch<React.SetStateAction<string[]>>;
    publicAccess: accessObject;
    setPublicAccess: React.Dispatch<React.SetStateAction<accessObject>>;
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
//a popup window to prompt user to pick a folder
const SharedModal = ({ sharedModalState, setSharedModalState, setNoteInp,
    NoteInp, viewerStatus, setArrOfChanges, categoryArray, setCategoryArray, publicAccess,
    accUpdObj, setAccUpdObj, agentsToUpd, setAgentsToUpd, setPublicAccess, habitInp, setHabitInp }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (!webId) {
        throw new Error("couldn't get your webId");
    }
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sharedList, setSharedList] = useState<Record<string, AccessModes>>({});

    useEffect(() => {
        const fetchAccess = async () => {
            setIsLoading(true);
            let inputToUse = NoteInp ? NoteInp : habitInp;

            //handle
            let key = Object.keys(inputToUse!.access!)[0];
            let pubAccess = inputToUse!.access![key];
            setPublicAccess({ read: pubAccess.read, append: pubAccess.append, write: pubAccess.write });
            if (inputToUse!.shareList) setSharedList(inputToUse!.shareList);
            else setSharedList({});

            setIsLoading(false);
        }
        if (sharedModalState) fetchAccess();

    }, [sharedModalState]);
    return (
        <Modal show={sharedModalState}>
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
                        setSharedModalState(false);
                    }}>
                        <Modal.Title>Shared List:</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
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
                        {
                            Object.entries(sharedList).map(([key, value], index) => {
                                return (
                                    <AccessElement
                                        key={Date.now() + index + Math.floor(Math.random() * 1000)}
                                        title={key}
                                        readOnChange={() => {
                                            setAgentsToUpd(prevState => ({ ...prevState, [key]: { read: !value.read, append: value.append, write: value.write } }));
                                            setSharedList(prevState => ({ ...prevState, [key]: { read: !value.read, append: value.append, write: value.write } }));
                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                        }}
                                        appendOnChange={() => {
                                            setAgentsToUpd(prevState => ({ ...prevState, [key]: { read: value.read, append: !value.append, write: value.write } }));
                                            setSharedList(prevState => ({ ...prevState, [key]: { read: value.read, append: !value.append, write: value.write } }));
                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                        }}
                                        writeOnChange={() => {
                                            setAgentsToUpd(prevState => ({ ...prevState, [key]: { read: value.read, append: value.append, write: !value.write } }));
                                            setSharedList(prevState => ({ ...prevState, [key]: { read: value.read, append: value.append, write: !value.write } }));
                                            setAccUpdObj(prevState => ({ ...prevState, "agent": true }));
                                        }}
                                        readStatus={sharedList[key].read}
                                        appendStatus={sharedList[key].append}
                                        writeStatus={sharedList[key].write}
                                    />
                                )
                            })
                        }
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => {
                            setAccUpdObj({});
                            setSharedModalState(false);
                        }}>Go Back</Button>
                        <Button variant="primary" onClick={() => setSharedModalState(false)}>save</Button>
                    </Modal.Footer>
                </div>
            }
        </Modal >
    );
}

export default SharedModal;