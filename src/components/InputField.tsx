import { Button, Form } from 'react-bootstrap';
import { Note } from './types';

interface Props {
    note: Note;
    setNote: React.Dispatch<React.SetStateAction<Note>>;
    handleAdd: (e: React.FormEvent<HTMLFormElement>) => void;
}
const InputField = ({ note, setNote, handleAdd }: Props) => {

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
    )
};

export default InputField;


// {
//     (e) => setNote((note) => {
//         note.title = e.target.value;
//         return note;
//    })
// }