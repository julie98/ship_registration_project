/*
 * Author: Christian Alexis Ocon
 * File: NoMatch_404.js
 */

import React, { Component } from 'react'
import Error_Ship from '../components/giphy.gif'
import './NoMatch_404.css'

export default class NoMatch_404 extends Component {
    render() {
        return (
            <div className="Error_Page">
                <h1> ERROR 404: You are lost at sea  </h1>
                <img src={Error_Ship} alt="File under the sea" />
            </div>
        );
    }
}