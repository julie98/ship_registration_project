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
import { Spinner, Button } from 'react-bootstrap'
import { Modal, Image, Breadcrumb, Table, Tab, Search } from 'semantic-ui-react'
import yacht_img from '../components/yacht.jpeg'
import { Signout } from '../containers/helpers/utility';
import axiosInstance from '../containers/helpers/axios';
import { DECISION_APPROVED, DECISION_REJECTED, REG_STATE_PENDING_REG_APPROVAL } from '../constants/constants'
import * as ConstSwitch from '../constants/ConstantSwitch'
import * as DateHelpers from '../containers/helpers/date'
import { SHIP_TYPE_COMMERCIAL, SHIP_TYPE_PLEASURE_VESSEL } from '../constants/constants';
import { SURVEYOR_LIST } from '../constants/constants'
import _ from "lodash";

export default class PendingList extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)

        this.initialState = {
            isLoading: false,
            results: [],
            value: "",
            return_val: []
        };

        this.state = {
            pendingVessels: [],
            surveyor: {},
            currVessels: { joint_owners: [], engine_details: [] },
            showModal: false,
            loadingTable: true,
            loadingDecision: false,
            searchBar: this.initialState
        }

        this.userData = JSON.parse(window.localStorage.getItem("userData"));


    }

    handleResultSelect = (e, { result }) => {
        let surveyor = this.state.surveyor
        surveyor[this.state.currVessels.id] = [result.title, result.description, result.operation]
        this.setState({
            searchBar: {
                isLoading: false,
                value: result.title,
                results: this.state.searchBar.results,
                return_val: [result.title, result.description, result.operation]
            },
            surveyor: surveyor
        });

        console.log('On Select: ', [result.title, result.description, result.operation])
        console.log('Surveyor: ', this.state.surveyor)
    }

    handleSearchChange = (e, { value }) => {
        console.log('this state: ', this.state)
        this.setState({
            searchBar: { isLoading: true, value, results: this.state.searchBar.results, return_val: ['', '', ''] },
        });

        // This is a search time out. after 300ms, returns results.
        setTimeout(() => {
            console.log('Search Bar', this.state.searchBar)
            if (this.state.searchBar.value.length < 1) return this.setState({ searchBar: this.initialState });
            const re = new RegExp(_.escapeRegExp(this.state.searchBar.value), "i");
            const isMatch_Title = (result) => re.test(result.title);
            const isMatch_Description = (result) => re.test(result.description);
            const isMatch_Operation = (result) => re.test(result.operation);
            const filteredResults = _.reduce(
                SURVEYOR_LIST,
                (memo, data, name) => {
                    const results_title = _.filter(data.results, isMatch_Title);
                    const results_description = _.filter(data.results, isMatch_Description);
                    const results_operation = _.filter(data.results, isMatch_Operation);
                    let results_cat = results_title.concat(results_description).concat(results_operation)
                    results_cat = [...new Set([...results_title, ...results_description, ...results_operation])]
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



    appReviewAxios(registration_id, decision) {
        this.setState({ loadingDecision: true });
        console.log(this.state.currVessels)
        console.log("Local Storage", localStorage)
        console.log("registration ID: ", registration_id)
        console.log("Decision: ", decision)
        console.log("in App Review Axios: ")
        axiosInstance.post('/applications/review/', {
            registration_id: registration_id,
            decision: decision,
        }).then((res) => {
            console.log('Users List Passed')
            console.log('res.data', res.data)

            this.pendingAxios()
        })
            .catch((err) => {
                console.log("COULD NOT CONNECT", err)
                console.log("status", err.response.status)
                if (err.response.status === 401) {
                    Signout();
                    this.props.history.push('/')
                }
                let newState = this.state

                newState.loadingDecision = false
                newState.showModal = false

                this.setState(newState, () => console.log(newState));
            })
    }


    pendingAxios() {
        console.log("Local Storage", localStorage)
        console.log("This State: ", this.state)
        console.log("Component Did Mount: ")
        axios.all([
            axios.get('/applications/view/all/?registration_status=pending_reg_approval', {
                baseURL: process.env.REACT_APP_API_ROOT,
                headers: {
                    Authorization: localStorage.Token
                }
            }),
            axios.get('/applications/view/all/?registration_status=reg_fee_pending', {
                baseURL: process.env.REACT_APP_API_ROOT,
                headers: {
                    Authorization: localStorage.Token
                }
            })
        ]).then(axios.spread((res_pending_reg, res_reg_fee_pending) => {
            console.log('Users List Passed')
            console.log('res_pending_reg', res_pending_reg.data)
            console.log('Reg fee pending', res_reg_fee_pending.data)

            let newState = this.state

            newState.loadingTable = false
            newState.loadingDecision = false
            newState.showModal = false

            newState.pendingVessels.length = 0 //reset list


            for (var key_p in res_pending_reg.data) {
                var newDict_p = res_pending_reg.data[key_p]
                if (newDict_p.engine_details === null && newDict_p.ship_type === SHIP_TYPE_COMMERCIAL) {
                    newDict_p.engine_details = [["Not Stated", "Not Stated"]]
                }
                newState.pendingVessels.push(newDict_p)
            }

            for (var key_r in res_reg_fee_pending.data) {
                var newDict_r = res_reg_fee_pending.data[key_r]

                if (newDict_r.engine_details === null && newDict_r.ship_type === SHIP_TYPE_COMMERCIAL) {
                    newDict_r.engine_details = [["Not Stated", "Not Stated"]]
                }
                newState.pendingVessels.push(newDict_r)
            }

            console.log('vessels managed data', newState.pendingVessels)

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

                newState.loadingTable = false
                newState.loadingDecision = false
                newState.showModal = false

                this.setState(newState, () => console.log(newState));
            })
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
        axios.all([
            axios.get('/applications/view/all/?registration_status=pending_reg_approval', {
                baseURL: process.env.REACT_APP_API_ROOT,
                headers: {
                    Authorization: localStorage.Token
                }
            }),
            axios.get('/applications/view/all/?registration_status=reg_fee_pending', {
                baseURL: process.env.REACT_APP_API_ROOT,
                headers: {
                    Authorization: localStorage.Token
                }
            })
        ]).then(axios.spread((res_pending_reg, res_reg_fee_pending) => {
            if (this._isMounted) {
                console.log('Users List Passed')
                console.log('res_pending_reg', res_pending_reg.data)
                console.log('Reg fee pending', res_reg_fee_pending.data)

                let newState = this.state

                newState.loadingTable = false

                //this.vessel_id.length = 0;
                newState.surveyor = {}
                for (var key_p in res_pending_reg.data) {
                    var newDict_p = res_pending_reg.data[key_p]
                    if (newDict_p.engine_details === null && newDict_p.ship_type === SHIP_TYPE_COMMERCIAL) {
                        newDict_p.engine_details = [["Not Stated", "Not Stated"]]
                    }

                    newState.surveyor[res_pending_reg.data[key_p]['id']] = ['', '']
                    console.log('Surveyor: ', newState.surveyor)
                    newState.pendingVessels.push(newDict_p)
                    //this.vessel_id.push(res.data[key].pk)
                }

                for (var key_r in res_reg_fee_pending.data) {
                    var newDict_r = res_reg_fee_pending.data[key_r]

                    if (newDict_r.engine_details === null && newDict_r.ship_type === SHIP_TYPE_COMMERCIAL) {
                        newDict_r.engine_details = [["Not Stated", "Not Stated"]]
                    }
                    newState.surveyor[res_reg_fee_pending.data[key_r]['id']] = ['', '']
                    console.log('Surveyor: ', newState.surveyor)
                    newState.pendingVessels.push(newDict_r)
                }

                console.log('vessels managed data', newState.pendingVessels)

                this.setState(newState, () => console.log(newState));
            }
        }))
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



    renderPending = (vesselsManaged, index) => {
        return (
            <tr className={vesselsManaged.reg_state === REG_STATE_PENDING_REG_APPROVAL ? 'Light_Green' : ''} key={index} onClick={() => this.setState({ currVessels: vesselsManaged, showModal: true })}>
                <td>{vesselsManaged.ship_name}</td>
                <td>{ConstSwitch.checkPort(vesselsManaged.port)}</td>
                <td>{vesselsManaged.first_name} {vesselsManaged.last_name}</td>
                <td>{ConstSwitch.checkRegState(vesselsManaged.reg_state)}</td>
                <td>{DateHelpers.shortDate(vesselsManaged.date_approved)}</td>
                <td>{this.state.surveyor[vesselsManaged.id][1]}</td>
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
                <Tab.Pane loading={this.state.loadingDecision} >
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
        {
            menuItem: { key: 'surveyor', icon: 'info', content: 'Surveyor Information' },
            render: () =>
                <Tab.Pane>
                    <Search
                        className='Commercial-Class Icon Search'
                        category
                        aligned={'right'}
                        loading={this.state.searchBar.isLoading}
                        onResultSelect={this.handleResultSelect}
                        onSearchChange={_.debounce(this.handleSearchChange, 500, {
                            leading: true
                        })}
                        results={this.state.searchBar.results}
                        value={this.state.searchBar.value}
                    />
                    <Table className='Vessel-Registration-Table' selectable definition collapsing striped columns={2} verticalAlign='middle' textAlign='center'>
                        <Table.Header>
                            <Table.HeaderCell />
                            <Table.HeaderCell>Description</Table.HeaderCell>
                        </Table.Header>
                        <Table.Row >
                            <Table.Cell>Surveying Officer</Table.Cell>
                            <Table.Cell> {this.state.surveyor[this.state.currVessels.id][0]}</Table.Cell>
                        </Table.Row>
                        <Table.Row >
                            <Table.Cell>Company</Table.Cell>
                            <Table.Cell> {this.state.surveyor[this.state.currVessels.id][1]}</Table.Cell>
                        </Table.Row>
                        <Table.Row >
                            <Table.Cell>Title</Table.Cell>
                            <Table.Cell> {this.state.surveyor[this.state.currVessels.id][2]}</Table.Cell>
                        </Table.Row>
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
                        <Breadcrumb.Section active>Pending</Breadcrumb.Section>
                    </Breadcrumb>
                    <h2> Hello, {this.userData.firstName}  {ConstSwitch.accountBadge(this.userData.userType)} </h2>
                    < Modal
                        centered
                        dimmer={'blurring'}
                        closeOnEscape={!this.state.loadingDecision}
                        closeOnDimmerClick={!this.state.loadingDecision}
                        className='Modal-Registered'
                        onClose={() => this.setState({ showModal: false, searchBar: this.initialState })}
                        onOpen={() => this.setState({ showModal: true, searchBar: this.initialState })}
                        open={this.state.showModal}

                    >
                        <Modal.Header>Vessel Registration</Modal.Header>
                        <Modal.Content scrolling image>
                            <Image className='Registered-Image' size='medium' src={yacht_img} wrapped />

                            <Modal.Description>
                                <Tab className='Registered-Tab' menu={{ fluid: false, tabular: true }} panes={this.panes} />
                            </Modal.Description>


                        </Modal.Content>
                        <Modal.Actions>
                            {this.state.currVessels.reg_state === REG_STATE_PENDING_REG_APPROVAL ?
                                <>
                                    <Button variant="success" disabled={this.state.loadingDecision} onClick={() => this.appReviewAxios(this.state.currVessels.registration_info_id, DECISION_APPROVED)}>Approve</Button>{'\xa0'}
                                    <Button variant="danger" disabled={this.state.loadingDecision} onClick={() => this.appReviewAxios(this.state.currVessels.registration_info_id, DECISION_REJECTED)}>Deny</Button>{'\xa0'}
                                    {/*<Button variant="info" disabled={this.state.loadingDecision} onClick={() => this.setState({ showModal: false })}>Add Surveyor</Button>{'\xa0'}*/}
                                </>
                                :
                                <>
                                {''} {/*<><Button variant="info" disabled={this.state.loadingDecision} onClick={() => this.setState({ showModal: false })}>Add Surveyor</Button>{'\xa0'}</>*/}
                                </>
                            }
                            <Button variant="secondary" disabled={this.state.loadingDecision} onClick={() => this.setState({ showModal: false, searchBar: this.initialState })}>Close</Button>
                        </Modal.Actions>
                    </Modal>
                    <ReactBootStrap.Table className="Registrar-table" striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Vessel Name</th>
                                <th>Port</th>
                                <th>Applicant</th>
                                <th>Status</th>
                                <th>Date Applied</th>
                                <th>Surveyed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.loadingTable === true ?
                                <tr>
                                    <td colSpan="6" rowSpan="2">
                                        <Spinner as="span" size="sm" animation="border" />{'\xa0'}
                                            Loading...
                                            </td>
                                </tr>
                                :
                                this.state.pendingVessels.length === 0 ?
                                    <tr>
                                        <td colSpan="6"> {"Table is empty. No Pending Vessels."}</td>
                                    </tr>
                                    :
                                    this.state.pendingVessels.map((this.renderPending))
                            }
                        </tbody>
                    </ReactBootStrap.Table>
                </div>
            </div>
        );
    }
}