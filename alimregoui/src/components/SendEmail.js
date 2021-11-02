import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  Input,
  Stack,
  HStack,
  Grid,
  Button,
  Select,
  useToast,
  Flex,

} from "@chakra-ui/react";
import { SmallCloseIcon } from "@chakra-ui/icons";
import request from "../utils/request";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { convertFromRaw, EditorState } from "draft-js";
import axios from "axios";
import { stateToHTML } from "draft-js-export-html";
import  Email from "../utils/sendEmail"

const SendEmail = () => {
  const [templates, updateTemplates] = useState([]);
  const [selected, select] = useState(0);
  const [selectedFrom, selectFrom] = useState(0);
  const [currentTemplate, updateCurrentTemplate] = useState({
    template_name: "",
    template_subject: "",
    template_body: EditorState.createEmpty(),
  });
  const [email, updateEmail] = useState("");
  const [to, updateTo] = useState([]);
  const [from, updateFrom] = useState([]);
  const [files, updateFiles] = useState([]);
  const [student, updateStudent] = useState("");
  const [grade, updateGrade] = useState(0);
  const toast = useToast();
  const upload = useRef();

  //can be used for providing a list of from emails

  useEffect(() => {
    getFromEmails();
  }, []);

  useEffect(() => {
    if (templates.length > 0) {
      updateCurrentTemplate({ ...currentTemplate, ...templates[selected] });
    }
  }, [templates, selected]);
  
  useEffect(() => {
    //fetch all templates
    getAllTemplates()
      .then((data) => {
        const d = data.map(({ template_body, ...rest }) => ({
          ...rest,
          template_body: EditorState.createWithContent(
            convertFromRaw(JSON.parse(template_body))
          ),
        }));

        return updateTemplates(d);
      })
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

  const getFromEmails = async  () => {
   const email = new Email();
   const emails = await email.getFromEmails();
   updateFrom(emails)
  }

  const getEmails =async () => {
    request.post({ to: "/student/search_for_email/", body:{ grade, name: student }}).then(({data}) =>{
      if(data.length === 0) {
        if(student !== "") {
          alert("No emails found with current grade-name combination");
        } else {
          alert("No emails found for current grade");
        }
      } else {
        updateTo([...to, ...data.map(d => ({email: d}))]);
        
      }
    }).catch(err=>console.log(err))
  }

  const handleClick = (e) => {
    updateCurrentTemplate({
      ...currentTemplate,
      [e.target.name]: e.target.value,
    });
  };

  const handleFile = (e) => {
    try {
      const file = e.target.files[0];

      const reader = new FileReader();
      reader.readAsDataURL(file); //converts file to an url
      reader.onloadend = () => {
        updateFiles([
          ...files,
          {
            content: reader.result,
            type: file.type,
            filename: file.name,
            disposition: "attachment",
            content_id: new Date().toString(),
          },
        ]);
      };
    } catch (error) {
      console.log(error);
    }
  };

  const removeFile = (index) => {
    const newFileList = files;
    newFileList.splice(index, 1)
    updateFiles([...newFileList])
  }
  
  const sendEmail = async () => {
    const email = new Email();
    console.log(stateToHTML(
          currentTemplate.template_body.getCurrentContent()
        ))
    // email.send({
    //   to,
    //   subject: currentTemplate.template_subject,
    //   body: stateToHTML(
    //     currentTemplate.template_body.getCurrentContent()
    //   ),
    //   attachments: files,
    //   from: from[selectedFrom],
    // })
   
  };

  const addEmail = (e) => {
    if (e.key === "Enter") {
      updateTo([...to, { email }]);
      updateEmail("");
    }
  };
  const removeEmail = (index) => {
    if(index < 0) return
    const newTo = to;
    newTo.splice(index, 1)
    console.log(newTo)
    updateTo([...newTo])
  }
  const discard = () => {
    updateCurrentTemplate({
      ...currentTemplate,
      template_body: EditorState.createEmpty(),
      template_subject: "",
    });

    updateTo([]);
  };

  const editorChange = async (data) => {
    updateEmail(data);
  };
  
  return (
    <>
      <Text fontWeight="semibold" textAlign="left">
        Send email
      </Text>
      <Stack py="8" spacing="6">
        <Grid templateColumns="1fr 2fr">
          <Text pr="8">Email template</Text>
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
          <Text pr="8">From</Text>
          <Select  name="selectedFrom"
            value={selectedFrom}
            onChange={(e) => selectFrom(e.target.value)}>
            { from.map(({ email_address }, index) => <option key={index} value={index}>{ email_address }</option>)}
            </Select>     
         
        </Grid>
        <Grid templateColumns="1fr 2fr">
          <Text pr="8">Grade</Text>
          <Select onChange={(e)=>updateGrade(e.target.value)} value={grade}>
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
         
        </Grid>
        <Grid templateColumns="1fr 2fr">
        <Text pr="8">Student name </Text>
        <Input name="student" value={student} onChange={(e)=> updateStudent(e.target.value)}/>
        </Grid>
        <Grid templateColumns="1fr 2fr">
          <Flex />
        <Button variant="solid" minW="fit-content" colorScheme="orange" onClick={getEmails}>Fill Recipients</Button>
        
        </Grid>
        <Grid templateColumns="1fr 2fr">
          <Text pr="8">Recipent</Text>
          <Flex
            backgroundColor="white"
            alignItems="center"
            borderRadius="md"
            flexWrap="wrap"
            p="2"
          >
            {to.map(({ email }, index) => (
              <Flex
                backgroundColor="brand.orange"
                color="white"
                p={1}
                borderRadius="md"
                mx={2}
                my={1}
                key={index}
                onClick={()=>removeEmail(index)}
              >
                <Text fontSize="12px">{email}</Text>
                <SmallCloseIcon mx={2} />
              </Flex>
            ))}

            <Input
              width="auto"
              outline="none"
              outlineColor="white"
              border="none"
              type="email"
              name="email"
              onKeyUp={addEmail}
              value={email}
              fontSize="sm"
              onChange={(e) => updateEmail(e.target.value)}
            />
          </Flex>
        </Grid>
        <Grid templateColumns="1fr 2fr">
          <Text pr="8">Subject</Text>
          <Input
            type="text"
            value={
              templates.length > 0 && Object.keys(currentTemplate).length > 0
                ? currentTemplate.template_subject
                : ""
            }
            onChange={handleClick}
            name="template_subject"
          />
        </Grid>
        <Grid templateColumns="1fr 2fr" overflow="hidden" minH="320px">
          <Text pr="8">Body</Text>
          <Editor
            editorState={
              templates.length > 0 && Object.keys(currentTemplate).length > 0
                ? currentTemplate.template_body
                : EditorState.createEmpty()
            }
            toolbarClassName="toolbarClassName"
            wrapperClassName="demo-editor"
            editorClassName="editorClassName"
            onEditorStateChange={editorChange}
          />
        </Grid>

        <Grid templateColumns="1fr 2fr">
          <Text pr="8">Attach File</Text>
          <Input type="file" name="file" onChange={upload && handleFile} ref={upload} display="none"/>
          <Flex backgroundColor="white" padding="4" textAlign="left" alignItems="center">
            <Button onClick={()=> {upload && upload.current.click()}}>upload</Button>
            <Flex flexWrap="wrap">
            {files.map(({ filename }, index) => (
              <Flex
                backgroundColor="brand.orange"
                color="white"
                p={1}
                borderRadius="md"
                m={2}
                alignItems="center"
                justifyContent="space-between"
                key={index}
                maxW="32"
              >
                <Text fontSize="sm" isTruncated>{filename}</Text>
                <SmallCloseIcon mx={2} onClick={()=>removeFile(index)}/>
              </Flex>
            ))}
            </Flex>
          </Flex>
  
          
        </Grid>
      </Stack>
      <HStack width="100%">
        <Button
          variant="outline"
          color="brand.orange"
          backgroundColor="white"
          width="100%"
          onClick={discard}
        >
          Discard
        </Button>
        <Button
          variant="solid"
          backgroundColor="brand.orange"
          color="white"
          width="100%"
          onClick={sendEmail}
        >
          Send email
        </Button>
      </HStack>
    </>
  );
};

export default SendEmail;
