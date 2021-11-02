import React from "react";

import { Layout } from "../components";
import useStudentForm from "../components/useStudentForm";

const Enroll = () => {
  const [Form, _] = useStudentForm({
    redirectUrl: "/student",
    newForm: true,
  });

  return <Layout>{Form}</Layout>;
};

export default Enroll;
