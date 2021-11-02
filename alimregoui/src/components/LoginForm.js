import React, { useEffect, useState } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
} from "@chakra-ui/react";
import Request from "../utils/request";
import { Redirect } from "react-router";

const LoginForm = (props) => {
  const [user, updateUser] = useState({ username: "", password: "" });
  const [loggedIn, login] = useState();

  
  const handleSubmit = (e) => {
    e.preventDefault();
    const options = {
      to: "/token/generate/",
      body: { ...user },
    };

    Request.post({ ...options })
      .then(({ data: { access, email } }) => {
        //for now store it in the local storage
        localStorage.setItem(
          "smart-alim:user",
          JSON.stringify({ access, email })
        );
        window.location.href = "/";
        login(true);
      })
      .catch(console.error);
  };

  const handleChange = (e) => {
    updateUser({ ...user, [e.target.name]: e.target.value });
  };

  return loggedIn ? (
    <Redirect to="/" />
  ) : (
    <Stack spacing="8" backgroundColor="white" p="12" boxShadow="md">
      <Heading as="h3">Log in</Heading>
      <form onSubmit={handleSubmit}>
        <Stack spacing="4">
          <FormControl id="username" isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              name="username"
              value={user["username"]}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              value={user["password"]}
              onChange={handleChange}
            />
          </FormControl>

          <Button
            type="submit"
            backgroundColor="brand.orange"
            variant="solid"
            color="white"
          >
            Login
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

export default LoginForm;
