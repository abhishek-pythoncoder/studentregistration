import axios from "axios";

const url = process.env.REACT_APP_ORIGIN;

const request = {
  /**
   *
   * @param from relative end point
   * @returns resolves a promise
   */
  get: ({ from, useToken, params = {} }) => {
    //[Todo]: create a seperate token get function
    const headers = useToken
      ? {
          Authorization: `Bearer ${
            JSON.parse(localStorage.getItem("smart-alim:user"))["access"]
          }`,
        }
      : {};

    params = Object.keys(params)
      .map((key, index) => `${key}=${params[key]}&`)
      .join("");
    params = params.substring(0, params.length - 1);
    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.get(`${url}${from}?${params}`, {
          headers,
        });

        resolve(response);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("smart-alim:user");
          window.location.href = "/login";
        }
        reject(error);
      }
    });
  },
  /**
   *
   * @param to relative end point
   * @param body JS object
   * @returns resolves a promise
   */
  post: ({ to, body }) => {
    const token =
      localStorage.getItem("smart-alim:user") &&
      JSON.parse(localStorage.getItem("smart-alim:user"))["access"];

    return new Promise(async (resolve, reject) => {
      try {
        const response = await axios.post(
          `${url}${to}`,
          { ...body },
          {
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        resolve(response);
      } catch (error) {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem("smart-alim:user");
          window.location.href = "/login";
        }
        reject(error.status);
      }
    });
  },
};

export default request;
