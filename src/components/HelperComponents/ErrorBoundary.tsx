import * as React from "react";
import 'bootstrap/dist/css/bootstrap.css';
import { Button, Card } from "react-bootstrap";
import { FiLogOut } from "react-icons/fi";
import { LogoutButton } from "@inrupt/solid-ui-react";

interface Props {
    children: JSX.Element;
}

/**
 * Fallback component that is render when an error occurs. Gives information about error and renders logout and refresh buttons.
 *
 * @category Helper components
 */
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
                        <div className="d-flex justify-content-around">
                            <Button onClick={resetError} variant="info">reset</Button>
                            <LogoutButton>
                                <Button id="logout-button" onClick={resetError} className="logout-button"><FiLogOut /> Log out</Button>
                            </LogoutButton>
                        </div>
                    </Card.Body>
                </Card>
            </div>
        </React.Fragment>
    ) : (
        children
    );
};

export default ErrorBoundary;