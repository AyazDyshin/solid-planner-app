import React from 'react';
import { Alert, Button, Modal } from 'react-bootstrap';
import { withErrorBoundary, FallbackProps } from 'react-error-boundary';

const ErrorComponent = ({ error, resetErrorBoundary }: FallbackProps) => {
    return (
        <Modal
            variant='danger'
            show={true}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Alert key='danger' variant='danger'>
                    Error occurred with the following message:
                    <div>{error.message}</div>
                </Alert>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="info" onClick={resetErrorBoundary}>restart</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ErrorComponent