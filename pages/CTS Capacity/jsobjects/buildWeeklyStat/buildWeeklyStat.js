export default {
  prepareLineGraphData: () => {
    const allStats = appsmith.store.ctsweeklystats || [];

    const series = [];

    allStats.forEach(stat => {
      const { relatedPartyId, timePeriodData } = stat;
      if (!timePeriodData) return;

      // Handle inbound series
      if (Array.isArray(timePeriodData.inboundSeriesData)) {
        series.push({
          seriesTitle: `${relatedPartyId} - Inbound`,
          data: timePeriodData.inboundSeriesData
            .filter(p => p.x != null && typeof p.y === "number")
            .map(p => ({ x: p.x, y: p.y }))
        });
      }

      // Handle outbound series
      if (Array.isArray(timePeriodData.outboundSeriesData)) {
        series.push({
          seriesTitle: `${relatedPartyId} - Outbound`,
          data: timePeriodData.outboundSeriesData
            .filter(p => p.x != null && typeof p.y === "number")
            .map(p => ({ x: p.x, y: p.y }))
        });
      }
    });

    return series.filter(s => s.data.length > 0);
  },

  getAggregateStats: () => {
    const allStats = appsmith.store.ctsweeklystats || [];

    return allStats.map(stat => ({
      relatedPartyId: stat.relatedPartyId,
      serviceId: stat.serviceId,
      aggregate: stat.aggregateValues || {}
    }));
  },

  getEChartOptions: () => {
    // which service to show (by ID). fallback: selected row, or "all"
    const selectedId = appsmith.store.ctsStatclick || configuredCTS.selectedRow?.id || "ALL";

    // source: what runStatsQueries stored (one entry per service)
    const rows = Array.isArray(appsmith.store.ctsweeklystats) ? appsmith.store.ctsweeklystats : [];

    // pick either one service or all
    const targets = selectedId === "ALL"
      ? rows
      : rows.filter(r => r.serviceId === selectedId);

    // weekday order
    const dayOrder = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

    // helper to coerce [{x, y}] into a y-array aligned to dayOrder
    const toYArray = (pts = []) => {
      const map = Object.fromEntries((pts || []).map(p => [String(p.x), Number(p.y) || 0]));
      return dayOrder.map(d => map[d] ?? 0);
    };

    // build series: each service contributes up to 3 lines: Inbound, Outbound, Total
    const series = [];
    const legend = [];

    for (const r of targets) {
      const tpd = r?.timePeriodData || r?.stats?.timePeriodData; // support either placement
      const inbound = tpd?.inboundSeriesData;
      const outbound = tpd?.outboundSeriesData;
      const total = tpd?.totalSeriesData;

      const base = r.serviceName || r.serviceId || "Service";

      if (Array.isArray(inbound) && inbound.length) {
        legend.push(`${base} (Inbound)`);
        series.push({
          name: `${base} (Inbound)`,
          type: "line",
          emphasis: { focus: "series" },
          data: toYArray(inbound)
        });
      }
      if (Array.isArray(outbound) && outbound.length) {
        legend.push(`${base} (Outbound)`);
        series.push({
          name: `${base} (Outbound)`,
          type: "line",
          emphasis: { focus: "series" },
          data: toYArray(outbound)
        });
      }
      if (Array.isArray(total) && total.length) {
        legend.push(`${base} (Total)`);
        series.push({
          name: `${base} (Total)`,
          type: "line",
          emphasis: { focus: "series" },
          data: toYArray(total)
        });
      }
    }

    if (!series.length) {
      return {
        title: { text: `No concurrent-call data${selectedId === "ALL" ? "" : ` for ${selectedId}`}` },
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
        series: []
      };
    }

    return {
      tooltip: { trigger: "axis" },
      legend: { data: legend },
      xAxis: { type: "category", data: ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"] },
      yAxis: { type: "value", name: "Concurrent Calls" },
      series
    };
  }
};