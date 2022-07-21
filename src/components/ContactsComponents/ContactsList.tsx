import React, { useState } from "react";
import { Container, Modal, Nav, Navbar, OverlayTrigger, Popover } from "react-bootstrap";
import { MdAdd } from "react-icons/md";

interface Props {
    contactsArr: (string | null)[][],
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Fetches contacts list from the user's POD if not fetched and renders contacts list
 *
 * @category Contacts components
 */
const ContactsList = ({ contactsArr, setOtherWebId, setIsLoading }: Props) => {
    contactsArr.map((item) => item[0]);
    const [activeContact, setActiveContact] = useState<string | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);

    const handleClose = () => {
        setShowModal(false);
    }

    return (
        <div className="w-100 h-100">
            <div className="d-flex">
                <Navbar expand="lg" bg="warning" variant="light" className="w-100">
                    <Container>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="me-auto">
                                <OverlayTrigger placement="right" overlay={
                                    <Popover>
                                        <Popover.Body className="py-1 px-1">
                                            How to add contacts?
                                        </Popover.Body>
                                    </Popover>}>
                                    <Nav.Link onClick={() => { setShowModal(true) }}>
                                        <MdAdd /> Add</Nav.Link>
                                </OverlayTrigger>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>
            <div className="list-group w-100 h-80">
                {
                    contactsArr.map((contact, index) => {
                        return <a
                            key={Date.now() + index + Math.floor(Math.random() * 1000)}
                            className={`list-group-item px-1 text-center list-group-item-action 
                            ${activeContact === contact[1] ? 'active' : ''}`}
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
                <div className="card text-center">
                    <div className="card-body">
                        <h5 className="card-title">
                            Adding contacts
                        </h5>
                        <div className="card-text">
                            <div className="card text-center">
                                <ol className="list-group list-group-numbered">
                                    <li className="list-group-item">Go to <a href="https://podbrowser.inrupt.com/login" target="_blank" className="link-primary"
                                        rel="noreferrer">Inrupt&apos;s POD browser</a></li>
                                    <li className="list-group-item">Authorize with your POD provider</li>
                                    <li className="list-group-item">Go to &quot;Contacts&quot; tab</li>
                                    <li className="list-group-item">Add at least one webId</li>
                                    <li className="list-group-item">
                                        After that the contacts that you add there would be shown in this tab</li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default ContactsList;