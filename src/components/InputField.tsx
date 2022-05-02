import { CombinedDataProvider, useSession, Image, Text, useDataset } from '@inrupt/solid-ui-react';
import { Button, Form } from 'react-bootstrap';
import { Note } from './types';
import { FOAF, VCARD } from "@inrupt/lit-generated-vocab-common";
import { useState } from 'react';
import { buildThing, createContainerInContainer, createSolidDataset, createThing, saveSolidDatasetAt, saveSolidDatasetInContainer, setThing } from '@inrupt/solid-client';
import {SCHEMA_INRUPT, RDF} from '@inrupt/vocab-common-rdf';

interface Props {
    note: Note;
    setNote: React.Dispatch<React.SetStateAction<Note>>;
    handleAdd: (e: React.FormEvent<HTMLFormElement>) => void;
}
const InputField = ({ note, setNote, handleAdd }: Props) => {
    const { session, fetch} = useSession();
    const { webId } = session.info;
    const [editing, setEditing] = useState(true);
    const { dataset, error } = useDataset();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNote(note => ({ ...note, [e.target.name]: e.target.value }));
    }
    const handleSubmit = () => {
        console.log(webId);
    }
    const me = buildThing(createThing({ name: "profile-vincent" }))
  .addUrl(RDF.type, SCHEMA_INRUPT.Person)
  .addStringNoLocale(SCHEMA_INRUPT.givenName, "Vincent")
  .build();
    const dts = createSolidDataset();
    const dtsFull= setThing(dts,me);
   // saveSolidDatasetAt("https://ayazdyshin.inrupt.net/public/test", dtsFull, {fetch: fetch});
    console.log(webId);
    if (typeof webId === 'string'){
        return (
        
            <CombinedDataProvider
            datasetUrl={webId}
            thingUrl={webId}
          >
                <div>Your web id: {webId}</div>
                <Text
      autosave
      edit={true}
      property={FOAF.name.iri.value}
    />
                <Text property={FOAF.name.iri.value}  edit={editing}/>
                
                </CombinedDataProvider>
            
        )
    }
    else {
        return (
            <div>Error, Session doesn't exist</div>
        )
    }
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


        // <Button onClick={handleSubmit}>click me</Button>