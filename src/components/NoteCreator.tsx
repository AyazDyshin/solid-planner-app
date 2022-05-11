import { InputGroup, FormControl } from "react-bootstrap";

const NoteCreator = () => {
    return (
        <div className="h-100">
            <InputGroup className="mb-2 mt-2">
                <InputGroup.Text id="basic-addon1">Title:</InputGroup.Text>
                <FormControl
                    placeholder="Username"
                    aria-label="Username"
                    aria-describedby="basic-addon1"
                />
            </InputGroup>
            <FormControl as="textarea" aria-label="With textarea" style={{'resize': 'none', 'height':'91%'}}/>
        </div>
    )
}

export default NoteCreator;