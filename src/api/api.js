import axios from "axios";

//const API_ORIGIN = process.env.REACT_APP_API_ORIGIN ?? "http://localhost:8080";

const api = axios.create({
  baseURL: "http://192.168.219.103:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});


export async function getMenuCategories(signal) {
  const res = await api.get("/categories", { signal });
  return res.data;
}