import { useSession } from "@inrupt/solid-ui-react";
import { useEffect, useState } from "react";
import { checkContacts } from "../services/SolidPod";
import NoContacts from "./NoContacts";

const ContactsRender = () => {
    const { session, fetch } = useSession();
    const [contactsFdrStatus, setContactsFdrStatus] = useState<boolean>(false);
    const { webId } = session.info;
    if (webId === undefined) {
        throw new Error("error occured when fetching webId");
    }

    useEffect(() => {
        const initialize = async () => {
            let contactsStatus = await checkContacts(webId, fetch);
            setContactsFdrStatus(contactsStatus);
        }
    });
    return (
        <div className="container-fluid pad">
            <div className="row h-100">
                <div className="col h-100 border border-5 border-end-0 d-flex justify-content-center align-items-center p-0">
                    <NoContacts />
                    
                </div>
                <div className="col h-100 border border-5">

                </div>
            </div>

        </div>
    )
}

export default ContactsRender;