import { LogoutButton, useSession } from "@inrupt/solid-ui-react";
import { Button } from "react-bootstrap";
import "../styles.css";
import { Note } from "./types";
import { CgNotes } from "react-icons/cg";
import { FiLogOut } from "react-icons/fi";
import { RiContactsLine } from "react-icons/ri";
import { TbListCheck } from "react-icons/tb";
interface Props {
    links: string[];
    active: string;
    setActive: React.Dispatch<React.SetStateAction<string>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
}
// this component renders NavBar, it iterates over "links" array and creates corresponding links
// clicking on the links sets "active" to the links value
// logout functionality is implemented using "LogoutButton" component from @inrupt/solid-ui-react
const Navbar = ({ links, active, setActive, viewerStatus, setViewerStatus,
    creatorStatus, setCreatorStatus, isEdit, setIsEdit }: Props) => {
    const { session} = useSession();
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error(`Error, couldn't get user's WebId`);
    }
    const onError = (error: Error) => {
        console.log(error);
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
        <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
                <div className="navbar-nav d-flex justify-content-around w-100">
                    {links.map((link, index) => (
                        <a
                            key={Date.now() + index}
                            className={`nav-link ${active === link ? 'active' : ''} cursor`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActive(link);
                                setViewerStatus(false);
                                setCreatorStatus(false);
                                setIsEdit(false);
                            }}
                        >{getIcon(link)} {link}</a>
                    ))}
                    <LogoutButton onError={onError} >
                        <Button variant="secondary"><FiLogOut /> Log Out</Button>
                    </LogoutButton>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;