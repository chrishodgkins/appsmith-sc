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
    const selectedId =
      appsmith.store.ctsStatclick || configuredCTS.selectedRow?.id || "ALL";

    const rows = Array.isArray(appsmith.store.ctsweeklystats)
      ? appsmith.store.ctsweeklystats
      : [];

    const targets = selectedId === "ALL"
      ? rows
      : rows.filter(r => r.serviceId === selectedId);

    if (!targets.length) {
      return {
        title: { text: `No data${selectedId === "ALL" ? "" : ` for ${selectedId}`}` },
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
        series: []
      };
    }

    // --- helpers ---
    // Try to parse labels like "Jul 28" into real Dates.
    // Assume current year if year is missing.
    const curYear = new Date().getFullYear();
    const tryParse = (lbl) => {
      // if it already has a year, let Date handle it; otherwise append current year
      const hasYear = /\b\d{4}\b/.test(lbl);
      const s = hasYear ? lbl : `${lbl} ${curYear}`;
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    };

    // collect all unique date labels across targets & series
    const allLabels = [];
    const seen = new Set();

    const collectLabels = (arr) => {
      (arr || []).forEach(pt => {
        const key = String(pt?.x);
        if (!seen.has(key)) { seen.add(key); allLabels.push(key); }
      });
    };

    for (const r of targets) {
      const tpd = r?.timePeriodData || r?.stats?.timePeriodData;
      collectLabels(tpd?.inboundSeriesData);
      collectLabels(tpd?.outboundSeriesData);
      collectLabels(tpd?.totalSeriesData);
    }

    if (!allLabels.length) {
      return {
        title: { text: `No 4-week time series${selectedId === "ALL" ? "" : ` for ${selectedId}`}` },
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
        series: []
      };
    }

    // sort labels by date if we can parse; otherwise keep insertion order
    const sortable = allLabels.map(lbl => ({ lbl, date: tryParse(lbl) }));
    const anyParsable = sortable.some(x => x.date);
    if (anyParsable) {
      sortable.sort((a, b) => {
        if (a.date && b.date) return a.date - b.date;
        if (a.date && !b.date) return -1;
        if (!a.date && b.date) return 1;
        return 0; // both unparsed -> keep relative order
      });
    }
    const xLabels = sortable.map(x => x.lbl);

    const mapSeriesTo = (pts = []) => {
      const map = Object.fromEntries(
        (pts || []).map(p => [String(p.x), Number(p.y) || 0])
      );
      return xLabels.map(lbl => map[lbl] ?? 0);
    };

    // --- build series ---
    const series = [];
    const legend = [];

    for (const r of targets) {
      const tpd = r?.timePeriodData || r?.stats?.timePeriodData;
      const base = r.serviceName || r.serviceId || "Service";

      if (Array.isArray(tpd?.inboundSeriesData) && tpd.inboundSeriesData.length) {
        const name = `${base} (Inbound)`;
        legend.push(name);
        series.push({
          name, type: "line", emphasis: { focus: "series" },
          data: mapSeriesTo(tpd.inboundSeriesData)
        });
      }
      if (Array.isArray(tpd?.outboundSeriesData) && tpd.outboundSeriesData.length) {
        const name = `${base} (Outbound)`;
        legend.push(name);
        series.push({
          name, type: "line", emphasis: { focus: "series" },
          data: mapSeriesTo(tpd.outboundSeriesData)
        });
      }
      if (Array.isArray(tpd?.totalSeriesData) && tpd.totalSeriesData.length) {
        const name = `${base} (Total)`;
        legend.push(name);
        series.push({
          name, type: "line", emphasis: { focus: "series" },
          data: mapSeriesTo(tpd.totalSeriesData)
        });
      }
    }

    if (!series.length) {
      return {
        title: { text: "No series to plot" },
        xAxis: { type: "category", data: xLabels },
        yAxis: { type: "value" },
        series: []
      };
    }

    return {
      tooltip: { trigger: "axis" },
      legend: { data: legend, type: "scroll" },
      xAxis: { type: "category", data: xLabels, name: "Week" },
      yAxis: { type: "value", name: "Peak Concurrent Calls" },
      series
    };
  }
};