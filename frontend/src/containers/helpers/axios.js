/***************************************************
 * Author: Christian Ocon
 * File Name: axios.js
 * Description:
 *      This file sets the localStorage token initial 
 *      states and makes an instance of Axios for
 *      backend communication.
 ****************************************************/

import axios from "axios";
import { USER_TYPE_NONE, ELIG_TYPE_NONE } from '../../constants/constants.js'

// .env base database URL
const baseURL = process.env.REACT_APP_API_ROOT;

console.log("BaseURL", { baseURL });

let userDataInitial = {
    firstName: "",
    lastName: "",
    userEmail: "",
    userType: USER_TYPE_NONE,
    eligType: ELIG_TYPE_NONE,
    loggedIn: false
}


// If localStorage Token or userData do not exis, reset
if (!localStorage.Token || !localStorage.userData) {
    localStorage.setItem("Token", '')
    window.localStorage.setItem("userData", JSON.stringify(userDataInitial));
}


console.log(`${localStorage.Token}`);

//Set an axios instance
const axiosInstance = axios.create({
    baseURL: baseURL,
    headers: {
        Authorization: localStorage.Token
    }
});

export default axiosInstance;