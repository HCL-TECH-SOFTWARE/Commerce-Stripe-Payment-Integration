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
import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import Axios, { Canceler } from "axios";
import { useHistory } from "react-router";
import getDisplayName from "react-display-name";
import getSymbolFromCurrency from "currency-symbol-map";
//Foundation libraries
import { useSite } from "./useSite";
import { localStorageUtil } from "../utils/storageUtil";
import paymentInstructionService from "../apis/transaction/paymentInstruction.service";
import { ACCOUNT, LOCALE } from "../constants/common";
//Custom libraries
import { PAYMENT_CONFIGS } from "../../configs/order";

import {
  PAYMENT,
  PO_NUMBER,
  EXPIRY,
  ACCOUNT_CC,
  CC_CVC,
  EXPIRE_YEAR,
  EXPIRE_MONTH,
} from "../../constants/order";
import * as ROUTES from "../../constants/routes";
import {
  IS_PERSONAL_ADDRESS_ALLOWED,
  STRING_TRUE,
  EMPTY_STRING,
  HYPHEN,
} from "../../constants/common";
import storeUtil from "../../utils/storeUtil";
//Redux
import {
  isCheckoutDisabledSelector,
  payMethodsSelector,
  cartSelector,
} from "../../redux/selectors/order";
import { activeOrgSelector } from "../../redux/selectors/organization";
import * as orderActions from "../../redux/actions/order";
import * as organizationAction from "../../redux/actions/organization";
import * as accountActions from "../../redux/actions/account";
import { addressDetailsSelector } from "../../redux/selectors/account";

export interface CreditCardFormDataType {
  account: string;
  expire_month: string;
  expire_year: string;
  cc_cvc: string;
}

export const CREDITCARDFORMDATA_INIT: CreditCardFormDataType = {
  account: EMPTY_STRING,
  expire_month: EXPIRY.MONTHS[0],
  expire_year: EXPIRY.YEARS[0],
  cc_cvc: EMPTY_STRING,
};

export interface PaymentInfoType {
  payMethodId: string;
  creditCardFormData: CreditCardFormDataType;
  addressId: string;
  piAmount: string;
  piCurrency: string;
  paymentTermConditionId: string;
  title: string;
  policyId: string;
}

/**
 * use checkout payment hook
 * @param props
 */
