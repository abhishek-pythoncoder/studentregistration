import React, { Suspense } from "react";
import {
  Box,
  Center,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { Layout } from "../components";
const SendEmail = React.lazy(() => import("../components/SendEmail"));
const ManageTemplate = React.lazy(() => import("../components/ManageTemplate"));
const CreateTemplate = React.lazy(() => import("../components/CreateTemplate"));

const Correspondence = () => {
  return (
    <Layout>
      <Box px="16">
        <Heading as="h2" color="brand.orange" py="8">
          Correspondence
        </Heading>
        <Center
          border="2px"
          p="4"
          borderRadius="md"
          borderColor="gray.200"
          mx="40"
          flexDirection="column"
        >
          <Tabs variant="unstyled" minW="100%" isFitted on>
            <TabList>
              <Tab _selected={{ color: "brand.orange", bg: "#FEECDC" }}>
                Send Email
              </Tab>
              <Tab _selected={{ color: "brand.orange", bg: "#FEECDC" }}>
                Manage Templates
              </Tab>
              <Tab _selected={{ color: "brand.orange", bg: "#FEECDC" }}>
                Create Template
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel textAlign="right">
                <Suspense fallback={<div>Loading...</div>}>
                  <SendEmail />
                </Suspense>
              </TabPanel>
              <TabPanel textAlign="right">
                <Suspense fallback={<div>Loading...</div>}>
                  <ManageTemplate />
                </Suspense>
              </TabPanel>
              <TabPanel textAlign="right">
                <Suspense fallback={<div>Loading...</div>}>
                  <CreateTemplate />
                </Suspense>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Center>
      </Box>
    </Layout>
  );
};

export default Correspondence;
