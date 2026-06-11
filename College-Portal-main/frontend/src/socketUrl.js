import { baseApiURL } from "./baseUrl";

export const socketURL = () => {
  const base = baseApiURL();
  if (!base) return "http://localhost:4000";
  return base.replace(/\/api\/?$/, "");
};
