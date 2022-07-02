import { LogoutButton, useSession } from '@inrupt/solid-ui-react';
import React from 'react';
import { Button, Card } from 'react-bootstrap';
import { FiLogOut } from "react-icons/fi";
import { AiOutlineLink } from "react-icons/ai";
import { MdRefresh } from "react-icons/md";
interface Props {
    refresh: boolean;
    setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}
const NoPermissions = ({ refresh, setRefresh }: Props) => {
    const { session, fetch } = useSession();
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error("error when trying to get webId");
    }
    return (
        <div className="d-flex justify-content-center align-items-center w-100 h-100">
            <Card style={{ width: '40%' }} className="text-center">
                <Card.Body>
                    <Card.Title>Seems like you didn't grant us permissions!</Card.Title>
                    <Card.Text>
                        Here is how to fix that:
                        <ol className="list-group list-group-numbered">
                            <li className="list-group-item">Go to <a href={webId} target="_blank" className="link-primary">Your POD's browser <AiOutlineLink /></a></li>
                            <li className="list-group-item">Display your preferences. <a href="https://github.com/SolidOS/userguide/blob/main/README.md#preferences"
                                target="_blank" className="link-primary">how? <AiOutlineLink /></a></li>
                            <li className="list-group-item">Go to <strong>"Manage your trusted applications"</strong> section.</li>
                            <li className="list-group-item">locate this application's URL (https://ayazdyshin.github.io)</li>
                            <li className="list-group-item">Enable : <strong>Read</strong>, <strong>Write</strong>, <strong>Append</strong>, <strong>Control</strong>.</li>
                            <li className="list-group-item">Save changes.</li>
                        </ol>
                    </Card.Text>
                    <div><strong>Done?</strong></div>
                    <div className="d-flex justify-content-around">
                        <Button variant="primary" onClick={() => { setRefresh(!refresh) }}><MdRefresh /> retry</Button>
                            <LogoutButton>
                            <Button variant="primary"><FiLogOut /> Log Out</Button>
                        </LogoutButton>
                    </div>
                </Card.Body>
            </Card>
        </div>
    )
}

export default NoPermissions