export default {
  // Function 1: Clear store variables on page initialization
  onPageLoad: () => {
    return Promise.all([
      storeValue('statclickaccount', ''),
      storeValue('statclick', '')
    ]);
  }
}