export const useCheckoutPayment = (props: any) => {
  const widgetName = getDisplayName("CheckoutPayment");
  const { isPONumberRequired } = props;
  const isCheckoutDisabled = useSelector(isCheckoutDisabledSelector);
  const payMethods = useSelector(payMethodsSelector);
  const cart = useSelector(cartSelector);
  const activeOrgId = useSelector(activeOrgSelector);
  const [currentPaymentNumber, setCurrentPaymentNumber] = useState<number>(0);
  const dispatch = useDispatch();
  const history = useHistory();
  const { mySite } = useSite();
  const CancelToken = Axios.CancelToken;
  let cancels: Canceler[] = [];
  const locale = localStorageUtil.get(LOCALE);
  const [paypalAddressdetails, setPaypalAddressDetails] = useState<any>({});
  const addressDetails: any = useSelector(addressDetailsSelector);

  /**Stripe POC */
  
  /**STRIPE INTEGRATION**/
  const [stripeTransactionFlag, setStripeTransactionFlag] = useState<boolean>(false);
  const [stripePayload, setStripePayload] = useState<any>({});
/**STRIPE INTEGRATION**/

  const isB2B = mySite ? mySite.isB2B : false;
  const PAYMENT_INFO_INIT: PaymentInfoType = {
    payMethodId: EMPTY_STRING,
    creditCardFormData: CREDITCARDFORMDATA_INIT,
    addressId: EMPTY_STRING,
    piAmount: cart.grandTotal,
    piCurrency: cart.grandTotalCurrency,
    paymentTermConditionId: EMPTY_STRING,
    policyId: EMPTY_STRING,
    title: EMPTY_STRING,
  };
  const [selectedPaymentInfoList, setSelectedPaymentInfoList] = useState<
    PaymentInfoType[]
  >([]);

  const [useMultiplePayment, setUseMultiplePayment] = useState<boolean>(false);

  const [createNewAddress, setCreateNewAddress] = useState<boolean>(false);
  const [editAddress, setEditAddress] = useState<boolean>(false);
  const [addNewPayment, setAddNewPayment] = useState<boolean>(false);
  const [editPayment, setEditPayment] = useState<boolean>(false);
  const [poNumber, setPONumber] = useState<string>(EMPTY_STRING);
  const [isEditPayment, setIsEditPayment] = useState<boolean>(false);
  const [isAddPayment, setIsAddPayment] = useState<boolean>(false);
  const [isReviewOrderClicked, setIsReviewOrderClicked] =
    useState<boolean>(false);

  const allowMorePayments = useMemo(
    () => isAllowMorePayments(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedPaymentInfoList]
  );
  const handlePONumberChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newPONumber = event.target.value;
    setPONumber(newPONumber);
  };

  const isPersonalAddressAllowed: string =
    cart && cart[IS_PERSONAL_ADDRESS_ALLOWED]
      ? cart[IS_PERSONAL_ADDRESS_ALLOWED]
      : STRING_TRUE;

  const payloadBase: any = {
    widget: widgetName,
    cancelToken: new CancelToken(function executor(c) {
      cancels.push(c);
    }),
  };

  const grandTotalforErrorMsg: string =
    getSymbolFromCurrency(cart.grandTotalCurrency) +
    parseFloat(cart.grandTotal);

    useEffect(() => {
      if (addressDetails && cart) {
        setPaypalAddressDetails({
          grandTotal: cart.grandTotal,
          grandTotalCurrency: cart?.grandTotalCurrency,
          shipping: addressDetails?.contactList[0],
  
        })
      }
    }, [addressDetails, cart])

  useEffect(() => {
    return () => {
      cancels.forEach((cancel) => cancel());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mySite) {
      let payload = {
        ...payloadBase,
      };
      dispatch(orderActions.GET_PAYMETHODS_ACTION(payload));
      dispatch(accountActions.GET_ADDRESS_DETAIL_ACTION(payload));
      const param: any = {
        storeId: mySite.storeId,
        organizationId: activeOrgId,
        ...payloadBase,
      };
      dispatch(organizationAction.GET_ORGANIZATION_ADDRESS_ACTION(param));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mySite, locale]);

  useEffect(() => {
    if (cart?.paymentInstruction?.length > 0) {
      let savedPaymentInfo = cart.paymentInstruction.map((pi) => {
        const payMethodId = pi.payMethodId;
        const paymentFromList = payMethods.filter(
          (payment) => payment.xumet_policyId === pi.xpaym_policyId
        )[0];

        let creditCardFormData = { ...CREDITCARDFORMDATA_INIT };

        if (payMethodId !== PAYMENT.paymentMethodName.cod) {
          if (pi.protocolData) {
            const pdAccount = pi.protocolData.find(
              (pd) => pd.name === ACCOUNT_CC
            );
            const pdMonth = pi.protocolData.find(
              (pd) => pd.name === EXPIRE_MONTH
            );
            const pdYear = pi.protocolData.find(
              (pd) => pd.name === EXPIRE_YEAR
            );
            if (pdAccount) {
              creditCardFormData[ACCOUNT_CC] = pdAccount.value;
            }
            if (pdMonth) {
              creditCardFormData[EXPIRE_MONTH] = pdMonth.value;
            }
            if (pdYear) {
              creditCardFormData[EXPIRE_YEAR] = pdYear.value;
            }
          }
        }

        const newPaymentInfo: PaymentInfoType = {
          payMethodId: payMethodId,
          creditCardFormData: creditCardFormData,
          addressId: pi.billing_address_id,
          piAmount: pi.piAmount,
          piCurrency: pi.piCurrency,
          paymentTermConditionId: paymentFromList?.paymentTermConditionId
            ? paymentFromList?.paymentTermConditionId
            : EMPTY_STRING,
          policyId: pi.xpaym_policyId,
          title: paymentFromList?.description,
        };
        return newPaymentInfo;
      });
      if (cart.paymentInstruction.length === 1) {
        let paymentInfo = savedPaymentInfo[0];
        if (paymentInfo) {
          paymentInfo.piAmount = cart.grandTotal;
          if (paymentInfo.creditCardFormData) {
            paymentInfo.creditCardFormData[ACCOUNT_CC] = EMPTY_STRING;
          }
          savedPaymentInfo.splice(0, 1, paymentInfo);
        }
        setUseMultiplePayment(false);
      } else {
        setUseMultiplePayment(true);
      }
      setSelectedPaymentInfoList(savedPaymentInfo);
    } else {
      setSelectedPaymentInfoList([Object.assign({}, PAYMENT_INFO_INIT)]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  useEffect(() => {
    if (cart && poNumber === EMPTY_STRING) {
      const poNumberFromStorage = localStorageUtil.get(
        ACCOUNT + HYPHEN + PO_NUMBER + HYPHEN + cart.orderId
      );

      if (
        poNumberFromStorage !== null &&
        poNumberFromStorage !== EMPTY_STRING
      ) {
        setPONumber(poNumberFromStorage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart]);

  /** Handle toggle between single/multiple payments */
  const handleMultiplePaymentChange = (event) => {
    const newUseMultiplePayment = event.target.checked;
    if (newUseMultiplePayment) {
      setSelectedPaymentInfoList([]);
      setCurrentPaymentNumber(-1);
    } else {
      const singlePaymentInit: PaymentInfoType = Object.assign(
        {},
        PAYMENT_INFO_INIT
      );
      setSelectedPaymentInfoList([singlePaymentInit]);
      setCurrentPaymentNumber(0);
    }
    setUseMultiplePayment(newUseMultiplePayment);
  };

  /** Handle adding new payments for multiple payments */
  const handleAddNewPayment = (
    newPaymentInfo: PaymentInfoType,
    paymentNumber: number
  ) => {
    if (allowMorePayments) {
      setAddNewPayment(true);
      setCurrentPaymentNumber(selectedPaymentInfoList.length);
      let newPaymentInfoList: PaymentInfoType[] =
        selectedPaymentInfoList.slice();
      if (newPaymentInfo && paymentNumber >= 0) {
        newPaymentInfoList.splice(paymentNumber, 1, newPaymentInfo);
      }
      const remainingPi =
        parseFloat(cart.grandTotal) -
        getRunningPaymentTotal(newPaymentInfoList);
      const newPaymentInit: PaymentInfoType = {
        ...PAYMENT_INFO_INIT,
        piAmount: remainingPi.toString(),
      };
      newPaymentInfoList.push(newPaymentInit);
      setSelectedPaymentInfoList(newPaymentInfoList);
      setIsAddPayment(true);
    }
  };

  /** Handle edit payment for multiple payments */
  const handleEditPayment = (paymentNumber: number) => {
    setEditPayment(true);
    setCurrentPaymentNumber(paymentNumber);
    let newPaymentInfoList: PaymentInfoType[] = selectedPaymentInfoList.slice();
    let newPaymentInfo = newPaymentInfoList[paymentNumber];
    if (newPaymentInfo && newPaymentInfo.creditCardFormData) {
      newPaymentInfo.creditCardFormData[ACCOUNT_CC] = EMPTY_STRING;
      newPaymentInfo.creditCardFormData[CC_CVC] = EMPTY_STRING;
      newPaymentInfoList.splice(paymentNumber, 1, newPaymentInfo);
      setSelectedPaymentInfoList(newPaymentInfoList);
    }
    setIsEditPayment(true);
  };

  /** Handle delete payment for multiple payments */
  const handleDeletePayment = (paymentNumber: number) => {
    setIsEditPayment(true);
    let newPaymentInfoList: PaymentInfoType[] = selectedPaymentInfoList.slice();
    newPaymentInfoList.splice(paymentNumber, 1);
    setSelectedPaymentInfoList(newPaymentInfoList);
  };

  /** Handle cancelling new payments for multiple payments */
  const handleCancelNewPayment = () => {
    if (addNewPayment) {
      let newPaymentInfoList: PaymentInfoType[] =
        selectedPaymentInfoList.slice();
      newPaymentInfoList.pop();
      setSelectedPaymentInfoList(newPaymentInfoList);
      setCurrentPaymentNumber(newPaymentInfoList.length - 1);
    }
    setAddNewPayment(false);
    setEditPayment(false);
  };

  /** Handle saving the new/updated payments for multiple payments */
  const handleSavePayment = (
    newPaymentInfo: PaymentInfoType,
    paymentNumber: number
  ) => {
    setAddNewPayment(false);
    setEditPayment(false);
    if (!addNewPayment && !editPayment && isEditPayment) {
      setIsEditPayment(false);
    }
    updateSelectedPaymentInfoList(newPaymentInfo, paymentNumber);
  };
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

  /**
   * Update the selectedPaymentInfoList state
   */
  function updateSelectedPaymentInfoList(
    newPaymentInfo: PaymentInfoType,
    paymentNumber: number
  ) {
    let newPaymentInfoList: PaymentInfoType[] = selectedPaymentInfoList.slice();
    newPaymentInfoList.splice(paymentNumber, 1, newPaymentInfo);
    setSelectedPaymentInfoList(newPaymentInfoList);
  }

  /**
   * Gets the maximum amount allowed for this payment method based on the running total of other payments   */
  const getMaximumPiAmount = (paymentNumber: number) => {
    if (selectedPaymentInfoList.length > 1) {
      let otherPayments: PaymentInfoType[] = selectedPaymentInfoList.slice();
      otherPayments.splice(paymentNumber, 1);
      return (
        parseFloat(cart.grandTotal) - getRunningPaymentTotal(otherPayments)
      );
    }
    return parseFloat(cart.grandTotal);
  };

  /**
   * Checks if more new payments are allowed
   * @returns Whether additional new payments are allowed
   */
  function isAllowMorePayments() {
    if (selectedPaymentInfoList.length >= PAYMENT_CONFIGS.maxNumPayment) {
      return false;
    }
    return !isOrderTotalMet();
  }

  /**
   * Checks if the list of payment method's piAmounts add up to the Order Total
   * @returns Whether the total piAmounts equals to the Order Total
   */
  function isOrderTotalMet() {
    if (selectedPaymentInfoList.length > 0) {
      return (
        parseFloat(cart.grandTotal) ===
        parseFloat(getRunningPaymentTotal(selectedPaymentInfoList).toFixed(2))
      );
    }
    return false;
  }

  /**
   * Gets the total piAmount from the specified payment list
   * @returns Total piAmount
   */
  function getRunningPaymentTotal(paymentList: PaymentInfoType[]) {
    if (paymentList?.length > 0) {
      return paymentList
        .map((p) => parseFloat(p.piAmount))
        .reduce((acc, val) => {
          return acc + val;
        });
    }
    return 0;
  }

  function handlePiAmountChange(valueAsNumber: number, paymentNumber: number) {
    if (valueAsNumber) {
      const newPaymentInfo: PaymentInfoType = {
        ...selectedPaymentInfoList[paymentNumber],
        piAmount: valueAsNumber.toString(),
      };

      let newPaymentInfoList: PaymentInfoType[] =
        selectedPaymentInfoList.slice();
      newPaymentInfoList.splice(paymentNumber, 1, newPaymentInfo);
      setSelectedPaymentInfoList(newPaymentInfoList);
      setIsEditPayment(true);
    }
  }

  /**
   * Checks if the entered credit card number is a numeric value
   * @returns Whether the card number format is valid.
   */
  function isValidCardNumber(account: string) {
    if (cart?.paymentInstruction?.length > 1 && !isEditPayment) {
      return true;
    }
    return storeUtil.isNumeric(account?.trim());
  }

  /**
   * Checks if the entered cvv code entered is a numeric value
   * @returns Whether the cvv code format is valid.
   */
  function isValidCode(cc_cvc: string) {
    if (cart?.paymentInstruction?.length > 1 && !isEditPayment) {
      return true;
    }
    return storeUtil.isNumeric(cc_cvc?.trim());
  }

  /**
   * Validate billing address id for a payment
   * @returns Whether or not the billing address is valid
   */
  function isValidBillingAddress(paymentInfo: PaymentInfoType) {
    if (paymentInfo.addressId === EMPTY_STRING) {
      return false;
    }

    return true;
  }

  /**
   * Validate payment options/credit card for a payment
   * @returns Whether or not the payment method is valid
   */
  function isValidPaymentMethod(paymentInfo: PaymentInfoType) {
    if (cart?.paymentInstruction?.length > 1 && !isEditPayment) {
      return true;
    }
    if (paymentInfo.paymentTermConditionId !== EMPTY_STRING) {
      return true;
    }
    if (paymentInfo.payMethodId !== PAYMENT.paymentMethodName.cod &&
      /**STRIPE INTEGRATION**/paymentInfo.payMethodId !==
      PAYMENT.paymentMethodName.stripe/**STRIPE INTEGRATION**/
      
      ) {
      if (paymentInfo.paymentTermConditionId === EMPTY_STRING) {
        for (let key in paymentInfo.creditCardFormData) {
          if (paymentInfo.creditCardFormData[key]?.trim() === EMPTY_STRING) {
            return false;
          }
        }
        if (
          isValidCardNumber(paymentInfo.creditCardFormData.account) === false
        ) {
          return false;
        }
        if (
          isValidCode(paymentInfo.creditCardFormData.cc_cvc) === false ||
          paymentInfo?.creditCardFormData.cc_cvc?.trim() === EMPTY_STRING
        ) {
          return false;
        }
        if (paymentInfo.creditCardFormData.account === EMPTY_STRING) {
          return false;
        }
      } else {
        if (isValidCode(paymentInfo.creditCardFormData.cc_cvc) === false) {
          return false;
        }
      }
    }
    /**STRIPE INTEGRATION**/else if (paymentInfo.payMethodId === PAYMENT.paymentMethodName.stripe) {
      debugger
      return (stripeTransactionFlag) ? true : false;
    }
	/**STRIPE INTEGRATION**/
    return true;
  }

  /**
   * Validate billing address id and payment options/credit card for a payment
   * @returns Whether or not the payment is valid
   */
  function isValidPayment(paymentInfo: PaymentInfoType) {
    if (!isValidBillingAddress(paymentInfo)) {
      return false;
    }
    if (!isValidPaymentMethod(paymentInfo)) {
      return false;
    }
    return true;
  }

  /**
   * Validate billing address id list and payment options/credit card inputs for all payments
   * @returns Whether or not all payment selections is valid
   */
  function isValidPaymentList() {
    if (selectedPaymentInfoList.length < 1) {
      return false;
    }

    for (let i = 0; i < selectedPaymentInfoList.length; i++) {
      const paymentInfo = selectedPaymentInfoList[i];
      if (!isValidBillingAddress(paymentInfo)) {
        return false;
      }
      if (!isValidPaymentMethod(paymentInfo)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validate whether po number is required and specified
   * @returns Whether po number is valid or needed
   */
  function isValidPO() {
    if (isPONumberRequired) {
      if (poNumber.trim() === EMPTY_STRING) {
        return false;
      }
    }
    return true;
  }

  /**
   * Validate whether shopper can proceed to next step
   * @returns Whether next step is allowed
   */
  function canContinue() {
    return (
      !isCheckoutDisabled &&
      isValidPaymentList() &&
      isValidPO() &&
      isOrderTotalMet()
    );
  }

  /**
   * Submit the selected payment method and billing address information
   */
  async function submit() {
    if (canContinue() && !isReviewOrderClicked) {
      setIsReviewOrderClicked(true);

      if (isPONumberRequired && cart) {
        localStorageUtil.set(
          ACCOUNT + HYPHEN + PO_NUMBER + HYPHEN + cart.orderId,
          poNumber
        );
      }

      if (isEditPayment || isAddPayment || !useMultiplePayment) {
        await paymentInstructionService.deleteAllPaymentInstructions({
          ...payloadBase,
        });

        const p = selectedPaymentInfoList.map(async (thisPayment) => {
          const {
            payMethodId,
            piAmount,
            addressId: billing_address_id,
            paymentTermConditionId,
          } = thisPayment;

          let body: any = { piAmount, billing_address_id, payMethodId };
          if (payMethodId !== PAYMENT.paymentMethodName.cod
            &&/**STRIPE INTEGRATION**/ payMethodId !==
          PAYMENT.paymentMethodName.stripe/**STRIPE INTEGRATION**/
            ) {
            if (paymentTermConditionId === EMPTY_STRING) {
              Object.assign(body, {
                account: thisPayment.creditCardFormData.account.trim(),
                expire_month: thisPayment.creditCardFormData.expire_month,
                expire_year: thisPayment.creditCardFormData.expire_year,
                cc_cvc: thisPayment.creditCardFormData.cc_cvc.trim(),
                cc_brand: payMethodId,
              });
            } else {
              Object.assign(body, {
                account: EMPTY_STRING,
                //cc_cvc: EMPTY_STRING,
                expire_month: EMPTY_STRING,
                expire_year: EMPTY_STRING,
                //cc_brand: payMethod,
                valueFromPaymentTC: STRING_TRUE,
                //paymentTermConditionId: thisPayment.paymentTermConditionId,
                //valueFromProfileOrder: "",
                //orderId: ".",
              });
            }
          }
          	/**STRIPE INTEGRATION**/
        if (payMethodId === PAYMENT.paymentMethodName.stripe) {
          body = {
            ...body,
            ...stripePayload
          };
        }
		/**STRIPE INTEGRATION**/
          const payload = { ...payloadBase, body };
          return paymentInstructionService.addPaymentInstruction(payload);
        });

        try {
          await Promise.all(p);
        } finally {
          setIsReviewOrderClicked(false);
        }
      } else {
        setIsReviewOrderClicked(false);
      }

      history.push(ROUTES.CHECKOUT_REVIEW);
    }
  }
  /**
   * Go back to the previous checkout step
   */
  function back() {
    history.push(ROUTES.CHECKOUT_SHIPPING);
  }

  return {
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
    payMethods,
    handleAddNewPayment,
    allowMorePayments,
    back,
    canContinue,
    submit,
    isValidPayment,
    setAddNewPayment,
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
  };
};
