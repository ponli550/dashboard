document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
        
        // Add smooth transition to body to prevent scrolling during menu animation
        document.body.style.overflow = hamburger.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu when clicking on a nav link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Dashboard Tabs with improved transitions
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // Add transition class to all tab contents
    tabContents.forEach(content => {
        content.classList.add('tab-transition');
    });
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabBtns.forEach(btn => btn.classList.remove('active'));
            
            // First set all tabs to transitioning-out state
            tabContents.forEach(content => {
                if (content.classList.contains('active')) {
                    content.classList.add('transitioning-out');
                    content.classList.remove('active');
                }
            });
            
            // Add active class to clicked button
            btn.classList.add('active');
            
            // Use setTimeout to create a smooth transition between tabs
            setTimeout(() => {
                tabContents.forEach(content => content.classList.remove('transitioning-out'));
                document.getElementById(`${tabId}-content`).classList.add('active');
                
                // Load chart data based on tab
                if (tabId === 'pollution') {
                    loadPollutionChart();
                } else if (tabId === 'trends') {
                    loadTrendsChart();
                } else if (tabId === 'comparison') {
                    loadComparisonChart();
                }
            }, 300); // Match this timing with your CSS transition duration
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
    
    // Load Pollution Chart with smoother animation
    async function loadPollutionChart() {
        // Show loading indicator
        showChartLoading('pollutionChart');
        
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
        
        // Add animation options for smoother chart rendering
        const chartOptions = {
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
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            }
        };
        
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
            options: chartOptions
        });
        
        // Update chart info with fade effect
        fadeInElement('.chart-info h3', 'Water Quality Indicators');
        fadeInElement('.chart-info p', `Data from ${latestYear} showing BOD5, NH3N, and SS levels across ${latestYearData[0].basins_monitored} monitored basins`);
        
        // Update stats
        const firstYearBOD5Clean = data.find(item => item.date === chartData.years[0] && item.measure === 'bod5' && item.status === 'clean');
        const latestYearBOD5Clean = data.find(item => item.date === latestYear && item.measure === 'bod5' && item.status === 'clean');
        
        const statsHTML = `
            <li><span class="stat">${firstYearBOD5Clean.proportion.toFixed(1)}%</span> Clean BOD5 levels in ${chartData.years[0]}</li>
            <li><span class="stat">${latestYearBOD5Clean.proportion.toFixed(1)}%</span> Clean BOD5 levels in ${latestYear}</li>
            <li><span class="stat">${(latestYearBOD5Clean.proportion - firstYearBOD5Clean.proportion).toFixed(1)}%</span> Change over ${chartData.years.length} years</li>
        `;
        
        fadeInElement('.chart-stats', statsHTML);
    }
    
    // Load Trends Chart with smoother animation
    async function loadTrendsChart() {
        // Show loading indicator
        const trendsContent = document.getElementById('trends-content');
        trendsContent.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>Loading chart data...</p>
            </div>
        `;
        
        const data = await fetchData();
        const chartData = processDataForCharts(data);
        
        // Format years for display (remove time part if present)
        const displayYears = chartData.years.map(year => {
            return year.split(' ')[0];
        });
        
        // Use setTimeout to create a small delay for smoother transition
        setTimeout(() => {
            trendsContent.innerHTML = `
                <div class="chart-container fade-in">
                    <canvas id="trendsChart"></canvas>
                </div>
                <div class="chart-info fade-in">
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
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
            
            // Trigger fade-in animation
            document.querySelectorAll('.fade-in').forEach(el => {
                el.classList.add('visible');
            });
        }, 300);
    }
    
    // Load Comparison Chart with smoother animation
    async function loadComparisonChart() {
        // Show loading indicator
        showChartLoading('comparison-content');
        
        const data = await fetchData();
        
        // Get the first and last year for comparison
        const years = [...new Set(data.map(item => item.date))];
        const firstYear = years[0];
        const lastYear = years[years.length - 1];
        
        // Use setTimeout for smoother transition
        setTimeout(() => {
            const comparisonContent = document.getElementById('comparison-content');
            comparisonContent.innerHTML = `
                <div class="chart-container fade-in">
                    <canvas id="comparisonChart"></canvas>
                </div>
                <div class="chart-info fade-in">
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
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
            
            // Trigger fade-in animation
            document.querySelectorAll('.fade-in').forEach(el => {
                el.classList.add('visible');
            });
        }, 300);
    }
    
    // Helper function to show loading indicator
    function showChartLoading(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Loading chart data...</p>
                </div>
            `;
        }
    }
    
    // Helper function to fade in elements with text
    function fadeInElement(selector, text) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.opacity = 0;
            element.innerHTML = text;
            setTimeout(() => {
                element.style.opacity = 1;
            }, 50);
        }
    }
    
    // Initialize the first chart
    loadPollutionChart();
    
    // Enhanced smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Add a highlight effect to the target section
                const highlightClass = 'section-highlight';
                
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Add highlight effect after scrolling
                setTimeout(() => {
                    targetElement.classList.add(highlightClass);
                    setTimeout(() => {
                        targetElement.classList.remove(highlightClass);
                    }, 1000);
                }, 600);
            }
        });
    });
    
    // Add intersection observer for scroll animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements that should animate on scroll
    document.querySelectorAll('.feature-card, .team-member, .presentation-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });
});