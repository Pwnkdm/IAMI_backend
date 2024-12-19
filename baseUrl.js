const axios = require('axios'); // Use CommonJS syntax

let baseURL = 'https://sandbox-in-gw.insuremo.com'; // Define your base URL here

// Create an Axios instance
const instance = axios.create({ baseURL });

// Export both the baseURL and Axios instance
module.exports = {
  baseurl: baseURL,
  axiosInstance: instance
};