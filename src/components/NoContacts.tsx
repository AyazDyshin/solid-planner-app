import React, { useState } from 'react'
import { Button, Collapse } from "react-bootstrap";

const NoContacts = () => {
    const [open, setOpen] = useState(false);

    return (
        <div className="card text-center">
            <div className="card-body">
                <h5 className="card-title">It seems like you don't have contacts set up in you POD
                </h5>
                <div className="card-text">
                    <Button
                        onClick={() => setOpen(!open)}
                        aria-controls="example-collapse-text"
                        aria-expanded={open}
                    >
                        How to fix this?
                    </Button>
                    <Collapse in={open}>
                        <div className="card text-center">
                            <ol className="list-group list-group-numbered">
                                <li className="list-group-item">Go to <a href="https://podbrowser.inrupt.com/login" className="link-primary">Inrupt's POD browser</a></li>
                                <li className="list-group-item">Authorize with your POD provider</li>
                                <li className="list-group-item">Go to "Contacts" tab</li>
                                <li className="list-group-item">Add at least one webId</li>
                                <li className="list-group-item">After that the contacts that you add there would be shown in this tab</li>
                            </ol>
                        </div>
                    </Collapse>

                </div>
            </div>
        </div>
    )
}

export default NoContacts;

