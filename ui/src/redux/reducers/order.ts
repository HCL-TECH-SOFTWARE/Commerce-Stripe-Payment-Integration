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
import { createReducer, AnyAction } from "@reduxjs/toolkit";
import { NOT_FOUND } from "http-status-codes";
//Custom libraries
import { INVENTORY_STATUS, SHIPMODE, PAYMENT } from "../../constants/order";
import { ORDER_ID, HYPHEN } from "../../constants/common";
//Foundation libraries
import { localStorageUtil } from "../../_foundation/utils/storageUtil";
import { ACCOUNT } from "../../_foundation/constants/common";
//Redux
import * as ACTIONS from "../action-types/order";
import initStates from "./initStates";
import { OrderReducerState } from "./reducerStateInterface";
import { LOGOUT_SUCCESS_ACTION } from "../actions/user";

/**
 * Order reducer
 * handles states used by order related components
 * @param state State object managed by order reducer
 * @param action The dispatched action
 */

const orderReducer = createReducer(initStates.order, (builder) => {
  builder.addCase(
    ACTIONS.CART_FETCHING_REQUESTED,
    (state: OrderReducerState, action: AnyAction) => {
      state.isFetching = true;
    }
  );
  builder.addCase(
    ACTIONS.CART_GET_SUCCESS,
    (state: OrderReducerState, action: AnyAction) => {
      const response = action.response;
      if (response) {
        const { orderItem: orderItems, ...cart } = response;
        const newCatentries = action.catentries;
        const checkInventory = action.checkInventory;

        state.cart = cart;

        let count = 0;
        if (orderItems) {
          count = orderItems.reduce(
            (c: number, item: any) => +item.quantity + c,
            0
          );
        }
        state.numItems = count;

        let newOrderItems: any[] = [];
        let disableRecurringOrder = false;
        let disableCheckout = false;
        if (orderItems && orderItems.length > 0) {
          let catentries = state.catentries;

          if (newCatentries !== undefined) {
            catentries = newCatentries;
            state.catentries = newCatentries;
          }

          newOrderItems = [];
          orderItems.forEach((item: any, index: number) => {
            if (checkInventory) {
              if (
                item.orderItemInventoryStatus !== INVENTORY_STATUS.available &&
                item.orderItemInventoryStatus !== INVENTORY_STATUS.allocated
              ) {
                disableCheckout = true;
              }
            }
            let obj = {
              ...item,
            };
            const catentryId = item.productId;
            if (catentries != null) {
              const catentry = catentries[catentryId];
              if (catentry !== undefined) {
                if (catentry.name !== undefined) {
                  obj["name"] = catentry.name;
                }
                if (catentry.thumbnail !== undefined) {
                  obj["thumbnail"] = catentry.thumbnail;
                }
                if (catentry.attributes !== undefined) {
                  obj["attributes"] = catentry.attributes;
                }
                if (catentry.seo !== undefined) {
                  obj["seo"] = catentry.seo;
                }
                if (catentry.disallowRecurringOrder !== undefined) {
                  obj["disallowRecurringOrder"] =
                    catentry.disallowRecurringOrder;
                  if (catentry.disallowRecurringOrder === "1") {
                    disableRecurringOrder = true;
                  }
                }
              }
            }
            newOrderItems.push(obj);
          });

          state.isCheckoutDisabled = disableCheckout;
          state.isRecurringOrderDisabled = disableRecurringOrder;
        }
        state.orderItems = newOrderItems;
      }
      if (state.isRecurringOrderDisabled && state.cart && state.cart.orderId) {
        if (
          localStorageUtil.get(
            ACCOUNT + HYPHEN + ORDER_ID + HYPHEN + state.cart.orderId
          )
        ) {
          const recurringOrderInfo: any[] = [false, "0", null];
          localStorageUtil.set(
            ACCOUNT + HYPHEN + ORDER_ID + HYPHEN + state.cart.orderId,
            recurringOrderInfo
          );
        }
      }
      state.isFetching = false;
    }
  );

  builder.addCase(
    ACTIONS.CART_GET_ERROR,
    (state: OrderReducerState, action: AnyAction) => {
      if (
        action.error &&
        action.error.response &&
        action.error.response.status &&
        action.error.response.status === NOT_FOUND
      ) {
        state.cart = null;
        state.numItems = 0;
        state.orderItems = [];
      }
      state.isCheckoutDisabled = true;
      state.isFetching = false;
    }
  );

  builder.addCase(
    ACTIONS.SHIPINFO_GET_SUCCESS,
    (state: OrderReducerState, action: AnyAction) => {
      state.shipInfos = action.response;
    }
  );
  builder.addCase(
    ACTIONS.SHIPMODES_GET_SUCCESS,
    (state: OrderReducerState, action: AnyAction) => {
      const response = action.response;
      if (response && response.usableShippingMode) {
        state.shipModes = response.usableShippingMode.filter(
          (s) => s.shipModeCode !== SHIPMODE.shipModeCode.PickUp
        );
      }
    }
  );
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
  builder.addCase(LOGOUT_SUCCESS_ACTION, resetCart);
  builder.addCase(ACTIONS.CART_RESET_REQUESTED, resetCart);
});

function resetCart(state: OrderReducerState, action: AnyAction) {
  state.cart = null;
  resetCartInfo(state, action);
}

function resetCartInfo(state: OrderReducerState, action: AnyAction) {
  state.numItems = 0;
  state.orderItems = [];
  state.catentries = null;
  state.isCheckoutDisabled = false;
  state.shipInfos = null;
  state.shipModes = [];
  state.payMethods = [];
  state.isRecurringOrderDisabled = false;
  state.isFetching = false;
}

export default orderReducer;
