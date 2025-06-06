sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, MessageBox) {
        "use strict";

        return Controller.extend("com.eros.customerrecord.controller.MainView", {
            onInit: function () {
                this.oModel = this.getOwnerComponent().getModel();
                this.oModel.setSizeLimit(1000);
                this.custModel = new JSONModel();
                this.getView().setModel(this.custModel, "custModel");
            },
            onAddAddress: function () {

                if (!this.getView().byId("workSection").getVisible()) {
                    this.getView().byId("workSection").setVisible(true);
                }
                else if (!this.getView().byId("otherSection").getVisible()) {
                    this.getView().byId("otherSection").setVisible(true);
                }
            },
            onCustomerTypeChange: function (oEvent) {

                if (oEvent.getParameter("selectedItem").getProperty("key") === "TOURIST") {
                    this.getView().byId("cardTypelbl").setRequired(true);
                    this.getView().byId("issuedBylbl").setRequired(true);
                    this.getView().byId("cardNumberlbl").setRequired(true);
                    this.getView().byId("cardExpirylbl").setRequired(true);
                    this.getView().getModel("custModel").setProperty("/Code","");
                }
                else {
                    this.getView().byId("cardTypelbl").setRequired(false);
                    this.getView().byId("issuedBylbl").setRequired(false);
                    this.getView().byId("cardNumberlbl").setRequired(false);
                    this.getView().byId("cardExpirylbl").setRequired(false);
                    this.getView().getModel("custModel").setProperty("/Code","00971");
                }

            },
            onSearchNumber: function (oEvent) {
                var that = this;
                var searchNumber = oEvent.getParameter("query");
                var aFilters = [];

                aFilters.push(new sap.ui.model.Filter("Mobile", sap.ui.model.FilterOperator.EQ, searchNumber));
                this.oModel.read("/CustomerSet",
                    {
                        filters: aFilters,
                        success: function (oData) {
                            if (oData) {
                                if (oData.results.length > 0) {
                                    that.getView().getModel("custModel").setData({});
                                    that.getView().getModel("custModel").setData(oData.results[0]);
                                    if ((oData.results[0].HomeAddressLine1 !== "") || (oData.results[0].HomeAddressLine2 !== "")) {
                                        that.getView().byId("addHomeType").setSelectedKey("1");
                                    }
                                    if ((oData.results[0].OfficeAddressLine1 !== "") || (oData.results[0].OfficeAddressLine2 !== "")) {
                                        that.getView().byId("addWorkType").setSelectedKey("2");
                                        that.getView().byId("workSection").setVisible(true);
                                    }
                                    if ((oData.results[0].OtherAddressLine1 !== "") || (oData.results[0].OtherAddressLine2 !== "")) {
                                        that.getView().byId("addOtherType").setSelectedKey("3");
                                        that.getView().byId("otherSection").setVisible(true);
                                    }
                                    that.getView().getModel("custModel").refresh();

                                }
                                else {
                                    sap.m.MessageBox.show("Customer does not exist. Kindly add it", {
                                        icon: sap.m.MessageBox.Icon.Error,
                                        title: "Error",
                                        actions: [MessageBox.Action.OK],
                                        onClose: function (oAction) {
                                            if (oAction === MessageBox.Action.OK) {
                                                that.getView().getModel("custModel").setData({});
                                            }
                                        }
                                    });
                                }
                            }

                        },
                        error: function (oError) {
                            sap.m.MessageBox.show("Customer does not exist. Kindly add it", {
                                icon: sap.m.MessageBox.Icon.Error,
                                title: "Error",
                                actions: [MessageBox.Action.OK],
                                onClose: function (oAction) {
                                    if (oAction === MessageBox.Action.OK) {
                                        that.getView().getModel("custModel").setData({});
                                    }
                                }
                            });
                        }
                    });
            },
            convertToYYYYMMDD: function(dateStr) {
                // Check if already in yyyyMMdd format
                if(/^\d{ 8}$ /.test(dateStr)) {
            return dateStr;
        }

        // Check if in dd/MM/yyyy format
        const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (match) {
            const [, day, month, year] = match;
            return `${year}${month}${day}`;
        }

        // Return original if format doesn't match
        return dateStr;
    },
      validateCustomer: function () {
                var bFlag;
                var custData = this.getView().getModel("custModel").getData();
                var errorMessage = "";

                // Basic Required Fields
               
                
                if (!custData.FirstName || custData.FirstName.trim() === "") {
                    errorMessage += "First Name is required.\n";
                }
                if (!custData.Code || custData.Code.trim() === "") {
                    errorMessage += "Country Code is required.\n";
                }
                if (!custData.Mobile || custData.Mobile.trim() === "") {
                    errorMessage += "Mobile Number is required.\n";
                }
                if (!custData.CustomerType || custData.CustomerType.trim() === "") {
                    errorMessage += "Customer Type is required.\n";
                }

                // Additional fields for Tourist (CustType === "2")
                if (custData.CustomerType === "TOURIST") {
                    if (!custData.IdentityType || custData.IdentityType.trim() === "") {
                        errorMessage += "Identity Type is required for Tourists.\n";
                    }
                    if (!custData.IdentityIssuedBy || custData.IdentityIssuedBy.trim() === "") {
                        errorMessage += "Identity Document Issued By is required for Tourists.\n";
                    }
                    if (!custData.IdentityNumber || custData.IdentityNumber.trim() === "") {
                        errorMessage += "Identity Document Number is required for Tourists.\n";
                    }
                    if (this.getView().byId("expiryDate").getValue() === "") {
                        errorMessage += "Identity Expiry Date is required.\n";
                    }
                }

                

                // Show message if there are errors
                if (errorMessage.length > 0) {
                    sap.m.MessageBox.error(errorMessage);
                    bFlag = false;
                }
                else {
                    bFlag = true;
                }

                return bFlag;


            },
    onSave: function (oEvent) {
        var that = this;
        var data = this.getView().getModel("custModel").getData();
        var birthDate = this.getView().byId("birthDate").getValue();
        var expiryDate = this.getView().byId("expiryDate").getValue();
         var bFlag = this.validateCustomer();

        if (birthDate) {
            data.BirthDate =new Date(birthDate);
        }
        else {
            data.BirthDate = null;
        }
        if (expiryDate) {
            data.IdentityExpiry = new Date(expiryDate);
        }
        else {
            data.IdentityExpiry = null;
        }
        
        if (data.CustomerType === "TOURIST") {
            if (data.IdentityExpiry && data.IdentityIssuedBy && data.IdentityIssuedBy && data.IdentityType) {
                
                this.getView().byId("cardType").setValueState("None");
                this.getView().byId("issuedBy").setValueState("None");
                this.getView().byId("cardNumber").setValueState("None");
                this.getView().byId("expiryDate").setValueState("None");
            }
            else {
            
                this.getView().byId("cardType").setValueState("Error");
                this.getView().byId("issuedBy").setValueState("Error");
                this.getView().byId("cardNumber").setValueState("Error");
                this.getView().byId("expiryDate").setValueState("Error");

            }
        }
        
        if (bFlag) {
            this.oModel.create("/CustomerSet", data, {
                success: function (oData) {
                    that.getView().getModel("custModel").setData({});
                    that.getView().byId("_IDGenSearchField").setValue("");
                    sap.m.MessageToast.show("Entry Created Successfully");
                },
                error: function (oError) {
                    sap.m.MessageToast.show("Error Creating Entry");

                }
            });
        }
       
    }
        });
    });
