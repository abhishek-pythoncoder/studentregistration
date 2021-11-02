import { Spinner } from "@chakra-ui/spinner";
import React, { Fragment, useEffect, useState } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import {
  AttendancePage,
  AuthPage,
  CorrespondencePage,
  EnrollPage,
  HomePage,
  ManagePage,
  StudentPage,
} from "./pages";

function App() {
  const [user, updateUser] = useState(null);
  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("smart-alim:user"));
    if (token) {
      updateUser(token);
    } else {
      updateUser({});
    }
  }, []);

  return user === null ? (
    <>
      <Spinner />
    </>
  ) : Object.keys(user).length > 0 ? (
    <Fragment>
      <Switch>
        <Route exact path="/" component={HomePage} />
        <Route path="/student/:id" component={StudentPage} />
        <Route exact path="/enroll-student" component={EnrollPage} />
        <Route exact path="/manage-students" component={ManagePage} />
        <Route exact path="/correspondence" component={CorrespondencePage} />
        <Route exact path="/attendance" component={AttendancePage} />
      </Switch>
    </Fragment>
  ) : (
    <Fragment>
      <Switch>
        <Route path="/enroll-student" component={EnrollPage} />
        <Route excat path="/login" component={AuthPage} />
        <Route
          render={() => (
            <>
              <Redirect to="/login" />
            </>
          )}
        />
      </Switch>
    </Fragment>
  );
}

export default App;
