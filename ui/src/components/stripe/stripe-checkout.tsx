/**
*==================================================
Copyright [2021] [HCL Technologies]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*==================================================
**/

import React from 'react';
import { useSelector } from 'react-redux';
import StripeCheckout from 'react-stripe-checkout';
import { userNameSelector } from '../../redux/selectors/user';

const StripeCheckoutButton: React.FC<any> = (props: any) => {
    let { grandTotal, grandTotalCurrency } = props.address;
    const { firstName, lastName } = useSelector(userNameSelector);
    const StripeKey = "<STRIPE PUBLIC KEY>";
    let price = grandTotal * 100;
    
    let userName = firstName ? firstName :lastName;

   return (
        <>
            <StripeCheckout
                amount={price}
                label="Pay with Card"
                name={userName}
                billingAddress
                shippingAddress
                image="https://svgshare.com/i/CUz.svg"
                description={`Your Total is ${grandTotal}`}
                panelLabel="Pay Now"
                currency={grandTotalCurrency}
                token={props.onSuccess}
                // alipay={true}
                // bitcoin={true}
                stripeKey={StripeKey}
            />
        </>
    )
}
export default StripeCheckoutButton;