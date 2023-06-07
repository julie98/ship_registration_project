/***************************************************
 * Author: Christian Ocon 
 * File Name: App.js
 * Description:
 *      This file works as our router for all of
 *      our program.
 ****************************************************/

import React, { Component } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './WebsitePages/Home';
import VesselsList from './UserPages/VesselsList';
import NoMatch_404 from './WebsitePages/NoMatch_404';
import NavigationBar from './Navbar/NavigationBar';
import Contact  from './WebsitePages/Contact';
import  Notices  from './WebsitePages/Notices';
import  ServicesBroker  from './WebsitePages/ServicesBroker';
import Policy from './WebsitePages/Policy';
import Services from './WebsitePages/Services';
import userSettings from './UserPages/userSettings';
import Registration from './UserPages/Registration';
import CommercialRegistration from './UserPages/CommercialRegistration';
import PersonalRegistration from './UserPages/PersonalRegistration';
import UsersList from './RegistrarPages/UsersList';
import PendingList from './RegistrarPages/PendingList';
import SurveyingList from './RegistrarPages/SurveyingList';
import RegisteredList from './RegistrarPages/RegisteredList';
import DeniedList from "./RegistrarPages/DeniedList";
import RegistrationPayment from './UserPages/RegistrationPayment'


/***************************************
 * Some paths need to be wrapped since they
 * are forms that we want to keep a consistent
 * layout for.
 * 
 * Other paths have their preset layout.
 * 
 * We also have a path for unknown paths
 ****************************************/
class App extends Component {
  render() {
    return (
        <Router>
          <NavigationBar />
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/contact" component={Contact} />
            <Route path="/notices" component={Notices} />
            <Route path="/policy" component={Policy} />
            <Route path="/registrar/users" component = {UsersList}/>
            <Route path="/registrar/pending" component = {PendingList}/>
            <Route path="/registrar/registered" component = {RegisteredList}/>
            <Route path="/registrar/denied" component = {DeniedList}/>
            <Route path="/registrar/surveying" component = {SurveyingList}/>
            <Route exact path="/services" component={Services} />
            <Route path="/services/broker" component={ServicesBroker} />
            <Route path="/userSettings" component={userSettings} />
            <Route path="/vessels/list" component = {VesselsList} />
            <Route path="/payment/:reg_id" component = {RegistrationPayment} />

            <Route exact path="/register" component = {Registration} />
            <Route exact path="/register/commercial" component = {CommercialRegistration} />
            <Route exact path="/register/personal" component = {PersonalRegistration} />

            <Route component={NoMatch_404} />
          </Switch>
        </Router>
    );
  }
}

export default App;
