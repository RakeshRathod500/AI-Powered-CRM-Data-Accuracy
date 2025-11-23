let accuracyChart, dataDistributionChart, errorTypesChart;
let processedData = null;
let headers = [];

document.getElementById('csvFile').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.csv')) {
        const reader = new FileReader();
        reader.onload = function(event) {
            processedData = event.target.result;
            console.log('File loaded:', processedData); // Debug log
        };
        reader.onerror = function() {
            alert('Error reading file');
        };
        reader.readAsText(file);
    } else {
        alert('Please upload a valid CSV file');
    }
});

function processData() {
    console.log('Process button clicked'); // Debug log
    if (!processedData) {
        alert('Please upload a CSV file first');
        return;
    }

    // Parse CSV
    const lines = processedData.split('\n');
    headers = lines[0].split(',').map(h => h.trim());
    const dataRows = lines.slice(1).filter(row => row.trim() !== '').map(row => {
        const values = row.split(',').map(v => v.trim());
        return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
    });

    // Simulate AI analysis
    const analysisResults = {
        totalRecords: dataRows.length,
        accuracyRate: Math.random() * (95 - 85) + 85,
        errorTypes: {
            missingData: 0,
            duplicates: 0,
            invalidFormat: 0
        },
        processedRecords: []
    };

    // Simple validation rules
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    const seen = new Set();

    dataRows.forEach((record, index) => {
        let issues = [];
        
        // Check for duplicates (based on email)
        if (record.Email) {
            if (seen.has(record.Email)) {
                issues.push('Duplicate');
                analysisResults.errorTypes.duplicates++;
            }
            seen.add(record.Email);
        }

        // Check missing data
        headers.forEach(header => {
            if (!record[header] || record[header] === '') {
                issues.push(`Missing ${header}`);
                analysisResults.errorTypes.missingData++;
            }
        });

        // Check format
        if (record.Email && !emailRegex.test(record.Email)) {
            issues.push('Invalid Email');
            analysisResults.errorTypes.invalidFormat++;
        }
        if (record.Phone && !phoneRegex.test(record.Phone)) {
            issues.push('Invalid Phone');
            analysisResults.errorTypes.invalidFormat++;
        }

        analysisResults.processedRecords.push({
            ...record,
            Status: issues.length === 0 ? 'Valid' : 'Has Issues',
            Issues: issues.join(', ') || 'None'
        });
    });

    // Show results section
    document.getElementById('results').style.display = 'block';

    // Update Charts
    if (accuracyChart) accuracyChart.destroy();
    if (dataDistributionChart) dataDistributionChart.destroy();
    if (errorTypesChart) errorTypesChart.destroy();

    accuracyChart = new Chart(document.getElementById('accuracyChart'), {
        type: 'doughnut',
        data: {
            labels: ['Accurate', 'Inaccurate'],
            datasets: [{
                data: [analysisResults.accuracyRate, 100 - analysisResults.accuracyRate],
                backgroundColor: ['#4a90e2', '#e24a4a']
            }]
        },
        options: {
            title: { display: true, text: 'Data Accuracy Rate' }
        }
    });

    dataDistributionChart = new Chart(document.getElementById('dataDistributionChart'), {
        type: 'bar',
        data: {
            labels: ['Total Records', 'Processed', 'Errors'],
            datasets: [{
                label: 'Records',
                data: [analysisResults.totalRecords, 
                       analysisResults.totalRecords - analysisResults.errorTypes.duplicates,
                       Object.values(analysisResults.errorTypes).reduce((a, b) => a + b)],
                backgroundColor: ['#4a90e2', '#357abd', '#e24a4a']
            }]
        },
        options: {
            title: { display: true, text: 'Data Distribution' },
            scales: { y: { beginAtZero: true } }
        }
    });

    errorTypesChart = new Chart(document.getElementById('errorTypesChart'), {
        type: 'pie',
        data: {
            labels: ['Missing Data', 'Duplicates', 'Invalid Format'],
            datasets: [{
                data: Object.values(analysisResults.errorTypes),
                backgroundColor: ['#4a90e2', '#357abd', '#90c7e2']
            }]
        },
        options: {
            title: { display: true, text: 'Error Types Distribution' }
        }
    });

    // Update Table
    updateTable(analysisResults);
}

function updateTable(analysisResults) {
    const headerRow = document.getElementById('tableHeader');
    headerRow.innerHTML = '';
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
    const statusTh = document.createElement('th');
    statusTh.textContent = 'Status';
    headerRow.appendChild(statusTh);
    const issuesTh = document.createElement('th');
    issuesTh.textContent = 'Issues';
    headerRow.appendChild(issuesTh);

    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    analysisResults.processedRecords.forEach(record => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = record[header] || '';
            tr.appendChild(td);
        });
        const statusTd = document.createElement('td');
        statusTd.textContent = record.Status;
        statusTd.className = record.Status === 'Valid' ? 'status-valid' : 'status-error';
        tr.appendChild(statusTd);
        const issuesTd = document.createElement('td');
        issuesTd.textContent = record.Issues;
        tr.appendChild(issuesTd);
        tbody.appendChild(tr);
    });
}