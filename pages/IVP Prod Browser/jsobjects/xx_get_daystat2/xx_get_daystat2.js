export default {
  dailystats: [],

  runStatsQueries: async () => {
    // Keep your compatibility-safe "status" in storeValue
    storeValue("dstatready", "Day Stats Pending");

    try {
      const services = Get_Services.data?.result ?? [];

      const fetchStat = async (service) => {
        const rp = service.relatedParty?.[0]?.id;
        const sid = service.id;
        if (!rp || !sid) return { service, error: 'missing ids' };
        try {
          const stats = await getStatsToday.run({ relatedPartyId: rp, serviceId: sid });
          return { service, stats };
        } catch {
          return { service, error: 'Failed to fetch stats' };
        }
      };

      const retryFetchAll = async (items, retries = 2, delay = 500) => {
        const results = await Promise.all(items.map(fetchStat));
        const failures = results.filter(r => r.error);
        if (failures.length && retries > 0) {
          console.warn(`Retrying ${failures.length} failed items…`);
          await new Promise(res => setTimeout(res, delay));
          const retried = await retryFetchAll(failures.map(f => f.service), retries - 1, delay * 2);
          return results.filter(r => !r.error).concat(retried);
        }
        return results.filter(r => !r.error);
      };

      const finalResults = await retryFetchAll(services);

      const processed = finalResults.map(r => ({
        relatedPartyId: r.service.relatedParty[0].id,
        serviceId: r.service.id,
        ...r.stats,
      }));

      // In-memory mutation, because performance matters
      this.dailystats = processed;

      // Store the updated status as before
      storeValue("dstatready", "Day Stats Ready");

      return processed;
    } catch (e) {
      console.error("Fatal error in runStatsQueries:", e);
      showAlert("Error running stats queries", "error");

      this.dailystats = [];
      storeValue("dstatready", "Stats Failed");

      return [];
    }
  }
};