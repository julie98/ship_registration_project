/***************************************************
 * Author: Priya Padmanaban
 * File Name: PersonalRegistration.js
 * Description:
 *      This file allows submission of a personal
 *      vessel (pleasure craft) application.
 ****************************************************/

import React, { Component } from 'react';
import './PersonalRegistration.css';
import axiosInstance from '../containers/helpers/axios'
import axios from 'axios';
import { Signout } from '../containers/helpers/utility';
import { PROP_TYPE_NONE, PROP_TYPE_SAI, PROP_TYPE_PRP, PROP_TYPE_PPJ, PROP_TYPE_PWH, PROP_TYPE_VSC, PROP_TYPE_CTP, SHIP_TYPE_NONE, USER_TYPE_BROKER, SHIP_TYPE_PLEASURE_VESSEL, USER_TYPE_INDIVIDUAL } from '../constants/constants.js'
import { PORT_NONE, PORT_WHT, PORT_SBG, PORT_PNC, PORT_BAR, PORT_RBH, PORT_VCT } from '../constants/constants.js'
import { PLE_NONE, PLE_BAR, PLE_DIN, PLE_HVC, PLE_INF, PLE_MSA, PLE_MYT, PLE_NRB, PLE_SYT, PLE_SBT, PLE_WBK } from '../constants/constants.js'
import { registrationPersonalValid, validateName, validateHIN, validateShare } from '../containers/helpers/validation';
import { Spinner, Form, Button } from 'react-bootstrap';
import { ELIG_TYPE_NONE, ELIG_TYPE_UKC, ELIG_TYPE_BDTC, ELIG_TYPE_BOC, ELIG_TYPE_CC, ELIG_TYPE_NK, ELIG_TYPE_CEU } from '../constants/constants.js'
import * as ConstSwitch from '../constants/ConstantSwitch'

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from "@stripe/stripe-js/pure";
import CheckoutForm from "./CheckoutForm";
import { Modal } from 'semantic-ui-react';

