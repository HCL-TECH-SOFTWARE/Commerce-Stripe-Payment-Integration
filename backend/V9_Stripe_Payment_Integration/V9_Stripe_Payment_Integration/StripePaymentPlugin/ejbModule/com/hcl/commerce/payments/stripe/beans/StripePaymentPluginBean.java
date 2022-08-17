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
package com.hcl.commerce.payments.stripe.beans;

import java.util.HashMap;
import java.util.Map;
import java.util.logging.Logger;

import javax.ejb.Local;
import javax.ejb.LocalBean;
import javax.ejb.Stateless;

import com.ibm.commerce.foundation.logging.LoggingHelper;
import com.ibm.commerce.payments.plugin.CommunicationException;
import com.ibm.commerce.payments.plugin.ConfigurationException;
import com.ibm.commerce.payments.plugin.ExtendedData;
import com.ibm.commerce.payments.plugin.FinancialTransaction;
import com.ibm.commerce.payments.plugin.FunctionNotSupportedException;
import com.ibm.commerce.payments.plugin.InvalidDataException;
import com.ibm.commerce.payments.plugin.InvalidPaymentInstructionException;
import com.ibm.commerce.payments.plugin.PaymentInstruction;
import com.ibm.commerce.payments.plugin.Plugin;
import com.ibm.commerce.payments.plugin.PluginContext;
import com.ibm.commerce.payments.plugin.PluginException;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Charge;
import com.stripe.model.issuing.Authorization;

/**
 * Session Bean implementation class StripePaymentPluginBean
 */

@Stateless(mappedName = "StripePaymentPluginBean")
@Local(Plugin.class)
@LocalBean
public class StripePaymentPluginBean implements Plugin {
	
	private static final String CLASS_NAME = "StripePaymentPluginBean";
	private static final Logger LOGGER = Logger.getLogger(CLASS_NAME);

	/**
	 * Default constructor.
	 */
	public StripePaymentPluginBean() {
	}

	@Override
	public FinancialTransaction approve(PluginContext pluginContext, FinancialTransaction transaction, boolean flag)
			throws CommunicationException, PluginException {
		final String METHOD_NAME = "approve";
		Stripe.apiKey = "<STRIPE PRIVATE KEY>";

		if (LoggingHelper.isEntryExitTraceEnabled(LOGGER))
			LOGGER.entering(CLASS_NAME, METHOD_NAME);
		
		ExtendedData data = transaction.getPayment().getPaymentInstruction().getExtendedData();
		
		try {
			String pay_token = data.getString("pay_token");
			int amount = (int) Math.round(100*transaction.getPayment().getPaymentInstruction().getAmount().doubleValue());
			Map<String, Object> chargeParams = new HashMap<String, Object>();
			
			chargeParams.put("amount", amount);
			chargeParams.put("currency", "USD");
			chargeParams.put("source", pay_token);
			chargeParams.put("description", "Payment is successfull");
			
			Charge charge = Charge.create(chargeParams);
			
		} catch (StripeException e) {
			transaction.setResponseCode("Error: StripeException");
			transaction.setReasonCode("See Extended Data");
			data.setString("Error", e.getMessage(), false);
			e.printStackTrace();
			throw new PluginException(e);
		} catch (Exception e) {
			transaction.setResponseCode("Error");
			transaction.setReasonCode("See Extended Data");
			data.setString("Error", e.getMessage(), false);
			e.printStackTrace();
			throw new PluginException(e);
		} finally {
			if (LoggingHelper.isEntryExitTraceEnabled(LOGGER))
				LOGGER.exiting(CLASS_NAME, METHOD_NAME);
		}
		
		return transaction;
	}

	@Override
	public FinancialTransaction approveAndDeposit(PluginContext pluginContext, FinancialTransaction transaction, boolean flag)
			throws FunctionNotSupportedException, PluginException {
		String METHOD_NAME = "approveAndDeposit";
		throw createFunctionNotSupportedException(pluginContext, transaction, METHOD_NAME);
	}

	@Override
	public boolean checkHealth() {
		// TODO Auto-generated method stub
		return false;
	}

	@Override
	public void checkPaymentInstruction(PluginContext pluginContext, PaymentInstruction transaction)
			throws InvalidPaymentInstructionException, ConfigurationException, InvalidDataException {
		// TODO Auto-generated method stub
		
	}

	@Override
	public FinancialTransaction credit(PluginContext pluginContext, FinancialTransaction transaction, boolean flag)
			throws PluginException {
		String METHOD_NAME = "credit";
		throw createFunctionNotSupportedException(pluginContext, transaction, METHOD_NAME);
	}

	@Override
	public FinancialTransaction deposit(PluginContext pluginContext, FinancialTransaction transaction, boolean flag)
			throws PluginException {
		String METHOD_NAME = "deposit";
		throw createFunctionNotSupportedException(pluginContext, transaction, METHOD_NAME);
	}

	@Override
	public String getMessage(PluginContext pluginContext, String transaction) {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public FinancialTransaction reverseApproval(PluginContext pluginContext, FinancialTransaction transaction, boolean flag)
			throws CommunicationException, PluginException {
		String METHOD_NAME = "reverseApproval";
		throw createFunctionNotSupportedException(pluginContext, transaction, METHOD_NAME);
	}

	@Override
	public FinancialTransaction reverseCredit(PluginContext pluginContext, FinancialTransaction transaction, boolean flag)
			throws InvalidPaymentInstructionException, FunctionNotSupportedException, InvalidDataException {
		String METHOD_NAME = "reverseCredit";
		throw createFunctionNotSupportedException(pluginContext, transaction, METHOD_NAME);
	}

	@Override
	public FinancialTransaction reverseDeposit(PluginContext pluginContext, FinancialTransaction transaction, boolean flag)
			throws FunctionNotSupportedException, PluginException {
		String METHOD_NAME = "reverseDeposit";
		throw createFunctionNotSupportedException(pluginContext, transaction, METHOD_NAME);
	}

	@Override
	public void validatePaymentInstruction(PluginContext pluginContext, PaymentInstruction transaction)
			throws InvalidPaymentInstructionException, FunctionNotSupportedException {
		// TODO Auto-generated method stub
		
	}
	
	private FunctionNotSupportedException createFunctionNotSupportedException(PluginContext pluginContext,
			FinancialTransaction tran, String methodName) {
		FunctionNotSupportedException e = new FunctionNotSupportedException();
		e.setClassSource("StripePaymentPlugin");
		e.setMethodSource(methodName);
		e.setMessageKey("PLUGIN_FUNCTION_NOT_SUPPORTED");
		e.addProperty("plugin context", pluginContext);
		e.addProperty("Financial transaction", tran);
		return e;
	}
}
