/***************************************************
 * Author: Christian Ocon 
 * File Name: Login.js
 * Description:
 *      This file is for the Login Form when a user
 *      intends to sign into their account
 ****************************************************/

import React, { Component } from 'react';
import { Alert, Spinner } from 'react-bootstrap'
import './Login.css';
import axiosInstance from '../containers/helpers/axios'
import { validateEmail, validatePassword, loginValid } from '../containers/helpers/validation'
import { ELIG_TYPE_NONE, USER_TYPE_NONE, USER_TYPE_REGISTRAR } from '../constants/constants';
import { Button as BUTTON_SEMANTIC, Icon } from 'semantic-ui-react'

// Set Initial Variables needed
export default class Login extends Component {
    constructor(props) {
        super(props);

        this.handleLogin = this.handleLogin.bind(this);

        this.state = {
            userEmail: null,
            userPassword: null,
            loading: false,
            showAlert: false,
            formErrors: {
                userEmail: "",
                userPassword: "",
            }
        };

    };

    closeFunc() {
        this.props.onChange(false)
    }

    /****************************************
     * loginAxios handles the Post needed for the database
     * If successful, we will acquire a unique token
     * from the database.
     * If unsuccessful, we will show a flag to the user
    ****************************************/
    loginAxios(data) {
        console.log("In Axios, this State: ", this.state)

        console.log('Should be loading:', this.state.loading)
        axiosInstance.post('/login/', {
            username: this.state.userEmail,
            password: this.state.userPassword,
        })
            .then((res) => {
                console.log('Login Passed')
                console.log('Res Data: ', res.data)
                this.setState({ loading: false })

                localStorage.setItem("Token", 'Token ' + res.data.token)

                var userData = JSON.parse(window.localStorage.getItem("userData"))

                userData = {
                    firstName: res.data.first_name,
                    lastName: res.data.last_name,
                    userEmail: this.userEmail,
                    userType: res.data.user_type,
                    eligType: ELIG_TYPE_NONE,
                    loggedIn: true
                }

                window.localStorage.setItem("userData", JSON.stringify(userData));

                console.log('Token: ', localStorage)


                console.log('Should not be loading:', this.state.loading)

                //this.props.onChange(false)
                if (userData.userType === USER_TYPE_REGISTRAR) {
                    this.props.history.push('/registrar/users')
                } else {
                    this.props.history.push('/vessels/list')
                }
            })
            .catch((err) => {
                console.log("COULD NOT CONNECT", err)

                let newState = this.state

                newState.loading = false;
                newState.showAlert = true;

                var userData = JSON.parse(window.localStorage.getItem("userData"))
                userData = {
                    firstName: "",
                    lastName: "",
                    userEmail: this.userEmail,
                    userType: USER_TYPE_NONE,
                    eligType: ELIG_TYPE_NONE,
                    loggedIn: false
                }

                window.localStorage.setItem("userData", JSON.stringify(userData));
                console.log('Should not be loading:', this.state.loading)

                this.setState(newState, () => console.log(newState));
            })
    }

    /****************************************
     * handleLogin() handles the the submit button
     * It will validate the form and send
     * the information to loginAxios().
     * If invalid, will display reasons why
     * invalid on form
    ****************************************/
    handleLogin = e => {
        e.preventDefault();
        this.setState({ loading: false })

        console.log('State: ', this.state)

        if (loginValid(this.state)) {
            this.loginAxios();
        } else {
            let newState = this.state

            newState.loading = false;

            if ((newState.userEmail === null) || (newState.userEmail === "")) {
                newState.formErrors.userEmail = "Field is required"
            } else if (validateEmail(newState.userEmail) === false) {
                newState.formErrors.userEmail = "Invalid email"
            }

            if ((newState.userPassword === null) || (newState.userPassword === "")) {
                newState.formErrors.userPassword = "Field is required"
            } else if (validatePassword(newState.userPassword) === false) {
                newState.formErrors.userPassword = "Password invalid"
            }

            this.setState(newState, () => console.log(newState));

            console.error('Form Invalid -DISPLAY ERROR MESSAGE')
        }

        return;
    };

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
            case 'userEmail':
                formErrors.userEmail = "";
                break;
            case 'userPassword':
                formErrors.userPassword = "";
                break;
            default:
                break;
        }
        this.setState({ formErrors, [id]: value }, () => console.log(this.state));
    }

    render() {
        const { formErrors } = this.state
        return (
            < div className="Login" >

                <div className='auth-wrapper'>
                    <div className='auth-inner'>
                            <BUTTON_SEMANTIC icon onClick = {()=> this.closeFunc()} color = 'white'>
                                <Icon name='window close' color = 'red'size = 'big'/>
                            </BUTTON_SEMANTIC>
                        <form>
                            <h3>Login </h3>
                            {this.state.showAlert === true ?
                                <Alert className="Alert" variant="danger" >
                                    <p>Incorrect email or password.</p>
                                </Alert> : ""}
                            <div className='form-group'>
                                <label>Email</label>
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
                                <label>Password</label>
                                <input
                                    type='password'
                                    className={formErrors.userPassword.length > 0 ? " form-control error" : 'form-control'}
                                    placeholder='Enter password'
                                    id='userPassword'
                                    formNoValidate
                                    onChange={this.handleChange} />
                                <span className="errorMessage">{formErrors.userPassword}</span>

                            </div>

                            <div className='form-group'>
                                <div className='custom-control custom-checkbox'>
                                    <input
                                        type='checkbox'
                                        className='custom-control-input'
                                        id='customCheck1' />
                                    <label className='custom-control-label' htmlFor='customCheck1'>Remember me</label>
                                </div>
                            </div>


                            {this.state.loading === true ?
                                <button disabled type='submit' className='btn btn-primary btn-block'>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />{'\xa0'}
                                    Loading...
                                </button>
                                :
                                <button onClick={this.handleLogin} type='button' className='btn btn-primary btn-block'>
                                    Log in
                                </button>
                            }

                            <p className='forgot-password text-right'>
                                Forgot password? <a href='retrieve-password'>Click here</a>
                            </p>

                        </form>
                    </div >
                </div>
            </div>
        );
    };
}
