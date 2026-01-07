export default {
	
	// Function 1: Extract and lookup all assigned number UUIDs
	// Queries IVPnumbers table to get phone numbers for assigned UUIDs
	async fetchAssignedNumbers() {
		const data = singleServiceQuery.data;
		const uuidSet = new Set();
		
		data.forEach(item => {
			if (item["Assigned numbers"]) {
				item["Assigned numbers"].split(',').forEach(uuid => {
					const trimmed = uuid.trim();
					if (trimmed) uuidSet.add(trimmed);
				});
			}
		});
		
		const uuidArray = Array.from(uuidSet);
		
		if (uuidArray.length === 0) return {};
		
		await storeValue('uuidList', uuidArray);
		await lookupAssignedNumbersQuery.run();
		
		const numberMap = {};
		if (lookupAssignedNumbersQuery.data) {
			lookupAssignedNumbersQuery.data.forEach(row => {
				// Store all columns as object
				numberMap[row.id] = {
					starting_number: row.starting_number,
					block_size: row.block_size,
					status: row.status,
					service: row.service
				};
			});
		}
		
		return numberMap;
	}
}