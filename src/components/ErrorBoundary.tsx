import * as React from "react";
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Card } from "react-bootstrap";

interface Props {
    children: JSX.Element;
}

const ErrorBoundary = ({ children }: Props) => {
    const [error, setError] = React.useState("");

    const promiseRejectionHandler = React.useCallback((event: { reason: React.SetStateAction<string>; }) => {
        setError(event.reason);
    }, []);

    const resetError = React.useCallback(() => {
        setError("");
    }, []);

    React.useEffect(() => {
        window.addEventListener("unhandledrejection", promiseRejectionHandler);

        return () => {
            window.removeEventListener("unhandledrejection", promiseRejectionHandler);
        };
    }, []);

    return error ? (
        <React.Fragment>
            <div className="w-100 h-100 d-flex justify-content-center align-items-center">
                <Card className="w-50 text-center">
                    <Card.Body>
                        <Card.Title>Error!</Card.Title>

                        <div style={{ color: "red" }}>{error.toString()}</div>

                        <Button onClick={resetError} variant="info">reset</Button>
                    </Card.Body>
                </Card>
            </div>
        </React.Fragment>
    ) : (
        children
    );
};

export default ErrorBoundary;