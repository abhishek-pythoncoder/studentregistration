import React, { useEffect } from "react";
import { Box, Center, Heading, SimpleGrid } from "@chakra-ui/react";
import { Layout } from "../components";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <Layout id="layout">
      <Center flexGrow="1">
        <SimpleGrid
          columns={3}
          spacing={10}
          h="100%"
          px="12"
          color="brand.orange"
        >
          <Box
            backgroundColor="#F9F1EB"
            p="12"
            boxShadow="lg"
            _hover={{ boxShadow: "2xl" }}
          >
            <Link to="/enroll-student">
              <Heading as="h2">Enroll Students</Heading>
            </Link>
          </Box>
          <Box
            p="12"
            boxShadow="lg"
            backgroundColor="#EFF9EB"
            _hover={{ boxShadow: "2xl" }}
          >
            <Link to="/manage-students">
              <Heading as="h2">Manage Students</Heading>
            </Link>
          </Box>
          <Box
            backgroundColor="#F9EBEF"
            p="12"
            boxShadow="lg"
            _hover={{ boxShadow: "2xl" }}
          >
            <Link to="/correspondence">
              <Heading as="h2">Correspondence </Heading>
            </Link>
          </Box>
          <Box
            backgroundColor="#F9EBEF"
            p="12"
            boxShadow="lg"
            _hover={{ boxShadow: "2xl" }}
          >
            <Link to="/attendance">
              <Heading as="h2">Attendance</Heading>
            </Link>
          </Box>
        </SimpleGrid>
      </Center>
    </Layout>
  );
};

export default Home;
