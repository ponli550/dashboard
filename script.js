document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
    
    // Dashboard Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            btn.classList.add('active');
            document.getElementById(`${tabId}-content`).classList.add('active');
            
            // Load chart data based on tab
            if (tabId === 'pollution') {
                loadPollutionChart();
            } else if (tabId === 'trends') {
                loadTrendsChart();
            } else if (tabId === 'comparison') {
                loadComparisonChart();
            }
        });
    });
    
    // Fetch and process CSV data
    async function fetchData() {
        try {
            const response = await fetch('/Users/irfanali/Desktop/KAISEL2/d.csv');
            const data = await response.text();
            
            // Parse CSV
            const rows = data.split('\n');
            const headers = rows[0].split(',');
            
            const parsedData = [];
            for (let i = 1; i < rows.length; i++) {
                if (rows[i].trim() === '') continue;
                
                const values = rows[i].split(',');
                const row = {};
                
                for (let j = 0; j < headers.length; j++) {
                    if (headers[j] === 'date') {
                        row[headers[j]] = values[j];
                    } else if (headers[j] === 'basins_monitored') {
                        row[headers[j]] = parseInt(values[j]);
                    } else if (headers[j] === 'proportion') {
                        row[headers[j]] = parseFloat(values[j]);
                    } else {
                        row[headers[j]] = values[j];
                    }
                }
                
                parsedData.push(row);
            }
            
            return parsedData;
        } catch (error) {
            console.error('Error fetching or parsing data:', error);
            return [];
        }
    }
    
    // Process data for charts
    function processDataForCharts(data) {
        // Get unique years
        const years = [...new Set(data.map(item => item.date))];
        
        // Process data for BOD5 clean status over years
        const bod5CleanData = years.map(year => {
            const yearData = data.filter(item => item.date === year && item.measure === 'bod5' && item.status === 'clean');
            return yearData.length > 0 ? yearData[0].proportion : 0;
        });
        
        // Process data for NH3N clean status over years
        const nh3nCleanData = years.map(year => {
            const yearData = data.filter(item => item.date === year && item.measure === 'nh3n' && item.status === 'clean');
            return yearData.length > 0 ? yearData[0].proportion : 0;
        });
        
        // Process data for SS clean status over years
        const ssCleanData = years.map(year => {
            const yearData = data.filter(item => item.date === year && item.measure === 'ss' && item.status === 'clean');
            return yearData.length > 0 ? yearData[0].proportion : 0;
        });
        
        return {
            years,
            bod5CleanData,
            nh3nCleanData,
            ssCleanData
        };
    }
    
    // Load Pollution Chart
    async function loadPollutionChart() {
        const data = await fetchData();
        const chartData = processDataForCharts(data);
        
        // Get the latest year data
        const latestYear = chartData.years[chartData.years.length - 1];
        const latestYearData = data.filter(item => item.date === latestYear);
        
        // Get data for each measure and status
        const measures = ['bod5', 'nh3n', 'ss'];
        const statuses = ['clean', 'slightly__polluted', 'polluted'];
        
        const chartLabels = [];
        const chartValues = [];
        const backgroundColors = [];
        
        measures.forEach(measure => {
            statuses.forEach(status => {
                const item = latestYearData.find(d => d.measure === measure && d.status === status);
                if (item) {
                    chartLabels.push(`${measure.toUpperCase()} - ${status.replace('__', ' ')}`);
                    chartValues.push(item.proportion);
                    
                    // Set colors based on status
                    if (status === 'clean') {
                        backgroundColors.push('#10b981'); // Green
                    } else if (status === 'slightly__polluted') {
                        backgroundColors.push('#f59e0b'); // Yellow
                    } else {
                        backgroundColors.push('#ef4444'); // Red
                    }
                }
            });
        });
        
        const ctx = document.getElementById('pollutionChart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.pollutionChart) {
            window.pollutionChart.destroy();
        }
        
        window.pollutionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: `Water Quality Indicators (${latestYear})`,
                    data: chartValues,
                    backgroundColor: backgroundColors,
                    borderColor: backgroundColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Proportion (%)'
                        },
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.raw.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }
        });
        
        // Update chart info
        document.querySelector('.chart-info h3').textContent = 'Water Quality Indicators';
        document.querySelector('.chart-info p').textContent = `Data from ${latestYear} showing BOD5, NH3N, and SS levels across ${latestYearData[0].basins_monitored} monitored basins`;
        
        // Update stats
        const firstYearBOD5Clean = data.find(item => item.date === chartData.years[0] && item.measure === 'bod5' && item.status === 'clean');
        const latestYearBOD5Clean = data.find(item => item.date === latestYear && item.measure === 'bod5' && item.status === 'clean');
        
        const statsHTML = `
            <li><span class="stat">${firstYearBOD5Clean.proportion.toFixed(1)}%</span> Clean BOD5 levels in ${chartData.years[0]}</li>
            <li><span class="stat">${latestYearBOD5Clean.proportion.toFixed(1)}%</span> Clean BOD5 levels in ${latestYear}</li>
            <li><span class="stat">${(latestYearBOD5Clean.proportion - firstYearBOD5Clean.proportion).toFixed(1)}%</span> Change over ${chartData.years.length} years</li>
        `;
        
        document.querySelector('.chart-stats').innerHTML = statsHTML;
    }
    
    // Load Trends Chart
    async function loadTrendsChart() {
        const data = await fetchData();
        const chartData = processDataForCharts(data);
        
        // Format years for display (remove time part if present)
        const displayYears = chartData.years.map(year => {
            return year.split(' ')[0];
        });
        
        const trendsContent = document.getElementById('trends-content');
        trendsContent.innerHTML = `
            <div class="chart-container">
                <canvas id="trendsChart"></canvas>
            </div>
            <div class="chart-info">
                <h3>Water Quality Trends (2000-2021)</h3>
                <p>Track the improvement of clean water indicators over time</p>
                <ul class="chart-stats">
                    <li><span class="stat">BOD5:</span> Biochemical Oxygen Demand - measures organic pollution</li>
                    <li><span class="stat">NH3N:</span> Ammonia Nitrogen - indicates presence of sewage/agricultural runoff</li>
                    <li><span class="stat">SS:</span> Suspended Solids - measures particles in water</li>
                </ul>
            </div>
        `;
        
        const ctx = document.getElementById('trendsChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: displayYears,
                datasets: [
                    {
                        label: 'BOD5 Clean (%)',
                        data: chartData.bod5CleanData,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37, 99, 235, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'NH3N Clean (%)',
                        data: chartData.nh3nCleanData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'SS Clean (%)',
                        data: chartData.ssCleanData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Proportion of Clean Status (%)'
                        },
                        max: 100
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Load Comparison Chart
    async function loadComparisonChart() {
        const data = await fetchData();
        
        // Get the first and last year for comparison
        const years = [...new Set(data.map(item => item.date))];
        const firstYear = years[0];
        const lastYear = years[years.length - 1];
        
        const comparisonContent = document.getElementById('comparison-content');
        comparisonContent.innerHTML = `
            <div class="chart-container">
                <canvas id="comparisonChart"></canvas>
            </div>
            <div class="chart-info">
                <h3>Basin Monitoring Comparison</h3>
                <p>Compare water quality status between ${firstYear} and ${lastYear}</p>
                <ul class="chart-stats">
                    <li><span class="stat">${data.find(item => item.date === firstYear).basins_monitored}</span> basins monitored in ${firstYear}</li>
                    <li><span class="stat">${data.find(item => item.date === lastYear).basins_monitored}</span> basins monitored in ${lastYear}</li>
                    <li><span class="stat">${data.find(item => item.date === lastYear).basins_monitored - data.find(item => item.date === firstYear).basins_monitored}</span> additional basins added over time</li>
                </ul>
            </div>
        `;
        
        // Get data for first and last year
        const firstYearData = data.filter(item => item.date === firstYear);
        const lastYearData = data.filter(item => item.date === lastYear);
        
        // Prepare data for chart
        const measures = ['bod5', 'nh3n', 'ss'];
        const statuses = ['clean', 'slightly__polluted', 'polluted'];
        
        const datasets = [];
        
        measures.forEach(measure => {
            // First year data
            const firstYearValues = statuses.map(status => {
                const item = firstYearData.find(d => d.measure === measure && d.status === status);
                return item ? item.proportion : 0;
            });
            
            // Last year data
            const lastYearValues = statuses.map(status => {
                const item = lastYearData.find(d => d.measure === measure && d.status === status);
                return item ? item.proportion : 0;
            });
            
            datasets.push({
                label: `${measure.toUpperCase()} ${firstYear}`,
                data: firstYearValues,
                backgroundColor: 'rgba(37, 99, 235, 0.7)',
                stack: `${measure}-${firstYear}`
            });
            
            datasets.push({
                label: `${measure.toUpperCase()} ${lastYear}`,
                data: lastYearValues,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                stack: `${measure}-${lastYear}`
            });
        });
        
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: statuses.map(status => status.replace('__', ' ')),
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        stacked: false,
                        title: {
                            display: true,
                            text: 'Proportion (%)'
                        },
                        max: 100
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Status'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Initialize the first chart
    loadPollutionChart();
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});