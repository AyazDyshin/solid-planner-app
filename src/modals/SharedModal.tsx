import { AccessModes } from "@inrupt/solid-client/dist/acp/policy";
import { useSession } from "@inrupt/solid-ui-react";
import React, { useEffect, useState } from "react";
import { Modal, Button, Spinner } from "react-bootstrap";
import { accessObject, Note, Habit } from "../services/types";
import AccessElement from "./AccessElement";

interface Props {
    sharedModalState: boolean;
    setSharedModalState: React.Dispatch<React.SetStateAction<boolean>>;
    NoteInp?: Note;
    habitInp?: Habit;
    publicAccess: accessObject;
    setPublicAccess: React.Dispatch<React.SetStateAction<accessObject>>;
    setAccUpdObj: React.Dispatch<React.SetStateAction<{
        [x: string]: boolean;
    }>>;
    setAgentsToUpd: React.Dispatch<React.SetStateAction<{
        [x: string]: AccessModes;
    }>>;
}

/**
 * Component that renders shared list of a given entry modal
 *
 * @category Modals
 * @component
 */
const SharedModal = ({ sharedModalState, setSharedModalState, NoteInp, publicAccess, setAccUpdObj, setAgentsToUpd, setPublicAccess,
    habitInp }: Props) => {
    const { session } = useSession();
    const { webId } = session.info;
    if (!webId) {
        throw new Error(`Error, couldn't get user's WebId`);
    }
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sharedList, setSharedList] = useState<Record<string, AccessModes>>({});

    useEffect(() => {
        const fetchAccess = async () => {
            setIsLoading(true);
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
            if (inputToUse.shareList) setSharedList(inputToUse.shareList);
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
                        }}>Go back</Button>
                        <Button variant="primary" onClick={() => setSharedModalState(false)}>Save</Button>
                    </Modal.Footer>
                </div>
            }
        </Modal >
    );
}

export default SharedModal;