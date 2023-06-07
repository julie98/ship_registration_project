/***************************************************
 * Author: Christian Ocon
 * File Name: VesselsList.js
 * Description:
 *      This file ...
 ****************************************************/

import React, { Component } from 'react';
import './VesselsList.css';
import { Button, Form, Dropdown } from 'react-bootstrap'
import NavigationBar from '../Navbar/NavigationBar';
import axios from 'axios';
import { Signout } from '../containers/helpers/utility';
import yatch_add_icon from '../components/icons8-yacht-24-add.png'
import axiosInstance from '../containers/helpers/axios' 
import {
    SHIP_TYPE_PLEASURE_VESSEL,
    SHIP_TYPE_COMMERCIAL,
    USER_TYPE_COMMERCIAL,
    USER_TYPE_INDIVIDUAL,
    USER_TYPE_BROKER
} from '../constants/constants'
import { REG_STATE_REG_APPROVED, REG_STATE_REG_COMPLETED } from '../constants/constants'
import { Card, Image, Modal, Header, Icon, Segment, Placeholder, Table, Tab } from "semantic-ui-react";
import broker_ship from "../components/broker_ship.jpg";
import * as ConstSwitch from "../constants/ConstantSwitch";
import * as DateHelpers from "../containers/helpers/date";

export default class VesselsList extends Component {
    _isMounted = false;
    constructor(props) {
        super(props);
        this.handleRegistration = this.handleRegistration.bind(this);

        this.vessel_id = [];
        this.state = {
            vesselsManaged: [],
            currVessels: { joint_owners: [], engine_details: [] },
            showModal: false,
            loadingCards: true
        }

        this.userData = JSON.parse(window.localStorage.getItem("userData"));
    }

    handleRegistration = (vessel_id) => {
        console.log('vessel_id', vessel_id)

        axiosInstance.post('/vessels/register/', {
            vessel_id: vessel_id
        })
            .then((res) => {
                console.log(res.data)
                console.log('ship added')
                //this.props.history.push('/vessels/list')
            })
            .catch((err) => {
                console.log("COULD NOT CONNECT")
                /*if (err.response.status === 401) {
                    Signout();
                    this.props.history.push('/login')
                }*/
            })
    }

