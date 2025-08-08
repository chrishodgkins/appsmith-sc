export default {
  prepareLineGraphData: () => {
    const allStats = appsmith.store.weeklystats || [];

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
    const allStats = appsmith.store.weeklystats || [];

    return allStats.map(stat => ({
      relatedPartyId: stat.relatedPartyId,
      serviceId: stat.serviceId,
      aggregate: stat.aggregateValues || {}
    }));
  },

  getEChartOptions: () => {
    const allSeries = buildWeeklyStat.prepareLineGraphData();
    const selectedId = appsmith.store.statclick || TableReal.selectedRow?.externalid || "";

    const filtered = allSeries.filter(s => s.seriesTitle.startsWith(selectedId));

    if (!filtered.length) {
      return {
        title: { text: `No data for ${selectedId}` },
        xAxis: { type: 'category', data: [] },
        yAxis: { type: 'value' },
        series: []
      };
    }

    return {
      tooltip: { trigger: 'axis' },
      legend: { data: filtered.map(s => s.seriesTitle) },
      xAxis: { type: 'category', data: filtered[0].data.map(pt => pt.x) },
      yAxis: { type: 'value' },
      series: filtered.map(s => ({
        name: s.seriesTitle,
        type: 'line',
        stack: 'total',
        areaStyle: {},
        emphasis: { focus: 'series' },
        data: s.data.map(pt => pt.y)
      }))
    };
  }
};