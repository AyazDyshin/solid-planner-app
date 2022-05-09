import { useState } from "react";
import { LogoutButton, useSession } from "@inrupt/solid-ui-react";
import { Button } from "react-bootstrap";
interface Props{
    links : string[];
    active: string;
    setActive: React.Dispatch<React.SetStateAction<string>>;
}

const Navbar = ({links, active, setActive}: Props) => {
   
    const onError = (error: Error) => {
        console.log(error);
      }
    return (

        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <div className="container-fluid">

                <div className="navbar-nav d-flex justify-content-around w-100">


                    {links.map((link) => (
                        <a
                            href=""
                            className={`nav-link ${active === link ? 'active' : ''}`}
                            onClick={(e) => {
                                e.preventDefault();
                                setActive(link)
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