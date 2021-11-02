import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Layout } from "../components";
import request from "../utils/request";
import { Link } from "react-router-dom";

const Manage = () => {
  const [searchParams, updateSearch] = useState({
    first_name: "",
    last_name: "",
    email_for_correspondence: "",
    grade: "",
    year: "",
  });
  const [students, updateStudents] = useState([]);
  const [loading, toggelLoading] = useState();

  const handleChange = (e) => {
    updateSearch({ ...searchParams, [e.target.name]: e.target.value });
  };

  const reset = () => {
    updateSearch({
      first_name: "",
      last_name: "",
      email_for_correspondence: "",
      grade: 0,
      year: 0,
    });
  };
  const handleSubmit = async (e) => {
    toggelLoading(true);
    e.preventDefault();
    try {
      const response = await request.get({
        from: "/student/search/",
        params: searchParams,
        useToken: true,
      });
      const { data } = response;
      updateStudents(data);
      toggelLoading(false);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Layout>
      <Box px="16">
        <Heading as="h2" color="brand.orange" py="8">
          Manage Students
        </Heading>

        {/**filter form */}

        <Stack spacing="8">
          {/**filter */}
          <form onSubmit={handleSubmit}>
            <Box border="2px" p="4" borderRadius="md" borderColor="gray.200">
              <Text fontWeight="semibold">Search students</Text>
              <SimpleGrid columns="3" spacing="4" py="8">
                <VStack spacing="4">
                  {/**firstname */}
                  <FormControl id="first-name">
                    <FormLabel>First name</FormLabel>
                    <Input
                      type="text"
                      name="first_name"
                      value={searchParams["first_name"]}
                      maxLength="50"
                      onChange={handleChange}
                      tabIndex={0}
                    />
                  </FormControl>

                  {/**contact number */}
                  {/* <FormControl id="contact" isRequired>
                    <FormLabel>Contact Number</FormLabel>
                    <Input
                      type="number"
                      name="contact_number"
                      value={searchParams["contact_number"]}
                      onChange={handleChange}
                    />
                  </FormControl> */}
                </VStack>

                <VStack spacing="4">
                  {/**lastname */}
                  <FormControl id="last-name">
                    <FormLabel>Last name</FormLabel>
                    <Input
                      type="text"
                      name="last_name"
                      value={searchParams["last_name"]}
                      maxLength="50"
                      onChange={handleChange}
                      tabIndex={1}
                    />
                  </FormControl>
                </VStack>

                <VStack spacing="4">
                  {/**email */}
                  {/* <FormControl id="email">
                    <FormLabel>Email</FormLabel>
                    <Input
                      type="email"
                      name="email_for_correspondence"
                      value={searchParams["email_for_correspondence"]}
                      onChange={handleChange}
                      tabIndex={2}
                    />
                  </FormControl> */}

                  {/**grade */}
                  <FormControl id="grade">
                    <FormLabel>Grade In School</FormLabel>
                    <Select
                      name="grade"
                      value={searchParams["grade"]}
                      onChange={handleChange}
                      tabIndex={3}
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

                  {/**year */}
                  {/* <FormControl id="year">
                    <FormLabel>Year</FormLabel>
                    <Select
                      name="year"
                      value={searchParams["year"]}
                      onChange={handleChange}
                    >
                      <option value="">None</option>
                      <option value={0}>2021</option>
                      <option value={1}>2022</option>
                      <option value={2}>2023</option>
                      <option value={3}>2024</option>
                      <option value={4}>2025</option>
                      <option value={5}>2026</option>
                      <option value={6}>2027</option>
                      <option value={7}>2028</option>
                      <option value={8}>2029</option>
                      <option value={9}>2030</option>z
                    </Select>
                  </FormControl> */}
                </VStack>
              </SimpleGrid>

              <Flex mt="8">
                <Box flex="1"></Box>
                <Button
                  variant="outline"
                  backgroundColor="white"
                  color="brand.orange"
                  _hover={{}}
                  mx="4"
                  borderColor="brand.orange"
                  onClick={reset}
                  tabIndex={5}
                >
                  Clear
                </Button>
                <Button
                  backgroundColor="brand.orange"
                  color="white"
                  _hover={{}}
                  minW="251px"
                  type="submit"
                  tabIndex={4}
                >
                  Search
                </Button>
              </Flex>
            </Box>
          </form>
          {/**Search Result */}
          <Box border="2px" p="4" borderRadius="md" borderColor="gray.200">
            <Text fontWeight="semibold">Search results</Text>
            <SimpleGrid columns="4" py="8">
              <Heading as="h3" fontSize="md">
                Sr no.
              </Heading>
              <Heading as="h3" fontSize="md">
                First name
              </Heading>
              <Heading as="h3" fontSize="md">
                Last name
              </Heading>
              <Heading as="h3" fontSize="md">
                Email
              </Heading>
              {/* <Heading as="h3" fontSize="md">
                Contact
              </Heading> */}
            </SimpleGrid>
            {loading ? (
              <Spinner size="lg"></Spinner>
            ) : (
              students.length > 0 &&
              students.map(({ pk, fields }, index) => (
                <SimpleGrid
                  as={Link}
                  to={`/student/${pk}`}
                  columns="4"
                  py="2"
                  key={index}
                >
                  <Text as="h5" fontSize="md">
                    {index + 1}
                  </Text>
                  <Text as="h5" fontSize="md">
                    {fields.first_name}
                  </Text>
                  <Text as="h5" fontSize="md">
                    {fields.last_name}
                  </Text>
                  <Text as="h5" fontSize="md">
                    {fields.email_for_correspondence}
                  </Text>
                  {/* <Heading as="h3" fontSize="md">
                {fields.con}
              </Heading> */}
                </SimpleGrid>
              ))
            )}
          </Box>
        </Stack>
      </Box>
    </Layout>
  );
};

export default Manage;
