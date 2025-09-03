export default {
	initValues () {
		storeValue("statready", "Week Stats Pending");
		// storeValue("dstatready", "Day Stats Pending");
//		storeValue("dbsync","db sync in progress")
	},
	  async runAllStats() {
    try {
      await get_weekstat.runStatsQueries();
      console.log("✅ get_weekstat.runStatsQueries succeeded");
    } catch (error) {
      console.warn("⚠️ get_weekstat.runStatsQueries failed:", error);
    }

//    try {
//      await get_daystat2.runStatsQueries();
//      console.log("✅ get_daystat2.runStatsQueries succeeded");
//    } catch (error) {
//      console.warn("⚠️ get_daystat2.runStatsQueries failed:", error);
//    }

    console.log("🚀 All stat queries attempted");
  }
}