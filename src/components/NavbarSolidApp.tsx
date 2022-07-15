import React from 'react';
import { LogoutButton, useSession } from "@inrupt/solid-ui-react";
import { Container, Nav, Navbar } from "react-bootstrap";
import "../styles.css";
import { CgNotes } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { RiContactsLine } from "react-icons/ri";
import { TbListCheck } from "react-icons/tb";
import { useState } from "react";
import { capitalizeFirstLetter } from '../services/helpers';
interface Props {
    links: string[];
    active: string;
    setActive: React.Dispatch<React.SetStateAction<string>>;
}
// this component renders NavBar, it iterates over "links" array and creates corresponding links
// clicking on the links sets "active" to the links value
// logout functionality is implemented using "LogoutButton" component from @inrupt/solid-ui-react
const NavbarSolidApp = ({ links, active, setActive }: Props) => {
    const { session } = useSession();
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error(`Error, couldn't get user's WebId`);
    }
    const [expanded, setExpanded] = useState(false);

    const onError = (error: Error) => {
        let message = 'Unknown Error';
        if (error instanceof Error) message = error.message;
        throw new Error(`Error when trying to logout, error: ${message}`);
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

    return (
        <Navbar bg="primary" variant="dark" expand="lg" fixed="top" expanded={expanded}>
            <Container>
                <Navbar.Brand href="#home">Solid Planner App</Navbar.Brand>
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
                        <LogoutButton onError={onError} >
                            <Nav.Link><FiLogOut /> Log out</Nav.Link>
                        </LogoutButton>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    )
}

export default NavbarSolidApp;