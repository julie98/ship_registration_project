/***************************************************
 * Author: Christian Ocon 
 * File Name: Services.js
 * Description:
 *      This file is for the Services page
 ****************************************************/
import React, { Component } from 'react'
import './RegistrarList.css'
import NavigationBar from '../Navbar/NavigationBar';
import * as ReactBootStrap from "react-bootstrap"
import axios from 'axios';
import {Spinner, Badge, Button} from 'react-bootstrap'
import { Signout } from '../containers/helpers/utility';
import { USER_TYPE_BROKER, USER_TYPE_COMMERCIAL, USER_TYPE_INDIVIDUAL, USER_TYPE_REGISTRAR } from '../constants/constants';
import {Breadcrumb, Card, Modal } from 'semantic-ui-react'
import * as ConstSwitch from '../constants/ConstantSwitch'
import * as DateHelpers from '../containers/helpers/date'

/* 
 * Able to view Users (first name, last name)
 * Able to see the user type
 * Able to see date joined
 * Able to see if active user
 */

export default class UsersList extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)

        this.state = {
            usersManaged: [],
            showModal: false,
            currUser: [],
            loadingTable: true
        }

        this.userData = JSON.parse(window.localStorage.getItem("userData"));
    }


    /****************************************
     * ComponentDidMount() is a Life Cycle
     * Event that runs once the entire
     * page has been mounted. It will then
     * receive user data
    ****************************************/
    componentDidMount() {
        this._isMounted = true;
        console.log("Local Storage", localStorage)
        console.log("This State: ", this.state)
        console.log("Component Did Mount: ")
        axios.get('/users/view/all/', {
            baseURL: process.env.REACT_APP_API_ROOT,
            headers: {
                Authorization: localStorage.Token
            }
        }).then((res) => {
            if (this._isMounted) {
                console.log('Users List Passed')
                console.log('res.data', res.data)

                let newState = this.state

                newState.loadingTable = false

                
                for (var key in res.data) {
                    newState.usersManaged.push(res.data[key])
                }

                console.log('vessels managed data', newState.usersManaged)

                this.setState(newState, () => console.log(newState));
            }
        })
            .catch((err) => {
                if (this._isMounted) {
                    console.log("COULD NOT CONNECT", err)
                    console.log("status", err.response.status)
                    if (err.response.status === 401) {
                        Signout();
                        this.props.history.push('/')
                    }
                    let newState = this.state

                    newState.loadingTable = false

                    this.setState(newState, () => console.log(newState));
                }
            })

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    accountBadge(userType) {
        var str = ''
        var variant = ''
        switch (userType) {
            case USER_TYPE_REGISTRAR:
                str = "Registrar"
                variant = "primary"
                break;
            case USER_TYPE_BROKER:
                str = "Broker"
                variant = "secondary"
                break;
            case USER_TYPE_INDIVIDUAL:
                str = "Personal"
                variant = "success"
                break;
            case USER_TYPE_COMMERCIAL:
                str = "Commercial"
                variant = "info"
                break;
            default:
                str = "No Name"
                variant = "warning"
                break;

        }

        return (
            <Badge className='Vessel-Badge' pill variant={variant}> {str}</Badge>
        )
    }

    /****************************************
     * renderUsers() is a dynamic Table generator
     * with information on the user
    ****************************************/
    renderUsers = (usersManaged, index) => {
        return (
            <tr key={index} onClick={() => this.setState({ currUser: usersManaged, showModal: true })}>
                <td>{usersManaged.first_name}{'\xa0'}{usersManaged.last_name}</td>
                <td>{usersManaged.id}</td>
                <td>{ConstSwitch.checkUserType(usersManaged.user_type)}</td>
                <td>{DateHelpers.longDate(usersManaged.date_joined)}</td>
            </tr>
        )
    }

    renderUsersCard = (usersManaged, index) => {
        return (
            <Card fluid>
                <Card.Content>
                    <Card.Header textAlign={"left"}>{usersManaged.first_name}{'\xa0'}{usersManaged.last_name}</Card.Header>
                    <Card.Meta textAlign={"left"}>{ConstSwitch.checkUserType(usersManaged.user_type) + ' Account'}</Card.Meta>
                    <Card.Description textAlign={"left"}>
                        {'User ID: ' + usersManaged.id}
                    </Card.Description>

                    <Card.Description textAlign={"left"}>
                        {'Email: On Request'}
                    </Card.Description>

                    <Card.Description textAlign={"left"}>
                        {'Date joined: ' + DateHelpers.longDate(usersManaged.date_joined)}
                    </Card.Description>

                </Card.Content>
            </Card>
        )
    }




    render() {
        return (
            <div>
                <NavigationBar />
                <div className="Registrar">

                    <Breadcrumb>
                        <Breadcrumb.Section href='/'>Home</Breadcrumb.Section>
                        <Breadcrumb.Divider />
                        <Breadcrumb.Section active>Users</Breadcrumb.Section>
                    </Breadcrumb>

                    <h2> Hello, {this.userData.firstName} {this.accountBadge(this.userData.userType)} </h2>

                    < Modal
                        dimmer={'blurring'}
                        closeOnEscape={true}
                        closeOnDimmerClick={true}
                        className='Modal-Users'
                        centered
                        onClose={() => this.setState({ showModal: false })}
                        onOpen={() => this.setState({ showModal: true })}
                        open={this.state.showModal}

                    >
                        <Modal.Header>User Information</Modal.Header>
                        <Modal.Content scrolling>
                            <Modal.Description>
                                {/*<Card className='User-Card' centered>*/}
                                    {this.renderUsersCard(this.state.currUser)}
                                {/*</Card>*/}
                            </Modal.Description>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button variant="outline-info" onClick={() => this.setState({ showModal: false })}>Request Email</Button>{'\xa0'}
                            <Button variant="outline-success" onClick={() => this.setState({ showModal: false })}>Done</Button>
                        </Modal.Actions>
                    </Modal>

                    <ReactBootStrap.Table className="Registrar-table" striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>User Name</th>
                                <th>User ID</th>
                                <th>Account Type</th>
                                <th>Date Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.loadingTable === true ?
                                <tr>
                                    <td colSpan="4" rowSpan="2">
                                        <Spinner as="span" size="sm" animation="border" />{'\xa0'}
                                            Loading...
                                            </td>
                                </tr>
                                :
                                this.state.usersManaged.length === 0 ?
                                    <tr>
                                        <td colSpan="4"> {"Table is empty. Users need to be added"}</td>
                                    </tr>
                                    :
                                    this.state.usersManaged.map((this.renderUsers))
                            }
                        </tbody>
                    </ReactBootStrap.Table>


                </div>
            </div>
        );
    }
}