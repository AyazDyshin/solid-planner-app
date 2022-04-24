import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';

const InputField = () => {
    return (
            <Form>
                <Form.Group className="mb-3" controlId="">
                    <Form.Label>Title</Form.Label>
                    <Form.Control type="text" placeholder="enter a title" />
                </Form.Group>
                <Form.Group className="mb-3" controlId="">
                    <Form.Label>Example textarea</Form.Label>
                    <Form.Control as="textarea" rows={3} />
                </Form.Group>
            </Form>
    )
};

export default InputField;