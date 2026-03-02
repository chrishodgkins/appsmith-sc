export default {
  // === FUNCTION 1: Map Services to Phone Numbers ===
  // Maps Assigned_numbers UUIDs to actual phone numbers from lookup table
  enrichServicesWithNumbers: () => {
    const services = getIVPServicesBuilt.data || [];  // FIXED: removed .data.data
    const numberLookup = lookupAssignedNumbersQuery.data || [];
    
    // Create UUID to number mapping for O(1) lookups
    const numberMap = {};
    numberLookup.forEach(record => {
      numberMap[record.id] = {
        number: record.starting_number,
        blockSize: record.block_size,
        status: record.status
      };
    });
    
    // Enrich each service with phone number details
    return services.map(service => {
      // Parse comma-separated UUIDs
      const uuids = (service.Assigned_numbers || '')
        .split(',')
        .map(uuid => uuid.trim())
        .filter(uuid => uuid.length > 0);
      
      // Look up phone numbers for each UUID
      const phoneNumbers = uuids
        .map(uuid => numberMap[uuid])
        .filter(num => num !== undefined)
        .map(num => num.number);
      
      return {
        ...service,
        phone_numbers: phoneNumbers,
        phone_numbers_string: phoneNumbers.join(', '),
        assigned_count: phoneNumbers.length
      };
    });
  },

  // === FUNCTION 2: Get Numbers for Single Service ===
  getNumbersForService: (assignedNumbersString) => {
    const numberLookup = lookupAssignedNumbersQuery.data || [];
    
    const uuids = (assignedNumbersString || '')
      .split(',')
      .map(uuid => uuid.trim())
      .filter(uuid => uuid.length > 0);
    
    return uuids
      .map(uuid => numberLookup.find(n => n.id === uuid))
      .filter(num => num !== undefined)
      .map(num => num.starting_number);
  }
};