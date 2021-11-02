import React, { useEffect, useState } from "react";
import { Layout } from "../components";
import request from "../utils/request";
import useStudentForm from "../components/useStudentForm";
import { Center, Heading } from "@chakra-ui/layout";
import { Spinner } from "@chakra-ui/spinner";
import { formatStudentData } from "../utils/helper";

const Student = (props) => {
  const { id } = props.match.params;
  const [studentData, updateData] = useState({});

  useEffect(() => {
    request
      .get({ from: `/student/get/${id}/`, useToken: true })
      .then(({ data }) => {
       const studentData = formatStudentData(data)
        updateData(studentData);
      })
      .catch(console.log);
  }, []);

  return (
    <Layout>
      {Object.keys(studentData).length === 0 ? (
        <NoData />
      ) : (
        <DataForm data={studentData} />
      )}
    </Layout>
  );
};

const NoData = () => {
  return (
    <Center h="100vh">
      {" "}
      <Spinner size="lg"></Spinner>
    </Center>
  );
};

const DataForm = ({ data }) => {
  const [Form, formData] = useStudentForm({
    formData: data,
    isReadOnly: true,
    newForm: false,
  });
  return <>{Form}</>;
};
export default Student;
