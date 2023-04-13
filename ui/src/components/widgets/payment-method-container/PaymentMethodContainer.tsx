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

//Standard libraries
import React, { useEffect } from "react";
//Custom libraries
import { PaymentMethodSelection } from "../../widgets/payment-method-selection";
import { PaymentInfoType } from "../../pages/checkout/payment/Payment";
import CheckoutAddress, {
  CheckoutPageType,
} from "../../pages/checkout/address/Address";
//UI
import { Divider } from "@material-ui/core";

interface PaymentMethodContainerProps {
  paymentInfo: PaymentInfoType;
  currentPaymentNumber: number;
  usableBillAddresses: any[] | null;
  setSelectedAddressId: Function; //setter fn to set selected billing address id
  createNewAddress: boolean;
  setCreateNewAddress: Function;
  setEditAddress: Function;
  editAddress: boolean;
  togglePayOption: Function;
  handleCreditCardChange: Function;
  isValidCardNumber: Function;
  isValidCode: Function;
  useMultiplePayment: boolean;
  paymentsList: any[];
  isPersonalAddressAllowed: string;
  orgAddressDetails: any[];
  paypaladressDetails : Object;
  onSucessTransactionOfPaypal: Function;
  onSuccessTransactionStripeToken: Function;
}

/**
 * PaymentMethodContainer component
 * displays billing address selection component and payment method selection component
 * @param props
 */
const PaymentMethodContainer: React.FC<PaymentMethodContainerProps> = (
  props: PaymentMethodContainerProps
) => {
  const {
    usableBillAddresses,
    paymentInfo,
    currentPaymentNumber,
    setSelectedAddressId,
    createNewAddress,
    setCreateNewAddress,
    setEditAddress,
    editAddress,
    togglePayOption,
    handleCreditCardChange,
    isValidCardNumber,
    isValidCode,
    useMultiplePayment,
    paymentsList,
    isPersonalAddressAllowed,
    orgAddressDetails,
    paypaladressDetails,
    onSucessTransactionOfPaypal,
	/**STRIPE INTEGRATION**/
    onSuccessTransactionStripeToken
	/**STRIPE INTEGRATION**/
  } = props;

  const [paymentChosen, setPaymentChosen] = React.useState<boolean>(false);

  useEffect(() => {
    if (paymentInfo && paymentInfo.policyId && paymentInfo.payMethodId) {
      setPaymentChosen(true);
    }
  }, [paymentInfo]);

  return (
    <>
      {!createNewAddress && !editAddress && (
        <>
          <PaymentMethodSelection
            paymentInfo={paymentInfo}
            currentPaymentNumber={currentPaymentNumber}
            togglePayOption={togglePayOption}
            handleCreditCardChange={handleCreditCardChange}
            isValidCardNumber={isValidCardNumber}
            isValidCode={isValidCode}
            useMultiplePayment={useMultiplePayment}
            paymentsList={paymentsList}
            paypaladressDetails={paypaladressDetails}
            onSucessTransactionOfPaypal={onSucessTransactionOfPaypal}
			/**STRIPE INTEGRATION**/
            onSuccessTransactionStripeToken={onSuccessTransactionStripeToken}
			/**STRIPE INTEGRATION**/
          />
          <Divider className="top-margin-3 bottom-margin-2" />
        </>
      )}

      <CheckoutAddress
        usableAddresses={usableBillAddresses || []}
        page={CheckoutPageType.PAYMENT}
        setSelectedAddressId={setSelectedAddressId}
        selectedAddressId={paymentInfo?.addressId ? paymentInfo.addressId : ""}
        toggleCreateNewAddress={setCreateNewAddress}
        createNewAddress={createNewAddress}
        editAddress={editAddress}
        toggleEditAddress={setEditAddress}
        isPersonalAddressAllowed={isPersonalAddressAllowed}
        orgAddressDetails={orgAddressDetails}
        paymentChosen={paymentChosen}
      />
    </>
  );
};

export { PaymentMethodContainer };
