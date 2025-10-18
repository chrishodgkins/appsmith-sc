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
	},
	
	// Function 2: Generate HTML tables with replaced phone numbers
	// Creates side-by-side vertical tables with service details
	async generateServiceTables() {
		const data = singleServiceQuery.data;
		
		if (!data || data.length === 0) {
			return '<p>No service data available</p>';
		}
		
		const numberMap = await this.fetchAssignedNumbers();
		
		// Columns to exclude from display
		const excludedColumns = ['password', 'Password', 'passwd']; // Add exact column name here
		
		const html = `
			<div style="display: flex; gap: 20px; overflow-x: auto; padding: 10px;">
				${data.map(item => `
					<div style="flex-shrink: 0;">
						<h3 style="margin: 0 0 10px 0; font-size: 14px;">${item.externalid || 'Unknown'} - ${item.name || 'Unnamed'}</h3>
						<table style="border-collapse: collapse; border: 1px solid #ddd; font-size: 12px;">
							${Object.entries(item)
								.filter(([key]) => !excludedColumns.includes(key))
								.map(([key, value]) => {
								let displayValue = value;
								
								if (key === "Assigned numbers" && value) {
									const dataRows = value.split(',').map(uuid => {
										const trimmed = uuid.trim();
										const numberData = numberMap[trimmed];
										
										if (numberData) {
											return `${numberData.starting_number}, ${numberData.block_size}, ${numberData.status}, ${numberData.service}`;
										}
										return trimmed;
									}).join('<br>');
									
									displayValue = `<strong>starting_number, block_size, status, service</strong><br>${dataRows}`;
								}
								
								return `
									<tr>
										<td style="border: 1px solid #ddd; padding: 8px; font-weight: bold; background-color: #f5f5f5; min-width: 200px;">${key}</td>
										<td style="border: 1px solid #ddd; padding: 8px; max-width: 300px; word-wrap: break-word;">${displayValue !== null && displayValue !== '' ? displayValue : '—'}</td>
									</tr>
								`;
							}).join('')}
						</table>
					</div>
				`).join('')}
			</div>
		`;
		
		await storeValue('generatedHTML', html);
		return html;
	}
}