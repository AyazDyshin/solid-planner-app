import "regenerator-runtime/runtime";
import React, { useEffect, useState } from "react";
import LogInPage from "./components/LogInPage";
import MainContent from "./components/MainContent";
import { useSession } from "@inrupt/solid-ui-react";
import { Spinner } from "react-bootstrap";
import { checkPermissions } from "./services/access";
import { FallbackProps } from 'react-error-boundary';
import NoPermissions from "./components/NoPermissions";
import ErrorComponent from "./components/ErrorComponent";
import ErrorBoundary from "./components/ErrorBoundary";
import Test from "./components/Test";
const App: React.FC = () => {
  const { session, sessionRequestInProgress, fetch } = useSession();
  const { webId } = session.info;

  const [refresh, setRefresh] = useState<boolean>(false);
  const render = () => {
    useEffect(() => {

    }, [refresh])
    // Checks if data loading is in progress
    if (sessionRequestInProgress) {
      return (
        <div className="h-100 d-flex justify-content-center align-items-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      )
    }
    // case when data loading is finished
    else {
      //checks for login status
      if (!session.info.isLoggedIn) {
        //case for when user is not logged in
        return (
          <ErrorBoundary>
            <LogInPage />
          </ErrorBoundary>
        );
      }
      //case for when the user is logged in
      else {
        return (
          <ErrorBoundary>
            <MainContent />
          </ErrorBoundary>

        )
      }
    }
  }
  return render();
}

export default App;

