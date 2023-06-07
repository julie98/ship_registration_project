/***************************************************
 * DEPRECATED, DO NOT MODIFY, WILL BE REMOVED
 * PLEASE REFER TO
 *      PersonalRegistration.js
 *      CommercialRegistration.js
 ****************************************************/

import React, { Component } from 'react';
import './Registration.css';
import axiosInstance from '../containers/helpers/axios'
import axios from 'axios';
import { Form, Button } from 'react-bootstrap'
import {Signout} from '../containers/helpers/utility';
import { PROP_TYPE_NONE, PROP_TYPE_PRP, PROP_TYPE_PPJ, PROP_TYPE_PWH, PROP_TYPE_SAI, PROP_TYPE_VSC, PROP_TYPE_CTP} from '../constants/constants'
import {PORT_NONE, PORT_WHT, PORT_SBG, PORT_PNC, PORT_BAR, PORT_RBH, PORT_VCT} from '../constants/constants.js'
import { PLE_NONE, PLE_BAR, PLE_DIN, PLE_HVC, PLE_INF, PLE_MSA, PLE_MYT, PLE_NRB, PLE_SYT, PLE_SBT, PLE_WBK } from '../constants/constants.js'
import {
    registrationValid,
    validateName,
    validateIMO
} from '../containers/helpers/validation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from "@stripe/stripe-js/pure";
import CheckoutForm from "./CheckoutForm";
import { Modal } from 'semantic-ui-react';

/*
TODO:
- allow for multiple owners
*/

