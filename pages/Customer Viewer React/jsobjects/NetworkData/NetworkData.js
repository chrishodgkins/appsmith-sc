export default {
  getCustomerData: () => {
    const selectedAccount = appsmith.store.statclickaccount;
    const allData = manipTable.tableData || [];
    
    // Filter for selected customer
    const filtered = allData.filter(row => row.account_no === selectedAccount);
    
    return {
      selectedAccount: selectedAccount,
      customerData: filtered  // Returns actual array, not string!
    };
  }
}