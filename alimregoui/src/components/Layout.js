import { Box, Flex } from "@chakra-ui/layout";
import React from "react";
import Header from "./Header";

const Layout = ({ children }) => {
  return (
    <Box>
      {/*---Header--- */}
      <Header />
      {/*---Component--- */}
      <Flex
        backgroundColor="brand.green"
        minH="100vh"
        direction="column"
        pb="24"
      >
        {children}
      </Flex>
      {/*---Footer--- */}
    </Box>
  );
};

export default Layout;