export default class Registration extends Component {
    constructor(props) {
        super(props);
        this.stripeKey = null;

        this.handleAddVessel = this.handleAddVessel.bind(this);
        this.tempHandleAddVessel = this.tempHandleAddVessel.bind(this);
        this.checkPortAvailability = this.checkPortAvailability.bind(this);

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

        this.state = {
            showModal: false,
            ship_name: null,
            ship_type: null,
            tonnage: null,
            imo_num: null,
            joint_owners: null,
            prop_method: PROP_TYPE_NONE,
            prop_power: null,
            num_engine: null,
            num_hull: null,
            port: PORT_NONE,
            builder_name: null,
            builder_addr: null,
            builder_yard_no: null,
            build_date: null,
            keel_date: null,

            formErrors: {
                ship_name: "",
                ship_type: "",
                tonnage: "",
                imo_num: "",
                joint_owners: "",
                prop_method: "",
                prop_power: "",
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

    closeFunc() {
        this.props.onChange(false)
    }

    return() {
        let newState = this.state

        newState = {
            ship_name: null,
            ship_type: null,
            tonnage: null,
            imo_num: null,
            joint_owners: null,
            prop_method: PROP_TYPE_NONE,
            prop_power: null,
            num_engine: null,
            num_hull: null,
            port: PORT_NONE,
            builder_name: null,
            builder_addr: null,
            builder_yard_no: null,
            build_date: null,
            keel_date: null,

            formErrors: {
                ship_name: "",
                ship_type: "",
                tonnage: "",
                imo_num: "",
                joint_owners: "",
                prop_method: "",
                prop_power: "",
                num_engine: "",
                num_hull: "",
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
     * registrationAxios() posts form data to /vessels/add
     * If successful, creates a new pending vessel.
     * If unsuccessful, signs out and redirects to login.
     ****************************************/
    registrationAxios(data) {
        axiosInstance.post('/vessels/add/', {
            ship_name: this.state.ship_name,
            ship_type: this.state.ship_type,
            tonnage: this.state.tonnage,
            imo_num: this.state.imo_num,
            joint_owners: this.state.joint_owners,
            prop_method: this.state.prop_method,
            prop_power: this.state.prop_power,
            num_engine: this.state.num_engine,
            num_hull: this.state.num_hull,
            port: this.state.port,
            builder_name: this.state.builder_name,
            builder_addr: this.state.builder_addr,
            builder_yard_no: this.state.builder_yard_no,
            build_date: this.state.build_date,
            keel_date: this.state.keel_date,
        })
            .then((res) => {
                console.log(res.data)
                console.log('ship added')
                this.vessel_id = res.data
                console.log('Vessel_id: ', this.vessel_id)
                this.props.history.push('/vessels/list')
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

        if (registrationValid(this.state)) {
            this.signupAxios();
        } else {
            let newState = this.state

            //newState.loading = false;
            if ((newState.ship_name === null) || (newState.ship_name === "")) {
                newState.formErrors.ship_name = "Field is required"
            } else if (validateName(newState.ship_name) === false) {
                newState.formErrors.ship_name = "Invalid Name Entry"
            }

            if ((newState.ship_type === null) || (newState.ship_type === "")) {
                newState.formErrors.ship_type = "Field is required"
            } else if (validateName(newState.ship_type) === false) {
                newState.formErrors.ship_type = "Invalid Type Entry"
            }

            if ((newState.builder_name === null) || (newState.builder_name === "")) {
                newState.formErrors.builder_name = "Field is required"
            } else if (validateName(newState.builder_name) === false) {
                newState.formErrors.builder_name = "Invalid Name Entry"
            }

            if ((newState.imo_num === null) || (newState.imo_num === "")) {
                newState.formErrors.imo_num = "Field is required"
            } else if (validateIMO(newState.imo_num) === false) {
                newState.formErrors.imo_num = "Invalid IMO"
            }


            if (newState.prop_method === PROP_TYPE_NONE) {
                newState.formErrors.prop_method = "Please select a propulsion type."
            }

            if (newState.port === PORT_NONE) {
                newState.formErrors.port = "Please select a port."
            }


            this.setState(newState, () => console.log(newState));

            console.error('Form Invalid -DISPLAY ERROR MESSAGE')


        }
        return;
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
        switch (id) {
            case 'ship_name':
                formErrors.ship_name = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                break;
            case 'ship_type':
                formErrors.ship_type = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                break;
            case 'builder_name':
                formErrors.builder_name = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                break;
            case 'imo_num':
                formErrors.imo_num = (value.length > 0 && validateIMO(value) === false) ? "Invalid IMO: Format is IMO1234567" : "";
                break;
            case 'prop_type':
                formErrors.prop_type = "";
                break;
            case 'port':
                formErrors.port = "";
                break;
            default:
                break;
        }

        this.setState({ formErrors, [id]: value }, () => console.log(this.state));
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
                formErrors.userType = "";
                break;
        }

        this.setState({ formErrors, userType: parseInt(value), showAccount: false }, () => console.log(this.state));
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
                formErrors.userType = "";
                break;
        }

        this.setState({ formErrors, userType: parseInt(value), showAccount: false }, () => console.log(this.state));
    }

    tempHandleAddVessel(data) {
        console.log("temporary handle add vessel")
        this.enableSubmit = false
        this.enablePayment = true

        var ship_name = document.getElementById('shipName').value
        var port = 1;//document.getElementById('port').value
        var ship_type = 1;//document.getElementById('shipType').value
        var personal_vessel_type = 1;
        var personal_model = "Benneteau 26";
        var length = 50;
        var num_hull = 1;//document.getElementById('numHull').value
        var hull_id = "SCJ63750H458"//document.getElementById('hullID').value
        var prop_method = 1;//document.getElementById('propMethod').value
        var joint_owners = [
            ["owner0", "100", "British Overseas Citizen"]
        ]; //document.getElementById('jointOwner').value

        var url = new URL(window.location.href).host

        axiosInstance.post('/vessels/register_vessel/', { // changed to register_vessel
            ship_name: ship_name,
            port: port,
            ship_type: ship_type,
            personal_vessel_type: personal_vessel_type,
            personal_model: personal_model,
            length: length,
            num_hull: num_hull,
            hull_id: hull_id,
            prop_method: prop_method,
            joint_owners: joint_owners,
            root_url:  url,
        })
            .then((res) => {
                console.log(res.data)
                console.log('ship added', res.data)
                this.reg_id = res.data[0].pk
                console.log('registration_id: ', this.reg_id)
                // Force update so the submit vessel button is disabled
                this.forceUpdate()
                // this.props.history.push('/vessels/list')
            })
            .catch((err) => {
                console.log("COULD NOT CONNECT")
                if (err.response.status === 401) {
                    Signout();
                    this.props.history.push('/login')
                }
            })
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
        const enableSubmitButton = this.CheckCanSubmitReg();
        const enablePaymentButton = this.CheckCanSubmitPayment();
        return (
            <div className="Registration">
                <div className='auth-wrapper'>
                    <div className='auth-inner'>
                        <form>
                            <h3>Register a Pleasure Craft</h3>
                            <br></br>
                            <p><b>Name and Port of Registry</b></p>

                            <div className='form-group'>
                                <label id='Section_Label'>Vessel name</label>
                                <input id='shipName' type='text' className='form-control' placeholder='Vessel name'/>

                            <Button variant="outline-primary" onClick={this.checkPortAvailability}>
                                    Check Available Ports
                            </Button>
                            </div>

                            <div>
                                <label id='Section_Label'>Select a port:</label>
                                    <Form.Group controlId="exampleForm.SelectCustom">
                                        <Form.Control as="select">
                                            <option value={PORT_NONE} id='SEL'>Select One</option>
                                            <option value={PORT_WHT} id='WHT'>Whitby Harbour</option>
                                            <option value={PORT_SBG} id='SBG'>Scarborough</option>
                                            <option value={PORT_PNC} id='PNC'>Point Newcastle</option>
                                            <option value={PORT_BAR} id='BAR'>Barrow</option>
                                            <option value={PORT_RBH} id='RBH'>Robin Hood's Bay</option>
                                            <option value={PORT_VCT} id='VCT'>Victoria</option>
                                        </Form.Control>
                                    </Form.Group>
                            </div>


                            <br></br>
                            <p><b>Vessel Details</b></p>

                            <div>
                                <label id='Section_Label'>Select your vessel type:</label>
                                    <Form.Group controlId="exampleForm.SelectCustom">
                                        <Form.Control as="select">
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
                                    </Form.Group>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Model</label>
                                <input id='model' type='text' className='form-control' placeholder='Model'/>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Length (m)</label>
                                <input id='length' type='number' className='form-control' placeholder='0'/>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Number of Hulls</label>
                                <input id='numHull' type='number' className='form-control' placeholder='0'/>
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>HIN</label>
                                <input id='HIN' type='text' className='form-control' placeholder='AAA00000A000' />
                            </div>

                            <div>
                                <label id='Section_Label'>Select your propulsion method:</label>
                                    <Form.Group controlId="exampleForm.SelectCustom">
                                        <Form.Control as="select">
                                            <option value={PROP_TYPE_NONE} id='SEL'>Select One</option>
                                            <option value={PROP_TYPE_PRP} id='PRP'>Propellor</option>
                                            <option value={PROP_TYPE_PPJ} id='PPJ'>Pump Jet</option>
                                            <option value={PROP_TYPE_PWH} id='PWH'>Paddle Wheel</option>
                                            <option value={PROP_TYPE_SAI} id='SAI'>Sail</option>
                                            <option value={PROP_TYPE_VSC} id='VSC'>Voith-Schneider Cyclo-Rotor</option>
                                            <option value={PROP_TYPE_CTP} id='CTP'>Caterpillar</option>
                                        </Form.Control>
                                    </Form.Group>
                            </div>

                            <br></br>
                            <p><b>Majority Owner Details</b></p>

                            <div className='form-group'>
                                <label id='Section_Label'>Name of Owner</label>
                                <input type='text' className='form-control' placeholder='Name of Owner' />
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Share Percentage</label>
                                <input type='number' min='1' max='100' className='form-control' placeholder='0' />
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Mailing Address</label>
                                <input type='text' className='form-control' placeholder='Mailing Address' />
                            </div>

                            <div className='form-group'>
                                <label id='Section_Label'>Email</label>
                                <input type='email' className='form-control' placeholder='example@example.com' />
                            </div>

                            <Modal
                                dimmer={'blurring'}
                                className= 'Payment-Modal'
                                closeOnEscape={true}
                                closeOnDimmerClick={true}
                                onClose={() => this.setState({ showModal: false })}
                                onOpen={() => this.setState({ showModal: true })}
                                open={this.state.showModal}
                                trigger={<Button className='btn btn-info btn-block' centered onClick={() => this.setState({ showModal: true })}>Show Payment</Button>}
                            >
                                <Modal.Content>


                                    <Elements className='Stripe' stripe={this.stripePromise}>
                                        <CheckoutForm data={{ reg_id: this.reg_id, enablePayment: enablePaymentButton, fee_type: "appfee"}} />
                                    </Elements>

                                    <Button className='Payment-Button-Close'
                                        onClick={() => this.setState({ showModal: false })}
                                    > Close</Button>
                                </Modal.Content>
                            </Modal>

                            <button onClick={this.tempHandleAddVessel} type='button' disabled={!enableSubmitButton}
                                className='btn btn-primary btn-block'>Submit Application
                            </button>

                        </form>
                    </div>
                </div>
            </div>



        );
    }
}