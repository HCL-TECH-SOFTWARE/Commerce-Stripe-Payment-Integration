# Stripe Payment Integration - React Storefront

## Steps to include the Stripe UI component in the React Store

1. Install and include the below package 

      `npm install react-stripe-checkout`
      
2. Include the `stripe` folder inside `src/components` folder.It has stripe-checkout.tsx file which is stripe UI component.

3. Do the following changes in order.ts file placed inside `src/redux/reducer` folder
     Add the following code which start and end with comment "STRIPE INTEGRATION" inside the Case "PAYMETHODS_GET_SUCCESS" to add the stripe payment option.
       
          
              builder.addCase(
              ACTIONS.PAYMETHODS_GET_SUCCESS,
              (state: OrderReducerState, action: AnyAction) => {
                const response = action.response;
                if (response && response.usablePaymentInformation) {
                  let cardsList: any[] = [];
                  let cashList: any[] = [];
              /**STRIPE INTEGRATION**/
                  let walletList: any[] = [];
                  /**STRIPE INTEGRATION**/
                  for (let payment of response.usablePaymentInformation) {
                    if (
                      payment.paymentMethodName === PAYMENT.paymentMethodName.amex ||
                      payment.paymentMethodName === PAYMENT.paymentMethodName.mc ||
                      payment.paymentMethodName === PAYMENT.paymentMethodName.visa
                    ) {
                      cardsList.push(payment);
                    } else if (
                      payment.paymentMethodName === PAYMENT.paymentMethodName.cod
                    ) {
                      cashList.push(payment);
                    }/**STRIPE INTEGRATION**/else if (
                      payment.paymentMethodName === PAYMENT.paymentMethodName.paypal || payment.paymentMethodName === PAYMENT.paymentMethodName.stripe 
                    ) {
                      walletList.push(payment);
                    }
                /**STRIPE INTEGRATION**/
                  }

                  if (cardsList.length > 0) {
                    state.payMethods = cardsList.concat(cashList);
                  }else {
                    state.payMethods = cashList;
                  }
              /**STRIPE INTEGRATION**/
                  state.payMethods =[...state.payMethods,...walletList];
              /**STRIPE INTEGRATION**/
                }
              }
            );
         
      
4.  Add the constant varibles for stripe in `constants/order.ts` file as shown below

         export const PAYMENT = {
          paymentMethodName: {
            cod: "COD",
            mc: "Master Card",
            visa: "VISA",
            amex: "AMEX",
            paypal:"BT_PayPal",
          /**STRIPE INTEGRATION**/
            stripe:"Stripe"
          /**STRIPE INTEGRATION**/
          },
          paymentDisplayName: {
            mc: "Mastercard",
            visa: "Visa",
            amex: "American Express",
          },
          /**STRIPE INTEGRATION**/
          payOptions: { cod: "COD", cc: "CC",paypal:"BT_PayPal" ,stripe:"Stripe"},
          /**STRIPE INTEGRATION**/
        };
         
