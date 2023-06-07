import React, { Component } from 'react';
import './Registration.css';
import axiosInstance from '../containers/helpers/axios'
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from "@stripe/stripe-js/pure";
import CheckoutForm from "./CheckoutForm";



const stripePromise = loadStripe('pk_test_51HtcSQC3o9vvjq8u984APQli5dp0aK81Sr0BLSlgNNSRB2MJFvbWm7wqg6BSuJdWqdx7D2eHWlw3APZLOOnwaFZA00RqSNJXsZ');
export default class RegistrationPayment extends Component {
    constructor(props) {
        super(props);
        this.stripeKey = null;

        // Get stripe API pub key
        axiosInstance.get('/payment/config/')
            .then((res) => {
                console.log(res.data)
                this.stripeKey = res.data.publicKey;

                // this.stripePromise = loadStripe(this.stripeKey)
            })
            .catch((err) => {
                console.log(err)
            })

        this.reg_id = this.props.match.params.reg_id
        console.log(this.reg_id)
    }


    render() {

        return (
            <Elements className='Stripe' stripe={stripePromise}>
                <CheckoutForm data={{ reg_id: this.reg_id, enablePayment: true, fee_type: "regfee"}} />
            </Elements>
        );
    }

}