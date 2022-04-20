import "regenerator-runtime/runtime";
import React, { useEffect, useState } from "react";
import LogInPage from "./components/LogInPage";
import { handleIncomingRedirect, getDefaultSession } from "@inrupt/solid-client-authn-browser";
import Test from "./Test";
const App: React.FC = () => {
  const [logInStatus, setLogInStatus] = useState<boolean>(false);
  const [isLoading, setLoading] = React.useState(true);

  useEffect(() => {
    const handle = async () => {
      await handleIncomingRedirect({
        restorePreviousSession: true,
      }).then((info) => {
        setLogInStatus(info?.isLoggedIn ?? false);
      });
    }
    handle();
  }, [logInStatus]);

  if (!logInStatus) {
    return (
      <div>
        <LogInPage logInStatus={logInStatus} setLogInStatus={setLogInStatus} />
      </div>
    );
  }
  else {
    return (

      <Test logInStatus={logInStatus} setLogInStatus={setLogInStatus} />)
  }
}
export default App;