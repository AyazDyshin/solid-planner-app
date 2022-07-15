import React from 'react'
import { Button, Card, Modal } from 'react-bootstrap';
import { AiOutlineLink } from "react-icons/ai";

interface Props {
    providerModalState: boolean;
    setProviderModalState: React.Dispatch<React.SetStateAction<boolean>>;
}
const ProviderModal = ({ providerModalState, setProviderModalState }: Props) => {
    return (
        <Modal show={providerModalState}>
            <Modal.Header closeButton onClick={() => { setProviderModalState(false) }}>
                <Modal.Title>How to choose a provider?</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Card className="text-center">
                    <Card.Body>
                        <Card.Text>
                            <h3>TLDR:</h3>
                            <div> if you want to share your data with other users, pick:</div>
                            <div><strong>inrupt.net</strong></div>
                            <div>If you don&apos;t want to share your data with other users, but want faster load times, pick:</div>
                            <div><strong>Broker Pod Inrupt</strong></div>
                            <ol className="list-group list-group-numbered">
                                <li className="list-group-item">There are two ways how to use Solid App: either by picking a provider or by <a href="https://solidproject.org//self-hosting/css" target="_blank" className="link-primary" rel="noreferrer">hosting your own POD <AiOutlineLink /></a>.</li>
                                <li className="list-group-item">To learn more about different aspects of provider&apos;s PODs (server location, implementation) go<a href="https://solidproject.org/users/get-a-pod#get-a-pod-from-a-pod-provider"
                                    target="_blank" className="link-primary" rel="noreferrer"> here<AiOutlineLink /></a>.</li>
                                <li className="list-group-item"><strong>ESS</strong> PODs currently do not support definition of access to your files (hopefully this will be fixed soon). But have much faster load times.</li>
                                <li className="list-group-item"><strong>CSS</strong> and <strong>NSS</strong> PODs support all features, but have slower load times.</li>
                                <li className="list-group-item">To sum up: if you want to use app&apos;s functionality only for yourself, go for <strong>ESS</strong> POD.</li>
                                <li className="list-group-item">If you want to share your date with others go for <strong>NSS/CSS</strong> POD.</li>
                            </ol>
                        </Card.Text>
                    </Card.Body>
                </Card>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={() => { setProviderModalState(false) }}>Go Back</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default ProviderModal