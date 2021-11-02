import React, { useEffect, useState } from "react";
import {
  Text,
  Textarea,
  Input,
  Stack,
  HStack,
  Grid,
  Button,
  Select,
  useToast,
} from "@chakra-ui/react";
import request from "../utils/request";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";

const ManageTemplate = () => {
  const [templates, updateTemplates] = useState([]);
  const [selected, select] = useState(0);
  const [currentTemplate, updateCurrentTemplate] = useState({
    template_name: "",
    template_subject: "",
    template_body: EditorState.createEmpty(),
  });
  const toast = useToast();

  useEffect(() => {
    if (templates.length > 0) {
      updateCurrentTemplate(templates[selected]);
    }
  }, [templates, selected]);

  useEffect(() => {
    //fetch all templates
    getAllTemplates()
      .then((data) =>
        updateTemplates(
          data.map(({ template_body, ...rest }) => {
            return {
              ...rest,
              template_body: EditorState.createWithContent(
                convertFromRaw(JSON.parse(template_body))
              ),
            };
          })
        )
      )
      .catch((err) => console.log(err));
  }, []);

  const getAllTemplates = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const res = await request.get({
          from: "/student/template/get/",
          useToken: true,
        });

        resolve(res.data);
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleClick = (e) => {
    updateCurrentTemplate({
      ...currentTemplate,
      [e.target.name]: e.target.value,
    });
  };
  const updateSettings = () => {
    getAllTemplates().then((data) => {
      if (data.length > 0) {
        select(0);
        updateTemplates(data);
      } else {
        updateTemplates([]);
      }
    });
  };
  const updateTemplate = async () => {
    try {
      await request.post({
        to: `/student/template/update/${currentTemplate.template_id}/`,
        body: {
          ...currentTemplate,
          template_body: JSON.stringify(
            convertToRaw(currentTemplate["template_body"].getCurrentContent())
          ),
        },
      });
      toast({
        title: "Template Updated",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      updateSettings();
    } catch (error) {
      console.log(error);
      toast({
        title: "Template Updated Error",
        description: "There is some eror, please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const deleteTemplate = async () => {
    try {
      await request.post({
        to: `/student/template/delete/${currentTemplate.template_id}/`,
      });
      toast({
        title: "Template Deleted",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      updateSettings();
    } catch (error) {
      console.log(error);
      toast({
        title: "Template Delete Error",
        description: "There is some eror, please try again later",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    }
  };

  const editorChange = async (data) => {
    updateCurrentTemplate({
      ...currentTemplate,
      template_body: data,
    });
  };

  return (
    <>
      <Text fontWeight="semibold" textAlign="left" id="manage-template">
        Manage templates
      </Text>
      {templates.length > 0 && (
        <>
          <Stack py="8" spacing="6">
            <Grid templateColumns="1fr 2fr">
              <Text pr="8">Template Name</Text>
              <Select
                name="selected"
                value={selected}
                onChange={(e) => select(e.target.value)}
              >
                {templates.map((template, index) => (
                  <option value={index} key={index}>
                    {template.template_name}
                  </option>
                ))}
              </Select>
            </Grid>
            <Grid templateColumns="1fr 2fr">
              <Text pr="8">Subject</Text>
              <Input
                type="text"
                value={
                  templates.length > 0 &&
                  Object.keys(currentTemplate).length > 0
                    ? currentTemplate.template_subject
                    : ""
                }
                onChange={handleClick}
                name="template_name"
              />
            </Grid>
            <Grid templateColumns="1fr 2fr" overflow="hidden" minH="320px">
              <Text pr="8">Body</Text>
              <Editor
                editorState={
                  templates.length > 0 &&
                  Object.keys(currentTemplate).length > 0
                    ? currentTemplate.template_body
                    : ""
                }
                toolbarClassName="toolbarClassName"
                wrapperClassName="demo-editor"
                editorClassName="editorClassName"
                onEditorStateChange={editorChange}
              />
            </Grid>
          </Stack>
          <HStack width="100%">
            <Button
              variant="outline"
              color="brand.orange"
              backgroundColor="white"
              width="100%"
              onClick={deleteTemplate}
              _hover={{}}
            >
              Delete template
            </Button>
            <Button
              variant="solid"
              backgroundColor="brand.orange"
              color="white"
              width="100%"
              onClick={updateTemplate}
              _hover={{}}
            >
              Update Template
            </Button>
          </HStack>
        </>
      )}
    </>
  );
};

export default ManageTemplate;
