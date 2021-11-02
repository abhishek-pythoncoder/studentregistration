import axios from "axios"

export default class Email {
  constructor() {
    this.token = btoa(`${ process.env.REACT_APP_CLICKSEND_USERNAME}:${process.env.REACT_APP_CLICKSEND_PASSWORD}`);
    this.emailEndPoint = process.env.REACT_APP_EMAIL_URL;
    this.userEmailEndPoint = process.env.REACT_APP_USER_EMAIL_URL;
  }

  send = async ({ from, to, subject, body: emailBody, attachments }) =>   {
    try {
      const body = {
        to,
        subject,
        body: emailBody,
        attachments,
        from: { name: "Alasar", ...from}
      };
      
      const response = await axios.post(this.emailEndPoint, body, {
        headers: {
          "Content-type": "application/json",
          Authorization: `Basic ${this.token}`,
        },
      });
      console.log(response)
      // toast({
      //   titl: "Email",
      //   description: "Email has been added to queue.",
      //   status: "info",
      //   duration: 5000,
      //   isClosable: true,
      //   position: "top",
      // });
    } catch (error) {
      console.log(error);
      // toast({
      //   title: "SMS",
      //   description: "Could not sent the sms",
      //   status: "error",
      //   duration: 5000,
      //   isClosable: true,
      //   position: "top",
      // });
    }
  }

  getFromEmails = () => {
   return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.get(this.userEmailEndPoint, {
        headers: {
          Authorization: `Basic ${this.token}`,
        },
      });
      const { data: {data: { data }}} = response;
      console.log(data)
      resolve(data);
    } catch (error) {
      console.log(error)
      reject(error);
    }
   })
  }
}

