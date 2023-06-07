/***************************************************
 * Author: Priya Padmanaban
 * File Name: CommercialRegistration.js
 * Description:
 *      This file allows submission of a commercial/
 *      merchant vessel application.
 ****************************************************/

import React, { Component } from 'react';
import './CommercialRegistration.css';
import axiosInstance from '../containers/helpers/axios'
import axios from 'axios';
import { Signout } from '../containers/helpers/utility';
import { PROP_TYPE_NONE, PROP_TYPE_SAI, PROP_TYPE_PRP, PROP_TYPE_PPJ, PROP_TYPE_PWH, PROP_TYPE_VSC, PROP_TYPE_CTP, SHIP_TYPE_COMMERCIAL, SHIP_TYPE_NONE, COMMERCIAL_TYPE_TANKER, TANKER_SIZE_NONE, USER_TYPE_BROKER, USER_TYPE_COMMERCIAL } from '../constants/constants.js'
import { PORT_NONE, PORT_WHT, PORT_SBG, PORT_PNC, PORT_BAR, PORT_RBH, PORT_VCT } from '../constants/constants.js'
import { COMMERCIAL_SHIP_TYPE_LIST } from '../constants/constants'
import { TANKER_SIZE_AFRAMAX, TANKER_SIZE_PANAMAX, TANKER_SIZE_SUEZMAX, TANKER_SIZE_ULCC, TANKER_SIZE_VLCC } from '../constants/constants'
import _ from "lodash";
import { Search } from "semantic-ui-react";
import { registrationCommercialValid, validateName, validateIMO, validateHIN, validateMMSI, validateCallSign, validateShare } from '../containers/helpers/validation';
import { Spinner, Form, Button } from 'react-bootstrap';
import { ELIG_TYPE_NONE, ELIG_TYPE_NA, ELIG_TYPE_BDT, ELIG_TYPE_EEAC, ELIG_TYPE_BCP, ELIG_TYPE_EEIG, ELIG_TYPE_CWS } from '../constants/constants.js'
import * as ConstSwitch from '../constants/ConstantSwitch'

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from "@stripe/stripe-js/pure";
import CheckoutForm from "./CheckoutForm";
import { Modal } from 'semantic-ui-react';

export default class CommercialRegistration extends Component {
    constructor(props) {
        super(props);

        var today = new Date(),
            date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();

        this.stripeKey = null;

        this.handleAddVessel = this.handleAddVessel.bind(this);

        this.CheckCanSubmitReg = this.CheckCanSubmitReg.bind(this);
        this.CheckCanSubmitPayment = this.CheckCanSubmitPayment.bind(this);

        this.reg_id = null
        this.enableSubmit = true
        this.enablePayment = true


        axiosInstance.get('/payment/config/')
            .then((res) => {
                console.log(res.data)
                this.stripeKey = res.data.publicKey;

                this.stripePromise = loadStripe(this.stripeKey)

                
            })
            .catch((err) => {
                console.log(err)
            })

        this.initialState = {
            isLoading: false,
            results: [],
            value: "",
            return_val: []
        };

        this.userData = JSON.parse(window.localStorage.getItem("userData"))

        this.state = {
            currentDate: date,
            ship_name: null,
            ship_type: SHIP_TYPE_NONE,
            commer_type: [],
            tonnage: null,
            vessel_length: null,
            width: null,
            depth: null,
            imo_num: null,
            joint_owners: null,
            share_num: null,
            prop_method: PROP_TYPE_NONE,
            hin_num: null,
            prop_power: null,
            engine_make: null,
            engine_model: null,
            num_engine: null,
            num_hull: null,
            call_sign: null,
            mmsi_num: null,
            eligType: ELIG_TYPE_NONE,
            loadingPorts: false,
            portList: [],
            port: PORT_NONE,
            builder_name: null,
            builder_addr: null,
            builder_yard_no: null,
            build_date: null,
            keel_date: null,
            searchBar: this.initialState,
            formErrors: {
                ship_name: "",
                ship_type: "",
                tanker_size: "",
                tonnage: "",
                vessel_length: "",
                width: "",
                depth: "",
                imo_num: "",
                imo_mul: "",
                imo_dig: "",
                imo_example: "",
                hin_num: "",
                mmsi_num: "",
                eligType: "",
                call_sign: "",
                joint_owners: "",
                share_num: '',
                prop_method: "",
                prop_power: "",
                engine_make: "",
                engine_model: "",
                num_engine: "",
                num_hull: "",
                port: "",
                builder_name: "",
                builder_addr: "",
                builder_yard_no: "",
                build_date: "",
                keel_date: "",
            }
        };
    }

    handleResultSelect = (e, { result }) => {
        let formErrors = { ...this.state.formErrors };
        this.setState({
            searchBar: {
                isLoading: false,
                value: result.title,
                results: this.state.searchBar.results,
                return_val: [result.title, result.description, result.vessel_type]
            },
            commer_type: [result.title, result.description, result.vessel_type],
            ship_type: SHIP_TYPE_COMMERCIAL,
            formErrors
        });

        console.log('On Select: ', [result.title, result.description, result.vessel_type])
    }

