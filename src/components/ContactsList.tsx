import { useState } from "react";
import React from 'react';
import { Button, Collapse, Dropdown, DropdownButton, Modal, OverlayTrigger, Popover } from "react-bootstrap";
import { BsPlusLg } from "react-icons/bs";
import NoContacts from "./NoContacts";
import { GoPrimitiveDot } from "react-icons/go";
import { RiArrowDropDownLine, RiArrowGoBackFill } from "react-icons/ri";
import { VscTypeHierarchySuper } from "react-icons/vsc";

interface Props {
    contactsArr: (string | null)[][],
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    otherWebId: string | null;
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContactsList = ({ contactsArr, setContactsArr, otherWebId, setOtherWebId, isLoading, setIsLoading }: Props) => {
    const contactsNames = contactsArr.map((item) => item[0]);
    const [activeContact, setActiveContact] = useState<string | null>(null);
    const [open, setOpen] = useState(false);
    const [showModal, setShowModal] = useState<boolean>(false);
    const handleClose = () => {
        setShowModal(false);
    }
    return (
        <div className="w-100 h-100">
            <div className="d-flex">
                <OverlayTrigger placement="right" overlay={
                    <Popover>
                        <Popover.Body className="py-1 px-1">
                            How to add contacts?
                        </Popover.Body>
                    </Popover>}>
                    <Button variant="secondary" onClick={() => { setShowModal(true) }} className="ms-auto my-1 py-2 d-flex align-items-center justify-content-center">
                        <BsPlusLg /></Button>
                </OverlayTrigger>
            </div>
            <div className="list-group w-100 h-80">
                {
                    contactsArr.map((contact, index) => {
                        return <a
                            key={Date.now() + index + Math.floor(Math.random() * 1000)}
                            className={`list-group-item px-1 text-center list-group-item-action ${activeContact === contact[1] ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setIsLoading(true);
                                setActiveContact(contact[1]);
                                setOtherWebId(contact[1]);
                            }}
                        >
                            {contact[0] ? contact[0] : "no name"}
                        </a>
                    })
                }
            </div>
            <Modal show={showModal} onHide={handleClose}>
                <NoContacts />
            </Modal>
        </div>
    )
}

export default ContactsList;