5. Add the following changes in the `src/components/widgets/checkout-payment/checkout-payment.tsx` file

      - Add the state variables for the stripe Payment
         
             /**STRIPE INTEGRATION**/
              const [stripeTransactionFlag, setStripeTransactionFlag] = useState<boolean>(false);
              const [stripePayload, setStripePayload] = useState<any>({});
              /**STRIPE INTEGRATION**/
        
      -  add the below statement in `togglePayOption` method in the IF condition 
          
              if (
                paymentTCId &&
                paymentTCId !== "" &&
                payment.payMethodId !== PAYMENT.paymentMethodName.cod &&
                payment.payMethodId !== PAYMENT.paymentMethodName.paypal &&
              /**STRIPE INTEGRATION**/
                payment.payMethodId !== PAYMENT.paymentMethodName.stripe
              /**STRIPE INTEGRATION**/
              ) 
      
      - add the below changes in `isValidPaymentMethod` method
      
           Add the statement in the IF condition
          
            if (
              selectedPaymentInfoList[paymentNumber].payMethodId !==
              PAYMENT.paymentMethodName.cod &&  && /**STRIPE INTEGRATION**/selectedPaymentInfoList[paymentNumber].payMethodId !==
              PAYMENT.paymentMethodName.stripe/**STRIPE INTEGRATION**/
            ) 
         
           Add the else if part in the same `isValidPaymentMethod()` method
         
             /**STRIPE INTEGRATION**/else if (selectedPaymentInfoList[paymentNumber].payMethodId === PAYMENT.paymentMethodName.stripe) {
                  return (stripeTransactionFlag) ? true : false;
                }
              /**STRIPE INTEGRATION**/
      
      -  add below changes in the `submit()` method
           
           add the statement in the IF condition
           
              if (
                selectedPaymentInfoList[i].payMethodId !==
                PAYMENT.paymentMethodName.cod && selectedPaymentInfoList[i].payMethodId !==
                PAYMENT.paymentMethodName.paypal &&/**STRIPE INTEGRATION**/ selectedPaymentInfoList[i].payMethodId !==
                PAYMENT.paymentMethodName.stripe/**STRIPE INTEGRATION**/
              )
      
            Add the if block inside submit for the stripe payload
            
                 /**STRIPE INTEGRATION**/
                  if (selectedPaymentInfoList[i].payMethodId === PAYMENT.paymentMethodName.stripe) {
                    body = {
                      ...body,
                      ...stripePayload
                    };
                  }
                /**STRIPE INTEGRATION**/
                
      - add the below function in the payment file
       
            /**STRIPE INTEGRATION**/
              function onSuccessTransactionStripeToken(payload) {
                console.log(payload);
                const { id, email } = payload;
                setStripeTransactionFlag(true);
                setStripePayload({
                  pay_token: id,
                  StripeEmailId: email
                })
              }
            /**STRIPE INTEGRATION**/
      
      
      - add the stripe props `onSuccessTransactionStripeToken` in the PaymentMethodContainer component. 
      
             <PaymentMethodContainer
                paymentInfo={selectedPaymentInfoList[currentPaymentNumber]}
                ....
                onSucessTransactionOfPaypal={onSucessTransactionOfPaypal}
                /**STRIPE INTEGRATION**/
                onSuccessTransactionStripeToken={onSuccessTransactionStripeToken}
                /**STRIPE INTEGRATION**/
              />
              
      
 6. Add the below changes in the `src/components/widgets/PaymentMethodContainer/PaymentMethodContainer.tsx` file
          
        -Add the onSuccessTransactionStripeToken props in the interface
        
              interface PaymentMethodContainerProps {
                ....
                paypaladressDetails : Object;
                onSucessTransactionOfPaypal: Function;
                /**STRIPE INTEGRATION**/
                onSuccessTransactionStripeToken: Function;
                /**STRIPE INTEGRATION**/
              }
              
         -Pull the values from the Props
         
                 const {
                  usableBillAddresses,
                  ...
                  paypaladressDetails,
                  onSucessTransactionOfPaypal,
                /**STRIPE INTEGRATION**/
                  onSuccessTransactionStripeToken
                /**STRIPE INTEGRATION**/
                } = props;
             
         -Pass the onSuccessTransactionStripeToken value as prop to PaymentMethodSelection component.
         
               <PaymentMethodSelection
                paymentInfo={paymentInfo}
                ...
                paypaladressDetails={paypaladressDetails}
                onSucessTransactionOfPaypal={onSucessTransactionOfPaypal}
                /**STRIPE INTEGRATION**/
                onSuccessTransactionStripeToken={onSuccessTransactionStripeToken}
                /**STRIPE INTEGRATION**/
              />
       
   7. Add the below changes in the `src/components/widgets/PaymentMethodSelection/PaymentMethodSelection.tsx` file 
  
         -Add the onSuccessTransactionStripeToken props in the interface
         
               interface PaymentMethodSelectionProps {
               ...
               paypaladressDetails: Object;
                onSucessTransactionOfPaypal: Function;
                /**STRIPE INTEGRATION**/
                onSuccessTransactionStripeToken: Function;
                /**STRIPE INTEGRATION**/
              }
      
          -Pull the values from the Props
         
                const {
                  ...
                  paymentsList,
                  paypaladressDetails,
                  onSucessTransactionOfPaypal,
                /**STRIPE INTEGRATION**/
                  onSuccessTransactionStripeToken
                /**STRIPE INTEGRATION**/
                } = props;
                
          -  update the HTML code placed inside the render() method to render the stripe payment on the UI (Please refer the updated PaymentMethodSelection component for the render method)
      
         
      
      
      
      
      
      
      
      
      