    handleSearchChange = (e, { value }) => {
        let formErrors = { ...this.state.formErrors };
        formErrors.ship_type = ""
        console.log('this state: ', this.state)
        this.setState({
            searchBar: { isLoading: true, value, results: this.state.searchBar.results, return_val: ['', '', ''] },
            commer_type: [],
            ship_type: SHIP_TYPE_NONE,
            formErrors
        });

        // This is a search time out. after 300ms, returns results.
        setTimeout(() => {
            console.log('Search Bar', this.state.searchBar)
            if (this.state.searchBar.value.length < 1) return this.setState({ searchBar: this.initialState });
            const re = new RegExp(_.escapeRegExp(this.state.searchBar.value), "i");
            const isMatch_Title = (result) => re.test(result.title);
            const isMatch_Description = (result) => re.test(result.description);
            const isMatch_Vessel_Type = (result) => re.test(result.vessel_type);
            const filteredResults = _.reduce(
                COMMERCIAL_SHIP_TYPE_LIST,
                (memo, data, name) => {
                    const results_title = _.filter(data.results, isMatch_Title);
                    const results_description = _.filter(data.results, isMatch_Description);
                    const results_vessel_type = _.filter(data.results, isMatch_Vessel_Type);
                    let results_cat = results_title.concat(results_description).concat(results_vessel_type)
                    results_cat = [...new Set([...results_title,...results_description, ...results_vessel_type ])]
                    const results = results_cat
                    if (results.length) memo[name] = { name, results }; // eslint-disable-line no-param-reassign
                    return memo;
                },
                {}
            );

            this.setState({
                searchBar: {
                    isLoading: false,
                    value: this.state.searchBar.value,
                    results: filteredResults,
                    return_val: ['', '', '']
                }
            });
        }, 300);
    };

    return() {
        let newState = this.state

        newState = {
            ship_name: null,
            ship_type: SHIP_TYPE_NONE,
            tonnage: null,
            vessel_length: null,
            width: null,
            depth: null,
            imo_num: null,
            call_sign: null,
            mmsi_num: null,
            joint_owners: null,
            share_num: null,
            prop_method: PROP_TYPE_NONE,
            prop_power: null,
            num_engine: null,
            eligType: ELIG_TYPE_NONE,
            engine_make: null,
            engine_model: null,
            num_hull: null,
            port: PORT_NONE,
            loadingPorts: false,
            portList: [],
            builder_name: null,
            builder_addr: null,
            builder_yard_no: null,
            build_date: null,
            keel_date: null,
            searchBar: this.initialState,

            formErrors: {
                ship_name: "",
                tanker_size: "",
                ship_type: "",
                tonnage: "",
                vessel_length: "",
                width: "",
                depth: "",
                gross: "",
                imo_num: "",
                imo_mul: "",
                imo_dig: "",
                call_sign: "",
                imo_example: "",
                joint_owners: "",
                eligType: "",
                share_num: "",
                prop_method: "",
                prop_power: "",
                num_engine: "",
                engine_make: "",
                engine_model: "",
                num_hull: "",
                mmsi_num: "",
                port: "",
                builder_name: "",
                builder_addr: "",
                builder_yard_no: "",
                build_date: "",
                keel_date: "",
            }
        }

        this.setState(newState, () => console.log(this.state));
    }

    /****************************************
     * CommercialRegistrationAxios() posts form data to /vessels/add
     * If successful, creates a new pending vessel.
     * If unsuccessful, signs out and redirects to login.
     ****************************************/
    CommercialRegistrationAxios(data) {

        var url = new URL(window.location.href).host
        var tempjoint_owners = []

        if (this.userData.eligType === USER_TYPE_BROKER) {//if broker user, use the form information
            tempjoint_owners = [
                [
                    this.state.joint_owners,
                    document.getElementById('share_num').value,
                    this.state.eligType
                ]
            ]
        } else {//if commercial user, use their information
            tempjoint_owners =
                [
                    [
                        this.userData.firstName + ' ' + this.userData.lastName,
                        document.getElementById('share_num').value,
                        this.userData.eligType
                    ]
                ]
        }

        axiosInstance.post('/vessels/register_vessel/', {
            ship_name: this.state.ship_name,
            ship_type: SHIP_TYPE_COMMERCIAL,
            commer_type: this.state.commer_type,
            length: this.state.vessel_length,
            width: this.state.width,
            depth: this.state.depth,
            tonnage: this.state.tonnage,
            imo_num: this.state.imo_num,
            joint_owners: tempjoint_owners,
            prop_method: this.state.prop_method,
            prop_power: this.state.prop_power,
            num_engine: this.state.num_engine,
            engine_details:
                [
                    [
                        this.state.engine_make,
                        this.state.engine_model
                    ]
                ],
            num_hull: this.state.num_hull,
            hull_id: this.state.hin_num,
            mmsi: this.state.mmsi_num,
            port: this.state.port,
            call_sign: this.state.call_sign,
            builder_name: this.state.builder_name,
            builder_addr: this.state.builder_addr,
            builder_yard_no: this.state.builder_yard_no,
            build_date: this.state.build_date,
            keel_date: this.state.keel_date,
            root_url:  url,
        })
            .then((res) => {
                console.log(res.data)
                console.log('ship added')
                this.vessel_id = res.data
                console.log('Vessel_id: ', this.vessel_id)

                this.reg_id = res.data[0].pk
                console.log('registration_id: ', this.reg_id)

                // Force update so the submit vessel button is disabled
                this.forceUpdate()

                //this.props.history.push('/vessels/list')
            })
            .catch((err) => {
                console.log("COULD NOT CONNECT")
                if (err.response.status === 401) {
                    Signout();
                    this.props.history.push('/login')
                }
            })

    }

    /****************************************
     * handleAddVessel() handles the apply button
     * It will validate the form and send
     * the information to signupAxios().
     * If invalid, will display reasons why
     * invalid on form
     ****************************************/

