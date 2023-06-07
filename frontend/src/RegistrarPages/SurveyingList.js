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
import { Button, Modal, Image, Breadcrumb, Table, Tab } from 'semantic-ui-react'
import yacht_img from '../components/yacht.jpeg'
import * as ConstSwitch from '../constants/ConstantSwitch'
import * as DateHelpers from '../containers/helpers/date'
import { PORT_VCT, PORT_SBG, PORT_BAR, PORT_WHT } from '../constants/constants'
import { Search } from "semantic-ui-react";
import { SURVEYOR_LIST } from '../constants/constants'
import _ from "lodash";

//Show list of vessels and only vessels allocated to be surveyed
// Vessel name & Company


//Allocate new vessels using a search function ontop of table
//Allocate new surveying vessels in registered tab
/////// Be able to select vessel in registered tab to bring up its details, allocate to surveying button
////// Add column in registered vessels on whether or not the vessel needs to be surveyed and by whom
////// if column is blank, it is not being surveyed by anyone (Surveyed By)

//Vessel can be registered without being surveyed before

// Add surveying in pending tab as well

// For Companies, show list of vessels they are currently surveying

// Maximum width of view port


//Mounting Issue

export default class SurveyingList extends Component {
    _isMounted = false;
    constructor(props) {
        super(props)





        this.joint_owners = [['Example 1', 'Example', 'Example'],
        ['Example 2', 'Example', 'Example'],
        ['Example 3', 'Example', 'Example']]

        this.initialState = {
            isLoading: false,
            results: [],
            value: "",
            return_val: []
        };

        this.state = {
            registeredVessels: [],
            currVessels: { joint_owners: ['', '', ''] },
            showModal: false,
            loadingTable: true,
            searchBar: this.initialState
        }

        this.pendingVessels = [
            { ship_name: "Mayflower", port: PORT_WHT, user: "Larry Jacobs", surveyingCo: "Uk Shipping Co" },
            { ship_name: "Sea Queen", port: PORT_SBG, user: "Kara Berricua", surveyingCo: "Boat Inc" },
            { ship_name: "The Black Pearl", port: PORT_BAR, user: "Madison Presley", surveyingCo: "Vessel World Wide" },
            { ship_name: "Bachelor's Delight", port: PORT_VCT, user: "Sergio Patt", surveyingCo: "Sea Registry Co" }
        ]



        this.userData = JSON.parse(window.localStorage.getItem("userData"));


        let tempSurveyingVessels = Object.keys(SURVEYOR_LIST).map(function (key) {
            let surveyingVessels = []
            for (var name in SURVEYOR_LIST[key]) {
                surveyingVessels = [...surveyingVessels, SURVEYOR_LIST[key][name]]
            }

            return surveyingVessels;
        });

        this.surveyingVessels = []

        for (var name in tempSurveyingVessels) {
            this.surveyingVessels = this.surveyingVessels.concat(tempSurveyingVessels[name][1])
        }

        console.log('list: ', this.surveyingVessels)

    }

