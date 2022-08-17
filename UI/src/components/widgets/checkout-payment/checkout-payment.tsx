/*
 *==================================================
 * Licensed Materials - Property of HCL Technologies
 *
 * HCL Commerce
 *
 * (C) Copyright HCL Technologies Limited 2020
 *
 *==================================================
 */
//Standard libraries
import { useTranslation } from "react-i18next";
//Foundation libraries
import { useCheckoutPayment } from "../../../_foundation/hooks/use-checkout-payment";
//Custom libraries
import { PaymentMethodContainer } from "../payment-method-container";
import { PurchaseOrderNumber } from "../purchase-order-number";
import { PaymentInfoList } from "../payment-info-list";
//UI
import { Divider } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import {
  StyledBox,
  StyledButton,
  StyledGrid,
  StyledPaper,
  StyledSwitch,
  StyledTypography,
} from "@hcl-commerce-store-sdk/react-component";

const CheckoutPayment: React.FC = (props: any) => {
  const {
    createNewAddress,
    editAddress,
    addNewPayment,
    useMultiplePayment,
    handleMultiplePaymentChange,
    setCreateNewAddress,
    setEditAddress,
    handleCancelNewPayment,
    currentPaymentNumber,
    isPersonalAddressAllowed,
    isB2B,
    isPONumberRequired,
    poNumber,
    handlePONumberChange,
    isValidPO,
    selectedPaymentInfoList,
    isValidCardNumber,
    isValidCode,
    handleAddNewPayment,
    allowMorePayments,
    back,
    canContinue,
    submit,
    isValidPayment,
    grandTotalforErrorMsg,
    handleEditPayment,
    handleDeletePayment,
    handleSavePayment,
    getMaximumPiAmount,
    handlePiAmountChange,
    editPayment,
    updateSelectedPaymentInfoList,
    isOrderTotalMet,
    isEditPayment,
    isValidPaymentList,
    paypalAddressdetails,
    onSuccessTransactionStripeToken
    
  } = useCheckoutPayment(props);

  const { t } = useTranslation();
  return (
    <StyledPaper className="vertical-padding-2 horizontal-padding-2">
      <StyledGrid
        container
        direction="row"
        alignments="center"
        justifyContent="flex-start"
        spacing={2}>
        {!createNewAddress && !editAddress && !addNewPayment && !editPayment ? (
          <>
            <StyledGrid item>
              <StyledBox
                display="flex"
                flexDirection="row"
                alignItems="center"
                className="full-height">
                <StyledTypography variant="h4" component="p">
                  {t("Payment.Title")}
                </StyledTypography>
              </StyledBox>
            </StyledGrid>
            <StyledGrid item>
              <StyledSwitch
                checked={useMultiplePayment}
                setChecked={handleMultiplePaymentChange}
                label={t("Payment.Labels.UseMultiple")}
              />
            </StyledGrid>
            <StyledGrid item>
              <StyledTypography variant="body1" className="error top-margin-1">
                {t("PaymentInfoList.Msgs.PayMethodNote")}
              </StyledTypography>
            </StyledGrid>
          </>
        ) : (
          <>
            <StyledGrid item>
              <StyledButton
                variant="text"
                onClick={() => {
                  setCreateNewAddress(false);
                  setEditAddress(false);
                  handleCancelNewPayment();
                }}>
                <StyledTypography variant="h4" component="p">
                  {t("Payment.Title")}
                </StyledTypography>
              </StyledButton>
            </StyledGrid>
            <StyledGrid item>
              <StyledBox
                variant="div"
                display="inline-flex"
                alignItems="center"
                className="full-height">
                <ChevronRightIcon />
              </StyledBox>
            </StyledGrid>
            <StyledGrid item>
              {!(createNewAddress || editAddress) ? (
                <StyledTypography variant="h4" component="p">
                  {t("Payment.Labels.PaymentMethod", {
                    number: currentPaymentNumber + 1,
                  })}
                </StyledTypography>
              ) : createNewAddress ? (
                <StyledGrid item>
                  <StyledTypography variant="h4" component="p">
                    {t("Shipping.Labels.AddNewAddress")}
                  </StyledTypography>
                </StyledGrid>
              ) : (
                <StyledGrid item>
                  <StyledTypography variant="h4" component="p">
                    {t("Shipping.Labels.EditAddress")}
                  </StyledTypography>
                </StyledGrid>
              )}
            </StyledGrid>
          </>
        )}
      </StyledGrid>
      <Divider className="top-margin-3 bottom-margin-2" />

      {isB2B && isPONumberRequired && !createNewAddress && !editAddress && (
        <>
          <PurchaseOrderNumber
            poNumber={poNumber}
            handlePONumberChange={handlePONumberChange}
            isValidPO={isValidPO}
          />
          <Divider className="top-margin-3 bottom-margin-2" />
        </>
      )}

      {!useMultiplePayment ||
      (useMultiplePayment && (addNewPayment || editPayment)) ? (
        <PaymentMethodContainer
          paymentInfo={selectedPaymentInfoList[currentPaymentNumber]}
          currentPaymentNumber={currentPaymentNumber}
          setCreateNewAddress={setCreateNewAddress}
          createNewAddress={createNewAddress}
          editAddress={editAddress}
          setEditAddress={setEditAddress}
          isValidCardNumber={isValidCardNumber}
          isValidCode={isValidCode}
          isValidPayment={isValidPayment}
          useMultiplePayment={useMultiplePayment}
          isPersonalAddressAllowed={isPersonalAddressAllowed}
          getMaximumPiAmount={getMaximumPiAmount}
          handleAddNewPayment={handleAddNewPayment}
          handleCancelNewPayment={handleCancelNewPayment}
          updateSelectedPaymentInfoList={updateSelectedPaymentInfoList}
          handleSavePayment={handleSavePayment}
          allowMorePayments={allowMorePayments}
          paypaladressDetails={paypalAddressdetails}
		  /**STRIPE INTEGRATION**/
          onSuccessTransactionStripeToken={onSuccessTransactionStripeToken}
		  /**STRIPE INTEGRATION**/
        />
      ) : (
        <>
          <PaymentInfoList
            selectedPaymentInfoList={selectedPaymentInfoList}
            handleAddNewPayment={handleAddNewPayment}
            allowMorePayments={allowMorePayments}
            handleEditPayment={handleEditPayment}
            handleDeletePayment={handleDeletePayment}
            handlePiAmountChange={handlePiAmountChange}
            getMaximumPiAmount={getMaximumPiAmount}
            isEditPayment={isEditPayment}
            isValidPaymentList={isValidPaymentList}
          />
          <Divider className="top-margin-3 bottom-margin-2" />
        </>
      )}

      {!createNewAddress && !editAddress && !addNewPayment && !editPayment && (
        <StyledGrid
          container
          spacing={1}
          justifyContent="space-between"
          className="checkout-actions">
          <StyledGrid item xs={false}>
            <StyledButton color="secondary" onClick={() => back()}>
              {t("Payment.Actions.Back")}
            </StyledButton>
          </StyledGrid>

          <StyledGrid
            item
            xs
            spacing={1}
            container
            justifyContent="flex-end"
            className="checkout-actions">
            {useMultiplePayment ? (
              <StyledGrid item>
                {!addNewPayment &&
                !editPayment &&
                selectedPaymentInfoList.length > 0 &&
                allowMorePayments ? (
                  <StyledButton color="secondary" onClick={handleAddNewPayment}>
                    {t("Payment.Actions.AddAnotherPayMethod")}
                  </StyledButton>
                ) : null}
              </StyledGrid>
            ) : null}
            <StyledGrid item>
              <StyledButton
                color="primary"
                disabled={!canContinue()}
                onClick={() => submit()}>
                {t("Payment.Actions.Next")}
              </StyledButton>
            </StyledGrid>
          </StyledGrid>
        </StyledGrid>
      )}
      {selectedPaymentInfoList.length > 0 &&
      !isOrderTotalMet() &&
      !addNewPayment &&
      !editPayment &&
      useMultiplePayment ? (
        <StyledGrid
          item
          xs
          spacing={2}
          container
          justifyContent="flex-end"
          className="checkout-actions">
          <StyledGrid item>
            <StyledTypography variant="body1" className="error top-margin-1">
              {t("PaymentInfoList.Msgs.InsufficientPayment", {
                grandTotal: grandTotalforErrorMsg,
              })}
            </StyledTypography>
          </StyledGrid>
        </StyledGrid>
      ) : null}
      {selectedPaymentInfoList.length > 0 &&
      !isValidPaymentList() &&
      !addNewPayment &&
      !editPayment &&
      useMultiplePayment ? (
        <StyledGrid
          item
          xs
          spacing={2}
          container
          justifyContent="flex-end"
          className="checkout-actions">
          <StyledGrid item>
            <StyledTypography variant="body1" className="error top-margin-1">
              {t("PaymentInfoList.Msgs.CardDetailsUpdate")}
            </StyledTypography>
          </StyledGrid>
        </StyledGrid>
      ) : null}
    </StyledPaper>
  );
};
export default CheckoutPayment;
