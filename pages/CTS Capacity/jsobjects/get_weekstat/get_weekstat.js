export default {
  runStatsQueries: async () => {
    storeValue("statready", "Week Stats Pending");

    try {
      const services = Array.isArray(GetSecCoServices.data?.result)
        ? GetSecCoServices.data.result
        : [];

      if (!services.length) {
        showAlert("No CTS services found.", "warning");
        storeValue("ctsweeklystats", []);
        storeValue("statready", "No CTS Services");
        return [];
      }

      const fetchStat = async (service) => {
        try {
          const stats = await getStats.run({
            relatedPartyId: "AC1003",
            serviceId: service.id
          });
          return { service, stats };
        } catch (err) {
          return { service, error: err?.message || "Failed to fetch stats" };
        }
      };

      const retryFetchAll = async (items, retries = 2, delay = 500) => {
        const results = await Promise.all(items.map(fetchStat));
        const failures = results.filter(r => r.error);
        if (failures.length && retries > 0) {
          console.warn(`Retrying ${failures.length} failed items…`);
          await new Promise(res => setTimeout(res, delay));
          const retried = await retryFetchAll(
            failures.map(f => f.service),
            retries - 1,
            delay * 2
          );
          return results.filter(r => !r.error).concat(retried);
        }
        return results.filter(r => !r.error);
      };

      const finalResults = await retryFetchAll(services);

      const processed = finalResults.map(r => ({
        serviceId: r.service.id,
        serviceName: r.service.name,
        status: r.service.status,
        ...r.stats
      }));

      storeValue("ctsweeklystats", processed);
      storeValue("statready", "CTS Week Stats Ready");

      return processed;
    } catch (e) {
      console.error("Fatal error in runStatsQueries:", e);
      showAlert("Error running CTS weekly stats", "error");
      storeValue("ctsweeklystats", []);
      storeValue("statready", "Stats Failed");
      return [];
    }
  }
};