export default class PersonalRegistration extends Component {
    constructor(props) {
        super(props);

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
            ship_name: null,
            ship_type: SHIP_TYPE_NONE,
            personal_vessel_type: PLE_NONE,
            personal_model: null,
            vessel_length: null,
            joint_owners: null,
            share_num: null,
            prop_method: PROP_TYPE_NONE,
            hin_num: null,
            num_hull: null,
            eligType: ELIG_TYPE_NONE,
            loadingPorts: false,
            portList: [],
            port: PORT_NONE,
            formErrors: {
                ship_name: "",
                ship_type: "",
                personal_vessel_type: "",
                personal_model: "",
                vessel_length: "",
                hin_num: "",
                eligType: "",
                joint_owners: "",
                share_num: '',
                prop_method: "",
                num_hull: "",
                port: "",
            }
        };
    }

    return() {
        let newState = this.state

        newState = {
            ship_name: null,
            ship_type: SHIP_TYPE_NONE,
            personal_vessel_type: PLE_NONE,
            personal_model: null,
            vessel_length: null,
            joint_owners: null,
            share_num: null,
            prop_method: PROP_TYPE_NONE,
            hin_num: null,
            num_hull: null,
            eligType: ELIG_TYPE_NONE,
            loadingPorts: false,
            portList: [],
            port: PORT_NONE,
            formErrors: {
                ship_name: "",
                ship_type: "",
                personal_vessel_type: "",
                personal_model: "",
                vessel_length: "",
                hin_num: "",
                eligType: "",
                joint_owners: "",
                share_num: '',
                prop_method: "",
                num_hull: "",
                port: "",
            }
        }

        this.setState(newState, () => console.log(this.state));
    }

    /****************************************
    * PersonalRegistrationAxios() posts form data to /vessels/add
    * If successful, creates a new pending vessel.
    * If unsuccessful, signs out and redirects to login.
   ****************************************/
    PersonalRegistrationAxios(data) {
        var tempjoint_owners = []

        var url = new URL(window.location.href).host
        if (this.userData.eligType === USER_TYPE_BROKER) {//if broker user, use the form information
            tempjoint_owners = [
                [
                    this.state.joint_owners,
                    document.getElementById('share_num').value,
                    this.state.eligType
                ]
            ]
        } else {//if broker user, use their information
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
            ship_type: SHIP_TYPE_PLEASURE_VESSEL,
            personal_vessel_type: this.state.personal_vessel_type,
            personal_model: this.state.personal_model,
            length: this.state.vessel_length,
            joint_owners: tempjoint_owners,
            prop_method: this.state.prop_method,
            num_hull: this.state.num_hull,
            hull_id: this.state.hin_num,
            port: this.state.port,
            root_url:  url,
        })
            .then((res) => {
                console.log(res.data)
                console.log('ship added')
                this.vessel_id = res.data
                console.log('Vessel_id: ', this.vessel_id)

                this.reg_id = res.data[0].pk
                console.log('registration_id: ', this.reg_id)

                this.setState({showModal:true});

                // Force update so the submit vessel button is disabled
                this.forceUpdate()
                
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

        // Personal accounts use their own information
        if (tempState.userData.userType === USER_TYPE_INDIVIDUAL) {
            tempState.joint_owners = tempState.userData.firstName + ' ' + tempState.userData.lastName
            tempState.eligType = tempState.userData.eligType
        }


        if (registrationPersonalValid(tempState)) {
            console.log('Passed Validation')
            this.PersonalRegistrationAxios();

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

            if ((newState.personal_model === null) || (newState.personal_model === "")) {
                newState.formErrors.personal_model = "Field is required"
            }

            if ((newState.personal_vessel_type === PLE_NONE)) {
                newState.formErrors.personal_vessel_type = "Field is required"
            }

            if ((newState.joint_owners === null) || (newState.joint_owners === "")) {
                newState.formErrors.joint_owners = "Field is required"
            } else if (validateName(newState.joint_owners) === false) {
                newState.formErrors.joint_owners = "Invalid Name Entry"
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

            if ((newState.num_hull === null) || (newState.num_hull === 0)) {
                newState.formErrors.num_hull = "Please enter the number of hulls of your vessel."
            } else if ((isNaN(newState.num_hull) === true) || (newState.num_hull < 0)) {
                newState.formErrors.num_hull = "Invalid number of hulls entry."
            }

            if ((newState.hin_num === null) || (newState.hin_num === '')) {
                newState.formErrors.hin_num = 'Please enter your engine\'s HIN number'
            } else if (validateHIN(newState.hin_num) === false) {
                newState.formErrors.hin_num = "Invalid HIN: Format is ABC12345A123."
            }

            if ((newState.share_num === null) || (newState.share_num === '')) {
                newState.formErrors.share_num = 'Please enter the owner\'s share percentage'
            } else if (validateShare(newState.share_num) === false) {
                newState.formErrors.share_num = "Invalid share percentage: Value must be from 1-100."
            }

            if (newState.eligType === ELIG_TYPE_NONE && this.userData.userType === USER_TYPE_BROKER) {
                newState.formErrors.eligType = "Please choose the owner's eligibility."
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
            case 'joint_owners':
                formErrors.joint_owners = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                break;
            case 'prop_type':
                formErrors.prop_type = "";
                break;
            case 'personal_vessel_type':
                formErrors.personal_vessel_type = "";
                break;
            case 'personal_model':
                formErrors.personal_model = "";
                break;
            case 'port':
                formErrors.port = "";
                break;
            case 'hin_num':
                formErrors.hin_num = (value.length > 0 && validateHIN(value) === false) ? "Invalid HIN: Format is ABC12345A123." : "";
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
     * handleShipType() handles the user input
     * as they are choosing a radio button 
     * and reset the form errors
    ****************************************/
    handleShipType = e => {
        this.setState({ showAlert: false })
        const { id, value } = e.target;
        let formErrors = { ...this.state.formErrors };

        console.log("ID: ", id)
        console.log("Value: ", value)

        switch (id) {
            default:
                formErrors.personal_vessel_type = "";
                break;
        }

        this.setState({ formErrors, personal_vessel_type: parseInt(value) }, () => console.log(this.state));
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
            case 'num_hull':
                formErrors.num_hull = "";
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

        const enableSubmitButton = this.CheckCanSubmitReg();
        const enablePaymentButton = this.CheckCanSubmitPayment();
        return (
            <div className="PersonalRegistration">
                <div className='auth-wrapper'>
                    <div className='auth-inner'>
                        <form>
                            <h3>Register a Pleasure Craft</h3>
                            <br></br>
                            <p><b>Name and Port of Registry</b></p>

                            <div className='form-group'>
                                <label id='Section_Label'>Vessel name</label>
                                <div class="input-group mb-3">
                                    <input
                                        id='ship_name'
                                        type='text'
                                        className={formErrors.ship_name.length > 0 ? " form-control error" : 'form-control'}
                                        formNoValidate
                                        placeholder='Vessel name'
                                        onChange={this.handleChange} />
                                    <div class="input-group-append">
                                        {this.state.loadingPorts === true ?
                                            <button disabled class="btn btn-outline-info Check-Port" type="button">
                                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{'\xa0'}
                                                Loading...
                                             </button>
                                            :
                                            <button onClick={this.checkPortAvailability} class="btn btn-outline-info Check-Port" type="button">Check Port</button>
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

                            <div>
                                <label id='Section_Label'>Select your vessel type:</label>
                                <Form.Group controlId="exampleForm.SelectCustom">
                                    <Form.Control className={formErrors.personal_vessel_type.length > 0 ? " Personal-Class error" : 'Personal-Class'} as="select" custom onChange={this.handleShipType}>
                                        <option value={PLE_NONE} id='SEL'>Select One</option>
                                        <option value={PLE_BAR} id='BAR'>Barge</option>
                                        <option value={PLE_DIN} id='DIN'>Dinghy</option>
                                        <option value={PLE_HVC} id='HVC'>Hovercraft</option>
                                        <option value={PLE_INF} id='INF'>Inflatable</option>
                                        <option value={PLE_MSA} id='MSA'>Motor Sailer</option>
                                        <option value={PLE_MYT} id='MYT'>Motor Yacht</option>
                                        <option value={PLE_NRB} id='NRB'>Narrow Boat</option>
                                        <option value={PLE_SYT} id='SYT'>Sailing Yacht</option>
                                        <option value={PLE_SBT} id='SBT'>Sports Boat</option>
                                        <option value={PLE_WBK} id='WBK'>Wet Bike</option>
                                    </Form.Control>
                                    <p className="errorMessage">{formErrors.personal_vessel_type}</p>
                                </Form.Group>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Vessel Model</label>
                                <input id='personal_model' type='text' className={formErrors.personal_model.length > 0 ? " form-control error" : 'form-control'} onChange={this.handleChange} placeholder='e.g. Benneteau 26' />
                                <span className="errorMessage">{formErrors.personal_model}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Length (m)</label>
                                <input placeholder="Nearest whole number in meters (e.g. 123)" id='vessel_length' min="0" type='number' onChange={this.handleDimension} className={formErrors.vessel_length.length > 0 ? " form-control error" : 'form-control'} />
                                <span className="errorMessage">{formErrors.vessel_length}</span>
                            </div>

                            <div>
                                <label id='Section_Label'>Select your propulsion method:</label>
                                <Form.Group controlId="exampleForm.SelectCustom" >
                                    <Form.Control className={formErrors.prop_method.length > 0 ? " Personal-Class error" : 'Personal-Class'} as="select" custom onChange={this.handlePropType}>
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
                                <label id='Section_Label'>Number of Hulls</label>
                                <input id='num_hull' type='number' min="0" placeholder="Nearest whole number (e.g. 123)" onChange={this.handleDimension} className={formErrors.num_hull.length > 0 ? " form-control error" : 'form-control'} />
                                <span className="errorMessage">{formErrors.num_hull}</span>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>HIN</label>
                                <input id='hin_num' type='text' className={formErrors.hin_num.length > 0 ? " form-control error" : 'form-control'} onChange={this.handleChange} placeholder='e.g. AAA00000A000' />
                                <span className="errorMessage">{formErrors.hin_num}</span>
                            </div>

                            <br></br>

                            {this.userData.userType === USER_TYPE_BROKER ?

                                <>
                                    <p><b>Majority Owner Details</b></p>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Name of Owner</label>
                                        <input type='text' id='joint_owners' className={formErrors.joint_owners.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleChange} placeholder='Name of Owner' />
                                        <span className="errorMessage">{formErrors.joint_owners}</span>
                                    </div>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Share Percentage</label>
                                        <input id='share_num' type='number' min='0' max='100' className={formErrors.share_num.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleDimension} placeholder='Set Percentage' />
                                        <span className="errorMessage">{formErrors.share_num}</span>
                                    </div>

                                    <label id='Section_Label'>Select the owner's eligibility:</label>
                                    <Form.Group controlId="exampleForm.SelectCustom">
                                        <Form.Control className={formErrors.eligType.length > 0 ? "form-control error" : 'form-control'} as="select" custom onChange={this.handleUserStatus}>
                                            <option value={ELIG_TYPE_NONE} id='SEL'>Select One</option>
                                            <option value={ELIG_TYPE_UKC} id='UKC'>United Kingdom Citizen</option>
                                            <option value={ELIG_TYPE_BDTC} id='BDTC'>British Dependent Territories Citizen</option>
                                            <option value={ELIG_TYPE_BOC} id='BOC'>British Overseas Citizen</option>
                                            <option value={ELIG_TYPE_CC} id='CC'>Commonwealth Citizen</option>
                                            <option value={ELIG_TYPE_NK} id='NK'>Non-UK settled in UK</option>
                                            <option value={ELIG_TYPE_CEU} id='CEU'>Citizen of EU Member State</option>
                                        </Form.Control>
                                        <p className="errorMessage">{formErrors.eligType}</p>
                                    </Form.Group>
                                </>
                                :
                                <>
                                    <p><b>Your Ownership Details</b></p>
                                    <div className='form-group'>
                                        <label id='Section_Label'>Owner Name on file</label>
                                        <input disabled={true} type='text' id='joint_owners' className='form-control' placeholder={this.userData.firstName + ' ' + this.userData.lastName} />
                                    </div>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Share Percentage</label>
                                        <input id='share_num' type='number' min='0' max='100' className={formErrors.share_num.length > 0 ? "form-control error" : 'form-control'} onChange={this.handleDimension} placeholder='Set Percentage' />
                                        <span className="errorMessage">{formErrors.share_num}</span>
                                    </div>

                                    <label id='Section_Label'>Eligibility on file:</label>
                                    <Form.Group controlId="exampleForm.SelectCustom">
                                        <Form.Control disabled className='form-control' as="select" custom >
                                            <option value={this.userData.eligType}>{ConstSwitch.checkPersonalEligType(this.userData.eligType)}</option>
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