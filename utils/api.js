import axios from 'axios';

// заменяешь IP на свой
const API_URL = 'http://127.0.0.1:5001/api';

export const api = axios.create({
    baseURL: API_URL,
});
