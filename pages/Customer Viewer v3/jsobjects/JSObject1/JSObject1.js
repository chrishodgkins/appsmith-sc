export default {
  // Function 1: Clear store variables and fetch query data on page initialization
  onPageLoad: () => {
    return Promise.all([
      storeValue('statclickaccount', ''),
      storeValue('statclick', ''),
      lp_visibility.run()  // Execute the query
    ]);
  }
}