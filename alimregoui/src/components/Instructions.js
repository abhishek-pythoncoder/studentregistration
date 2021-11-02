import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Heading,
  Text,
  UnorderedList,
  ListItem,
  Icon,
} from "@chakra-ui/react";
const Instructions = ({ show }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  useEffect(() => {
    if(show) {
      onOpen();
    }
  }, []);
  return (
    <>
      <Icon name="QuestionIcon" onClick={onOpen} ml={8} />
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent pb={8}>
          <ModalHeader>Enrollment Form</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Heading as="h3" fontSize="md">
              Instructions to fill form
            </Heading>
            <Text my={2}>
              All the columns in the application form must be filled in. The
              incomplete form shall be rejected. Any wrong or misleading
              information in the application form will disqualify the applicant
              and if already admitted will lead to the cancellation of his/her
              admission
            </Text>
            <Text my={2}>
              The application form duly completed should be checked for all the
              entries, correctly filled with the appropriate course indicating
              your choice for seeking admission.
            </Text>
            <Text>Ensure the following mandatory items are complied with:</Text>
            <UnorderedList>
              <ListItem>Mobile Number for Whatsapp communication</ListItem>
              <ListItem>Both Father and Mother Contact Details</ListItem>
              <ListItem>Student Colored Photo</ListItem>
              <ListItem>Special Educational requirements</ListItem>
              <ListItem>Medical Conditions</ListItem>
            </UnorderedList>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Instructions;
