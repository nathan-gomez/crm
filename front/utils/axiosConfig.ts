import axios from 'axios'

const customInstance = axios.create({
  timeout: 1500,
  validateStatus: (status) => status < 500 ? true : false
});

export default customInstance