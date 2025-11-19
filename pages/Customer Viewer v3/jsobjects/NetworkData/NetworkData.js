export default {
  getCustomerData: () => {
    const selectedAccount = appsmith.store.statclickaccount;
    const allData = manipTable.tableData || [];
    const ivpServicesData = getIVPServices.data || [];

    // Filter for selected customer
    const filtered = allData.filter(
      (row) => row.account_no === selectedAccount,
    );

    return {
      selectedAccount: selectedAccount,
      customerData: filtered, // Returns actual array, not string!
      ivpServices: ivpServicesData, // IVP services lookup data with uuid and Region Name
    };
  },
};