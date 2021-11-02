import { Flex, Box, Image, Button, Text } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assests/logo.svg";
import isAuthenticated from "../utils/auth";

const Header = () => {
  const [user, updateUser] = useState(null);
  const [authenticatedUser, updateAuth] = useState(true);

  useEffect(() => {
    isAuthenticated().then((data) => updateAuth(data));
  }, []);

  useEffect(() => {
    const token = JSON.parse(localStorage.getItem("smart-alim:user"));
    if (token) {
      updateUser(token);
    } else {
      updateUser({});
    }
  }, []);
  return (
    <Flex p="16px">
      {/* ---Logo--- */}

      <Link to="/">
        <Image src={Logo} w="80px" />
      </Link>

      {/* ---White Space--- */}
      <Box flexGrow={1}></Box>

      {/* ---Left Section--- */}
      {/* Display this section only if the user is logged in */}

      {user && Object.keys(user).length > 0 ? (
        <>
          <Button
            color="brand.orange"
            backgroundColor="white"
            mx={8}
            justifySelf="flex-end"
            as="a"
            href={`${process.env.REACT_APP_ORIGIN}/student/download/report/`}
            display={authenticatedUser ? "flex" : "none"}
          >
            Download Student Report
          </Button>
          <Button
            variant="link"
            onClick={() => {
              localStorage.removeItem("smart-alim:user");
              window.location.href = "/login";
            }}
          >
            Logout
          </Button>
        </>
      ) : (
        <Text color="brand.orange" fontWeight="semibold">
          Guest User
        </Text>
      )}
    </Flex>
  );
};

export default Header;
