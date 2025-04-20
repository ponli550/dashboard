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
                } else if (tabId === 'detailed') {
                    loadDetailedCharts();
                }
            }, 300); // Match this timing with your CSS transition duration
        });
    });
    
    // Sample Data for Charts
    const data = {
        years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021],
        bod5: {
            clean: [32.5, 48.33, 57.5, 63.33, 54.17, 52.74, 65.75, 65.73, 55.24, 19.58, 8.39, 2.14, 8.57, 0, 0, 0, 0, 37.76, 36.81, 57.64, 86.11],
            slightlyPolluted: [52.5, 34.17, 24.17, 24.17, 30.83, 28.08, 19.18, 25.87, 32.17, 51.05, 55.24, 57.14, 49.29, 32.86, 10.71, 13.57, 7.86, 25.87, 27.08, 31.94, 7.64],
            polluted: [15, 17.5, 18.33, 12.5, 15, 19.18, 15.07, 8.39, 12.59, 29.37, 36.36, 40.71, 42.14, 67.14, 89.29, 86.43, 92.14, 36.36, 36.11, 10.42, 6.25]
        },
        nh3n: {
            clean: [41.67, 44.17, 42.5, 45, 35.83, 33.56, 33.56, 33.57, 50.35, 39.16, 24.48, 29.29, 25, 29.29, 29.29, 22.86, 13.57, 3.5, 8.33, 19.44, 40.28],
            slightlyPolluted: [40, 35.83, 33.33, 30.83, 39.17, 36.99, 38.36, 41.26, 26.57, 32.87, 46.15, 45.71, 47.86, 41.43, 42.14, 46.43, 59.29, 61.54, 51.39, 51.39, 25.69],
            polluted: [18.33, 20, 24.17, 24.17, 25, 29.45, 28.08, 25.17, 23.08, 27.97, 29.37, 25, 27.14, 29.29, 28.57, 30.71, 27.14, 34.97, 40.28, 29.17, 34.03]
        },
        ss: {
            clean: [35, 47.5, 65, 62.5, 65, 61.64, 57.53, 43.36, 39.86, 37.76, 47.55, 56.43, 68.57, 75, 70.71, 76.43, 62.14, 49.65, 54.17, 76.39, 88.19],
            slightlyPolluted: [20.83, 20.83, 11.67, 14.17, 9.17, 15.07, 13.7, 27.27, 23.08, 22.38, 18.88, 18.57, 20, 17.14, 15.71, 9.29, 16.43, 21.68, 25, 9.72],
            polluted: [44.17, 31.67, 23.33, 23.33, 25.83, 23.29, 28.77, 29.37, 37.06, 39.86, 33.57, 25, 11.43, 7.86, 13.57, 14.29, 21.43, 28.67, 20.83, 13.89]
        }
    };
    
    // Load Pollution Chart
    function loadPollutionChart() {
        const ctx = document.getElementById('pollutionChart');
        
        // Check if the canvas exists
        if (!ctx) {
            const pollutionContent = document.getElementById('pollution-content');
            pollutionContent.innerHTML = `
                <div class="chart-container">
                    <canvas id="pollutionChart"></canvas>
                </div>
                <div class="chart-info">
                    <h3>Water Quality Indicators</h3>
                    <p>Track BOD5, NH3N, and SS levels across monitored basins</p>
                    <ul class="chart-stats">
                        <li><span class="stat">32.5%</span> Clean BOD5 levels in 2000</li>
                        <li><span class="stat">86.1%</span> Clean BOD5 levels in 2021</li>
                        <li><span class="stat">53.6%</span> Improvement over 21 years</li>
                    </ul>
                </div>
            `;
            
            // Get the canvas again after adding it to the DOM
            const ctx = document.getElementById('pollutionChart').getContext('2d');
            createPollutionChart(ctx);
        } else {
            // If canvas exists, get its context and create chart
            const context = ctx.getContext('2d');
            createPollutionChart(context);
        }
    }
    
    function createPollutionChart(ctx) {
        // Destroy existing chart if it exists
        if (window.pollutionChart) {
            window.pollutionChart.destroy();
        }
        
        // Create new chart
        window.pollutionChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['BOD5 - Clean', 'BOD5 - Slightly Polluted', 'BOD5 - Polluted', 'NH3N - Clean', 'NH3N - Slightly Polluted', 'NH3N - Polluted', 'SS - Clean', 'SS - Slightly Polluted', 'SS - Polluted'],
                datasets: [{
                    label: 'Water Quality Indicators (2021)',
                    data: [
                        data.bod5.clean[data.bod5.clean.length - 1],
                        data.bod5.slightlyPolluted[data.bod5.slightlyPolluted.length - 1],
                        data.bod5.polluted[data.bod5.polluted.length - 1],
                        data.nh3n.clean[data.nh3n.clean.length - 1],
                        data.nh3n.slightlyPolluted[data.nh3n.slightlyPolluted.length - 1],
                        data.nh3n.polluted[data.nh3n.polluted.length - 1],
                        data.ss.clean[data.ss.clean.length - 1],
                        data.ss.slightlyPolluted[data.ss.slightlyPolluted.length - 1],
                        data.ss.polluted[data.ss.polluted.length - 1]
                    ],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 159, 64, 0.7)',
                        'rgba(153, 102, 255, 0.7)',
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(241, 196, 15, 0.7)',
                        'rgba(231, 76, 60, 0.7)'
                    ],
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
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
                }
            }
        });
    }
    
    // Load Trends Chart
    function loadTrendsChart() {
        const trendsContent = document.getElementById('trends-content');
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
        
        // Wait for DOM to update
        setTimeout(() => {
            const ctx = document.getElementById('trendsChart').getContext('2d');
            
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: data.years,
                    datasets: [
                        {
                            label: 'BOD5 Clean (%)',
                            data: data.bod5.clean,
                            borderColor: '#2563eb',
                            backgroundColor: 'rgba(37, 99, 235, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'NH3N Clean (%)',
                            data: data.nh3n.clean,
                            borderColor: '#10b981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            fill: true,
                            tension: 0.3
                        },
                        {
                            label: 'SS Clean (%)',
                            data: data.ss.clean,
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
        }, 50);
    }
    
    // Load Comparison Chart
    function loadComparisonChart() {
        const comparisonContent = document.getElementById('comparison-content');
        comparisonContent.innerHTML = `
            <div class="chart-container fade-in">
                <canvas id="comparisonChart"></canvas>
            </div>
            <div class="chart-info fade-in">
                <h3>Basin Monitoring Comparison</h3>
                <p>Compare water quality status between 2000 and 2021</p>
                <ul class="chart-stats">
                    <li><span class="stat">120</span> basins monitored in 2000</li>
                    <li><span class="stat">144</span> basins monitored in 2021</li>
                    <li><span class="stat">24</span> additional basins added over time</li>
                </ul>
            </div>
        `;
        
        // Wait for DOM to update
        setTimeout(() => {
            const ctx = document.getElementById('comparisonChart').getContext('2d');
            
            const firstYear = data.years[0];
            const lastYear = data.years[data.years.length - 1];
            
            // Prepare data for chart
            const measures = ['BOD5', 'NH3N', 'SS'];
            const statuses = ['Clean', 'Slightly Polluted', 'Polluted'];
            
            const datasets = [];
            
            // First year data
            datasets.push({
                label: `${firstYear} - Clean`,
                data: [data.bod5.clean[0], data.nh3n.clean[0], data.ss.clean[0]],
                backgroundColor: 'rgba(75, 192, 192, 0.7)',
                stack: 'Stack 0'
            });
            
            datasets.push({
                label: `${firstYear} - Slightly Polluted`,
                data: [data.bod5.slightlyPolluted[0], data.nh3n.slightlyPolluted[0], data.ss.slightlyPolluted[0]],
                backgroundColor: 'rgba(255, 206, 86, 0.7)',
                stack: 'Stack 0'
            });
            
            datasets.push({
                label: `${firstYear} - Polluted`,
                data: [data.bod5.polluted[0], data.nh3n.polluted[0], data.ss.polluted[0]],
                backgroundColor: 'rgba(255, 99, 132, 0.7)',
                stack: 'Stack 0'
            });
            
            // Last year data
            datasets.push({
                label: `${lastYear} - Clean`,
                data: [
                    data.bod5.clean[data.bod5.clean.length - 1], 
                    data.nh3n.clean[data.nh3n.clean.length - 1], 
                    data.ss.clean[data.ss.clean.length - 1]
                ],
                backgroundColor: 'rgba(54, 162, 235, 0.7)',
                stack: 'Stack 1'
            });
            
            datasets.push({
                label: `${lastYear} - Slightly Polluted`,
                data: [
                    data.bod5.slightlyPolluted[data.bod5.slightlyPolluted.length - 1], 
                    data.nh3n.slightlyPolluted[data.nh3n.slightlyPolluted.length - 1], 
                    data.ss.slightlyPolluted[data.ss.slightlyPolluted.length - 1]
                ],
                backgroundColor: 'rgba(255, 159, 64, 0.7)',
                stack: 'Stack 1'
            });
            
            datasets.push({
                label: `${lastYear} - Polluted`,
                data: [
                    data.bod5.polluted[data.bod5.polluted.length - 1], 
                    data.nh3n.polluted[data.nh3n.polluted.length - 1], 
                    data.ss.polluted[data.ss.polluted.length - 1]
                ],
                backgroundColor: 'rgba(153, 102, 255, 0.7)',
                stack: 'Stack 1'
            });
            
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: measures,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: true,
                            title: {
                                display: true,
                                text: 'Proportion (%)'
                            },
                            max: 100
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Parameter'
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
        }, 50);
    }
    
    // Load Detailed Charts
    function loadDetailedCharts() {
        const detailedContent = document.getElementById('detailed-content');
        detailedContent.innerHTML = `
            <div class="detailed-charts">
                <!-- Stacked Area Chart -->
                <div class="chart-container">
                    <h3>Pollution Categories Over Time</h3>
                    <canvas id="stackedAreaChart"></canvas>
                    <p class="chart-description">This stacked area chart shows the proportion of basins in each pollution category for BOD5 over time.</p>
                </div>
                
                <!-- Line Graph -->
                <div class="chart-container">
                    <h3>Proportion of Clean Basins Over Time</h3>
                    <canvas id="lineGraph"></canvas>
                    <p class="chart-description">This line graph compares the proportion of clean basins for all three parameters (BOD5, NH3N, SS) over the 21-year period.</p>
                </div>
                
                <!-- Bar Chart -->
                <div class="chart-container">
                    <h3>Proportion of Polluted Basins Over Time</h3>
                    <canvas id="barChart"></canvas>
                    <p class="chart-description">This bar chart shows the proportion of polluted basins for all three parameters, highlighting pollution hotspots over time.</p>
                </div>
            </div>
        `;
        
        // Wait for DOM to update
        setTimeout(() => {
            // Stacked Area Chart
            const ctx1 = document.getElementById('stackedAreaChart').getContext('2d');
            new Chart(ctx1, {
                type: 'line',
                data: {
                    labels: data.years,
                    datasets: [
                        { 
                            label: 'BOD5 - Clean', 
                            data: data.bod5.clean, 
                            borderColor: 'green', 
                            backgroundColor: 'rgba(0, 128, 0, 0.2)', 
                            fill: true 
                        },
                        { 
                            label: 'BOD5 - Slightly Polluted', 
                            data: data.bod5.slightlyPolluted, 
                            borderColor: 'orange', 
                            backgroundColor: 'rgba(255, 165, 0, 0.2)', 
                            fill: '-1' 
                        },
                        { 
                            label: 'BOD5 - Polluted', 
                            data: data.bod5.polluted, 
                            borderColor: 'red', 
                            backgroundColor: 'rgba(255, 0, 0, 0.2)', 
                            fill: '-1' 
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'top' } 
                    },
                    scales: { 
                        x: { 
                            stacked: true,
                            title: {
                                display: true,
                                text: 'Year'
                            }
                        }, 
                        y: { 
                            stacked: true, 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Proportion (%)'
                            },
                            max: 100
                        } 
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });

            // Line Graph
            const ctx2 = document.getElementById('lineGraph').getContext('2d');
            new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: data.years,
                    datasets: [
                        { 
                            label: 'BOD5 - Clean', 
                            data: data.bod5.clean, 
                            borderColor: 'green', 
                            fill: false,
                            tension: 0.3
                        },
                        { 
                            label: 'NH3N - Clean', 
                            data: data.nh3n.clean, 
                            borderColor: 'blue', 
                            fill: false,
                            tension: 0.3
                        },
                        { 
                            label: 'SS - Clean', 
                            data: data.ss.clean, 
                            borderColor: 'purple', 
                            fill: false,
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'top' } 
                    },
                    scales: { 
                        x: { 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Year'
                            }
                        }, 
                        y: { 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Proportion of Clean Basins (%)'
                            },
                            max: 100
                        } 
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });

            // Bar Chart
            const ctx3 = document.getElementById('barChart').getContext('2d');
            new Chart(ctx3, {
                type: 'bar',
                data: {
                    labels: data.years,
                    datasets: [
                        { 
                            label: 'BOD5 - Polluted', 
                            data: data.bod5.polluted, 
                            backgroundColor: 'rgba(255, 99, 132, 0.7)' 
                        },
                        { 
                            label: 'NH3N - Polluted', 
                            data: data.nh3n.polluted, 
                            backgroundColor: 'rgba(54, 162, 235, 0.7)' 
                        },
                        { 
                            label: 'SS - Polluted', 
                            data: data.ss.polluted, 
                            backgroundColor: 'rgba(153, 102, 255, 0.7)' 
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'top' } 
                    },
                    scales: { 
                        x: { 
                            stacked: false,
                            title: {
                                display: true,
                                text: 'Year'
                            }
                        }, 
                        y: { 
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Proportion of Polluted Basins (%)'
                            },
                            max: 100
                        } 
                    },
                    animation: {
                        duration: 1000,
                        easing: 'easeOutQuart'
                    }
                }
            });
        }, 50);
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
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});