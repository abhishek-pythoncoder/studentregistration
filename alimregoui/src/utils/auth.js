import axios from "axios";

const isAuthenticated = async () => {
  const token = localStorage.getItem("smart-alim:user");
  if (!token) return false;
  const { access, email } = JSON.parse(token);
  return new Promise((resolve, reject) => {
    axios
      .post(`${process.env.REACT_APP_ORIGIN}/student/validatetoken/`, {
        username: email,
        token: access,
      })
      .then((data) => resolve(data.data))
      .catch((err) => reject(false));
  });
};



export default isAuthenticated;
