import React, { useState, useRef, useEffect } from "react";
import {
  AspectRatio,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  HStack,
  Image,
  Input,
  Radio,
  RadioGroup,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack,
  useToast,
  Flex,
  Tag,
  UnorderedList,
  ListItem,
  Grid,
  GridItem,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from "@chakra-ui/react";
import { includes } from "lodash";
import request from "../utils/request";
import CustomButton from "./CustomButton";
import Instructions from "./Instructions";
import isAuthenticated from "../utils/auth";
import { AcceptanceEmailParent, AcceptanceEmailTeam, NewStudentEmailParents, NewStudentEmailTeam, RejectionEmail } from "../utils/EmailTemplates";
import Email from "../utils/sendEmail"
import { formatStudentData } from "../utils/helper";

const STATUS = {
  APPROVE: "approve",
  REJECT: "reject",
};

const StudentForm = ({ formData, newForm, redirectUrl }) => {
 
  const [form, updateForm] = useState(
    formData || {
      firstName: "",
      lastName: "",
      gender: "male",
      medicalCondition: "",
      dob: "",
      profile: "",
      isPrevious: "false",
      islamicGradePrev: "0",
      iqraGradePrev: "0",
      fatherName: "",
      fatherEmail: "",
      fatherContact: "",
      motherName: "",
      motherEmail: "",
      motherContact: "",
      corresspondence: "father",
      corrEmail: "",
      homeAddress: "",
      ambulanceCover: "false",
      ambulanceMembershipNumber: "",
      refereeName: "",
      refereePhone: "",
      refereeEmail: "",
      enrollmentYear: "2021",
      status: "pending",
      fees_paid: false,
      active_record: false,
      gradeInSchool: "0",
      currIqraGrade: "0",
      currIslamicGrade: "0"
    }
  );
  const [includeFees, toggelFeesRequirement] = useState(false);
  const [tnc, setTnc] = useState(false);
  const [isReadOnly, updateReadMode] = useState(!newForm);
  const toast = useToast();
  const uploadButtonRef = useRef(null);
  const [authenticatedUser, updateUser] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [rejectionMessage, updateRejectionMessage] = useState("");
  const [ studentId, updateStudentId] = useState("");

  useEffect(() => {
    isAuthenticated().then((data) => updateUser(data));
  }, []);
  useEffect(() => {
    if (newForm) {
      const script = document.createElement("script");

      script.src = "https://secure.ewaypayments.com/scripts/eCrypt.min.js";
      script.async = true;
      script.setAttribute(
        "data-publicapikey",
        "epk-6C5B91C4-5771-4028-AD53-6757EBACA3C1"
      );
      script.setAttribute("class", "eway-paynow-button");
      script.setAttribute("data-amount", 180);
      script.setAttribute("data-currency", "AUD");
      document.getElementById("fee").appendChild(script);
    }
  }, []);

  //[todo] replace this with date-fns
  const date = new Date();
  const currDate = `${date.getFullYear()}-${
    date.getMonth() < 10 ? `0${date.getMonth()}` : date.getMonth()
  }-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`;

  const handleChange = (e) => {
    updateForm({ ...form, [e.target.name]: e.target.value });
  };

  const clickUploadButton = () => {
    uploadButtonRef.current.click();
  };

  const fillStudent = () => {
    request
      .get({ from: `/student/get_noauth/${studentId}/`})
      .then(({ data }) => {
       const studentData = formatStudentData(data);
        updateForm(studentData);
      })
      .catch(()=> alert("No student found with this ID"));
  }

  const getFormatedData = () => {
    return {
      profile_photo: form["profile"],
      first_name: form["firstName"],
      last_name: form["lastName"],
      gender: form["gender"],
      medical_condition: form["medicalCondition"],
      dob: form["dob"],
      is_previous_student: form["isPrevious"] === "true",
      islamic_studies_grade_prev_year: Number(form["islamicGradePrev"]),
      iqra_grade_prev_year: Number(form["iqraGradePrev"]),
      enrolment_for_year: String(form["enrollmentYear"]),
      referee_name: form["refereeName"],
      referee_email_address: form["refereeEmail"],
      referee_phone_number: form["refereePhone"],
      father_name: form["fatherName"],
      mother_name: form["motherName"],
      father_email: form["fatherEmail"],
      mother_email: form["motherEmail"],
      father_contact_number: form["fatherContact"],
      mother_contact_number: form["motherContact"],
      ambulance_cover: form["ambulanceCover"] === "true",
      ambulance_membership_number: form["ambulanceMembershipNumber"],
      home_address: form["homeAddress"],
      preferred_contact_for_correspondence: form["corresspondence"],
      email_for_correspondence: form["corrEmail"],
      grade_in_school: Number(form["gradeInSchool"]),
      fees_paid: false,
      current_record: false,
      status: form["status"],
      active_record: false,
      curr_iqra_grade: form["currIqraGrade"],
      current_islamic_grade: form["currIslamicGrade"]
    };
  };

  const updateFormStatus = async (status) => {
    const email = new Email();
    try {
      if(status === STATUS.REJECT) {
        const parentEmailBody = RejectionEmail({ firstName: form.firstName, lastName: form.lastName, enrollmentYear: form.enrollmentYear});
        const from = await email.getFromEmails();
        await email.send({
          to: [{email:"timothyrajan@gmail.com"}],
          subject: "Admission Denied at Al Asr Madressa",
          body: parentEmailBody,
          from: from[0]
        });
        return;
      }

      if(status === STATUS.APPROVE) {
        const teamEmailBody = AcceptanceEmailTeam({ firstName: form.firstName, lastName: form.lastName, enrollmentYear: form.enrollmentYear});
        const parentEmailBody = AcceptanceEmailParent({ firstName: form.firstName, lastName: form.lastName, enrollmentYear: form.enrollmentYear});
        const from = await email.getFromEmails();
        // [{email: "hussainrezwe@gmail.com"},{email: "kausarnoorani@gmail.com"},{email: "management@alasr.com.au"}]
        await email.send({
          to: [{email:"timothyrajan@gmail.com"}],
          subject: "Admission Offered at Al Asr Madressa",
          body: parentEmailBody,
          from: from[0]
        });
        await email.send({
          to: [{email: "timothyrajan@gmail.com"}],
          subject: "Student accepted – Allocate Grades",
          body: teamEmailBody,
          from: from[0]
        })
      }
      // const url = `/student/${status}/${form["id"]}/`;
      // await request.post({ to: url });

      // //show a toast here
      window.location.href = "/";
    } catch (error) {
      console.log(error);
    }
  };

  const handleFormUpdate = async () => {
    if (isReadOnly === false) {
      // show a toast
      updateReadMode(!isReadOnly);
      const data = getFormatedData();
     
      try {
        await request.post({
          to: `/student/update/${form["id"]}/`,
          body: data,
        });
        window.location.reload();
      } catch (error) {
        console.log(error);
      }
    } else {
      updateReadMode(!isReadOnly);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];

    // validate if it's an image or not
    const fileName = file.name;
    var fileExtension = "";
    if (fileName.lastIndexOf(".") > 0) {
      fileExtension = fileName.substring(
        fileName.lastIndexOf(".") + 1,
        fileName.length
      );
    }

    if (includes(["png", "jpeg", "jpg"], fileExtension.toLowerCase())) {
      const reader = new FileReader();
      reader.readAsDataURL(file); //converts file to an url
      reader.onloadend = () => {
        updateForm({ ...form, profile: reader.result });
      };
    } else {
      toast({
        description: "Only png, jpeg and jpg image files are allowed",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (authenticatedUser) {
      if (!includeFees && !form["fees_paid"]) {
        alert("Fee payment is necessary");
        return;
      }
    } else {
      if (!form["fees_paid"]) {
        alert("Fee payment is necessary");
        return;
      }
    }

    const data = getFormatedData();
    const { father_name, father_email, father_contact_number, mother_contact_number, mother_email, mother_name} = data;
    const hasEitherOneParentInfo = (father_name !== "" && father_email !== "" && father_contact_number !== "") || (mother_name !== "" && mother_email !== "" && mother_contact_number !== "");
   
    if(!hasEitherOneParentInfo) {
      alert("Either Father or Mother Information is required");
    }

    try {
      const to = isAuthenticated
        ? "/student/create/"
        : "/student/create_noauth/";
      await request.post({
        to,
        body: { ...data },
      });
      const email = new Email();
      const teamEmailBody = NewStudentEmailTeam({ firstName: form.firstName, lastName: form.lastName, enrollmentYear: form.enrollmentYear});
      const parentEmailBody = NewStudentEmailParents({ firstName: form.firstName, lastName: form.lastName, enrollmentYear: form.enrollmentYear});
      const from = await email.getFromEmails();
      await email.send({
        to: [{email:"timothyrajan@gmail.com"}],
        subject: "Confirmation of Enrolment Received at Al Asr for 2021",
        body: parentEmailBody,
        from: from[0]
      });
      await email.send({
        to: [{email:"timothyrajan@gmail.com"}],
        subject: "Enrollment Received",
        body: teamEmailBody,
        from: from[0]
      });
      toast({
        title: "Student Enrollment",
        description: "Student is successfully enrolled",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top",
        onCloseComplete: () => (window.location.href = "/"),
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Student Enrollment",
        description: "Cannot enroll the student. Please contact administrator",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const Form = (
    <Box px="16">
      <>
        {!newForm ? (
          <Flex justifyContent="space-between" alignItems="center" w="100%">
            <Flex alignItems="center">
              <Heading color="brand.orange" as="h2" py={8}>
                {`${formData["firstName"]} ${formData["lastName"]}`}
              </Heading>
              <Tag
                ml={8}
                h="min-content"
                backgroundColor={
                  formData["status"] === "pending"
                    ? "brand.orange"
                    : formData["status"] === "approved"
                    ? "secondary.green"
                    : "secondary.red"
                }
                color="white"
                size="lg"
              >
                {formData["status"] || "pending"}
              </Tag>
            </Flex>
            <Flex alignItems="center">
              <Button
                backgroundColor="brand.orange"
                color="white"
                size="sm"
                borderRadius="md"
                onClick={handleFormUpdate}
                _hover={{}}
              >
                {isReadOnly ? "Edit Student Details" : "Save Student Details"}
              </Button>
            </Flex>
          </Flex>
        ) : (
          <Flex alignItems="center" justifyContent="space-between">
            <Flex alignItems="center">
              <Heading color="brand.orange" as="h2" py={8}>
                Enroll Student
              </Heading>
              {newForm && <Instructions show={!authenticatedUser}/>}
              </Flex>
              <Flex alignItems="center">
                <Input placeholder="Enter Student ID" marginRight="16px" name="studentId" value={studentId} onChange={(e) => updateStudentId(e.target.value)}/>
                <Button size="sm" minW="max-content" backgroundColor="brand.orange" color="white" onClick={fillStudent}>Prefill Student Info</Button>
              </Flex>
          </Flex>
        )}
      </>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Specify the reason for rejection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Textarea value={rejectionMessage} onChange={(e) => updateRejectionMessage(e.target.value)}></Textarea>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={()=> window.location.reload()}>
              Close
            </Button>
            <Button variant="ghost" onClick={()=> updateFormStatus(STATUS.REJECT)}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <form onSubmit={handleSubmit}>
        <Stack spacing="8">
          {/*---Personal Details---*/}

          <Box border="2px" p="4" borderRadius="md" borderColor="gray.200">
            <Text fontWeight="semibold">Personal Details</Text>
            <Grid templateColumns="25% 75%">
              <GridItem>
                <Flex flexDirection="column" alignItems="flex-start">
                  <Flex flexDirection="column" alignItems="flex-start">
                    <FormControl id="profile" isRequired>
                      <FormLabel>Profile photo</FormLabel>
                      <Input
                        type="file"
                        ref={uploadButtonRef}
                        accept="image/*"
                        onChange={handleFile}
                        isReadOnly={isReadOnly}
                        name="profile"
                        isRequired
                        opacity={0}
                        h={0}
                      />
                    </FormControl>
                    <AspectRatio w="200px" ratio={1}>
                      <Image
                        fallbackSrc="https://via.placeholder.com/200"
                        src={form["profile"]}
                        objectFit="cover"
                      />
                    </AspectRatio>
                    <Box justifySelf="center">
                      {" "}
                      <Button
                        variant="outline"
                        p="6"
                        mt="4"
                        color="brand.orange"
                        borderColor="brand.orange"
                        _hover={{}}
                        onClick={clickUploadButton}
                        w="fit-content"
                      >
                        Upload Photo
                      </Button>
                    </Box>
                  </Flex>
                </Flex>
              </GridItem>
              <GridItem>
                <HStack spacing={8} my={4}>
                  <Grid templateColumns="repeat(3,1fr)" flex={1} gap={8}>
                    <GridItem>
                      {/**Firstname */}
                      <FormControl id="first-name" isRequired>
                        <FormLabel>First name</FormLabel>
                        <Input
                          type="text"
                          name="firstName"
                          maxLength="50"
                          value={form["firstName"]}
                          onChange={handleChange}
                          isReadOnly={isReadOnly}
                        />
                        <FormHelperText>
                          Not more than 50 characters
                        </FormHelperText>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      {/**lastname */}
                      <FormControl id="last-name" isRequired>
                        <FormLabel>Last name</FormLabel>
                        <Input
                          type="text"
                          name="lastName"
                          maxLength="50"
                          value={form["lastName"]}
                          onChange={handleChange}
                          isReadOnly={isReadOnly}
                        />
                        <FormHelperText>
                          Not more than 50 characters
                        </FormHelperText>
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      {/**Gender */}
                      <FormControl id="gender" isRequired>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onChange={handleChange}
                          name="gender"
                          value={form["gender"]}
                          isDisabled={isReadOnly}
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Select>
                        <FormHelperText opacity={0}>sdsd</FormHelperText>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </HStack>

                <HStack spacing={8} my={4} alignItems="flex-start">
                  <Grid templateColumns="repeat(3,1fr)" flex={1} gap={8}>
                    <GridItem>
                      {/**Date of birth */}
                      <FormControl id="date-of-birth" flex="1" isRequired>
                        <FormLabel>Date of Birth</FormLabel>
                        <Input
                          type="date"
                          name="dob"
                          max={currDate}
                          onChange={handleChange}
                          value={form["dob"]}
                          isReadOnly={isReadOnly}
                        />
                      </FormControl>
                    </GridItem>
                    <GridItem>
                      {/**Enrollment year */}
                      <FormControl id="enrollment-year" isRequired>
                        <FormLabel>Enrollment Year</FormLabel>
                        <Select
                          name="enrollmentYear"
                          value={form["enrollmentYear"]}
                          onChange={handleChange}
                          isDisabled={isReadOnly}
                        >
                          <option value="2021">2021</option>
                          <option value="2022">2022</option>
                          <option value="2023">2023</option>
                          <option value="2024">2024</option>
                          <option value="2025">2025</option>
                          <option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                          <option value="2029">2029</option>
                          <option value="2030">2030</option>
                        </Select>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      {/**Medical condition */}
                      <FormControl id="medical-condition" isRequired>
                        <FormLabel>Medical Condition</FormLabel>
                        <Textarea
                          name="medicalCondition"
                          value={form["medicalCondition"]}
                          onChange={handleChange}
                          isReadOnly={isReadOnly}
                          placeholder="Enter your medical condition"
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>
                </HStack>

                <Grid templateColumns="30% 70%">
                  <GridItem>
                    <HStack spacing={8} my={4}>
                      {/**Is previous Student */}
                      {newForm ? (
                        <FormControl id="is-previous-student">
                          <FormLabel>Is previous student ?</FormLabel>
                          <RadioGroup
                            value={form["isPrevious"]}
                            name="isPrevious"
                            colorScheme="orange"
                          >
                            <HStack spacing="8">
                              <Radio
                                isDisabled={
                                  isReadOnly && form["isPrevious"] === "false"
                                }
                                onChange={handleChange}
                                value={"true"}
                                backgroundColor="white"
                              >
                                Yes
                              </Radio>
                              <Radio
                                isDisabled={
                                  isReadOnly && form["isPrevious"] === "true"
                                }
                                onChange={handleChange}
                                value={"false"}
                                backgroundColor="white"
                              >
                                No
                              </Radio>
                            </HStack>
                          </RadioGroup>
                        </FormControl>
                      ) : (
                        <>
                        <FormControl id="curr-iqra-grade" isRequired>
                          <FormLabel>Current Iqra grade</FormLabel>
                          <Select
                            name="currIqraGrade"
                            value={form["currIqraGrade"]}
                            onChange={handleChange}
                            isDisabled={isReadOnly}
                          >
                            <option value="0">NA</option>
                            <option value="1">Iqra 1</option>
                            <option value="2">Iqra 2</option>
                            <option value="3">Iqra 3</option>
                            <option value="4">Iqra 4</option>
                            <option value="5">Iqra 5</option>
                            <option value="6">Iqra 6</option>
                            <option value="7">Senior</option>
                          </Select>
                        </FormControl>
                         <FormControl>
                         <FormLabel>Current Islamic Grade</FormLabel>
                           <Select
                             name="currIslamicGrade"
                             value={form["currIslamicGrade"]}
                             onChange={handleChange}
                             isDisabled={isReadOnly}
                             w="fit-content"
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
                         </FormControl></>
                      )}
                    </HStack>
                  </GridItem>

                  <GridItem>
                    {form.isPrevious === "true" ? (
                      <HStack spacing={8} my={4} alignItems="flex-start">
                        {newForm ? (
                          <>
                            {" "}
                            {/**islamic studies grade */}
                            <FormControl id="islamic-grade" isRequired>
                              <FormLabel>
                                Islamic studies grade in prev. year
                              </FormLabel>
                              <Select
                                name="islamicGradePrev"
                                value={
                                  form["islamicGradePrev"]
                                    ? form["islamicGradePrev"]
                                    : ""
                                }
                                onChange={handleChange}
                                isDisabled={isReadOnly}
                              >
                                <option value="0">NA</option>
                                <option value="1">Year Prep</option>
                                <option value="2">Year 1</option>
                                <option value="3">Year 2</option>
                                <option value="4">Year 3</option>
                                <option value="5">Year 4</option>
                                <option value="6">Year 5</option>
                                <option value="7">Year 6</option>
                                <option value="8">Year 7</option>
                                <option value="9">Year 8</option>
                                <option value="10">Year 9</option>
                              </Select>
                            </FormControl>
                            {/**Iqra grade */}
                            <FormControl id="igra-grade" isRequired>
                              <FormLabel>Iqra grade in prev. year</FormLabel>
                              <Select
                                name="iqraGradePrev"
                                value={form["iqraGradePrev"]}
                                onChange={handleChange}
                                isDisabled={isReadOnly}
                              >
                                <option value="0">NA</option>
                                <option value="1">Iqra 1</option>
                                <option value="2">Iqra 2</option>
                                <option value="3">Iqra 3</option>
                                <option value="4">Iqra 4</option>
                                <option value="5">Iqra 5</option>
                                <option value="6">Iqra 6</option>
                                <option value="7">Senior</option>
                              </Select>
                            </FormControl>
                          </>
                        ) : (
                          <>
                          <FormControl mx={8} id="grade-in-school" isRequired>
                            <FormLabel>Grade In School</FormLabel>
                            <Select
                              name="gradeInSchool"
                              value={form["gradeInSchool"]}
                              onChange={handleChange}
                              isDisabled={isReadOnly}
                              w="fit-content"
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
                          </FormControl>
                         </>
                        )}
                      </HStack>
                    ) : (
                      <HStack spacing={8} my={4} mx={8} justifyItems="flex-end">
                        <VStack>
                          <FormControl id="refree-name" isRequired>
                            <FormLabel>Referee Name</FormLabel>
                            <Input
                              type="text"
                              name="refereeName"
                              value={form["refereeName"]}
                              onChange={handleChange}
                              isReadOnly={isReadOnly}
                            />
                          </FormControl>
                          <FormControl id="refree-email" isRequired>
                            <FormLabel>Referee Email Address</FormLabel>
                            <Input
                              type="email"
                              name="refereeEmail"
                              value={form["refereeEmail"]}
                              onChange={handleChange}
                              isReadOnly={isReadOnly}
                            />
                          </FormControl>
                        </VStack>
                        <VStack>
                          <FormControl id="refree-phone" isRequired>
                            <FormLabel>Referee Phone number</FormLabel>
                            <Input
                              type="text"
                              name="refereePhone"
                              value={form["refereePhone"]}
                              onChange={handleChange}
                              isReadOnly={isReadOnly}
                            />
                          </FormControl>
                          <FormControl id="grade-in-school" isRequired>
                            <FormLabel>Grade In School</FormLabel>
                            <Select
                              name="gradeInSchool"
                              value={form["gradeInSchool"]}
                              onChange={handleChange}
                              isDisabled={isReadOnly}
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
                          </FormControl>
                        </VStack>
                      </HStack>
                    )}
                  </GridItem>
                </Grid>
              </GridItem>
            </Grid>
          </Box>

          {/*---Parent Detail---*/}

          <Box border="2px" p="4" borderRadius="md" borderColor="gray.200">
            <Text fontWeight="semibold">Parent Details</Text>
            <Text fontWeight="light" fontSize="sm">Either Father's or Mother's information is required</Text>
            <HStack>
              <Grid templateColumns="repeat(3,1fr)" flex={1} gap={8} my={4}>
                <GridItem>
                  {/**father name */}
                  <FormControl id="father-name">
                    <FormLabel>Father's name</FormLabel>
                    <Input
                      type="text"
                      name="fatherName"
                      maxLength="50"
                      value={form["fatherName"]}
                      onChange={handleChange}
                      isReadOnly={isReadOnly}
                    />
                    <FormHelperText>Not more than 50 characters</FormHelperText>
                  </FormControl>
                </GridItem>
                <GridItem>
                  {/**Father email */}
                  <FormControl id="father-email">
                    <FormLabel>Father's email</FormLabel>
                    <Input
                      type="email"
                      name="fatherEmail"
                      value={form["fatherEmail"]}
                      onChange={handleChange}
                      isReadOnly={isReadOnly}
                    />
                    <FormHelperText>Enter valid email id</FormHelperText>
                  </FormControl>
                </GridItem>
                <GridItem>
                  {/**Father contact number */}
                  <FormControl id="father-contact">
                    <FormLabel>Father Contact Number</FormLabel>
                    <Input
                      type="text"
                      name="fatherContact"
                      value={form["fatherContact"]}
                      onChange={handleChange}
                      isReadOnly={isReadOnly}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </HStack>

            <HStack>
              <Grid templateColumns="repeat(3,1fr)" flex={1} gap={8} my={4}>
                <GridItem>
                  {/**mother name */}
                  <FormControl id="mother-name">
                    <FormLabel>Mother's name</FormLabel>
                    <Input
                      type="text"
                      name="motherName"
                      maxLength="50"
                      value={form["motherName"]}
                      onChange={handleChange}
                      isReadOnly={isReadOnly}
                    />
                    <FormHelperText>Not more than 50 characters</FormHelperText>
                  </FormControl>
                </GridItem>
                <GridItem>
                  {/**Mother email */}
                  <FormControl id="mother-email">
                    <FormLabel>Mother's email</FormLabel>
                    <Input
                      type="email"
                      name="motherEmail"
                      value={form["motherEmail"]}
                      onChange={handleChange}
                      isReadOnly={isReadOnly}
                    />
                    <FormHelperText>Enter valid email id</FormHelperText>
                  </FormControl>
                </GridItem>
                <GridItem>
                  {/**Mother Contact number */}
                  <FormControl id="mother-contact">
                    <FormLabel>Mother Contact Number</FormLabel>
                    <Input
                      type="text"
                      name="motherContact"
                      value={form["motherContact"]}
                      onChange={handleChange}
                      isReadOnly={isReadOnly}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </HStack>

            <HStack>
              <Grid templateColumns="repeat(3,1fr)" flex={1} gap={8} my={4}>
                <GridItem>
                  {/**correspondence */}
                  <FormControl id="corresspondence">
                    <FormLabel>Preferred contact for correspondence</FormLabel>
                    <RadioGroup
                      value={form["corresspondence"]}
                      name="corresspondence"
                      colorScheme="orange"
                    >
                      <HStack spacing="5">
                        <Radio
                          isDisabled={
                            isReadOnly && form["corresspondence"] === "mother"
                          }
                          value="father"
                          onChange={handleChange}
                          backgroundColor="white"
                        >
                          Father
                        </Radio>
                        <Radio
                          isDisabled={
                            isReadOnly && form["corresspondence"] === "father"
                          }
                          value="mother"
                          onChange={handleChange}
                          backgroundColor="white"
                        >
                          Mother
                        </Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>
                </GridItem>
                <GridItem>
                  {/**Corrosspondence email */}
                  <FormControl id="corr-email" isRequired>
                    <FormLabel>Correspondence's email</FormLabel>
                    <Input
                      type="email"
                      name="corrEmail"
                      value={form["corrEmail"]}
                      onChange={handleChange}
                      isReadOnly={isReadOnly}
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  {/**Home Address */}
                  <FormControl id="home-address" isRequired>
                    <FormLabel>Home Address</FormLabel>
                    <Textarea
                      name="homeAddress"
                      value={form["homeAddress"]}
                      onChange={handleChange}
                      isReadOnly={isReadOnly}
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </HStack>

            <HStack>
              <Grid templateColumns="repeat(3,1fr)" flex={1} gap={8} my={4}>
                <GridItem>
                  <FormControl id="ambulance-cover">
                    <FormLabel>Ambulance Cover</FormLabel>
                    <RadioGroup
                      value={form["ambulanceCover"]}
                      name="ambulanceCover"
                      colorScheme="orange"
                    >
                      <HStack spacing="8">
                        <Radio
                          isDisabled={
                            isReadOnly && form["ambulanceCover"] === "false"
                          }
                          value={"true"}
                          onChange={handleChange}
                          backgroundColor="white"
                        >
                          Yes
                        </Radio>
                        <Radio
                          isDisabled={
                            isReadOnly && form["ambulanceCover"] === "true"
                          }
                          value={"false"}
                          onChange={handleChange}
                          backgroundColor="white"
                        >
                          No
                        </Radio>
                      </HStack>
                    </RadioGroup>
                  </FormControl>
                </GridItem>
                <GridItem>
                  {form.ambulanceCover === "true" && (
                    <FormControl id="ambulanceMembershipNumber" isRequired>
                      <FormLabel>Ambulance Membership Number</FormLabel>
                      <Input
                        type="text"
                        name="ambulanceMembershipNumber"
                        value={form["ambulanceMembershipNumber"]}
                        onChange={handleChange}
                        isReadOnly={isReadOnly}
                      />
                    </FormControl>
                  )}
                </GridItem>
              </Grid>
            </HStack>
          </Box>

          <SimpleGrid columns={1} spacing="4">
            <Box border="2px" p="4" borderRadius="md" borderColor="gray.200">
              {!newForm ? (
                <>
                  <Text fontWeight="semibold">Fee Details</Text>
                  <SimpleGrid columns={3} spacing={8} py={8}>
                    <FormControl id="paidAmount" isReadOnly>
                      <FormLabel>Paid Amount</FormLabel>
                      <Input type="text" name="paidAmount" />
                    </FormControl>
                    <FormControl id="feeStatus" isReadOnly>
                      <FormLabel>Status</FormLabel>
                      <Input type="text" name="feeStatus" />
                    </FormControl>
                    <FormControl id="invoiceDate" isReadOnly>
                      <FormLabel>Invoice Date</FormLabel>
                      <Input type="text" name="invoiceDate" />
                    </FormControl>
                  </SimpleGrid>
                </>
              ) : (
                <Flex alignContent="center">
                  {authenticatedUser && (
                    <Checkbox
                      colorScheme="orange"
                      alignItems="start"
                      fontWeight="semibold"
                      isChecked={includeFees}
                      onChange={(e) => toggelFeesRequirement(e.target.checked)}
                      alignContent="center"
                    >
                      Ignore payment
                    </Checkbox>
                  )}
                  <Box
                    id="fee"
                    display={!includeFees ? "box" : "none"}
                    mx={12}
                  ></Box>
                </Flex>
              )}
            </Box>

            {/**Agree and Submit */}
            {newForm && (
              <Box border="2px" p="4" borderRadius="md" borderColor="gray.200">
                <Text fontWeight="semibold">Agree and Submit</Text>
                <Box py="8" px={16} textAlign="left">
                  <VStack alignItems="flex-start">
                    <Heading as="h3" fontSize="md">
                      NOTE THE FOLLOWING IMPORTANT INFORMATION:
                    </Heading>
                    <UnorderedList>
                      <ListItem>
                        The Al-Asr School academic (teaching) session will begin
                        from Sunday 7th February 2021 and the school will run
                        every Sunday.
                      </ListItem>
                      <ListItem>
                        School Timings will be as follows: Start at 10:15 am and
                        End at 2:30 pm. The annual fee for the year 2021 will be
                        $180.00 AUD . The fees are to be paid at the time of
                        enrolment. Late enrolment fees paid after 10/01/2021
                        will incur an additional charge of $35.00.{" "}
                      </ListItem>
                      <ListItem>
                        The Application Fee is non-refundable.
                      </ListItem>
                      <ListItem>
                        Parents/Guardians who sign the Application for Enrolment
                        are jointly and severely liable for payment of all of
                        the School's fees and charges in relation to the student
                        (Fees and Charges
                      </ListItem>
                      <ListItem>
                        Bank Details: AL-ASR School, BSB:083337,
                        Account:940113371.
                      </ListItem>
                    </UnorderedList>

                    <Heading as="h3" fontSize="md">
                      Terms And Conditions
                    </Heading>
                    <UnorderedList>
                      <ListItem>
                        I agree to be solely responsible for my child on the
                        School's Premises.
                      </ListItem>
                      <ListItem>
                        I agree to make myself available to any other volunteer
                        rosters as requested by Al-Asr School
                      </ListItem>
                      <ListItem>
                        I understand that I should direct and discuss all my
                        complaints/grievances/concerns only with the Al-Asr
                        Management and not with any other staff/volunteer
                        directly.
                      </ListItem>
                      <ListItem>
                        I understand that I am responsible for what my child
                        eats and drinks at the school.
                      </ListItem>
                      <ListItem>
                        I understand that the School reserves the right not to
                        refund Fees and Charges. However, the Management may, in
                        their sole discretion, consider a request for a refund
                        by a Parent/Guardian in accordance with the School's
                        Refund Policy. Please send an email to Madressa@alasr.com.au with the details requesting for the cancellation of enrolment and refund of school fees. Based on the acceptance of the same by Al Asr School Management, we will contact you to get your bank account details and process the refund of the fees on a pro-rata basis.
                      </ListItem>
                      <ListItem>
                        I understand that the Al-Asr Management reserves the
                        right to expel my child on behavioural and attendance
                        grounds
                      </ListItem>
                      <ListItem>
                        I take responsibility for my child in using ethical
                        language and demostrating responsible behavior with all
                        staff and students at all time.
                      </ListItem>
                      <ListItem>
                        I understand that if my child is absent during the term
                        for more than two weeks due to illness/overseas trips, I
                        will inform Al-Asr Madrassa management in advance
                        through email on madressa@alasr.com.au.
                      </ListItem>
                      <ListItem>
                        I understand that if my child does not attend for a term
                        or part of a term due to any reasons i.e. holidays, I
                        must still pay the term fees in order to reserve their
                        spot in the school.
                      </ListItem>
                      <ListItem>
                        I agree that I will bring my child to school on time.
                      </ListItem>
                      <ListItem>
                        I agree that I am responsible to ensure that my child is
                        not Najis while at the center. If the child needs
                        assistance to use the toilet I will be available to help
                        my child.
                      </ListItem>
                      <ListItem>
                        I agree that my child will always attend the school in
                        the proper Islamic Dress Code (long shirts, long sleeves
                        and long/loose pants for all children above 9 years,
                        Headscarf for all girls should be long enough and
                        appropriate for Hijaab). No leggings or tights for girls
                        and no shorts for boys.
                      </ListItem>
                      <ListItem>
                        I understand that I must attend each parent-teacher
                        meeting when advised by the school.
                      </ListItem>
                      <ListItem>
                        I understand that if my child is found to be
                        using/displaying Video Games, Consoles, Ipods, Mobile
                        Phones or similar devices during school hours, the
                        devices will be confiscated.
                      </ListItem>
                      <ListItem>
                        Al-Asr school will call an ambulance in case of
                        emergency/life-threatening injuries and any cost
                        incurred will be borne by the concerned parent.
                      </ListItem>
                      <ListItem>
                        I agree that all copyright for all the work and
                        intellectual property produced by the student in
                        relation to his/her participation in the Madrassa
                        program shall be assigned and belong to Al-Asr.
                      </ListItem>
                      <ListItem>
                        I consent for my child's name/photographs/videos to be
                        included in Al-Asr Madrassa's social media and email
                        group.
                      </ListItem>
                      <ListItem>
                        I consent to administer first aid treatment/Panadol to
                        my child in case of an emergency during school hours.
                      </ListItem>
                    </UnorderedList>

                    <Text>
                      For further information please contact
                      madressa@alasr.com.au. or call 0416 123 786
                    </Text>

                    <Checkbox
                      colorScheme="orange"
                      alignItems="start"
                      onChange={(e) => setTnc(e.target.checked)}
                      fontWeight="semibold"
                    >
                      I HAVE READ ALL THE TERMS AND CONDITIONS ABOVE, AND AGREE
                      TO ABIDE BY THEM. COMPLETING THIS FORM DOES NOT GUARANTEE
                      ENROLMENT INTO THE SCHOOL.
                    </Checkbox>
                  </VStack>
                  <Button
                    mt="8"
                    mb="2"
                    type="submit"
                    variant="solid"
                    backgroundColor="brand.orange"
                    color="white"
                    w="100%"
                    _hover={{}}
                    isDisabled={!tnc}
                  >
                    Submit
                  </Button>
                </Box>
              </Box>
            )}
          </SimpleGrid>

          {form["status"] === "pending" && isReadOnly === true && (
            <Box border="2px" p="4" borderRadius="md" borderColor="gray.200">
              <Text fontWeight="semibold">Application Status</Text>
              <Flex justifyContent="center" alignItems="center" py={8}>
                <Flex justifyContent="center" w="50%" mx={12}>
                  <CustomButton
                    label={"Accept"}
                    handleFuction={() => updateFormStatus(STATUS.APPROVE)}
                    style={{
                      variant: "solid",
                      backgroundColor: "green.500",
                      color: "white",
                      w: "100%",
                    }}
                  />
                </Flex>
                <Flex justifyContent="center" w="50%" mx={12}>
                  <CustomButton
                    label={"Reject"}
                    handleFuction={() => onOpen()}
                    style={{
                      variant: "solid",
                      backgroundColor: "red.500",
                      color: "white",
                      w: "100%",
                    }}
                  />
                </Flex>
              </Flex>
            </Box>
          )}
        </Stack>
      </form>
    </Box>
  );
  return [Form, form];
};

export default StudentForm;
