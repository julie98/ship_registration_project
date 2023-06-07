/***************************************************
 * Author: Christian Ocon
 * File Name: Signup.js
 * Description:
 *      This file ...
 ****************************************************/

import React, { Component } from 'react';
import axiosInstance from '../containers/helpers/axios';
import { signupValid, validateName, validateEmail, validatePassword } from '../containers/helpers/validation';
import { Form, Spinner, Alert, Button, Col } from 'react-bootstrap'
import { USER_TYPE_NONE, USER_TYPE_INDIVIDUAL, USER_TYPE_BROKER, USER_TYPE_COMMERCIAL, USER_TYPE_REGISTRAR } from '../constants/constants.js'
import { ELIG_TYPE_NONE, ELIG_TYPE_UKC, ELIG_TYPE_BDTC, ELIG_TYPE_BOC, ELIG_TYPE_CC, ELIG_TYPE_NK, ELIG_TYPE_CEU } from '../constants/constants.js'
import { ELIG_TYPE_NA, ELIG_TYPE_BDT, ELIG_TYPE_EEAC, ELIG_TYPE_BCP, ELIG_TYPE_EEIG, ELIG_TYPE_CWS } from '../constants/constants.js'
import './Signup.css';
import { Card, Button as BUTTON_SEMANTIC, Icon, Image } from 'semantic-ui-react'

export default class Signup extends Component {
    constructor(props) {
        super(props)
        this.handleSignup = this.handleSignup.bind(this)

        this.state = {
            loading: false,
            showAccount: true,
            showAlert: false,
            firstName: null,
            lastName: null,
            userEmail: null,
            userPassword: "",
            userConfirmPassword: "",
            userType: USER_TYPE_NONE,
            eligType: ELIG_TYPE_NONE,
            formErrors: {
                firstName: "",
                lastName: "",
                userEmail: "",
                userPassword: "",
                password_example: "",
                password_8: "",
                password_cap: "",
                password_low: "",
                password_num: "",
                password_spe: "",
                userConfirmPassword: "",
                userType: "",
                eligType: "",
            }
        };
    }

    closeFunc() {
        this.props.onChange(false)
    }

    return() {
        let newState = this.state

        newState = {
            loading: false,
            showAccount: true,
            showAlert: false,
            firstName: null,
            lastName: null,
            userEmail: null,
            userPassword: "",
            userConfirmPassword: "",
            userType: USER_TYPE_NONE,
            eligType: ELIG_TYPE_NONE,
            formErrors: {
                firstName: "",
                lastName: "",
                userEmail: "",
                userPassword: "",
                password_example: "",
                password_8: "",
                password_cap: "",
                password_low: "",
                password_num: "",
                password_spe: "",
                userConfirmPassword: "",
                userType: "",
                eligType: "",
            }
        }

        this.setState(newState, () => console.log(this.state));
    }

    /****************************************
     * signupAxios() handles the Post needed for the database
     * If successful, we will acquire a unique token
     * from the database.
     * If unsuccessful, we will show a flag to the user
    ****************************************/
    signupAxios(data) {
        console.log("In Axios, this State: ", this.state)

        console.log('Should be loading:', this.loading)

        axiosInstance.post('/register_user/', {
            username: this.state.userEmail,
            password: this.state.userPassword,
            first_name: this.state.firstName,
            last_name: this.state.lastName,
            user_type: this.state.userType,
            eligibility: this.state.eligType,
        })
            .then((res) => {
                console.log('Signup Passed')
                this.setState({ loading: false })
                var userData = {
                    firstName: this.state.firstName,
                    lastName: this.state.lastName,
                    userEmail: this.state.userEmail,
                    userType: this.state.userType,
                    eligType: this.state.eligType,
                    loggedIn: true
                }

                localStorage.setItem("Token", 'Token ' + res.data.token)
                window.localStorage.setItem("userData", JSON.stringify(userData));

                console.log('LocalStorage: ', localStorage)
                console.log("UserData: ", JSON.parse(window.localStorage.getItem("userData")))



                console.log('Should not be loading:', this.state.loading)
                
                //this.props.onChange(false)
                if (userData.userType === USER_TYPE_REGISTRAR) {
                    this.props.history.push('/registrar/list')
                } else {
                    this.props.history.push('/vessels/list')
                }
            })
            .catch((err) => {
                console.log("COULD NOT CONNECT", err)
                let newState = this.state

                newState.loading = false;
                newState.showAlert = true;

                console.log('Should not be loading:', this.state.loading)
                this.setState(newState, () => console.log(newState));
            })
    }

