/***************************************************
 * Author: Christian Ocon 
 * File Name: NavigationBar.js
 * Description:
 *      This file is for the Navigation Bar
 *      The navigation bar shows different 
 *      objects if the user is signed in or not
 ****************************************************/


import React from 'react'
import Logo_212 from "../components/212_Flag.png"
import './NavigationBar.css'
import { Nav, Navbar, NavDropdown, Form, Button, Badge } from 'react-bootstrap'
import { Signout } from '../containers/helpers/utility';
import yatch_icon from '../components/icons8-yacht-50.png'
import registrar_icon from '../components/icons8-organization-chart-people-24.png'
import { USER_TYPE_BROKER, USER_TYPE_COMMERCIAL, USER_TYPE_INDIVIDUAL, USER_TYPE_REGISTRAR } from '../constants/constants';
import { Modal } from 'semantic-ui-react'
import { useHistory } from "react-router-dom";
import Login from './Login'
import Signup from './Signup';


export function NavigationBar() {
    const [openLogin, setOpenLogin] = React.useState(false)
    const [openSignup, setOpenSignup] = React.useState(false)

    function handleChangeLogin(newValue) {
        setOpenLogin(newValue);
    }

    function handleChangeSignup(newValue) {
        setOpenSignup(newValue);
    }

    function accountBadge(firstName, userType) {
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
            <div>
               <Navbar.Text>Signed in as: </Navbar.Text>{'\xa0'} {firstName} <Badge className='Nav-Badge' pill variant={variant}> {str}</Badge>
            </div>
        )
    }

    let history = useHistory()
    const user = JSON.parse(window.localStorage.getItem("userData"))
    console.log('Navbar User Data: ', user);
    return (
        <div className="NavBar">
            <Navbar fixed='top' collapseOnSelect expand="lg" bg="dark" variant="dark">
                <Nav activeKey="/">
                    <Navbar.Brand href="/"><img src={Logo_212} className="NavBar-logo" alt="logo" /></Navbar.Brand>
                </Nav>

                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    {user.userType === USER_TYPE_REGISTRAR ?

                        <Nav className="mr-auto" >
                            <Nav.Link href="/registrar/users">Users</Nav.Link>
                            <Nav.Link href="/registrar/registered">Registered</Nav.Link>
                            <Nav.Link href="/registrar/pending">Pending </Nav.Link>
                            <Nav.Link href="/registrar/denied">Denied </Nav.Link>
                            <Nav.Link href="/registrar/surveying">Surveying</Nav.Link>
                        </Nav>
                        :

                        <Nav className="mr-auto">
                            <Nav.Link href="/services">Services</Nav.Link>
                            <Nav.Link href="/policy">Policy</Nav.Link>
                            <Nav.Link href="/notices">Notices</Nav.Link>
                            <Nav.Link href="/contact">Contact</Nav.Link>
                        </Nav>
                    }




                    {user.loggedIn === true ? (
                        <Nav >
                            <div>
                                
                                <NavDropdown
                                    title={accountBadge(user.firstName, user.userType)}
                                    id="collapsible-nav-dropdown" >
                                    <NavDropdown.Item href="/vessels/list">Account</NavDropdown.Item>
                                    <NavDropdown.Item href="/userSettings">Settings</NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onSelect={() => Signout()} href="/">Sign Out</NavDropdown.Item>
                                </NavDropdown>
                            </div>
                            <Form inline>
                                {user.userType === USER_TYPE_REGISTRAR ?
                                    <Button href="/registrar/users" variant="outline-light" > <img className="Icon2" src={registrar_icon} alt='' /> Registration </Button>
                                    :
                                    <Button href="/vessels/list" variant="outline-light" > <img className="Icon" src={yatch_icon} alt='' /> Vessels </Button>
                                }
                            </Form>
                        </Nav>
                    ) : (
                            <Form inline>
                                <Modal
                                    centered
                                    dimmer={'blurring'}
                                    closeOnEscape={true}
                                    closeOnDimmerClick={true}
                                    className='Modal'
                                    onClose={() => setOpenLogin(false)}
                                    onOpen={() => setOpenLogin(true)}
                                    open={openLogin}
                                    trigger={<Button variant="primary">Login</Button>}
                                >
                                    <Login history={history} onChange={handleChangeLogin} />
                                </Modal>{'\xa0'}
                                <Modal
                                    centered
                                    dimmer={'blurring'}
                                    closeOnEscape={true}
                                    closeOnDimmerClick={true}
                                    className='Modal'
                                    onClose={() => setOpenSignup(false)}
                                    onOpen={() => setOpenSignup(true)}
                                    open={openSignup}
                                    trigger={<Button variant="secondary">Sign up</Button>}
                                >
                                    <Signup history={history} onChange={handleChangeSignup} />
                                </Modal>
                            </Form>
                        )}
                </Navbar.Collapse>



            </Navbar>
        </div>
    );
}

export default NavigationBar;

/*
<Modal
    closeIcon
    closeOnEscape={true}
    closeOnDimmerClick={true}
    open={open_Login}
    onOpen={() => dispatch({ type: "OPEN_MODAL", dimmer: 'blurring' })}
    onClose={() => dispatch({ type: "CLOSE_MODAL" })}
    trigger={<Button variant="primary">Login</Button>}

>
    <div id="overlay"></div>
    <Login history={history} />
</Modal>{'\xa0'}

<Modal
    closeOnEscape={true}
    closeOnDimmerClick={true}
    open={open_Signup}
    onOpen={() => dispatch({ type: "OPEN_MODAL" })}
    onClose={() => dispatch({ type: "CLOSE_MODAL" })}
    trigger={<Button variant="secondary">Sign up</Button>}
>

    <Signup history={history} />
</Modal>
*/