    handleResultSelect = (e, { result }) => {
        this.setState({
            searchBar: {
                isLoading: false,
                value: result.title,
                results: this.state.searchBar.results,
                return_val: [result.title, result.description, result.vessel_type]
            }
        });

        console.log('On Select: ', [result.title, result.description, result.vessel_type])
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




    renderPending = (vesselsManaged, index) => {
        return (
            <tr key={index} onClick={() => this.setState({ currVessels: vesselsManaged, showModal: true })}>
                <td>{vesselsManaged.ship_name}</td>
                <td>{ConstSwitch.checkPort(vesselsManaged.port)}</td>
                <td>{vesselsManaged.user}</td>
                <td>{vesselsManaged.surveyingCo}</td>
            </tr>
        )
    }

    renderSurveying = (vesselsManaged, index) => {
        return (
            <tr key={index} >
                <td>{vesselsManaged.title}</td>
                <td>{vesselsManaged.description}</td>
                <td>{vesselsManaged.operation}</td>
            </tr>
        )
    }


    panes = [
        {
            menuItem: { key: 'pending', icon: 'edit', content: 'Ships Surveying' },
            render: () =>
                <Tab.Pane>
                    <ReactBootStrap.Table className="Registrar-table" striped bordered hover size="sm">
                        <thead>
                            <tr>
                                <th>Vessel Name</th>
                                <th>Port</th>
                                <th>Applicant</th>
                                <th>Surveyed By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.pendingVessels.map((this.renderPending))}
                        </tbody>
                    </ReactBootStrap.Table>
                </Tab.Pane>
        },
        {
            menuItem: { key: 'surveying', icon: 'building', content: 'Surveying Companies' },
            render: () =>
                <div className='Survey-Table'>
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

                    <Tab.Pane>
                        <ReactBootStrap.Table className="Registrar-table" striped bordered hover size="sm">
                            <thead>
                                <tr>
                                    <th>Surveying Officer</th>
                                    <th>Company</th>
                                    <th>Title</th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.surveyingVessels.map((this.renderSurveying))}
                            </tbody>
                        </ReactBootStrap.Table>
                    </Tab.Pane>
                </div>
        },
    ]

    renderShipData = (owner) => {
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
                    <Table.Cell>Ship Type</Table.Cell>
                    <Table.Cell>{owner.ship_type}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Registered Under</Table.Cell>
                    <Table.Cell>{owner.user_id}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>IMO Number</Table.Cell>
                    <Table.Cell>IMO {owner.imo_num}</Table.Cell>
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
                    <Table.Cell>Propulsion Method</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkPropType(owner.prop_method)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Propulsion Power</Table.Cell>
                    <Table.Cell>{owner.prop_power}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Build Date</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.build_date)}</Table.Cell>
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
                    <Table.Cell>Keel Date</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.keel_date)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Date Applied</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.date_applied)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Date Approved</Table.Cell>
                    <Table.Cell>{DateHelpers.shortDate(owner.date_approved)}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Surveyed By</Table.Cell>
                    <Table.Cell>{owner.surveyingCo}</Table.Cell>
                </Table.Row>
                <Table.Row >
                    <Table.Cell>Registration Status</Table.Cell>
                    <Table.Cell>{ConstSwitch.checkRegState(owner.reg_state)}</Table.Cell>
                </Table.Row>
            </Table.Body>
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


    panesModal = [
        {
            menuItem: { key: 'pending', icon: 'address card', content: 'Vessel Information' },
            render: () =>
                <Tab.Pane>
                    <Table className='Vessel-Registration-Table' selectable definition collapsing striped columns={2} verticalAlign='middle' textAlign='center'>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell />
                                <Table.HeaderCell>Description</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>

                        {this.renderShipData(this.state.currVessels)}
                    </Table>
                </Tab.Pane>
        },
        {
            menuItem: { key: 'pending', icon: 'group', content: 'Vessel Owners' },
            render: () =>
                <Tab.Pane>
                    <Table className='Vessel-Registration-Table' selectable collapsing striped columns={3} verticalAlign='middle' textAlign='center'>
                        <Table.Header>
                            <Table.HeaderCell>Owners</Table.HeaderCell>
                            <Table.HeaderCell>Share</Table.HeaderCell>
                            <Table.HeaderCell >Eligibility</Table.HeaderCell>
                        </Table.Header>
                        <Table.Body>
                            {this.joint_owners.map((this.renderOwners))}
                        </Table.Body>
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
                        <Breadcrumb.Section active>Surveying</Breadcrumb.Section>
                    </Breadcrumb>
                    <h2> Hello, {this.userData.firstName}  {ConstSwitch.accountBadge(this.userData.userType)} </h2>

                    <Tab menu={{ fluid: true, tabular: true }} panes={this.panes} />
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
                                <Tab className='Registered-Tab' menu={{ fluid: false, tabular: true }} panes={this.panesModal} />

                            </Modal.Description>
                        </Modal.Content>
                        <Modal.Actions>
                            <Button variant="secondary" onClick={() => this.setState({ showModal: false })}>Done</Button>
                        </Modal.Actions>
                    </Modal>

                </div>
            </div>
        );
    }
}