export default {
  // === DEBUG: Check Query Structure ===
  checkStructure: () => {
    const data = getIVPServicesBuilt.data;
    
    return {
      // Basic checks
      hasData: !!data,
      dataType: typeof data,
      isArray: Array.isArray(data),
      
      // Try different paths
      directLength: data?.length,
      nestedLength: data?.data?.length,
      
      // Keys at top level
      topLevelKeys: data ? Object.keys(data) : null,
      
      // First item
      firstItem: Array.isArray(data) ? data[0] : data?.data?.[0]
    };
  }
};