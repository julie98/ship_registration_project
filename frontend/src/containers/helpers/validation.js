/***************************************************
 * Author: Christian Ocon 
 * File Name: validation.js
 * Description:
 *      This file is for Form validation for the App
 ****************************************************/
import { USER_TYPE_NONE, USER_TYPE_INDIVIDUAL, USER_TYPE_COMMERCIAL, COMMERCIAL_TYPE_TANKER, TANKER_SIZE_NONE, USER_TYPE_BROKER, SHIP_TYPE_COMMERCIAL } from '../../constants/constants.js'
import { ELIG_TYPE_NONE } from '../../constants/constants.js'
import { PROP_TYPE_NONE, PORT_NONE, PLE_NONE } from '../../constants/constants.js'

/***************************************
 * Validates emails such as:
 *      johndoe@domainsample.com
 *      john.doe@domainsample.net
 *      john.doe43@domainsample.co.uk 
 ****************************************/
export function validateEmail(email) {
    const regexpEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regexpEmail.test(email);
}

/***************************************
 * Validates names. This regex Accepts:
 *      Mandatory single name
 *      Optional additional Names 
 *      Spaces in Names
 *      Special characters (apostrophes, hyphens, periods)
 ****************************************/
export function validateName(name) {
    const regexpName = /^(\s)*[A-Za-z]+((\s)?(('|-|\.)?([A-Za-z])*))*(\s)*$/;
    return regexpName.test(name);
}

/***************************************
 * Validates Passwords. They must contain:
 *      Minimum eight characters
 *      At least one uppercase letter
 *      At least one lowercase letter,
 *      At least one number
 *      At least one Special Character [@$!%*?&]
 ****************************************/
export function validatePassword(password) {
    const regexpPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regexpPassword.test(password)
}

/***************************************
 * Validates IMO. It must contain:
 *  An IMO number is made of the three 
 *  letters "IMO" followed by a seven-digit 
 * number. This consists of a six-digit 
 * sequential unique number followed by a 
 * check digit. The integrity of an IMO 
 * number can be verified using its check 
 * digit. This is done by multiplying each 
 * of the first six digits by a factor of 
 * 2 to 7 corresponding to their position 
 * from right to left. The rightmost digit 
 * of this sum is the check digit. For example, for: 
 * IMO 907472[9]: (9×7) + (0×6) + (7×5) + (4×4) + (7×3) + (2×2) = 13[9]
 ****************************************/
export function validateIMO(imo) {
    const regexpIMO = /^(IMO)\d{7}$/;
    if(regexpIMO.test(imo) === false){
        return false;
    }

    var arr = imo.slice(3)
    var check_sum = 0

    check_sum = (parseInt(arr[0]) * 7) + (parseInt(arr[1]) * 6) + (parseInt(arr[2]) * 5) +
                (parseInt(arr[3]) * 4) + (parseInt(arr[4]) * 3) + (parseInt(arr[5]) * 2);

    var last_digit = (check_sum % 10)

    return ( last_digit === parseInt(arr[6]))
}


/* 
 * MMSI is a 9 digit number from [100000000 - 999999999]
 */
export function validateMMSI(mmsi){
    return (mmsi>=100000000 && mmsi <= 999999999)
}

export function validateShare(mmsi){
    return (mmsi>=1 && mmsi <= 100)
}

/* 
 * CallSign 1ABC1
 */
export function validateCallSign(sign){
    const regexCallSign = /^([1-9]{1}[A-Z]{3}[1-9]{0,1})$/;
    return regexCallSign.test(sign)
}




/***************************************
 * Validates HIN. It must contain:
 *  Manufacturer's Identification Cod (MIC) [3 Capitol letters]
 * Hull Serial Number [5 numbers]
 * Date of Manufacture [1 cap Letter 1 num]
 * Model Year [2 num]
 * ABC 12345 A6 00
 * This is an example, should not be used
 * for real-life HIN validation(not fully validated)
 ****************************************/
export function validateHIN(hin){
    const regexpHIN = /^(([A-Z]){3}([0-9]){5}([A-Z]){1}([0-9]){1}([0-9]){2})$/;
    return regexpHIN.test(hin)
}
/***************************************
 * Validates Login Form:
 * Checks for form errors and values for 
 * that specific place in variable
 ****************************************/
export function loginValid({ formErrors, ...rest }) {
    console.log('form ', formErrors)
    console.log('rest ', rest)
    let valid = true;

    //Validate form errors being empty
    Object.values(formErrors).forEach(val => {
        val.length > 0 && (valid = false)
    });

    //Validate form was filled out
    Object.values(rest).forEach(val => {
        val === null && (valid = false)
    });

    //Validate form was filled out
    Object.values(rest).forEach(val => {
        val === "" && (valid = false)
    });


    if ((validateEmail(rest.userEmail) === false)) {
        valid = false;
    }

    if (validatePassword(rest.userPassword) === false) {
        valid = false;
    }

    return valid;
}


/***************************************
 * Validates Signup Form:
 * Checks for form errors and values for 
 * that specific place in variable
 ****************************************/
export function signupValid({ formErrors, ...rest }) {
    console.log('form ', formErrors)
    console.log('rest ', rest)
    let valid = true;
    //Validate form errors being empty
    Object.values(formErrors).forEach(val => {
        val.length > 0 && (valid = false)
    });

    //Validate form was filled out
    Object.values(rest).forEach(val => {
        val === null && (valid = false)
    });


    Object.values(rest).forEach(val => {
        val === "" && (valid = false)
    });


    if ((validateName(rest.firstName) === false)) {
        valid = false;
    }


    if ((validateName(rest.lastName) === false)) {
        valid = false;
    }


    if (validatePassword(rest.userPassword) === false) {
        valid = false;
    }

    if (rest.userType === USER_TYPE_NONE) {
        valid = false;
    }

    if (rest.eligType === ELIG_TYPE_NONE && (rest.userType === USER_TYPE_INDIVIDUAL || rest.userType === USER_TYPE_COMMERCIAL)) {
        valid = false;
    }

    return valid;
}

/***************************************
 * Validates Registration Form:
 * Checks for form errors and values for 
 * that specific place in variable
 ****************************************/
export function registrationValid({ formErrors, ...rest }) {
    console.log('form ', formErrors)
    console.log('rest ', rest)
    let valid = true;
    //Validate form errors being empty
    Object.values(formErrors).forEach(val => {
        val.length > 0 && (valid = false)
    });

    //Validate form was filled out
    Object.values(rest).forEach(val => {
        val === null && (valid = false)
    });

    Object.values(rest).forEach(val => {
        val === "" && (valid = false)
    });

    if ((validateName(rest.ship_name) === false)) {
        valid = false;
    }

    if ((validateName(rest.ship_type) === false)) {
        valid = false;
    }

    if ((validateName(rest.builder_name) === false)) {
        valid = false;
    }

    if (validateIMO(rest.imo_num) === false) {
        valid = false;
    }

    if (rest.prop_method === PROP_TYPE_NONE) {
        valid = false;
    }

    if (rest.port === PORT_NONE) {
        valid = false;
    }

    return valid;
}



/***************************************
 * Validates Commercial Registration Form:
 * Checks for form errors and values for 
 * that specific place in variable
 ****************************************/
export function registrationCommercialValid({ formErrors, ...rest }) {
    console.log('form ', formErrors)
    console.log('rest ', rest)
    let valid = true;
    //Validate form errors being empty
    Object.values(formErrors).forEach(val => {
        val.length > 0 && (valid = false)
    });

    console.log('Form errors?', valid)

    //Validate form was filled out
    Object.values(rest).forEach(val => {
        val === null && (valid = false)
    });

    console.log('Null errors?', valid)

    Object.values(rest).forEach(val => {
        val === "" && (valid = false)
    });

    console.log('string errors?', valid)

    if ((validateName(rest.ship_name) === false)) {
        valid = false;
    }

    console.log('Ship Name errors?', valid)

    if ((rest.ship_type !== SHIP_TYPE_COMMERCIAL)) {
        valid = false;
    }

    console.log('shipType?', valid)

    if ((rest.commer_type[2] === COMMERCIAL_TYPE_TANKER) && rest.commer_type[1] === TANKER_SIZE_NONE){
        valid = false;
    }

    console.log('Tanker Size?', valid)

    if ((validateName(rest.builder_name) === false)) {
        valid = false;
    }

    console.log('builder_name?', valid)

    if ((validateName(rest.joint_owners) === false)) {
        valid = false;
    }

    console.log('joint_owners?', valid)

    if (validateIMO(rest.imo_num) === false) {
        valid = false;
    }

    console.log('imo?', valid)

    if (rest.prop_method === PROP_TYPE_NONE) {
        valid = false;
    }

    console.log('propulsion type?', valid)

    if (rest.port === PORT_NONE) {
        valid = false;
    }

    console.log('port?', valid)

    if ((isNaN(rest.vessel_length) === true) || (rest.vessel_length <= 0)) {
        valid = false;
    }

    console.log('length?', valid)

    if ((isNaN(rest.width) === true) || (rest.width <= 0)) {
        valid = false;
    }

    console.log('width?', valid)

    if ((isNaN(rest.builder_yard_no) === true) || (rest.builder_yard_no <= 0)) {
        valid = false;
    }

    console.log('yard number?', valid)

    if ((isNaN(rest.depth) === true) || (rest.depth <= 0)) {
        valid = false;
    }

    console.log('depth?', valid)

    if ((isNaN(rest.tonnage) === true) || (rest.tonnage <= 0)) {
        valid = false;
    }

    console.log('tonnage??', valid)

    if ((isNaN(rest.prop_power) === true) || (rest.prop_power <= 0)) {
        valid = false;
    }

    console.log('prop_power?', valid)

    if ((isNaN(rest.num_hull) === true) || (rest.num_hull <= 0)) {
        valid = false;
    }

    console.log('num hull?', valid)

    if (validateHIN(rest.hin_num) === false) {
        valid = false;
    }

    console.log('hin num?', valid)

    if (validateMMSI(rest.mmsi_num) === false) {
        valid = false;
    }

    console.log('mmsi num?', valid)

    if (validateShare(rest.share_num) === false) {
        valid = false;
    }

    console.log('valid share?', valid)

    if (validateCallSign(rest.call_sign) === false) {
        valid = false;
    }

    console.log('call sign?', valid)

    if((rest.eligType === ELIG_TYPE_NONE) && (rest.userData.userType === USER_TYPE_BROKER)){
        valid = false;
    }

    console.log('elig type needed?', valid)

    return valid;
}

/***************************************
 * Validates Personal Registration Form:
 * Checks for form errors and values for 
 * that specific place in variable
 ****************************************/
export function registrationPersonalValid({ formErrors, ...rest }) {
    console.log('form ', formErrors)
    console.log('rest ', rest)
    let valid = true;

    //Validate form errors being empty
    Object.values(formErrors).forEach(val => {
        val.length > 0 && (valid = false)
    });

    console.log('Form errors?', valid)

    //Validate form was filled out
    Object.values(rest).forEach(val => {
        val === null && (valid = false)
    });

    console.log('Null errors?', valid)

    Object.values(rest).forEach(val => {
        val === "" && (valid = false)
    });

    console.log('string errors?', valid)

    if ((validateName(rest.ship_name) === false)) {
        valid = false;
    }

    console.log('Ship Name errors?', valid)

    if ((validateName(rest.joint_owners) === false)) {
        valid = false;
    }

    console.log('joint_owners?', valid)

    if (rest.prop_method === PROP_TYPE_NONE) {
        valid = false;
    }

    console.log('propulsion type?', valid)

    if (rest.port === PORT_NONE) {
        valid = false;
    }

    console.log('port?', valid)

    if (rest.personal_vessel_type === PLE_NONE) {
        valid = false;
    }

    console.log('personal vessel type?', valid)

    if ((isNaN(rest.vessel_length) === true) || (rest.vessel_length <= 0)) {
        valid = false;
    }

    console.log('length?', valid)


    if ((isNaN(rest.num_hull) === true) || (rest.num_hull <= 0)) {
        valid = false;
    }

    console.log('num hull?', valid)

    if (validateHIN(rest.hin_num) === false) {
        valid = false;
    }

    console.log('hin num?', valid)

    if (validateShare(rest.share_num) === false) {
        valid = false;
    }

    console.log('valid share?', valid)

    if((rest.eligType === ELIG_TYPE_NONE) && (rest.userData.userType === USER_TYPE_BROKER)){
        valid = false;
    }

    console.log('elig type needed?', valid)

    return valid;
}