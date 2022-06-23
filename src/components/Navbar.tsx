import { LogoutButton, useSession } from "@inrupt/solid-ui-react";
import { Button } from "react-bootstrap";
import "../styles.css";
import { Note } from "./types";
interface Props {
    links: string[];
    active: string;
    setActive: React.Dispatch<React.SetStateAction<string>>;
    otherWebId: string | null;
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    viewerStatus: boolean;
    setViewerStatus: React.Dispatch<React.SetStateAction<boolean>>;
    creatorStatus: boolean;
    setCreatorStatus: React.Dispatch<React.SetStateAction<boolean>>;
    isEdit: boolean;
    setIsEdit: React.Dispatch<React.SetStateAction<boolean>>;
    notesArray: (Note | null)[];
    setNotesArray: React.Dispatch<React.SetStateAction<(Note | null)[]>>;
    contactsArr: (string | null)[][];
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    isLoadingContents: boolean;
    setIsLoadingContents: React.Dispatch<React.SetStateAction<boolean>>;
}
// this component renders NavBar, it iterates over "links" array and creates corresponding links
// clicking on the links sets "active" to the links value
// logout functionality is implemented using "LogoutButton" component from @inrupt/solid-ui-react
const Navbar = ({ links, active, setActive, viewerStatus, setViewerStatus,
    creatorStatus, setCreatorStatus, isEdit, setIsEdit, otherWebId, setOtherWebId,
    notesArray, setNotesArray, contactsArr, setContactsArr, isLoadingContents, setIsLoadingContents }: Props) => {
    const onError = (error: Error) => {
        console.log(error);
    }

    return (
        <nav className="navbar fixed-top navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">
                <div className="navbar-nav d-flex justify-content-around w-100">
                    {links.map((link) => (
                        <a
                            key={`${link}${Date.now()}`}
                            className={`nav-link ${active === link ? 'active' : ''} nav`}
                            onClick={(e) => {
                                e.preventDefault();
                                setNotesArray([]);
                                setIsLoadingContents(true);
                                setViewerStatus(false);
                                setCreatorStatus(false);
                                setIsEdit(false);
                                setOtherWebId(null);
                                setActive(link);
                            }}
                        >{link}</a>
                    ))}
                    <LogoutButton onError={onError} >
                        <Button variant="secondary">Log Out</Button>
                    </LogoutButton>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;