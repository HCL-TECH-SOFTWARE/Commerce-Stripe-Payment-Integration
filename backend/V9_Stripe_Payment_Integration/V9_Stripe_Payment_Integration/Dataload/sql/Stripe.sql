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

INSERT INTO policy (POLICY_ID,POLICYNAME,POLICYTYPE_ID,STOREENT_ID,PROPERTIES,STARTTIME,ENDTIME,OPTCOUNTER) 
VALUES ((select max(POLICY_ID)+1 from policy),'Stripe','Payment',11,'attrPageName=StandardStripe&paymentConfigurationId=default&display=true&compatibleMode=false',null,null,1);

INSERT INTO policydesc (POLICY_ID,LANGUAGE_ID,DESCRIPTION,LONGDESCRIPTION,TIMECREATED,TIMEUPDATED,OPTCOUNTER) 
VALUES (( select POLICY_ID from policy where policyname = 'Stripe' ), -1 ,'Stripe','Stripe',CURRENT TIMESTAMP,CURRENT TIMESTAMP,1);

INSERT INTO POLICYCMD (POLICY_ID,BUSINESSCMDCLASS,PROPERTIES,OPTCOUNTER) VALUES ((select POLICY_ID from policy where policyname = 'Stripe'),'com.ibm.commerce.payment.actions.commands.DoPaymentActionsPolicyCmdImpl',null,1);
INSERT INTO POLICYCMD (POLICY_ID,BUSINESSCMDCLASS,PROPERTIES,OPTCOUNTER) VALUES ((select POLICY_ID from policy where policyname = 'Stripe'),'com.ibm.commerce.payment.actions.commands.EditPaymentInstructionPolicyCmdImpl',null,1);
INSERT INTO POLICYCMD (POLICY_ID,BUSINESSCMDCLASS,PROPERTIES,OPTCOUNTER) VALUES ((select POLICY_ID from policy where policyname = 'Stripe'),'com.ibm.commerce.payment.actions.commands.QueryPaymentsInfoPolicyCmdImpl',null,1);