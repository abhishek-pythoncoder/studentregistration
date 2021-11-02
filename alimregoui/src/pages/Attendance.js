import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box, Center, Flex, Heading, Text } from "@chakra-ui/layout";
import { Select } from "@chakra-ui/select";
import { forwardRef } from "@chakra-ui/system";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import { Layout } from "../components";
import AttendanceCheckBox from "../components/AttendanceCheckBox";
import axios from "axios";
import request from "../utils/request";
import { startOfWeek, format } from "date-fns";

const Attendance = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [startDate, setStartDate] = useState(startOfWeek(new Date()));
  const [grade, setGrade] = useState("2");
  const [selectedDate, setDate] = useState("");
  const [attendance, updateAddtendace] = useState({});
  const [isSubmitting, toggelSubmit] = useState(false);
  const toast = useToast();

  const search = async () => {
    try {
      toggelSubmit(true);
      const res = await request.get({
        from: `/student/searchforattendance/`,
        useToken: true,
        params: {
          grade,
          date: selectedDate.split("/").join("-"),
        },
      });
      console.log();
      if (typeof res.data === "string") {
        toast({
          title: "Attendance",
          description: "No Student record found",
          duration: 5000,
          position: "top",
          status: "info",
        });
      }
      updateAddtendace(res.data);
      toggelSubmit(false);
    } catch (error) {
      console.log(error);
    }
  };

  const handleAttendance = (idx, value) => {
    let stu = attendance.students;
    stu[idx] = { ...stu[idx], is_present: value };
    updateAddtendace({
      ...attendance,
      students: stu,
    });
  };

  const submitAttendance = async () => {
    try {
      toggelSubmit(true);
      const body = {
        date: selectedDate.split("/").join("-"),
        grade: Number(grade),
        students: attendance.students,
      };

      // toast({
      //   title: "Attendace Submitted.",
      //   status: "info",
      //   duration: 5000,
      //   isClosable: true,
      //   position: "top",
      // });
      const res = await request.post({ to: "/student/postattendance/", body });
      onOpen();
      //ask whether to send sms to all students
      //filter all absentess
      //send sms to all absentess
      search();
      toggelSubmit(false);
    } catch (error) {
      toast({
        title: "Attendance",
        description: "Could not update the attendance",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const getAbsentees = () => {
    return Object.keys(attendance).length > 0
      ? attendance.students.filter(({ isPresent }) => !isPresent)
      : [];
  };

  const sendSMS = async () => {
    try {
      const smsEndPoint = process.env.REACT_APP_SMS_URL;
      const username = process.env.REACT_APP_CLICKSEND_USERNAME;
      const password = process.env.REACT_APP_CLICKSEND_PASSWORD;
      const token = btoa(`${username}:${password}`);

      const absentees = getAbsentees();
      const body = {
        messages: absentees.map(({ mobile, name }) => ({
          source: "javascript",
          body: `Salaamunalaikum Respected Parent, This message is to let you know that ${name} has been marked absent for ${format(
            new Date(),
            "dd-MM-yyy"
          )}at Al Asr Madressa.JazakAllah`,
          to: mobile,
        })),
      };

      // const response = await axios.post(smsEndPoint, body, {
      //   headers: {
      //     "Content-type": "application/json",
      //     Authorization: `basic ${token}`,
      //   },
      // });

      // console.log(response);
      toast({
        titl: "SMS",
        description: "SMS sent to absentees",
        status: "info",
        duration: 5000,
        isClosable: true,
        position: "top",
      });

      onClose();
      toggelSubmit(!isSubmitting);
      search();
    } catch (error) {
      console.log(error);
      toast({
        title: "SMS",
        description: "Could not sent the sms",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const isWeekday = (date) => {
    const day = date.getDay(date);
    return day === 0;
  };

  const CustomInput = forwardRef(({ value, onClick }, ref) => {
    useEffect(() => {
      setDate(value);
    }, []);

    return (
      <Input
        type="text"
        value={value}
        onClick={onClick}
        ref={ref}
        onChange={(e) => {
          console.log(value);
        }}
        cursor="pointer"
        isReadOnly
      ></Input>
    );
  });

  const SMSDialog = () => (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>SMS</ModalHeader>
        <ModalBody>
          <Text>Send SMS to all the absentees</Text>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="ghost"
            colorScheme="blue"
            mr={3}
            onClick={() => {
              toggelSubmit(!isSubmitting);
              onClose();
              search();
            }}
          >
            No
          </Button>
          <Button onClick={sendSMS}>Yes</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
  return (
    <Layout>
      <SMSDialog />
      <Box px={16}>
        <Heading as="h2" color="brand.orange" py="8">
          Attendance
        </Heading>
        <Flex
          backgroundColor="secondary.orange"
          alignItems="center"
          p={4}
          color="white"
          borderRadius="md"
          w="100%"
        >
          <Flex w="180px" mr={8} alignItems="center">
            <Text pr={4}>Grade: </Text>
            <Select
              color="black"
              name="iqraGradePrev"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            >
              <option value="0">Kinder Garden</option>
              <option value="1">Prep</option>
              <option value="2">Year 1</option>
              <option value="3">Year 2</option>
              <option value="4">Year 3</option>
              <option value="5">Year 4</option>
              <option value="6">Year 5</option>
              <option value="7">Year 6</option>
              <option value="8">Year 7</option>
              <option value="9">Year 8</option>
              <option value="10">Year 9</option>
              <option value="11">Year 10</option>
            </Select>
          </Flex>
          <Flex color="black" alignItems="center">
            <Text color="white" pr={4}>
              Date:{" "}
            </Text>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              filterDate={isWeekday}
              dateFormat="dd/MM/yyyy"
              customInput={<CustomInput />}
            />
          </Flex>
          <Flex alignItems="center" flex="1" justifyContent="flex-end">
            <Button
              color="brand.orange"
              backgroundColor="white"
              mx={8}
              justifySelf="flex-end"
              onClick={search}
            >
              Search
            </Button>
            {Object.keys(attendance).length > 0 &&
              !attendance.attendanceSubmitted && (
                <>
                  <Button
                    color="brand.orange"
                    backgroundColor="white"
                    mx={8}
                    justifySelf="flex-end"
                    onClick={submitAttendance}
                  >
                    Submit Attendance
                  </Button>
                </>
              )}
            {Object.keys(attendance).length > 0 && (
              <Button
                color="brand.orange"
                backgroundColor="white"
                mx={8}
                justifySelf="flex-end"
                as="a"
                href={`${process.env.REACT_APP_ORIGIN}/student/download/attendance/${grade}/`}
              >
                Download Report
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>
      <Box px={16} mt={8}>
        {!isSubmitting ? (
          <Table
            variant="simple"
            border="2px"
            borderRadius="md"
            borderColor="gray.200"
            backgroundColor="white"
          >
            <Thead>
              <Tr>
                <Th>Sr. No</Th>
                <Th>Name</Th>
                <Th>Mobile Number</Th>
                <Th>Attendace</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!isSubmitting &&
                Object.keys(attendance).length > 0 &&
                attendance["students"] &&
                attendance["students"].map(
                  ({ name, is_present, mobile }, index) => (
                    <Tr key={index}>
                      <Td>{index + 1}</Td>
                      <Td>{name}</Td>
                      <Td>{mobile}</Td>
                      <Td display="flex">
                        <AttendanceCheckBox
                          isPresent={is_present}
                          handler={handleAttendance}
                          idx={index}
                          isReadOnly={attendance.attendanceSubmitted}
                        />
                      </Td>
                    </Tr>
                  )
                )}
            </Tbody>
          </Table>
        ) : (
          <Center>
            <Spinner size="lg"></Spinner>
          </Center>
        )}
      </Box>
    </Layout>
  );
};

export default Attendance;
