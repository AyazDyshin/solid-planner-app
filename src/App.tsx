import "regenerator-runtime/runtime";
import React from "react";
import LogInPage from "./components/MainAppComponents/LogInPage";
import MainContent from "./components/MainAppComponents/MainContent";
import { useSession } from "@inrupt/solid-ui-react";
import { Spinner } from "react-bootstrap";
import ErrorBoundary from "./components/HelperComponents/ErrorBoundary";
const App: React.FC = () => {
  const { session, sessionRequestInProgress } = useSession();
  const render = () => {
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

