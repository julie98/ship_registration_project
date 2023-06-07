import React, { Component } from 'react'
import './RegistrarList.css'
import NavigationBar from '../Navbar/NavigationBar';
import * as ReactBootStrap from "react-bootstrap"
import axios from 'axios';
import { Spinner, Button } from 'react-bootstrap'
import { Modal, Image, Breadcrumb, Table, Tab } from 'semantic-ui-react'
import { Signout } from '../containers/helpers/utility';
import yacht_img from '../components/yacht.jpeg'
import * as ConstSwitch from '../constants/ConstantSwitch'
import * as DateHelpers from '../containers/helpers/date'
import { SHIP_TYPE_COMMERCIAL, SHIP_TYPE_PLEASURE_VESSEL } from '../constants/constants';


export default class DeniedList extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)

        this.state = {
            deniedVessels: [],
            currVessels: { joint_owners: [], engine_details: [] },
            showModal: false,
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
        axios.get('/applications/view/all/?registration_status=reg_rejected', {
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
                    var newDict = res.data[key]
                    if (newDict.engine_details === null && newDict.ship_type === SHIP_TYPE_COMMERCIAL) {
                        newDict.engine_details = [["Not Stated", "Not Stated"]]
                    }
                    newState.deniedVessels.push(newDict)
                }

                console.log('vessels managed data', newState.deniedVessels)




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


    /****************************************
     * renderDenied() is a dynamic Table generator
     * with information on the vessel
     ****************************************/
    renderDenied = (deniedVessels, index) => {
        return (
            <tr key={index} onClick={() => this.setState({ currVessels: deniedVessels, showModal: true })}>
                <td>{deniedVessels.ship_name}</td>
                <td>{ConstSwitch.checkPort(deniedVessels.port)}</td>
                <td>{deniedVessels.first_name} {deniedVessels.last_name}</td>
                <td>{DateHelpers.shortDate(deniedVessels.date_applied)}</td>
            </tr>
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
                    <Table.Cell>Registered Under</Table.Cell>
                    <Table.Cell>{owner.first_name} {owner.last_name}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>User ID</Table.Cell>
                    <Table.Cell>{owner.user_id}</Table.Cell>
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
                    <Table.Cell>Registered Under</Table.Cell>
                    <Table.Cell>{owner.first_name} {owner.last_name}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>User ID</Table.Cell>
                    <Table.Cell>{owner.user_id}</Table.Cell>
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

    renderRegistrationInfo = (owner) => {
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
                    <Table.Cell>Registered Under</Table.Cell>
                    <Table.Cell>{owner.first_name} {owner.last_name}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>User ID</Table.Cell>
                    <Table.Cell>{owner.user_id}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Registration ID</Table.Cell>
                    <Table.Cell>{owner.registration_info_id}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Registration Status</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkRegState(owner.reg_state)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Date Applied</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.date_applied)}</Table.Cell>
                </Table.Row>
            </Table.Body>
        )

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
            menuItem: { key: 'vessel', icon: 'address card', content: 'Vessel Information' },
            render: () =>
                <Tab.Pane>
                    <Table className='Vessel-Registration-Table' selectable definition collapsing striped columns={2} verticalAlign='middle' textAlign='center'>
                        <Table.Header>
                            <Table.HeaderCell />
                            <Table.HeaderCell>Description</Table.HeaderCell>
                        </Table.Header>
                        {this.renderShipData(this.state.currVessels)}
                    </Table>
                    {this.state.currVessels.ship_type === SHIP_TYPE_COMMERCIAL ?
                        <Table className='Vessel-Registration-Table' selectable collapsing striped columns={2} verticalAlign='middle' textAlign='center'>
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
                    <Table fixed className='Vessel-Registration-Table' selectable collapsing striped columns={3} verticalAlign='middle' textAlign='center'>
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
            menuItem: { key: 'registration', icon: 'info', content: 'Registration Information' },
            render: () =>
                <Tab.Pane>
                    <Table className='Vessel-Registration-Table' selectable definition collapsing striped columns={2} verticalAlign='middle' textAlign='center'>
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
                <div className="Registrar">
                    <Breadcrumb>
                        <Breadcrumb.Section href='/'>Home</Breadcrumb.Section>
                        <Breadcrumb.Divider />
                        <Breadcrumb.Section active>Denied</Breadcrumb.Section>
                    </Breadcrumb>
                    <h2> Hello, {this.userData.firstName}  {ConstSwitch.accountBadge(this.userData.userType)} </h2>
                    < Modal
                        dimmer={'blurring'}
                        closeOnEscape={true}
                        closeOnDimmerClick={true}
                        className='Modal-Registered'
                        onClose={() => this.setState({ showModal: false })}
                        onOpen={() => this.setState({ showModal: true })}
                        open={this.state.showModal}

                    >
                        <Modal.Header>Vessel Registration</Modal.Header>
                        <Modal.Content image scrolling>
                            <Image className='Registered-Image' size='medium' src={yacht_img} wrapped />

                            <Modal.Description>
                                <Tab className='Registered-Tab' menu={{ fluid: false, tabular: true }} panes={this.panes} />

                            </Modal.Description>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button variant="secondary" onClick={() => this.setState({ showModal: false })}>Done</Button>
                        </Modal.Actions>
                    </Modal>
                    <ReactBootStrap.Table className="Registrar-table" striped bordered hover size="sm">
                        <thead>
                        <tr>
                            <th>Vessel Name</th>
                            <th>Port</th>
                            <th>Applicant</th>
                            <th>Date Applied</th>
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
                            this.state.deniedVessels.length === 0 ?
                                <tr>
                                    <td colSpan="4"> {"Table is empty. No Denied Vessels."}</td>
                                </tr>
                                :
                                this.state.deniedVessels.map((this.renderDenied))
                        }
                        </tbody>
                    </ReactBootStrap.Table>


                </div>
            </div>
        );
    }
}