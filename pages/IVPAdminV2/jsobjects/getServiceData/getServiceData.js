export default {
  // Function 1: Flatten and aggregate service data
  flattenServiceData: (records) => {
    if (!records || !Array.isArray(records)) {
      return [];
    }
    
    return records.map(record => {
      const flat = {
        "Name": record.name || "",
        "Profile": record.profile || "",
        "UUID": record.uuid || "",
        "State": record.state || "",
        "External ID": record.externalid || "",
        "Description": record.description || ""
      };
      
      // Process servicedef array - aggregate repeated fields
      const fieldGroups = {};
      (record.servicedef || []).forEach(item => {
        const fieldName = item.name || "Unnamed";
        const fieldValue = item.value !== undefined ? String(item.value) : "";
        
        if (!fieldGroups[fieldName]) {
          fieldGroups[fieldName] = [];
        }
        if (fieldValue !== "") {
          fieldGroups[fieldName].push(fieldValue);
        }
      });
      
      // Merge aggregated values into flat record
      Object.entries(fieldGroups).forEach(([key, values]) => {
        flat[key] = values.length > 1 ? values.join(", ") : values[0] || "";
      });
      
      return flat;
    });
  },

  // Function 2: Filter data based on search term
  filterData: (data, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") {
      return data;
    }
    
    const term = searchTerm.toLowerCase().trim();
    return data.filter(row => {
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(term)
      );
    });
  },

  // Function 3: Filter data based on State = Active
  filterByState: (data, showActiveOnly) => {
    if (!showActiveOnly) {
      return data;
    }
    
    return data.filter(row => row.State === "Active");
  },

  // Function 4: Get current page data
  getCurrentPageData: () => {
    const data = getIVPServicesBuilt.data;
    const pageSize = 25; // Records per page
    const currentPage = appsmith.store.currentPage || 1;
    const searchTerm = appsmith.store.searchTerm || "";
    const showActiveOnly = appsmith.store.showActiveOnly || false;
    
    if (!data || !Array.isArray(data)) {
      return { rows: [], totalPages: 0, currentPage: 1, totalRecords: 0, filteredRecords: 0 };
    }
    
    // Flatten all data
    const flattened = getServiceData.flattenServiceData(data);
    
    // Apply State filter first
    let filtered = getServiceData.filterByState(flattened, showActiveOnly);
    
    // Then apply search filter
    filtered = getServiceData.filterData(filtered, searchTerm);
    
    // Calculate pagination
    const totalRecords = data.length;
    const filteredRecords = filtered.length;
    const totalPages = Math.ceil(filteredRecords / pageSize);
    const startIdx = (currentPage - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const pageData = filtered.slice(startIdx, endIdx);
    
    return {
      rows: pageData,
      totalPages: totalPages,
      currentPage: currentPage,
      totalRecords: totalRecords,
      filteredRecords: filteredRecords,
      pageSize: pageSize
    };
  },

  // Function 5: Generate HTML table with pagination info
  generateTable: () => {
    try {
      const pageInfo = getServiceData.getCurrentPageData();
      
      if (pageInfo.rows.length === 0) {
        return `<p style="color:orange;">No results found. Try adjusting your filters or search term.</p>`;
      }
      
      const allColumns = [...new Set(pageInfo.rows.flatMap(Object.keys))];
      
      let html = `
        <div style="margin-bottom:10px; padding:10px; background:#f0f0f0; border-radius:5px;">
          <strong>Page ${pageInfo.currentPage} of ${pageInfo.totalPages}</strong> | 
          Showing ${pageInfo.rows.length} of ${pageInfo.filteredRecords} records
          ${pageInfo.filteredRecords < pageInfo.totalRecords ? 
            ` (filtered from ${pageInfo.totalRecords} total)` : ''}
        </div>
        <table style="width:100%; border-collapse:collapse; font-size:12px;">
          <thead>
            <tr style="background:#2c3e50; color:white;">
              ${allColumns.map(col => 
                `<th style="padding:10px; border:1px solid #ddd; text-align:left;">${col}</th>`
              ).join('')}
            </tr>
          </thead>
          <tbody>
            ${pageInfo.rows.map((row, idx) => `
              <tr style="background:${idx % 2 ? '#f9f9f9' : 'white'};">
                ${allColumns.map(col => 
                  `<td style="padding:8px; border:1px solid #ddd; vertical-align:top; max-width:300px; word-wrap:break-word;">${row[col] || ''}</td>`
                ).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
      
      return html;
    } catch (error) {
      return `<p style="color:red;">Error: ${error.message}</p>`;
    }
  },

  // Function 6: Go to next page
  nextPage: () => {
    const pageInfo = getServiceData.getCurrentPageData();
    const newPage = Math.min(pageInfo.currentPage + 1, pageInfo.totalPages);
    storeValue("currentPage", newPage);
  },

  // Function 7: Go to previous page
  prevPage: () => {
    const currentPage = appsmith.store.currentPage || 1;
    const newPage = Math.max(currentPage - 1, 1);
    storeValue("currentPage", newPage);
  },

  // Function 8: Handle search - reset to page 1
  handleSearch: (searchValue) => {
    storeValue("searchTerm", searchValue);
    storeValue("currentPage", 1);
  },

  // Function 9: Handle State filter toggle - reset to page 1
  toggleActiveFilter: (isChecked) => {
    storeValue("showActiveOnly", isChecked);
    storeValue("currentPage", 1);
  },

  // Function 10: Reset all filters
  resetSearch: () => {
    storeValue("searchTerm", "");
    storeValue("showActiveOnly", false);
    storeValue("currentPage", 1);
  }
}