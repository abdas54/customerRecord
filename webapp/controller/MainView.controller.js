sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,JSONModel,MessageBox) {
        "use strict";

        return Controller.extend("com.eros.customerrecord.controller.MainView", {
            onInit: function () {
                this.oModel = this.getOwnerComponent().getModel();
                this.custModel = new JSONModel();
                this.getView().setModel(this.custModel,"custModel");
            },
            onAddAddress: function(){

                if(!this.getView().byId("workSection").getVisible()){
                    this.getView().byId("workSection").setVisible(true);
                }
                else if(!this.getView().byId("otherSection").getVisible()){
                    this.getView().byId("otherSection").setVisible(true);
                }
            },
            onCustomerTypeChange: function(oEvent){

                if(oEvent.getParameter("selectedItem").getProperty("key") === "2"){
                    this.getView().byId("cardTypelbl").setRequired(true);
                    this.getView().byId("issuedBylbl").setRequired(true);
                    this.getView().byId("cardNumberlbl").setRequired(true);
                }
                else{
                this.getView().byId("cardTypelbl").setRequired(false);
                this.getView().byId("issuedBylbl").setRequired(false);
                this.getView().byId("cardNumberlbl").setRequired(false);
                }

            },
            onSearchNumber: function(oEvent){
                var that=this;
                var searchNumber = oEvent.getParameter("query");
                this.oModel.read("/ZER_CUST_MASTERSet(Kunnr='',MobNo='" + searchNumber + "')", {
                    success: function(oData) {
                        if(oData){
                            
                            that.getView().getModel("custModel").setData({});
                            that.getView().getModel("custModel").setData(oData);
                            if((oData.home_add1 !== "") || (oData.home_add2 !== "")){
                                that.getView().byId("addHomeType").setSelectedKey("1");
                            }
                            if((oData.off_add1 !== "") || (oData.off_add2 !== "")){
                                that.getView().byId("addWorkType").setSelectedKey("2");
                                that.getView().byId("workSection").setVisible(true);
                            }
                            if((oData.oth_Add1 !== "") || (oData.oth_Add2 !== "")){
                                that.getView().byId("addOtherType").setSelectedKey("3");
                                that.getView().byId("otherSection").setVisible(true);
                            }
                            that.getView().getModel("custModel").refresh();
                            
                            
                        }
                        
                    },
                    error: function(oError) {
                        sap.m.MessageBox.show("Customer does not exist. Kindly add it",{
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
            onSave: function(oEvent){
                var that = this;
                var data = this.getView().getModel("custModel").getData();
                data.add_type="";
                this.oModel.create("/ZER_CUST_MASTERSet", data, {
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
        });
    });