    handleAddVessel = e => {
        e.preventDefault();
        //this.setState({ loading: false })

        console.log('thisState on submit: ', this.state)
        let tempState = this.state

        this.enableSubmit = false
        this.enablePayment = true

        tempState.userData = this.userData

        // Commercials accounts use their own information
        if (tempState.userData.userType === USER_TYPE_COMMERCIAL) {
            tempState.joint_owners = tempState.userData.firstName + ' ' + tempState.userData.lastName
            tempState.eligType = tempState.userData.eligType
        }


        if (registrationCommercialValid(tempState)) {
            console.log('Passed Validation')
            this.CommercialRegistrationAxios();
        } else {
            console.log('Failed Validation')
            let newState = this.state

            //newState.loading = false;
            if ((newState.ship_name === null) || (newState.ship_name === "")) {
                newState.formErrors.ship_name = "Field is required"
            } else if (validateName(newState.ship_name) === false) {
                newState.formErrors.ship_name = "Invalid Name Entry"
            } else if (newState.portList.length === 0) {
                newState.formErrors.ship_name = "Please check port availability."
            }

            if ((newState.ship_type === SHIP_TYPE_NONE)) {
                newState.formErrors.ship_type = "Field is required"
            }

            if ((newState.commer_type[2] === COMMERCIAL_TYPE_TANKER) && newState.commer_type[1] === TANKER_SIZE_NONE) {
                newState.formErrors.tanker_size = "Please choose a tanker size"
            }

            if ((newState.builder_name === null) || (newState.builder_name === "")) {
                newState.formErrors.builder_name = "Field is required"
            } else if (validateName(newState.builder_name) === false) {
                newState.formErrors.builder_name = "Invalid Name Entry"
            }

            if ((newState.joint_owners === null) || (newState.joint_owners === "")) {
                newState.formErrors.joint_owners = "Field is required"
            } else if (validateName(newState.joint_owners) === false) {
                newState.formErrors.joint_owners = "Invalid Name Entry"
            }

            if ((newState.builder_addr === null) || (newState.builder_addr === "")) {
                newState.formErrors.builder_addr = "Field is required"
            }

            if ((newState.imo_num === null) || (newState.imo_num === "")) {
                newState.formErrors.imo_num = "Field is required"
                newState.formErrors.imo_example = ""
                newState.formErrors.imo_mul = ""
                newState.formErrors.imo_dig = ""
            } else if (validateIMO(newState.imo_num) === false) {
                newState.formErrors.imo_num = "Invalid IMO. Format IMO1234567."
                newState.formErrors.imo_mul = "• Multiply each of the first six digits by a factor of 2 to 7 corresponding to their position from right to left."
                newState.formErrors.imo_dig = "• The rightmost digit of this sum is the check digit."
                newState.formErrors.imo_example = "e.g. IMO907472[9]: (9×7) + (0×6) + (7×5) + (4×4) + (7×3) + (2×2) = 13[9]"
            }


            if (newState.prop_method === PROP_TYPE_NONE) {
                newState.formErrors.prop_method = "Please select a propulsion type."
            }

            if (newState.port === PORT_NONE) {
                newState.formErrors.port = "Please select a port."
            }

            if ((newState.vessel_length === null) || (newState.vessel_length === 0)) {
                newState.formErrors.vessel_length = "Please enter the length of your vessel."
            } else if ((isNaN(newState.vessel_length) === true) || (newState.vessel_length < 0)) {
                newState.formErrors.vessel_length = "Invalid length number entry."
            }

            if ((newState.width === null) || (newState.width === 0)) {
                newState.formErrors.width = "Please enter the width of your vessel."
            } else if ((isNaN(newState.width) === true) || (newState.width < 0)) {
                newState.formErrors.width = "Invalid width number entry."
            }

            if ((newState.builder_yard_no === null) || (newState.builder_yard_no === 0)) {
                newState.formErrors.builder_yard_no = "Please enter the yard number allocated to your ship."
            } else if ((isNaN(newState.builder_yard_no) === true) || (newState.builder_yard_no < 0)) {
                newState.formErrors.builder_yard_no = "Invalid yard number number entry."
            }

            if ((newState.depth === null) || (newState.depth === 0)) {
                newState.formErrors.depth = "Please enter the depth of your vessel."
            } else if ((isNaN(newState.depth) === true) || (newState.depth < 0)) {
                newState.formErrors.depth = "Invalid depth number entry."
            }

            if ((newState.tonnage === null) || (newState.tonnage === 0)) {
                newState.formErrors.tonnage = "Please enter the gross tonnage of your vessel."
            } else if ((isNaN(newState.tonnage) === true) || (newState.tonnage < 0)) {
                newState.formErrors.tonnage = "Invalid gross tonnage number entry."
            }

            if ((newState.num_hull === null) || (newState.num_hull === 0)) {
                newState.formErrors.num_hull = "Please enter the number of hulls of your vessel."
            } else if ((isNaN(newState.num_hull) === true) || (newState.num_hull < 0)) {
                newState.formErrors.num_hull = "Invalid number of hulls entry."
            }

            if ((newState.prop_power === null) || (newState.prop_power === 0)) {
                newState.formErrors.prop_power = "Please enter the total propulsion engine of your vessel."
            } else if ((isNaN(newState.prop_power) === true) || (newState.prop_power < 0)) {
                newState.formErrors.prop_power = "Invalid total propulsion engine number entry."
            }

            if ((newState.num_engine === null) || (newState.num_engine === 0)) {
                newState.formErrors.num_engine = "Please enter the total number of engines on your vessel."
            } else if ((isNaN(newState.num_engine) === true) || (newState.num_engine < 0)) {
                newState.formErrors.num_engine = "Invalid number of engines entry."
            }

            if ((newState.engine_make === null) || (newState.engine_make === "")) {
                newState.formErrors.engine_make = 'Please enter your engine\'s make'
            }

            if ((newState.build_date === null) || (newState.build_date === "")) {
                newState.formErrors.build_date = 'Please enter your vessel\'s build date'
            }

            if ((newState.keel_date === null) || (newState.keel_date === "")) {
                newState.formErrors.keel_date = 'Please enter your vessel\'s keel laying date'
            }

            if ((newState.engine_model === null) || (newState.engine_model === "")) {
                newState.formErrors.engine_model = 'Please enter your engine\'s model'
            }

            if ((newState.hin_num === null) || (newState.hin_num === '')) {
                newState.formErrors.hin_num = 'Please enter your engine\'s HIN number'
            } else if (validateHIN(newState.hin_num) === false) {
                newState.formErrors.hin_num = "Invalid HIN: Format is ABC12345A123."
            }

            if ((newState.mmsi_num === null) || (newState.mmsi_num === '')) {
                newState.formErrors.mmsi_num = 'Please enter your engine\'s MMSI number'
            } else if (validateMMSI(newState.mmsi_num) === false) {
                newState.formErrors.mmsi_num = "Invalid MMSI: Format is 123456789."
            }

            if ((newState.share_num === null) || (newState.share_num === '')) {
                newState.formErrors.share_num = 'Please enter the owner\'s share percentage'
            } else if (validateShare(newState.share_num) === false) {
                newState.formErrors.share_num = "Invalid share percentage: Value must be from 1-100."
            }

            if ((newState.call_sign === null) || (newState.call_sign === '')) {
                newState.formErrors.call_sign = 'Please enter your call sign'
            } else if (validateCallSign(newState.call_sign) === false) {
                newState.formErrors.call_sign = "Invalid Call Sign: Format is 1ABC or 1ABC1."
            }

            if (newState.eligType === ELIG_TYPE_NONE && this.userData.userType === USER_TYPE_BROKER) {
                newState.formErrors.eligType = "Please choose a shipping company."
            }

            this.setState(newState, () => console.log(newState));

            console.error('Form Invalid -DISPLAY ERROR MESSAGE')


        }
        return;
    }