    /****************************************
     * ComponentDidMount() is a Life Cycle
     * Event that runs once the entire
     * page has been mounted. It will then
     * receive user data
     * or signout the user if it count not
     * connect
    ****************************************/
    componentDidMount = () => {
        this._isMounted = true;
        console.log("Local Storage", localStorage)
        console.log("This State: ", this.state)
        console.log("Component Did Mount: ")
        axios.get('/vessels/list/', {
            baseURL: process.env.REACT_APP_API_ROOT,
            headers: {
                Authorization: localStorage.Token
            }
        }).then((res) => {
            if (this._isMounted) {
                console.log('Vessels List Passed')
                console.log('res.data', res.data)

                let newState = this.state

                newState.loadingCards = false

                for (var key in res.data) {
                    var newDict = res.data[key]
                    if (newDict.engine_details === null && newDict.ship_type === SHIP_TYPE_COMMERCIAL) {
                        newDict.engine_details = [["Not Stated", "Not Stated"]]
                    }
                    newState.vesselsManaged.push(res.data[key])
                }

                console.log('vessels managed data', newState.vesselsManaged)

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

                    newState.loadingCards = false

                    this.setState(newState, () => console.log(newState));
                }
            })
    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    /****************************************
     * renderVessels() is a dynamic Table generator
     * with information on the user's boats
    ****************************************/
    renderVessels = (vesselsManaged, index) => {
        console.log("Managed: ", vesselsManaged)
        console.log("Managed length: ", vesselsManaged.length)
        console.log("Index: ", index)
        console.log("Render Vessels")
        return (
            <Card key={index} centered className='vesselsCard' onClick={() => this.setState({ currVessels: vesselsManaged, showModal: true })} >

                <Image src={broker_ship} />
                <Card.Content>
                    <Card.Header>{vesselsManaged.ship_name}</Card.Header>
                    <Card.Description>{'Boat ID: ' + vesselsManaged.id}</Card.Description>
                    {/*<Card.Description>{"IMO: " + vesselsManaged.imo_num}</Card.Description>*/}
                    <Card.Description>{'Registration Status: ' + ConstSwitch.checkRegState(vesselsManaged.reg_status)}</Card.Description>
                </Card.Content>
            </Card>
        )
    }


    renderPlaceholder = () => {
        return (
            <Card>
                <Placeholder >
                    <Placeholder.Image square />
                </Placeholder>

                <Card.Content >
                    <Placeholder>
                        <Placeholder.Header>
                            <Placeholder.Line length='very short' />
                            <Placeholder.Line length='medium' />
                        </Placeholder.Header>
                        <Placeholder.Paragraph>
                            <Placeholder.Line length='short' />
                        </Placeholder.Paragraph>
                    </Placeholder>
                </Card.Content>
            </Card>
        )
    }

    /*
     * Owner 0: Owner name
     * Owner 1: Share
     * Owner 2: Eligibility
    */
    renderOwners = (owner, index) => {
        return (
            <Table.Row key={index}>
                <Table.Cell>{owner[0]}</Table.Cell>
                <Table.Cell>{owner[1]}</Table.Cell>
                <Table.Cell>{owner[2]}</Table.Cell>
            </Table.Row>
        )
    }

    /*
     * Engine 0: Engine Model
     * Engine 1: Engine Detail
    */
    renderEngDetails = (engine, index) => {
        return (
            <Table.Row key={index}>
                <Table.Cell>{engine[0]}</Table.Cell>
                <Table.Cell>{engine[1]}</Table.Cell>
            </Table.Row>
        )
    }


    renderCommVessels = (owner) => {
        return (
            <Table.Body>
                <Table.Row >
                    <Table.Cell>Ship Name</Table.Cell>
                    <Table.Cell>{owner.ship_name}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Ship ID</Table.Cell>
                    <Table.Cell>{owner.id}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Vessel Type</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkShipType(owner.ship_type)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Vessel Type Name</Table.Cell>
                    <Table.Cell>{owner.commer_type}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Call Sign</Table.Cell>
                    <Table.Cell>{owner.call_sign}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>IMO Number</Table.Cell>
                    <Table.Cell>IMO {owner.imo_num}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>MMSI</Table.Cell>
                    <Table.Cell>{owner.mmsi}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Port</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkPort(owner.port)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Number of Engines</Table.Cell>
                    <Table.Cell>{owner.num_engine}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Number of Hulls</Table.Cell>
                    <Table.Cell>{owner.num_hull}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Hull ID</Table.Cell>
                    <Table.Cell>{owner.hull_id}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Dimensions (length, width, depth)</Table.Cell>
                    <Table.Cell>{owner.length}x{owner.width}x{owner.depth}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Tonnage</Table.Cell>
                    <Table.Cell>{owner.tonnage}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Propulsion Method</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkPropType(owner.prop_method)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Propulsion Power</Table.Cell>
                    <Table.Cell>{owner.prop_power}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Builder Name</Table.Cell>
                    <Table.Cell>{owner.builder_name}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Build Address</Table.Cell>
                    <Table.Cell>{owner.builder_addr}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Build Yard Number</Table.Cell>
                    <Table.Cell>{owner.builder_yard_no}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Build Date</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.build_date)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Keel Laying Date</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.keel_date)}</Table.Cell>
                </Table.Row>
            </Table.Body>
        )
    }

    renderPleasureVessels = (owner) => {
        return (
            <Table.Body>
                <Table.Row >
                    <Table.Cell>Ship Name</Table.Cell>
                    <Table.Cell>{owner.ship_name}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Ship ID</Table.Cell>
                    <Table.Cell>{owner.id}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Vessel Type</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkShipType(owner.ship_type)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Vessel Type Name</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkVesselType(owner.personal_vessel_type)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Vessel Model</Table.Cell>
                    <Table.Cell>{owner.personal_model}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Port</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkPort(owner.port)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Number of Hulls</Table.Cell>
                    <Table.Cell>{owner.num_hull}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Hull ID</Table.Cell>
                    <Table.Cell>{owner.hull_id}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Dimensions (length)</Table.Cell>
                    <Table.Cell>{owner.length}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Propulsion Method</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkPropType(owner.prop_method)}</Table.Cell>
                </Table.Row>
            </Table.Body>
        )
    }

    renderRegistrationUnfinished = (owner) => {
        return (
            <Table.Body>
                <Table.Row >
                    <Table.Cell>Ship Name</Table.Cell>
                    <Table.Cell>{owner.ship_name}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Ship ID</Table.Cell>
                    <Table.Cell>{owner.id}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>Registration ID</Table.Cell>
                    <Table.Cell>{owner.reg_pk}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Registration Status</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkRegState(owner.reg_status)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Date Applied</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.date_applied)}</Table.Cell>
                </Table.Row>
            </Table.Body>
        )

    }

    renderRegistrationSuccess = (owner) => {
        return (
            <Table.Body>
                <Table.Row >
                    <Table.Cell>Ship Name</Table.Cell>
                    <Table.Cell>{owner.ship_name}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Ship ID</Table.Cell>
                    <Table.Cell>{owner.id}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>Registration ID</Table.Cell>
                    <Table.Cell>{owner.reg_pk}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Registration Status</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkRegState(owner.reg_status)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Date Applied</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.date_applied)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Date Approved</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.date_approved)}</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>Expiration Date</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDatePlusOneYear(owner.date_approved)}</Table.Cell>
                </Table.Row>
            </Table.Body>
        )

    }

    renderRegistrationInfo = (owner) => {
        if(owner.reg_status === REG_STATE_REG_APPROVED || owner.reg_status === REG_STATE_REG_COMPLETED) {
            return this.renderRegistrationSuccess(owner)
        }
        else {
            return this.renderRegistrationUnfinished(owner)
        }
    }

    renderShipData = (owner) => {
        if (owner.ship_type === SHIP_TYPE_PLEASURE_VESSEL) {
            return this.renderPleasureVessels(owner)
        } else if (owner.ship_type === SHIP_TYPE_COMMERCIAL) {
            return this.renderCommVessels(owner)
        }
    }

    panes = [
        {
            menuItem: { key: 'vessel', icon: 'address card', content: 'Vessel Info' },
            render: () =>
                <Tab.Pane>
                    <Table className='Vessels-View-Table' selectable unstackable definition collapsing striped columns={2} verticalAlign='middle' textAlign='center'>
                        <Table.Header>
                            <Table.HeaderCell />
                            <Table.HeaderCell>Description</Table.HeaderCell>
                        </Table.Header>
                        {this.renderShipData(this.state.currVessels)}
                    </Table>
                    {this.state.currVessels.ship_type === SHIP_TYPE_COMMERCIAL ?
                        <Table className='Vessels-View-Table' selectable unstackable collapsing striped columns={2} verticalAlign='middle' textAlign='center'>
                            <Table.Header>
                                <Table.HeaderCell>Engine Make</Table.HeaderCell>
                                <Table.HeaderCell>Engine Model</Table.HeaderCell>
                            </Table.Header>
                            <Table.Body>
                                {this.state.currVessels.engine_details.map((this.renderEngDetails))}
                            </Table.Body>
                        </Table> : ''
                    }
                </Tab.Pane>
        },
        {
            menuItem: { key: 'owners', icon: 'group', content: 'Vessel Owners' },
            render: () =>
                <Tab.Pane>
                    <Table className='Vessels-View-Table' selectable unstackable collapsing striped columns={3} verticalAlign='middle' textAlign='center'>
                        <Table.Header>
                            <Table.HeaderCell>Owners</Table.HeaderCell>
                            <Table.HeaderCell>Share</Table.HeaderCell>
                            <Table.HeaderCell >Eligibility</Table.HeaderCell>
                        </Table.Header>
                        <Table.Body>
                            {this.state.currVessels.joint_owners.map((this.renderOwners))}
                        </Table.Body>
                    </Table>
                </Tab.Pane>
        },
        {
            menuItem: { key: 'registration', icon: 'info', content: 'Registration Info' },
            render: () =>
                <Tab.Pane>
                    <Table className='Vessels-View-Table' selectable unstackable definition collapsing striped columns={2} verticalAlign='middle' textAlign='center'>
                        <Table.Header>
                            <Table.HeaderCell />
                            <Table.HeaderCell>Description</Table.HeaderCell>
                        </Table.Header>
                        {this.renderRegistrationInfo(this.state.currVessels)}
                    </Table>
                </Tab.Pane>
        },
    ]


    render() {
        return (
            <div>
                <NavigationBar />
                <div className="Broker">
                    {/* Broker Page */}
                    <h2> Hello, {this.userData.firstName} {ConstSwitch.accountBadge(this.userData.userType)} </h2>
                    <div className="Container">

                        {/*<ReactBootStrap.Table className="Broker-table" striped bordered hover size="sm">*/}

                        {/*<thead>*/}
                        {/*    <tr>*/}
                        {/*        <th>Name</th>*/}
                        {/*        <th>Boat ID</th>*/}
                        {/*        <th>IMO ID</th>*/}
                        {/*        <th>Registration</th>*/}
                        {/*        <th>Registration Status</th>*/}
                        {/*    </tr>*/}
                        {/*</thead>*/}
                        {/*<tbody>*/}
                        {/*    {this.state.loadingTable === true ?*/}
                        {/*        <tr>*/}
                        {/*            <td colSpan="5" rowSpan="2">*/}
                        {/*                <Spinner as="span" size="sm" animation="border" />{'\xa0'}*/}
                        {/*                Loading...*/}
                        {/*            </td>*/}
                        {/*        </tr>*/}
                        {/*        :*/}
                        {/*        this.state.vesselsManaged.length === 0 ?*/}
                        {/*            <tr>*/}
                        {/*                <td colSpan="5"> {"Table is empty. Please register your vessels."}</td>*/}
                        {/*            </tr>*/}
                        {/*            :*/}
                        {/*            this.state.vesselsManaged.map((this.renderVessels))*/}
                        {/*    }*/}
                        {/*</tbody>*/}
                        {/*</ReactBootStrap.Table>*/}

                        {/*this.state.loadingCards === true?*/}
                        {/* <p>Your boat list is empty. Please register your vessels.</p> */}
                        {
                            this.state.loadingCards === true ?

                                <div className='Card-Empty'>
                                    <Card.Group centered className='Card-Empty' stackable>
                                        {this.renderPlaceholder()}
                                        {this.renderPlaceholder()}
                                        {this.renderPlaceholder()}
                                        {this.renderPlaceholder()}
                                        {this.renderPlaceholder()}
                                        {this.renderPlaceholder()}
                                        {this.renderPlaceholder()}
                                        {this.renderPlaceholder()}
                                        {this.renderPlaceholder()}
                                    </Card.Group>
                                </div>

                                : this.state.vesselsManaged.length === 0 ?
                                    <Segment placeholder className='empty-outline'>
                                        <Header icon>
                                            <Icon circular size='tiny' name='ship' />
                                            <p>No vessels have been found for you.</p>
                                            <p>Please register a vessel.</p>
                                        </Header>
                                        {this.userData.userType === USER_TYPE_INDIVIDUAL ?
                                            < Button className="Table-Button" href="/register/personal" variant="outline-info" size="sm" > <img className="Icon" src={yatch_add_icon} alt='' /> Register Vessels</Button>
                                            : this.userData.userType === USER_TYPE_BROKER ?
                                                <Dropdown className = "Table-Dropdown-Vessels-List-Empty">
                                                    <Dropdown.Toggle  variant="outline-success" id="dropdown-basic">
                                                        Register Vessels
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="/register/personal">Pleasure Craft</Dropdown.Item>
                                                        <Dropdown.Item href="/register/commercial">Merchant Vessel</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                                : this.userData.userType === USER_TYPE_COMMERCIAL ?
                                                    < Button className="Table-Button" href="/register/commercial" variant="outline-info" size="sm" > <img className="Icon" src={yatch_add_icon} alt='' /> Register Vessels</Button>
                                                    : ''}
                                    </Segment>


                                    : this.userData.userType === USER_TYPE_INDIVIDUAL ?
                                        <>
                                            < Button className="Table-Button-Vessels-List-Filled" href="/register/personal" variant="outline-info" size="sm" > <img className="Icon" src={yatch_add_icon} alt='' /> Register Vessels</Button>

                                            <div className='Card-Fill'>
                                                <Card.Group centered className='Card-Group' doubling stackable>
                                                    {this.state.vesselsManaged.map((this.renderVessels))}
                                                </Card.Group>
                                            </div>
                                        </>

                                        : this.userData.userType === USER_TYPE_BROKER ?
                                            <>
                                                <Dropdown classname= "Table-Dropdown" bsPrefix='Table-Dropdown-Vessels-List-Filled'>
                                                    <Dropdown.Toggle variant="outline-success" >
                                                        Register Vessels
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu>
                                                        <Dropdown.Item href="/register/personal">Pleasure Craft</Dropdown.Item>
                                                        <Dropdown.Item href="/register/commercial">Merchant Vessel</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>

                                                <div className='Card-Fill'>
                                                    <Card.Group centered className='Card-Group' doubling stackable>
                                                        {this.state.vesselsManaged.map((this.renderVessels))}
                                                    </Card.Group>
                                                </div>
                                            </>

                                            : this.userData.userType === USER_TYPE_COMMERCIAL ?
                                                <>
                                                    < Button className="Table-Button-Vessels-List-Filled" href="/register/commercial" variant="outline-info" size="sm" > <img className="Icon" src={yatch_add_icon} alt='' /> Register Vessels</Button>


                                                    <div className='Card-Fill'>
                                                        <Card.Group centered className='Card-Group' doubling stackable>
                                                            {this.state.vesselsManaged.map((this.renderVessels))}
                                                        </Card.Group>
                                                    </div>
                                                </>

                                                :
                                                <div className='Card-Fill'>
                                                    <Card.Group centered className='Card-Group' doubling stackable>
                                                        {this.state.vesselsManaged.map((this.renderVessels))}
                                                    </Card.Group>
                                                </div>

                        }


                        < Modal
                            as={Form}
                            dimmer={'blurring'}
                            closeOnEscape={true}
                            closeOnDimmerClick={true}
                            className='ourModal'
                            centered
                            onClose={() => this.setState({ showModal: false })}
                            onOpen={() => this.setState({ showModal: true })}
                            open={this.state.showModal}
                        >
                            <Modal.Header>Vessel Registration</Modal.Header>
                            <Modal.Content scrolling image>
                                <Image size='medium' src={broker_ship} wrapped />
                                <Modal.Description>
                                    <Tab className='Vessels-View-Tab' menu={{ fluid: false, tabular: true }} panes={this.panes} />
                                </Modal.Description>
                            </Modal.Content>
                            <Modal.Actions>
                                <Button variant="secondary" onClick={() => this.setState({ showModal: false })}>Done</Button>
                            </Modal.Actions>
                        </Modal>

                    </div>
                </div >
            </div >
        );
    }
}
