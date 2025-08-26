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
    const selectedId = appsmith.store.ctsStatclick || configuredCTS.selectedRow?.id || "ALL";
    const rows = Array.isArray(appsmith.store.ctsweeklystats) ? appsmith.store.ctsweeklystats : [];
    const targets = selectedId === "ALL" ? rows : rows.filter(r => r.serviceId === selectedId);

    // Base week order
    const baseOrder = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
    const jsToName = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; // Date.getDay(): 0=Sun…6=Sat

    // Yesterday's day name
    const yesterdayIdx = (new Date().getDay() + 6) % 7; // yesterday = today - 1 (mod 7)
    const yesterdayName = jsToName[yesterdayIdx];       // e.g., "Tue" if today is Wed

    // Rotate week so yesterday is rightmost
    const yIdx = baseOrder.indexOf(yesterdayName);
    const dayOrder = baseOrder.slice((yIdx + 1) % 7).concat(baseOrder.slice(0, (yIdx + 1) % 7));
    // Example: if yesterday = Tue -> ["Wed","Thu","Fri","Sat","Sun","Mon","Tue"]

    // Map series data to this rotated day order
    const toYArray = (pts = []) => {
      const map = Object.fromEntries((pts || []).map(p => [String(p.x), Number(p.y) || 0]));
      return dayOrder.map(d => map[d] ?? 0);
    };

    const series = [];
    const legend = [];

    for (const r of targets) {
      const tpd = r?.timePeriodData || r?.stats?.timePeriodData;
      const inbound = tpd?.inboundSeriesData;
      const outbound = tpd?.outboundSeriesData;
      const total = tpd?.totalSeriesData;
      const base = r.serviceName || r.serviceId || "Service";

      if (Array.isArray(inbound) && inbound.length) {
        const name = `${base} (Inbound)`;
        legend.push(name);
        series.push({ name, type: "line", emphasis: { focus: "series" }, data: toYArray(inbound) });
      }
      if (Array.isArray(outbound) && outbound.length) {
        const name = `${base} (Outbound)`;
        legend.push(name);
        series.push({ name, type: "line", emphasis: { focus: "series" }, data: toYArray(outbound) });
      }
      if (Array.isArray(total) && total.length) {
        const name = `${base} (Total)`;
        legend.push(name);
        series.push({ name, type: "line", emphasis: { focus: "series" }, data: toYArray(total) });
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
      xAxis: { type: "category", data: dayOrder },
      yAxis: { type: "value", name: "Concurrent Calls" },
      series
    };
  }
};