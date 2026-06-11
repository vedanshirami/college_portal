import axios from "axios";
import { baseApiURL } from "../baseUrl";
const axiosWrapper = axios.create({
  baseURL: baseApiURL(),
  withCredentials: true,
});

// Ensure credentials are always included (cookies)
axiosWrapper.defaults.withCredentials = true;

axiosWrapper.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.data?.message === "Invalid or expired token" &&
      error.response?.data?.success === false &&
      error.response?.data?.data === null
    ) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosWrapper;
