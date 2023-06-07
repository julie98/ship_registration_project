import {CardElement, useElements, useStripe} from "@stripe/react-stripe-js";
import React, {useState} from "react";
import axiosInstance from "../containers/helpers/axios";
import {useHistory } from "react-router-dom";

const CheckoutForm = (data) => {
    const [error, setError] = useState(null);
    const [email, setEmail] = useState('');
    const stripe = useStripe();
    const elements = useElements();

    const history = useHistory();

    // Handle real-time validation errors from the card Element.
    const handleChange = (event) => {
        if (event.error) {
            setError(event.error.message);
        } else {
            setError(null);
        }
    }

    // Handle form submission.
    const handleSubmit = async (event) => {
        event.preventDefault();
        const card = elements.getElement(CardElement);

        const {paymentMethod, error} = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
        });
        console.log(paymentMethod)
        console.log(data, data.data.reg_id, data.data.enablePayment)

        if (error) {
            setError(error.response.data)
        } else {
            axiosInstance.post('/payment/save-stripe-info/', {
                email,
                payment_method_id: paymentMethod.id,
                fee_type: data.data.fee_type,
                reg_id: data.data.reg_id,
            }).then(response => {
                console.log(response.data);

                console.log('trying to redirect');
                history.push('/vessels/list') //TODO redirect back to /vessels/list

            }).catch(error => {
                console.log(error)
            })
        }
    }

    return (
        <form onSubmit={handleSubmit} className="stripe-form">
            <div className="form-row">
                <label htmlFor="email">
                    Email Address
                </label>
                <input
                    className="form-input"
                    id="email"
                    name="name"
                    type="email"
                    placeholder="jenny.rosen@example.com"
                    required
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);
                    }}
                />
            </div>
            <div className="form-row">
                <label htmlFor="card-element">
                    Credit or Debit card
                </label>

                <CardElement
                    id="card-element"
                    onChange={handleChange}
                />
                <div className="card-errors" role="alert">{error}</div>
            </div>
            <button type="submit" disabled={!data.data.enablePayment}
            className="submit-btn">Submit Payment</button>
        </form>
    )
}

export default CheckoutForm;