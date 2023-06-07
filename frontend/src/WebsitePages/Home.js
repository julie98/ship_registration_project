/***************************************************
 * Author: Haoyu Zhu
 * File Name: Home.js
 * Description:
 *      This file is the Landing page of our website
 ****************************************************/

import React, { Component } from 'react';
import { Card, Image } from 'semantic-ui-react';
import './Home.css';
import NavigationBar from '../Navbar/NavigationBar';
import { OurCarousel } from "./OurCarousel";
import broker_ship from '../components/broker_ship.jpg';
import individual_ship from '../components/individual_ship.jpg';
import commercial_ship from '../components/commercial_ship.jpg';
import boy from '../components/boy.png';
import commercial1 from '../components/enterprise.png';
import commercial2 from '../components/group.png';
import girl from '../components/girl.png';
import employee from '../components/employee.png';

import { FaCalendarCheck } from 'react-icons/fa';
import { FaSync } from 'react-icons/fa';
import { FaCheckCircle } from 'react-icons/fa';


export default class Home extends Component {
    render() {
        return (
            <div className='Home'>
                <NavigationBar />
                <OurCarousel />

                <Card.Group centered>
                    <Card color='violet'>
                        <a href='/services/broker'>
                            <Image src={broker_ship} />
                        </a>
                        <Card.Content header='Broker'/>
                        <Card.Content description='Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Tristique risus nec feugiat in fermentum posuere urna nec. Sed elementum tempus egestas
                        sed sed risus pretium quam vulputate.'/>
                    </Card>

                    <Card color='green'>
                        <a href='/services/individual'>
                            <Image src={individual_ship} />
                        </a>
                        <Card.Content header='Individual'/>
                        <Card.Content description='Lorem ipsum dolor sit amet, consectetur adipiscing elit,
                        sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Nec nam aliquam sem et tortor consequat id porta. Amet tellus cras adipiscing enim eu turpis.'/>
                    </Card>

                    <Card color='orange'>
                        <a href='/services/commercial'>
                            <Image src={commercial_ship} />
                        </a>
                        <Card.Content header='Commercial'/>
                        <Card.Content description='Lorem ipsum dolor sit amet,
                        consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                        Sit amet porttitor eget dolor morbi. Duis ut diam quam nulla porttitor.'/>
                    </Card>

                </Card.Group>


                {/*<div className='flex-container'>*/}

                {/*    <div className='flex-item'>*/}
                {/*        <a href='/services/broker'>*/}
                {/*            <img src={broker_ship} alt='' />*/}
                {/*        </a>*/}
                {/*        <div className='text'>*/}
                {/*            <h4>Broker</h4>*/}
                {/*            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt*/}
                {/*                ut labore et dolore magna aliqua. Tristique risus nec feugiat in fermentum posuere urna nec.*/}
                {/*                Sed elementum tempus egestas sed sed risus pretium quam vulputate.</p>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    <div className='flex-item'>*/}
                {/*        <a href='/services/individual'>*/}
                {/*            <img src={individual_ship} alt='' />*/}
                {/*        </a>*/}
                {/*        <div className='text'>*/}
                {/*            <h4>Individual</h4>*/}
                {/*            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt*/}
                {/*                ut labore et dolore magna aliqua. Nec nam aliquam sem et tortor consequat id porta.*/}
                {/*                Amet tellus cras adipiscing enim eu turpis.</p>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    <div className='flex-item'>*/}
                {/*        <a href='/services/commercial'>*/}
                {/*            <img src={commercial_ship} alt='' />*/}
                {/*        </a>*/}
                {/*        <div className='text'>*/}
                {/*            <h4>Commercial</h4>*/}
                {/*            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt*/}
                {/*                ut labore et dolore magna aliqua. Sit amet porttitor eget dolor morbi.*/}
                {/*                Duis ut diam quam nulla porttitor.</p>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*</div>*/}


                <div className='flex-container2'>
                    <div className='flex-item2'>
                        <div className='icon'>
                            {/*<i className='fa fa-calendar-check-o fa-3x'/>*/}
                            <FaCalendarCheck />
                        </div>
                        <div className='text2'>
                            <h5>Same Day Registration</h5>
                            <p>No hassle, no fuss. Get your registration done the same day as you apply!</p>
                        </div>
                    </div>

                    <div className='flex-item2'>
                        <div className='icon'>
                            {/*<i className='fa fa-refresh fa-3x'/>*/}
                            <FaSync />
                        </div>
                        <div className='text2'>
                            <h5>Year Long Registration</h5>
                            <p>Receive convenient reminders when your registration is up for renewal.</p>
                        </div>
                    </div>

                    <div className='flex-item2'>
                        <div className='icon'>
                            {/*<i className='fa-check-circle-o fa-3x'/>*/}
                            <FaCheckCircle />
                        </div>
                        <div className='text2'>
                            <h5>Coast Guard Approved</h5>
                            <p>Travelling on international waters has never been easier!</p>
                        </div>
                    </div>

                </div>

                <div className='flex-container3'>
                    <div className='text3'>
                        <h3>Our Clients</h3>
                        <p>Trusted by 10,000 customers worldwide</p>
                    </div>
                    <div className='flex-item3'>
                        <div className='image-container'>
                            <img src={commercial1} alt='' />
                            <div className='image-text'>Commercial Company</div>
                        </div>

                        <div className='image-container'>
                            <img src={commercial2} alt='' />
                            <div className='image-text'>Commercial Company</div>
                        </div>

                        <div className='image-container'>
                            <img src={employee} alt='' />
                            <div className='image-text'>Famous Broker</div>
                        </div>

                        <div className='image-container'>
                            <img src={girl} alt='' />
                            <div className='image-text'>Jane Beau</div>
                        </div>

                        <div className='image-container'>
                            <img src={boy} alt='' />
                            <div className='image-text'>John Doe</div>
                        </div>

                    </div>
                </div>

                <div className='footer'>
                    <p>Copyright &copy; 2020 NaDoT. All rights reserved.</p>
                </div>

            </div>



        );
    }
}




