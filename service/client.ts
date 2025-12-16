import axios from 'axios';
export const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export const clientApi = axios.create({
  baseURL: apiUrl // adjust your base URL accordingly
});
