import React, { useEffect } from 'react';
import { LogoutButton, useSession } from "@inrupt/solid-ui-react";
import { Badge, Button, Container, Nav, Navbar, OverlayTrigger, Popover } from "react-bootstrap";
import "../styles.css";
import { CgNotes } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { RiContactsLine } from "react-icons/ri";
import { TbListCheck } from "react-icons/tb";
import { useState } from "react";
import { capitalizeFirstLetter } from '../services/helpers';
import { AiOutlineInbox } from 'react-icons/ai';
import { appNotification } from './types';
import { getThingsFromInbox, thingToNotification } from '../services/SolidPod';

interface Props {
    links: string[];
    active: string;
    setActive: React.Dispatch<React.SetStateAction<string>>;
    refetchNotifications: boolean;
    podType: string;
}
// this component renders NavBar, it iterates over "links" array and creates corresponding links
// clicking on the links sets "active" to the links value
// logout functionality is implemented using "LogoutButton" component from @inrupt/solid-ui-react
const NavbarSolidApp = ({ links, active, setActive, refetchNotifications, podType }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error(`Error, couldn't get user's WebId`);
    }
    const [expanded, setExpanded] = useState(false);
    const [inboxArray, setInboxArray] = useState<appNotification[]>([]);

    useEffect(() => {
        const fetchNotifications = async () => {
            const notificationThings = await getThingsFromInbox(webId, fetch);
            const notificationArr = notificationThings.map((thing) => thingToNotification(thing));
            const updInbox: appNotification[] = notificationArr.filter((item): item is appNotification => item !== null);
            setInboxArray(updInbox);
        }
        fetchNotifications();
    }, [refetchNotifications]);
    const onError = (error: Error) => {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        throw new Error(`Error when trying to logout, error: ${message}`);
    }

    const handleDismiss = async () => {
        setInboxArray([]);
        await getThingsFromInbox(webId, fetch, true);
    }

    const getIcon = (link: string) => {
        switch (link) {
            case "notes":
                return <CgNotes />;
            case "habits":
                return <TbListCheck />;
            case "contacts":
                return <RiContactsLine />;
            default:
                return <div></div>;
        }
    }
    const popover = (
        <Popover id="popover-basic">
            <Popover.Header className="d-flex" as="h3">Inbox {inboxArray.length !== 0 && <Button onClick={handleDismiss}
                className="ms-auto" variant="outline-info" size="sm">Dismiss all</Button>}</Popover.Header>
            <Popover.Body style={{ "overflowY": "scroll", "maxHeight": "70vh" }}>
                {
                    inboxArray.length === 0 && <div>
                        You don&apos;t have any notifications
                    </div>
                }
                {
                    inboxArray.length !== 0 && <div>
                        {
                            inboxArray.map((link, index) => (
                                <div key={Date.now() + index}>
                                    <div> The user:</div>
                                    <div><strong>{link.sender}</strong></div>
                                    shared a <strong>{link.entryType}</strong> with you.
                                    <div>the <strong>{link.entryType}</strong> has the following url:</div>
                                    <div><strong>{link.url}</strong></div>
                                    <div>your access rights to this  <strong>{link.entryType}</strong> are: </div>
                                    <strong>{link.access.read && "read"}</strong>
                                    <strong>{link.access.append && "append"}</strong>
                                    <strong> {link.access.write && "write"}</strong>
                                </div>
                            ))
                        }
                    </div>
                }

            </Popover.Body>
        </Popover>
    );
    return (
        <Navbar bg="primary" variant="dark" expand="lg" fixed="top" expanded={expanded}>
            <Container>
                <Navbar.Brand>Solid Planner App</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" onClick={() => setExpanded(!expanded)} />
                <Navbar.Collapse>
                    <Nav className="d-flex justify-content-around w-100">
                        {links.map((link, index) => (
                            <Nav.Link
                                key={Date.now() + index}
                                className={`nav-link ${active === link ? 'active' : ''} cursor`}
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActive(link);
                                    setExpanded(false)
                                }}
                            >{getIcon(link)} {capitalizeFirstLetter(link)}</Nav.Link>
                        ))}
                        {
                            podType === 'wac' && <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
                                <Nav.Link>
                                    <AiOutlineInbox /> Inbox {inboxArray.length !== 0 && <Badge pill bg="danger">new</Badge>}
                                </Nav.Link>
                            </OverlayTrigger >
                        }
                        <LogoutButton onError={onError}>
                            <Nav.Link className="logout-button"><FiLogOut /> Log out</Nav.Link>
                        </LogoutButton>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default NavbarSolidApp;