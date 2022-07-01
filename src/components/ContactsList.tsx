import { useEffect, useState } from "react";
import { Note } from "./types";

interface Props {
    contactsArr: (string | null)[][],
    setContactsArr: React.Dispatch<React.SetStateAction<(string | null)[][]>>;
    otherWebId: string | null;
    setOtherWebId: React.Dispatch<React.SetStateAction<string | null>>;
    isLoading: boolean;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const ContactsList = ({ contactsArr, setContactsArr, otherWebId, setOtherWebId, isLoading, setIsLoading }: Props) => {
    const contactsNames = contactsArr.map((item) => item[0]);
    const [activeContact, setActiveContact] = useState<string | null>(null);
    return (
        <div className="w-100 h-100">
            <div className="list-group w-100 h-100">
                {
                    contactsArr.map((contact, index) => {
                        return <a
                            key={Date.now() + index + Math.floor(Math.random() * 1000)}
                            className={`list-group-item px-1 text-center list-group-item-action ${activeContact === contact[1] ? 'active' : ''}`}
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
        </div>
    )
}

export default ContactsList;