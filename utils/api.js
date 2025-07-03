import axios from 'axios';

// заменяешь IP на свой
const API_URL = 'https://bar-app-backend-77cz.onrender.com/api';

export const api = axios.create({
    baseURL: API_URL,
});