    /****************************************
     * handleuserType() handles the user input
     * as they are choosing a radio button
     * and reset the form errors
     ****************************************/
    handleUserStatus = e => {

        this.setState({ showAlert: false })
        const { id, value } = e.target;
        let formErrors = { ...this.state.formErrors };

        console.log("ID: ", id)
        console.log("Value: ", value)

        switch (id) {
            default:
                formErrors.eligType = "";
                break;
        }

        this.setState({ formErrors, eligType: parseInt(value) }, () => console.log(this.state));
    }

    /****************************************
     * handleChange() handles the user input
     * as they are typing and reset the form errors
     ****************************************/
    handleChange = e => {
        e.preventDefault();

        this.setState({ showAlert: false })
        const { id, value } = e.target;
        let formErrors = { ...this.state.formErrors };
        let portList = this.state.portList
        switch (id) {
            case 'ship_name':
                formErrors.ship_name = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                formErrors.port = "";
                portList.length = 0
                break;
            case 'ship_type':
                formErrors.ship_type = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                break;
            case 'builder_name':
                formErrors.builder_name = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                break;
            case 'joint_owners':
                formErrors.joint_owners = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                break;
            case 'imo_num':
                formErrors.imo_num = (value.length > 0 && validateIMO(value) === false) ? "Invalid IMO: Format is IMO1234567." : "";
                formErrors.imo_mul = (value.length > 0 && validateIMO(value) === false) ? "• Multiply each of the first six digits by a factor of 2 to 7 corresponding to their position from right to left." : "";
                formErrors.imo_dig = (value.length > 0 && validateIMO(value) === false) ? "• The rightmost digit of this sum is the check digit." : "";
                formErrors.imo_example = (value.length > 0 && validateIMO(value) === false) ? "e.g. IMO907472[9]: (9×7) + (0×6) + (7×5) + (4×4) + (7×3) + (2×2) = 13[9]" : "";
                break;
            case 'prop_type':
                formErrors.prop_type = "";
                break;
            case 'port':
                formErrors.port = "";
                break;
            case 'engine_make':
                formErrors.engine_make = "";
                break;
            case 'engine_model':
                formErrors.engine_model = "";
                break;
            case 'hin_num':
                formErrors.hin_num = (value.length > 0 && validateHIN(value) === false) ? "Invalid HIN: Format is ABC12345A123." : "";
                break;
            case 'builder_addr':
                formErrors.builder_addr = "";
                break;
            case 'build_date':
                formErrors.build_date = "";
                break;
            case 'keel_date':
                formErrors.keel_date = "";
                break;
            case 'call_sign':
                formErrors.call_sign = (value.length > 0 && validateCallSign(value) === false) ? "Invalid Call Sign: Format is 1ABC or 1ABC1." : "";
                break;
            case 'userType':
                formErrors.userType = "";
                break;
            default:
                break;
        }

        this.setState({ formErrors, [id]: value, portList }, () => console.log(this.state));
    }

    /****************************************
     * handlePropType() handles the user input
     * as they are choosing a radio button
     * and reset the form errors
     ****************************************/
    handlePropType = e => {
        this.setState({ showAlert: false })
        const { id, value } = e.target;
        let formErrors = { ...this.state.formErrors };

        console.log("ID: ", id)
        console.log("Value: ", value)

        switch (id) {
            default:
                formErrors.prop_method = "";
                break;
        }

        this.setState({ formErrors, prop_method: parseInt(value) }, () => console.log(this.state));
    }

