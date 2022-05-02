import { useState } from "react";


const Navbar = () => {
    const links = ['notes', 'link2', 'link3'];
    const [active, setActive] = useState("notes");
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

                    </div>
                </div>
            </nav>

    )
}

export default Navbar;