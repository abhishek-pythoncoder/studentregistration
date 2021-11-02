import React from "react";
import {
  AspectRatio,
  Center,
  Flex,
  Heading,
  Image,
  VStack,
} from "@chakra-ui/react";
import { Layout, LoginForm } from "../components";

import Logo from "../assests/logo.svg";

const Auth = () => {
  return (
    <Layout>
      <Flex direction="column">
        {/* ---Hero--- */}
        <VStack px="52" py="14">
          <Image src={Logo} w="277px" />
          <Center>
            <Heading as="h1" textAlign="center" pt="14" color="brand.orange">
              Welcome to Student Registration Portal. Sunday School Madrassa
            </Heading>
          </Center>
        </VStack>

        {/* ---Form--- */}
        <Center>
          <LoginForm />
        </Center>
      </Flex>
    </Layout>
  );
};

export default Auth;
