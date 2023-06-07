/***************************************************
 * Author: Priya Padmanaban
 * File Name: utility.js
 * Description:
 *      This file signs out the user, and resets
 *      the user data and token  in localStorage
 *      to its initial state.
 ****************************************************/


// Get Token and User data from Local Storage and reset to initial states. Also, call the Navigation Bar to update
export function Signout() {
    var userData = {
        firstName: "",
        lastName: "", 
        userEmail: "",
        userType: 0,
        eligType: 0,
        loggedIn: false
    }

    window.localStorage.setItem("userData", JSON.stringify(userData));
    localStorage.setItem("Token", '')
    console.log('LocalStorage: ', localStorage)
    console.log("UserData: ", JSON.parse(window.localStorage.getItem("userData")))
}