    handleDimension = e => {
        this.setState({ showAlert: false })
        const { id, value } = e.target;
        let formErrors = { ...this.state.formErrors };

        console.log("ID: ", id)
        console.log("Value: ", value)

        switch (id) {
            case 'vessel_length':
                formErrors.vessel_length = "";
                break;
            case 'width':
                formErrors.width = "";
                break;
            case 'depth':
                formErrors.depth = "";
                break;
            case 'tonnage':
                formErrors.tonnage = "";
                break;
            case 'prop_power':
                formErrors.prop_power = "";
                break;
            case 'num_hull':
                formErrors.num_hull = "";
                break;
            case 'builder_yard_no':
                formErrors.builder_yard_no = ""
                break;
            case 'num_engine':
                formErrors.num_engine = ""
                break;
            case 'mmsi_num':
                formErrors.mmsi_num = (value.length > 0 && validateMMSI(parseInt(value)) === false) ? "Invalid MMSI: Format is 123456789." : "";
                break;
            case 'share_num':
                formErrors.share_num = (value.length > 0 && validateShare(parseInt(value)) === false) ? "Invalid share percentage: Value must be from 1-100." : "";
                break;
            default:
                break;
        }

        this.setState({ formErrors, [id]: parseInt(value) }, () => console.log(this.state));
    }

    /****************************************
     * handlePort() handles the user input
     * as they are choosing a radio button
     * and reset the form errors
     ****************************************/
    handlePort = e => {
        this.setState({ showAlert: false })
        const { id, value } = e.target;
        let formErrors = { ...this.state.formErrors };

        console.log("ID: ", id)
        console.log("Value: ", value)

        switch (id) {
            default:
                formErrors.port = "";
                break;
        }

        this.setState({ formErrors, port: parseInt(value) }, () => console.log(this.state));
    }

    handleTankerSize = e => {
        this.setState({ showAlert: false })
        const { id, value } = e.target;
        let formErrors = { ...this.state.formErrors };
        let commer_type = { ...this.state.commer_type }
        console.log("ID: ", id)
        console.log("Value: ", value)

        switch (id) {
            default:
                formErrors.tanker_size = "";
                break;
        }

        commer_type[1] = value

        this.setState({ formErrors, commer_type }, () => console.log(this.state));
    }

    checkPortAvailability = e => {
        this.setState({ portList: [], showAlert: false, loadingPorts: true })

        const id = 'ship_name'
        const value = document.getElementById(id).value

        let formErrors = { ...this.state.formErrors };

        console.log("ID: ", id)
        console.log("Value: ", value)

        if (value === null || value === "") {
            formErrors.ship_name = "Please enter a vessel name.";
            formErrors.port = "";
            this.setState({ formErrors, [id]: value, loadingPorts: false }, () => console.log(this.state));
        } else {
            switch (id) {
                default:
                    formErrors.ship_name = "";
                    formErrors.port = "";
                    this.setState({ formErrors }, () => console.log(this.state));
                    break;
            }

            console.log("Local Storage", localStorage)
            console.log("This State: ", this.state)
            console.log("Checking Name Availability: ")
            axios.all([
                axios.get(`/vessels/check_unique_name/?ship_name=${value}&port=${PORT_WHT}`, {
                    baseURL: process.env.REACT_APP_API_ROOT,
                    headers: {
                        Authorization: localStorage.Token
                    }
                }),
                axios.get(`/vessels/check_unique_name/?ship_name=${value}&port=${PORT_SBG}`, {
                    baseURL: process.env.REACT_APP_API_ROOT,
                    headers: {
                        Authorization: localStorage.Token
                    }
                }),
                axios.get(`/vessels/check_unique_name/?ship_name=${value}&port=${PORT_PNC}`, {
                    baseURL: process.env.REACT_APP_API_ROOT,
                    headers: {
                        Authorization: localStorage.Token
                    }
                }),
                axios.get(`/vessels/check_unique_name/?ship_name=${value}&port=${PORT_BAR}`, {
                    baseURL: process.env.REACT_APP_API_ROOT,
                    headers: {
                        Authorization: localStorage.Token
                    }
                }),
                axios.get(`/vessels/check_unique_name/?ship_name=${value}&port=${PORT_RBH}`, {
                    baseURL: process.env.REACT_APP_API_ROOT,
                    headers: {
                        Authorization: localStorage.Token
                    }
                }),
                axios.get(`/vessels/check_unique_name/?ship_name=${value}&port=${PORT_VCT}`, {
                    baseURL: process.env.REACT_APP_API_ROOT,
                    headers: {
                        Authorization: localStorage.Token
                    }
                }),
            ]).then(axios.spread((res_PORT_WHT, res_PORT_SBG, res_PORT_PNC, res_PORT_BAR, res_PORT_RBH, res_PORT_VCT) => {
                console.log('Port List Passed')
                console.log('Port WHT', res_PORT_WHT.data['is_unique'])
                console.log('Port SBG', res_PORT_SBG.data['is_unique'])
                console.log('Port PNC', res_PORT_PNC.data['is_unique'])
                console.log('Port BAR', res_PORT_BAR.data['is_unique'])
                console.log('Port RBH', res_PORT_RBH.data['is_unique'])
                console.log('Port VCT', res_PORT_VCT.data['is_unique'])

                let newState = this.state

                newState.loadingPorts = false

                if (res_PORT_WHT.data['is_unique'] === false &&
                    res_PORT_SBG.data['is_unique'] === false &&
                    res_PORT_PNC.data['is_unique'] === false &&
                    res_PORT_BAR.data['is_unique'] === false &&
                    res_PORT_RBH.data['is_unique'] === false &&
                    res_PORT_VCT.data['is_unique'] === false) {
                    newState.portList.length = 0;
                    newState.formErrors.ship_name = "No available ports for this vessel name. Please rename your vessel.";

                }
                else {// Position of Array will be linked to list so we can call
                    // portList[PORT_WHT], which will give the correct value for
                    // that given port.
                    // arrays in JS start at 0., so it will return null instead.
                    newState.portList = [null, res_PORT_WHT.data['is_unique'], res_PORT_SBG.data['is_unique'],
                        res_PORT_PNC.data['is_unique'], res_PORT_BAR.data['is_unique'],
                        res_PORT_RBH.data['is_unique'], res_PORT_VCT.data['is_unique']]
                }

                this.setState(newState, () => console.log(newState));
            }))
                .catch((err) => {
                    console.log("COULD NOT CONNECT", err)
                    console.log("status", err.response.status)
                    if (err.response.status === 401) {
                        Signout();
                        this.props.history.push('/')
                    }
                    let newState = this.state

                    newState.loadingPorts = false
                    newState.portList.length = 0

                    this.setState(newState, () => console.log(newState));
                })
        }


    }

