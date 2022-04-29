import { CombinedDataProvider, useSession, Image, Text } from '@inrupt/solid-ui-react';
import { Button, Form } from 'react-bootstrap';
import { Note } from './types';
import { FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import { useState } from 'react';

interface Props {
    note: Note;
    setNote: React.Dispatch<React.SetStateAction<Note>>;
    handleAdd: (e: React.FormEvent<HTMLFormElement>) => void;
}
const InputField = ({ note, setNote, handleAdd }: Props) => {
    const { session } = useSession();
    const { webId } = session.info;
    const [editing, setEditing] = useState(true);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // e.persist();
        setNote(note => ({ ...note, [e.target.name]: e.target.value }));
    }
   
    return (
         <Form onSubmit={handleAdd}>
            <Form.Group className="mb-3" controlId="title">
                <Form.Label>Title</Form.Label>
                <input type="text" placeholder="enter a title"
                    onChange={handleChange}
                    value={note.title}
                    name="title"
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="content">
                <Form.Label>Example textarea</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder=""
                    value={note.content}
                    onChange={handleChange}
                    name="content"
                />
            </Form.Group>
            <Button type="submit">Submit</Button>
        </Form> 
    );
};

export default InputField;


// {
//     (e) => setNote((note) => {
//         note.title = e.target.value;
//         return note;
//    })
// }


{/* <Form onSubmit={handleAdd}>
            <Form.Group className="mb-3" controlId="title">
                <Form.Label>Title</Form.Label>
                <input type="text" placeholder="enter a title"
                    onChange={handleChange}
                    value={note.title}
                    name="title"
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="content">
                <Form.Label>Example textarea</Form.Label>
                <Form.Control as="textarea" rows={3} placeholder=""
                    value={note.content}
                    onChange={handleChange}
                    name="content"
                />
            </Form.Group>
            <Button type="submit">Submit</Button>
        </Form> */}


        // if (typeof webId === 'string'){
        //     return (
            
        //         <CombinedDataProvider
        //         datasetUrl={webId}
        //         thingUrl={webId}
        //       >
        //             <div>Your web id: {webId}</div>
        //             <Text property={FOAF.name.iri.value}  edit={editing} autosave />
        //             <Image property={VCARD.hasPhoto.iri.value} width={480} />
        //             </CombinedDataProvider>
                
        //     )
        // }
        // else {
        //     return (
        //         <div>Error, Session doesn't exist</div>
        //     )
        // }