export default {
  prepareLineGraphData: () => {
    const allStats = get_daystat2.runStatsQueries.data || [];

    const series = allStats
      .filter(stat =>
        Array.isArray(stat.timePeriodData?.inboundSeriesData) &&
        stat.timePeriodData.inboundSeriesData.length > 0
      )
      .map(stat => ({
        seriesTitle: `${stat.relatedPartyId}`,
        data: stat.timePeriodData.inboundSeriesData
          .filter(p => p.x != null && typeof p.y === 'number')
          .map(p => ({ x: p.x, y: p.y }))
      }))
      .filter(s => s.data.length > 0);

    return series;
  },

  getEChartOptions: () => {
    const allSeries = buildDayStat.prepareLineGraphData();
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