    CheckCanSubmitReg() {
        console.log("check submit reg", this.enableSubmit)
        return this.enableSubmit
    }

    CheckCanSubmitPayment() {
        console.log("check submit payment", this.enablePayment)
        return this.enablePayment
    }

    render() {
        const { formErrors, portList } = this.state
        const { isLoading, value, results } = this.state.searchBar;

        const enableSubmitButton = this.CheckCanSubmitReg();
        const enablePaymentButton = this.CheckCanSubmitPayment();
        return (
            <div className="CommercialRegistration">
                <div className='auth-wrapper'>
                    <div className='auth-inner'>
                        <form>
                            <h3>Register a Merchant Vessel</h3>
                            <br></br>
                            <p><b>Name and Port of Registry</b></p>

                            <div className='form-group'>
                                <label id='Section_Label'>Vessel name</label>
                                <div className="input-group mb-3">
                                    <input
                                        id='ship_name'
                                        type='text'
                                        className={formErrors.ship_name.length > 0 ? " form-control error" : 'form-control'}
                                        formNoValidate
                                        placeholder='Vessel name'
                                        onChange={this.handleChange} />
                                    <div className="input-group-append">
                                        {this.state.loadingPorts === true ?
                                            <button disabled className="btn btn-outline-info Check-Port" type="button">
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{'\xa0'}
                                                Loading...
                                            </button>
                                            :
                                            <button onClick={this.checkPortAvailability} className="btn btn-outline-info Check-Port" type="button">Check Port</button>
                                        }
                                    </div>
                                </div>
                                <span className="errorMessage Vessel">{formErrors.ship_name}</span>
                            </div>

                            {this.state.portList.length === 0 ? '' :
                                <div>
                                    <label id='Section_Label'>Port selection</label>


                                    {portList[PORT_WHT] === true ?
                                        <div className='form-check'>
                                            <input type='radio' id='whitby' name='port' value={PORT_WHT} onClick={this.handlePort} />
                                            <label htmlFor='whitby'>  Whitby Harbour</label>
                                        </div>
                                        : ''}

                                    {portList[PORT_SBG] === true ?
                                        <div className='form-check'>
                                            <input type='radio' id='scarborough' name='port' value={PORT_SBG} onClick={this.handlePort} />
                                            <label htmlFor='scarborough'>Scarborough</label>
                                        </div>
                                        : ''}

                                    {portList[PORT_PNC] === true ?
                                        <div className='form-check'>
                                            <input type='radio' id='newcastle' name='port' value={PORT_PNC} onClick={this.handlePort} />
                                            <label htmlFor='newcastle'>Point Newcastle</label>
                                        </div>
                                        : ''}

                                    {portList[PORT_BAR] === true ?
                                        <div className='form-check'>
                                            <input type='radio' id='barrow' name='port' value={PORT_BAR} onClick={this.handlePort} />
                                            <label htmlFor='barrow'>Barrow</label>
                                        </div>
                                        : ''}

                                    {portList[PORT_RBH] === true ?
                                        <div className='form-check'>
                                            <input type='radio' id='robin' name='port' value={PORT_RBH} onClick={this.handlePort} />
                                            <label htmlFor='robin'>Robin Hood's Bay</label>
                                        </div>
                                        : ''}

                                    {portList[PORT_VCT] === true ?
                                        <div className='form-check'>
                                            <input type='radio' id='victoria' name='port' value={PORT_VCT} onClick={this.handlePort} />
                                            <label htmlFor='victoria'>Victoria</label>
                                        </div>
                                        : ''}
                                </div>
                            }

                            {formErrors.ship_name.length > 0 ? '' : <p className="errorMessage">{formErrors.port}</p>}


                            <br></br>
                            <p><b>Vessel Details</b></p>

                            <label id='Section_Label'>Search for your vessel type</label>


                            <div className='Search'>
                                <Search
                                    className={formErrors.ship_type.length > 0 ? " Commercial-Class error" : 'Commercial-Class'}
                                    category
                                    aligned={'left'}
                                    loading={isLoading}
                                    onResultSelect={this.handleResultSelect}
                                    onSearchChange={_.debounce(this.handleSearchChange, 500, {
                                        leading: true
                                    })}
                                    results={results}
                                    value={value}
                                    placeholder={'Search Vessels Types'}
                                />
                                <span className="errorMessage Search">{formErrors.ship_type}</span>
                            </div>


                            {this.state.commer_type[2] === COMMERCIAL_TYPE_TANKER ?
                                <div className='Tanker-Size'>
                                    <label id='Section_Label'>Choose a tanker size</label>

                                    <div className='form-check'>
                                        <input type='radio' id='aframax' name='tanker_size' value={TANKER_SIZE_AFRAMAX} onClick={this.handleTankerSize} />
                                        <label htmlFor='aframax'>{TANKER_SIZE_AFRAMAX}</label>
                                    </div>

                                    <div className='form-check'>
                                        <input type='radio' id='panamax' name='tanker_size' value={TANKER_SIZE_PANAMAX} onClick={this.handleTankerSize} />
                                        <label htmlFor='panamax'>{TANKER_SIZE_PANAMAX}</label>
                                    </div>

                                    <div className='form-check'>
                                        <input type='radio' id='suezmax' name='tanker_size' value={TANKER_SIZE_SUEZMAX} onClick={this.handleTankerSize} />
                                        <label htmlFor='suezmax'>{TANKER_SIZE_SUEZMAX}</label>
                                    </div>

                                    <div className='form-check'>
                                        <input type='radio' id='VLCC' name='tanker_size' value={TANKER_SIZE_VLCC} onClick={this.handleTankerSize} />
                                        <label htmlFor='vlcc'>{TANKER_SIZE_VLCC}</label>
                                    </div>

                                    <div className='form-check'>
                                        <input type='radio' id='ULCC' name='tanker_size' value={TANKER_SIZE_ULCC} onClick={this.handleTankerSize} />
                                        <label htmlFor='ulcc'>{TANKER_SIZE_ULCC}</label>
                                    </div>
                                    <span className="errorMessage">{formErrors.tanker_size}</span>
                                </div> : ''}



                            <div className='form-group'>
                                <label id='Section_Label'>Length (m)</label>
                                <input placeholder="Nearest whole number in meters (e.g. 123)" id='vessel_length' min="0" type='number' onChange={this.handleDimension} className={formErrors.vessel_length.length > 0 ? " form-control error" : 'form-control'} />
                                <span className="errorMessage">{formErrors.vessel_length}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Width (m)</label>
                                <input placeholder="Nearest whole number in meters (e.g. 123)" id='width' min="0" type='number' onChange={this.handleDimension} className={formErrors.width.length > 0 ? " form-control error" : 'form-control'} />
                                <span className="errorMessage">{formErrors.width}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Depth (m)</label>
                                <input placeholder="Nearest whole number in meters (e.g. 123)" id='depth' min="0" type='number' onChange={this.handleDimension} className={formErrors.depth.length > 0 ? " form-control error" : 'form-control'} />
                                <span className="errorMessage">{formErrors.depth}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Gross Tonnage (approx)</label>
                                <input placeholder="Nearest whole number in kg (e.g. 123)" id='tonnage' min="0" type='number' onChange={this.handleDimension} className={formErrors.tonnage.length > 0 ? " form-control error" : 'form-control'} />
                                <span className="errorMessage">{formErrors.tonnage}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Total Propulsion Engine (kW)</label>
                                <input placeholder="Nearest whole number in kW (e.g. 123)" id='prop_power' min="0" type='number' onChange={this.handleDimension} className={formErrors.prop_power.length > 0 ? " form-control error" : 'form-control'} />
                                <span className="errorMessage">{formErrors.prop_power}</span>
                            </div>

                            <div>
                                <label id='Section_Label'>Select your propulsion method:</label>
                                <Form.Group controlId="exampleForm.SelectCustom" >
                                    <Form.Control className={formErrors.prop_method.length > 0 ? " Commercial-Class error" : 'Commercial-Class'} as="select" custom onChange={this.handlePropType}>
                                        <option value={PROP_TYPE_NONE} id='SEL'>Select One</option>
                                        <option value={PROP_TYPE_PRP} id='PRP'>Propellor</option>
                                        <option value={PROP_TYPE_PPJ} id='PPJ'>Pump Jet</option>
                                        <option value={PROP_TYPE_PWH} id='PWH'>Paddle Wheel</option>
                                        <option value={PROP_TYPE_SAI} id='SAI'>Sail</option>
                                        <option value={PROP_TYPE_VSC} id='VSC'>Voith-Schneider Cyclo-Rotor</option>
                                        <option value={PROP_TYPE_CTP} id='CTP'>Caterpillar</option>
                                    </Form.Control>
                                    <p className="errorMessage">{formErrors.prop_method}</p>
                                </Form.Group>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Engine Make</label>
                                <input id='engine_make' placeholder='Set Engine Make' type='text' className={formErrors.engine_make.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleChange} />
                                <span className="errorMessage">{formErrors.engine_make}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Engine Model</label>
                                <input id='engine_model' placeholder='Set Engine Model' type='text' className={formErrors.engine_model.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleChange} />
                                <span className="errorMessage">{formErrors.engine_model}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Number of Engines</label>
                                <input id='num_engine' placeholder='Set number of Engines' type='number' min="0" className={formErrors.num_engine.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleDimension} />
                                <span className="errorMessage">{formErrors.num_engine}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Number of Hulls</label>
                                <input id='num_hull' type='number' min="0" placeholder="Nearest whole number (e.g. 123)" onChange={this.handleDimension} className={formErrors.num_hull.length > 0 ? " form-control error" : 'form-control'} />
                                <span className="errorMessage">{formErrors.num_hull}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>IMO</label>
                                <input id='imo_num' type='text' className={formErrors.imo_num.length > 0 ? " form-control error" : 'form-control'} onChange={this.handleChange} placeholder='e.g. IMO1234567' />
                                <span className="errorMessage">{formErrors.imo_num}</span>
                                {formErrors.imo_mul.length > 0 ? <><br></br>
                                    <span className="errorMessage">{formErrors.imo_mul}</span></> : ''}
                                {formErrors.imo_dig.length > 0 ? <><br></br>
                                    <span className="errorMessage">{formErrors.imo_dig}</span></> : ''}
                                {formErrors.imo_example.length > 0 ? <><br></br>
                                    <span className="errorMessage">{formErrors.imo_example}</span></> : ''}
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>HIN</label>
                                <input id='hin_num' type='text' className={formErrors.hin_num.length > 0 ? " form-control error" : 'form-control'} onChange={this.handleChange} placeholder='e.g. AAA00000A000' />
                                <span className="errorMessage">{formErrors.hin_num}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>MMSI</label>
                                <input id='mmsi_num' type='number' min="100000000" max="999999999" className={formErrors.mmsi_num.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleDimension} placeholder='e.g. 123456789' />
                                <span className="errorMessage">{formErrors.mmsi_num}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Call Sign</label>
                                <input id='call_sign' type='text' className={formErrors.call_sign.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleChange} placeholder='e.g. 1ABC or 1ABC1' />
                                <span className="errorMessage">{formErrors.call_sign}</span>
                            </div>

                            <br></br>
                            <p><b>Builder Details</b></p>

                            <div className='form-group'>
                                <label id='Section_Label'>Builder's Name</label>
                                <input id='builder_name' type='text' className={formErrors.builder_name.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleChange} placeholder='Name' />
                                <span className="errorMessage">{formErrors.builder_name}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Builder's Address</label>
                                <input id='builder_addr' type='address' className={formErrors.builder_addr.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleChange} placeholder='Address' />
                                <span className="errorMessage">{formErrors.builder_addr}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Build Date</label>
                                <input id='build_date' type='date' max='this.state.currentDate' className={formErrors.build_date.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleChange} />
                                <span className="errorMessage">{formErrors.build_date}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Keel Laying Date</label>
                                <input id='keel_date' type='date' className={formErrors.keel_date.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleChange} />
                                <span className="errorMessage">{formErrors.keel_date}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Yard No. allocated to this ship</label>
                                <input id='builder_yard_no' min="0" type='number' className={formErrors.builder_yard_no.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleDimension} placeholder='Yard No.' />
                                <span className="errorMessage">{formErrors.builder_yard_no}</span>
                            </div>

                            <br></br>


                            {/*{user.userType === USER_TYPE_COMMERCIAL ? '': */}

                            {this.userData.userType === USER_TYPE_BROKER ?

                                <>
                                    <p><b>Majority Owner Details</b></p>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Name of Company or Sole Trader</label>
                                        <input type='text' id='joint_owners' className={formErrors.joint_owners.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleChange} placeholder='Name of Owner' />
                                        <span className="errorMessage">{formErrors.joint_owners}</span>
                                    </div>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Share Percentage</label>
                                        <input id='share_num' type='number' min='0' max='100' className={formErrors.share_num.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleDimension} placeholder='Set Percentage' />
                                        <span className="errorMessage">{formErrors.share_num}</span>
                                    </div>

                                    <label id='Section_Label'>Select the company the owner is incorporated in:</label>
                                    <Form.Group controlId="exampleForm.SelectCustom">
                                        <Form.Control className={formErrors.eligType.length > 0 ? "form-control error" : 'form-control'} as="select" custom onChange={this.handleUserStatus}>
                                            <option value={ELIG_TYPE_NONE} id='SEL'>Select One</option>
                                            <option value={ELIG_TYPE_NA} id='NA'>Navis Album</option>
                                            <option value={ELIG_TYPE_BDT} id='BDT'>British Dependent Territory</option>
                                            <option value={ELIG_TYPE_EEAC} id='EEAC'>EEA Country</option>
                                            <option value={ELIG_TYPE_BCP} id='BCP'>British Overseas Possession</option>
                                            <option value={ELIG_TYPE_EEIG} id='EEIG'>EEIG</option>
                                            <option value={ELIG_TYPE_CWS} id='CWS'>Commonwealth State</option>
                                        </Form.Control>
                                        <p className="errorMessage">{formErrors.eligType}</p>
                                    </Form.Group>
                                </>
                                :
                                <>
                                    <p><b>Your Ownership Details</b></p>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Company Name on file</label>
                                        <input disabled={true} type='text' id='joint_owners' className='form-control' placeholder={this.userData.firstName + ' ' + this.userData.lastName} />
                                    </div>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Share Percentage</label>
                                        <input id='share_num' type='number' min='0' max='100' className={formErrors.share_num.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleDimension} placeholder='Set Percentage' />
                                        <span className="errorMessage">{formErrors.share_num}</span>
                                    </div>

                                    <label id='Section_Label'>Company you're incorporated with on file:</label>
                                    <Form.Group controlId="exampleForm.SelectCustom">
                                        <Form.Control disabled className='form-control' as="select" custom >
                                            <option value={this.userData.eligType}>{ConstSwitch.checkEligType(this.userData.eligType)}</option>
                                        </Form.Control>
                                    </Form.Group>
                                </>}

                            <Modal
                                dimmer={'blurring'}
                                className='Payment-Modal'
                                closeOnEscape={true}
                                closeOnDimmerClick={true}
                                onClose={() => this.setState({ showModal: false })}
                                onOpen={() => this.setState({ showModal: true })}
                                open={this.state.showModal}
                                //trigger={<Button className='btn btn-info btn-block' centered onClick={() => this.setState({ showModal: true })}>Show Payment</Button>}
                            >

                                <Modal.Content>

                                    <Elements className='Stripe' stripe={this.stripePromise}>
                                        <CheckoutForm data={{ reg_id: this.reg_id, enablePayment: enablePaymentButton, fee_type: "appfee" }} />
                                    </Elements>

                                    <Button className='Payment-Button-Close'
                                        onClick={() => this.setState({ showModal: false })}
                                    > Close</Button>
                                </Modal.Content>
                            </Modal>

                            <button onClick={this.handleAddVessel} type='button' disabled={!enableSubmitButton}
                                className='btn btn-primary btn-block'>Pay and Submit Application
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