    /****************************************
     * handleLogin() handles the the submit button
     * It will validate the form and send
     * the information to signupAxios().
     * If invalid, will display reasons why
     * invalid on form
    ****************************************/
    handleSignup = e => {
        e.preventDefault();
        this.setState({ loading: false })

        console.log('State: ', this.state)

        if (signupValid(this.state)) {
            this.signupAxios();
        } else {
            let newState = this.state

            newState.loading = false;
            if ((newState.firstName === null) || (newState.firstName === "")) {
                newState.formErrors.firstName = "Field is required"
            } else if (validateName(newState.firstName) === false) {
                newState.formErrors.firstName = "Invalid Name Entry"
            }

            if ((newState.lastName === null) || (newState.lastName === "")) {
                newState.formErrors.lastName = "Field is required"
            } else if (validateName(newState.lastName) === false) {
                newState.formErrors.lastName = "Invalid Name Entry"
            }

            if ((newState.userEmail === null) || (newState.userEmail === "")) {
                newState.formErrors.userEmail = "Field is required"
            } else if (validateEmail(newState.userEmail) === false) {
                newState.formErrors.userEmail = "Invalid Email Entry"
            }

            if ((newState.userPassword === null) || (newState.userPassword === "")) {
                newState.formErrors.userPassword = "Field is required"
                newState.formErrors.password_example = ""
                newState.formErrors.password_8 = ""
                newState.formErrors.password_cap = ""
                newState.formErrors.password_low = ""
                newState.formErrors.password_num = ""
                newState.formErrors.password_spe = ""
            } else if (validatePassword(newState.userPassword) === false) {
                newState.formErrors.userPassword = "Invalid Password Entry. Password needs to be:"
                newState.formErrors.password_8 = "• At least 8 characters long."
                newState.formErrors.password_cap = "• Contain at least one capitol letter. "
                newState.formErrors.password_low = "• Contain at least one lowercase letter."
                newState.formErrors.password_num = "• Contain at least one number."
                newState.formErrors.password_spe = "• Contain at least one special character @$!%*?&."
                newState.formErrors.password_example = "• e.g. Example1!"
            }

            if ((newState.userConfirmPassword === null) || (newState.userConfirmPassword === "")) {
                newState.formErrors.userConfirmPassword = "Field is required"
            } else if (newState.userConfirmPassword.localeCompare(newState.userPassword) !== 0) {
                newState.formErrors.userConfirmPassword = "Passwords need to match"
            }

            if (newState.userType === USER_TYPE_NONE) {
                newState.formErrors.userType = "Please choose an account type"
            }

            if (newState.eligType === ELIG_TYPE_NONE && newState.userType === USER_TYPE_COMMERCIAL) {
                newState.formErrors.eligType = "Please choose a shipping company."
            }

            if (newState.eligType === ELIG_TYPE_NONE && newState.userType === USER_TYPE_INDIVIDUAL) {
                newState.formErrors.eligType = "Please choose your eligibility status."
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
            case 'firstName':
                formErrors.firstName = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                break;
            case 'lastName':
                formErrors.lastName = (value.length > 0 && validateName(value) === false) ? "Invalid Character" : "";
                break;
            case 'userEmail':
                formErrors.userEmail = (value.length > 0 && validateEmail(value) === false) ? "Email Format Incorrect (e.g. example@example.com or john.example@example.co.uk )" : "";
                break;
            case 'userPassword':
                formErrors.userPassword =    (value.length > 0 && validatePassword(value) === false) ? "Password needs to be: " : "";
                formErrors.password_8 =       (value.length > 0 && validatePassword(value) === false) ? "• At least 8 characters long.":"";
                formErrors.password_cap =     (value.length > 0 && validatePassword(value) === false) ? "• Contain at least one capitol letter. ":"";
                formErrors.password_low =     (value.length > 0 && validatePassword(value) === false) ? "• Contain at least one lowercase letter.":""
                formErrors.password_num =     (value.length > 0 && validatePassword(value) === false) ? "• Contain at least one number.":"";
                formErrors.password_spe =     (value.length > 0 && validatePassword(value) === false) ? "• Contain at least one special character @$!%*?&.":"";
                formErrors.password_example = (value.length > 0 && validatePassword(value) === false) ? "e.g. Example1!":"";
                break;
            case 'userConfirmPassword':
                formErrors.userConfirmPassword = (value.length > 0 && value.localeCompare(this.state.userPassword) !== 0) ? "Passwords must match" : "";
                break;
            case 'userType':
                formErrors.userType = "";
                break;
            case 'eligType':
                formErrors.eligType = "";
                break;
            default:
                break;
        }

        this.setState({ formErrors, [id]: value }, () => console.log(this.state));
    }

    /****************************************
     * handleuserType() handles the user input
     * as they are choosing a radio button 
     * and reset the form errors
    ****************************************/
    handleUserType = e => {
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

    render() {
        const { formErrors } = this.state
        return (
            <div className="Signup">
                <div className='auth-wrapper'>
                    <div className='auth-inner'>
                        <BUTTON_SEMANTIC className='Close' icon onClick={() => this.closeFunc()} color='white'>
                            <Icon name='window close' color='red' size='big' />
                        </BUTTON_SEMANTIC>


                        {this.state.showAccount === false ?
                            <BUTTON_SEMANTIC className='Back' icon onClick={() => this.return()} color='white'>
                                <Icon name='arrow left' color='black' size='big' />
                            </BUTTON_SEMANTIC>
                            :
                            ""
                        }
                        <form>
                            {this.state.userType === USER_TYPE_NONE ?
                                <h3>Create your Account</h3>
                                : this.state.userType === USER_TYPE_BROKER ?
                                    <h3>Create your Broker Account</h3>
                                    : this.state.userType === USER_TYPE_INDIVIDUAL ?
                                        <h3>Create your Personal Account</h3>
                                        : this.state.userType === USER_TYPE_COMMERCIAL ?
                                            <h3>Create your Commercial Account</h3>
                                            : <h3>Create your Account</h3>}

                            <br></br>
                            {this.state.showAccount === false && this.state.showAlert === true ?
                                <Alert className="Alert" variant="danger" >
                                    <p>Failed signup. Please check your internet connection or contact us if issue persists.</p>
                                </Alert> : ""}
                            <br></br>

                            {this.state.showAccount === true ?
                                <Card.Group centered fluid="true">
                                    <Card >
                                        <Image
                                            src="https://react.semantic-ui.com/images/avatar/large/matthew.png"
                                            wrapped
                                            ui={false}
                                            centered
                                        />
                                        <Card.Content>
                                            <Card.Header>Personal Account</Card.Header>
                                            <Card.Meta>
                                                <span className="date">Price: $ </span>
                                            </Card.Meta>
                                            <Card.Description>
                                                Personal Accounts are for managing your own private boats.  </Card.Description>
                                        </Card.Content>
                                        <Button variant='info' value={USER_TYPE_INDIVIDUAL} onClick={this.handleUserType}>
                                            Select
                                            </Button>
                                    </Card>

                                    <Card>
                                        <Image
                                            src="https://react.semantic-ui.com/images/avatar/large/molly.png"
                                            wrapped
                                            size='mini'
                                            ui={false}
                                        />
                                        <Card.Content>
                                            <Card.Header>Broker Account</Card.Header>
                                            <Card.Meta>
                                                <span className="date">Price: $$</span>
                                            </Card.Meta>
                                            <Card.Description>
                                                Broker Accounts are for managing other owner's boats. </Card.Description>
                                        </Card.Content>
                                        <Button variant='info' value={USER_TYPE_BROKER} onClick={this.handleUserType}>
                                            Select
                                            </Button>
                                    </Card>

                                    <Card>
                                        <Image
                                            src="https://react.semantic-ui.com/images/avatar/large/steve.jpg"
                                            wrapped
                                            size='mini'
                                            ui={false}
                                        />
                                        <Card.Content>
                                            <Card.Header>Commercial Account</Card.Header>
                                            <Card.Meta>
                                                <span className="date">Price: $$$</span>
                                            </Card.Meta>
                                            <Card.Description>
                                                Commercial Accounts are for managing your company's vessels.
                                            </Card.Description>
                                        </Card.Content>
                                        <Button variant='info' value={USER_TYPE_COMMERCIAL} onClick={this.handleUserType}>
                                            Select
                                            </Button>
                                    </Card>
                                </Card.Group>
                                :
                                <div className='form-group'>
                                    <Form.Row>
                                        <Col sm={6} xs="auto">
                                            <Form.Group controlId="formGridFirstName">
                                                <label id='Section_Label'>First name</label>
                                                <input
                                                    type='text'
                                                    className={formErrors.firstName.length > 0 ? " form-control error" : 'form-control'}
                                                    placeholder='First name'
                                                    id='firstName'
                                                    formNoValidate
                                                    onChange={this.handleChange}
                                                />
                                                <span className="errorMessage">{formErrors.firstName}</span>
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6} xs="auto">

                                            <Form.Group as={Col} controlId="formGridLastName">
                                                <label id='Section_Label'>Last name</label>
                                                <input
                                                    type='text'
                                                    className={formErrors.lastName.length > 0 ? " form-control error" : 'form-control'}
                                                    placeholder='Last name'
                                                    id='lastName'
                                                    formNoValidate
                                                    onChange={this.handleChange}
                                                />
                                                <span className="errorMessage">{formErrors.lastName}</span>
                                            </Form.Group>
                                        </Col>
                                    </Form.Row>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Email</label>
                                        <input
                                            type='email'
                                            className={formErrors.userEmail.length > 0 ? " form-control error" : 'form-control'}
                                            placeholder='Enter email'
                                            id='userEmail'
                                            formNoValidate
                                            onChange={this.handleChange} />
                                        <span className="errorMessage">{formErrors.userEmail}</span>
                                    </div>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Password</label>
                                        <input
                                            type='password'
                                            className={formErrors.userPassword.length > 0 ? " form-control error" : 'form-control'}
                                            placeholder='Password'
                                            id='userPassword'
                                            formNoValidate
                                            onChange={this.handleChange}
                                        />
                                        <span className="errorMessage">{formErrors.userPassword}</span>
                                        {formErrors.password_8.length > 0 ? <><br></br> 
                                        <span className="errorMessage">{'\xa0'}{'\xa0'}{formErrors.password_8}</span></> : ''}
                                        {formErrors.password_cap.length > 0 ? <><br></br> 
                                        <span className="errorMessage">{'\xa0'}{'\xa0'}{formErrors.password_cap}</span></> : ''}
                                        {formErrors.password_low.length > 0 ? <><br></br> 
                                        <span className="errorMessage">{'\xa0'}{'\xa0'}{formErrors.password_low}</span></> : ''}
                                        {formErrors.password_num.length > 0 ? <><br></br> 
                                        <span className="errorMessage">{'\xa0'}{'\xa0'}{formErrors.password_num}</span></> : ''}
                                        {formErrors.password_spe.length > 0 ? <><br></br> 
                                        <span className="errorMessage">{'\xa0'}{'\xa0'}{formErrors.password_spe}</span></> : ''}
                                        {formErrors.password_example.length > 0 ? <><br></br> 
                                        <span className="errorMessage">{'\xa0'}{'\xa0'}{formErrors.password_example}</span></> : ''}
                                    </div>

                                    <div className='form-group'>
                                        <label id='Section_Label'>Confirm password</label>
                                        <input
                                            type='password'
                                            className={formErrors.userConfirmPassword.length > 0 ? " form-control error" : 'form-control'}
                                            placeholder='Confirm password'
                                            id='userConfirmPassword'
                                            formNoValidate
                                            onChange={this.handleChange}
                                        />
                                        <span className="errorMessage">{formErrors.userConfirmPassword}</span>
                                    </div>
                                    {this.state.userType === USER_TYPE_INDIVIDUAL ?
                                        <div>
                                            <label id='Section_Label'>Select your eligibility:</label>
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
                                        </div>
                                        : this.state.userType === USER_TYPE_COMMERCIAL ?
                                            <div>
                                                <label id='Section_Label'>Select the company you're incorporated in:</label>
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
                                            </div>
                                            : <div></div>}

                                    <br></br>
                                    {this.state.loading === true ?
                                        <button disabled type='submit' className='btn btn-primary btn-block'>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{'\xa0'}
                                    Loading...
                                </button>
                                        :
                                        <button onClick={this.handleSignup} type='submit' className='btn btn-primary btn-block'>
                                            Sign Up
                                </button>
                                    }
                                    <p className='forgot-password text-right'>
                                        Already registered? <a href='/login'>Log in</a>
                                    </p>
                                </div>


                            }

                        </form>
                    </div>
                </div>
            </div>
        )
    }
}
