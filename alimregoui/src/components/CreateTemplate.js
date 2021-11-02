import React, { useState } from "react";
import {
  Text,
  Input,
  Stack,
  HStack,
  Grid,
  Button,
  useToast,
} from "@chakra-ui/react";
import request from "../utils/request";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { EditorState, convertToRaw } from "draft-js";

const CreateTemplate = () => {
  const [form, updateForm] = useState({
    template_name: "",
    template_subject: "",
    template_body: EditorState.createEmpty(),
  });
  const editorChange = async (data) => {
    updateForm({
      ...form,
      template_body: data,
    });
  };
  const toast = useToast();
  const handleChange = (e) => {
    updateForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await request.post({
        to: "/student/template/create/",
        body: {
          ...form,
          template_body: JSON.stringify(
            convertToRaw(form["template_body"].getCurrentContent())
          ),
        },
      });
      toast({
        title: "Template Created",
        description: "Please refresh the page to see the updated template",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } catch (error) {
      console.log(error);
      toast({
        title: "Template Create Error",
        description: "There is some eror, please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };
  return (
    <>
      <Text fontWeight="semibold" textAlign="left">
        Create Template
      </Text>
      <form onSubmit={handleSubmit}>
        <Stack py="8" spacing="6">
          <Grid templateColumns="1fr 2fr">
            <Text pr="8">Template Name</Text>
            <Input
              type="text"
              name="template_name"
              value={form["template_name"]}
              onChange={handleChange}
              isRequired
            />
          </Grid>
          <Grid templateColumns="1fr 2fr">
            <Text pr="8">Subject</Text>
            <Input
              type="text"
              name="template_subject"
              value={form["template_subject"]}
              onChange={handleChange}
              isRequired
            />
          </Grid>
          <Grid templateColumns="1fr 2fr" overflow="hidden" minH="320px">
            <Text pr="8">Body</Text>
            <Editor
              editorState={form["template_body"]}
              toolbarClassName="toolbarClassName"
              wrapperClassName=""
              editorClassName="demo-editor"
              onEditorStateChange={editorChange}
            />
            {/* <Textarea
              rows={10}
              name="template_body"
              value={form["template_body"]}
              onChange={handleChange}
              isRequired
            /> */}
          </Grid>
        </Stack>
        <HStack width="100%">
          <Button
            variant="solid"
            color="white"
            backgroundColor="brand.orange"
            width="100%"
            type="submit"
            _hover={{}}
          >
            Create template
          </Button>
        </HStack>
      </form>
    </>
  );
};

export default CreateTemplate;
