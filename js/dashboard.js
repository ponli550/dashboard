// Sample data - in a real implementation, this would be loaded from JSON files
const sampleData = {
    mineral_extraction: {
        insights: [
            "Iron ore extraction has increased by 15% in the past year, primarily in Pahang state.",
            "Bauxite mining shows the highest growth rate at 22.3% across all mineral types.",
            "Metallic minerals dominate production at 68.5% of total volume."
        ],
        problems: [
            "Tin mining operations show concerning environmental impact in water catchment areas.",
            "Regulatory compliance issues identified in 23% of small-scale mining operations.",
            "Increasing extraction rates may not be sustainable in key regions."
        ],
        key_points: [
            "Need for improved environmental monitoring around extraction sites.",
            "Opportunity for sustainable mining practices in developing regions.",
            "Importance of balancing economic benefits with environmental protection."
        ]
    },
    water_quality: {
        insights: [
            "Average water pH level across all locations is 6.8.",
            "Klang River basin has the most samples with pH below recommended levels.",
            "Johor shows elevated contaminant levels that require attention."
        ],
        problems: [
            "Industrial runoff contributing to declining water quality in urban areas.",
            "Heavy metal contamination detected in 18% of samples near mining operations.",
            "Inadequate wastewater treatment infrastructure in rapidly developing regions."
        ],
        key_points: [
            "Critical need for improved water treatment facilities in urban centers.",
            "Importance of buffer zones between industrial areas and water sources.",
            "Potential for green infrastructure to mitigate urban runoff issues."
        ]
    },
    timber_production: {
        insights: [
            "Sarawak is the highest timber producing region with 3,245,000 units.",
            "Kelantan has the lowest sustainability index at 3.45.",
            "Sabah has the highest timber species diversity with 28 different species."
        ],
        problems: [
            "Deforestation rates exceed sustainable levels in 35% of logging areas.",
            "Illegal logging remains a significant challenge in remote regions.",
            "Replanting efforts lag behind harvesting rates in key timber-producing states."
        ],
        key_points: [
            "Need for stronger enforcement of sustainable forestry practices.",
            "Importance of indigenous community involvement in forest management.",
            "Potential for eco-tourism as an alternative economic driver."
        ]
    },
    integrated: {
        integrated_insights: [
            "Strong correlation between mining activities and downstream water quality degradation.",
            "Regions with sustainable timber practices show better overall environmental health metrics.",
            "Urban development pressure is creating competing demands for water resources and land use."
        ],
        systemic_problems: [
            "Lack of integrated planning across resource management sectors.",
            "Economic development priorities often override environmental protection measures.",
            "Insufficient data sharing between agencies hampers coordinated response."
        ],
        recommendations: [
            "Implement integrated watershed management approaches across all resource sectors.",
            "Develop cross-sector sustainability metrics and reporting requirements.",
            "Increase community involvement in environmental monitoring and decision-making."
        ]
    },
    // Add chart data
    charts: {
        mineral: {
            labels: ["Iron", "Bauxite", "Tin", "Gold", "Copper"],
            values: [4500, 3200, 2100, 1800, 2700]
        },
        water: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            values: [72, 68, 65, 70, 75, 78, 76, 74, 72, 70, 73, 75]
        },
        timber: {
            labels: ["Sarawak", "Sabah", "Pahang", "Kelantan", "Others"],
            values: [45, 25, 15, 10, 5]
        },
        integrated: {
            labels: ["Water Quality", "Forest Cover", "Biodiversity", "Air Quality", "Soil Health", "Waste Management"],
            current: [65, 48, 52, 70, 55, 60],
            target: [85, 75, 80, 90, 75, 85]
        }
    }
};

// Function to simulate API call to Deepseek
async function analyzeWithDeepseek(dataType) {
    // In a real implementation, this would make an actual API call
    // For this demo, we'll just return the sample data after a delay
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(sampleData[dataType]);
        }, 1500); // Simulate API delay
    });
}

// Function to load data from JSON file
async function loadDataFromJson() {
    try {
        // Use a relative path that works with static file serving
        const response = await fetch('./dashboard.json');
        if (!response.ok) {
            throw new Error('Failed to load dashboard data');
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading JSON data:', error);
        // Fall back to sample data if JSON loading fails
        return sampleData;
    }
}

// Function to display insights in the UI
function displayInsights(containerId, insights) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    insights.forEach(insight => {
        const div = document.createElement('div');
        div.className = 'insight-item';
        div.textContent = insight;
        container.appendChild(div);
    });
}

// Function to display problems in the UI
function displayProblems(containerId, problems) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    problems.forEach(problem => {
        const div = document.createElement('div');
        div.className = 'problem-item';
        div.textContent = problem;
        container.appendChild(div);
    });
}

// Function to display key points in the UI
function displayKeyPoints(containerId, keyPoints) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    if (!keyPoints) return;
    
    keyPoints.forEach(point => {
        const div = document.createElement('div');
        div.className = 'key-point-item';
        div.textContent = point;
        container.appendChild(div);
    });
}

// Chart creation functions
function createMineralChart(data) {
    const ctx = document.getElementById('mineralChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Extraction Volume (tons)',
                data: data.values,
                backgroundColor: 'rgba(40, 167, 69, 0.6)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function createWaterChart(data) {
    const ctx = document.getElementById('waterChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Water Quality Index',
                data: data.values,
                backgroundColor: 'rgba(23, 162, 184, 0.2)',
                borderColor: 'rgba(23, 162, 184, 1)',
                borderWidth: 2,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function createTimberChart(data) {
    const ctx = document.getElementById('timberChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    'rgba(255, 193, 7, 0.6)',
                    'rgba(40, 167, 69, 0.6)',
                    'rgba(23, 162, 184, 0.6)',
                    'rgba(220, 53, 69, 0.6)',
                    'rgba(111, 66, 193, 0.6)'
                ],
                borderColor: [
                    'rgba(255, 193, 7, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(220, 53, 69, 1)',
                    'rgba(111, 66, 193, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

function createIntegratedChart(data) {
    const ctx = document.getElementById('integratedChart');
    if (!ctx) return;
    
    new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Current Status',
                data: data.current,
                backgroundColor: 'rgba(220, 53, 69, 0.2)',
                borderColor: 'rgba(220, 53, 69, 1)',
                borderWidth: 2
            }, {
                label: 'Target',
                data: data.target,
                backgroundColor: 'rgba(40, 167, 69, 0.2)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

// Main function to load and display all data
async function loadAllData() {
    const loadingElement = document.getElementById('loading');
    const loadDataBtn = document.getElementById('loadDataBtn');
    
    if (loadingElement) loadingElement.style.display = 'block';
    if (loadDataBtn) loadDataBtn.disabled = true;
    
    try {
        // Try to load data from JSON file first, fall back to sample data
        const data = await loadDataFromJson();
        
        // Load mineral extraction data
        if (data.mineral_extraction) {
            displayInsights('mineralInsights', data.mineral_extraction.insights);
            displayProblems('mineralProblems', data.mineral_extraction.problems);
            displayKeyPoints('mineralKeyPoints', data.mineral_extraction.key_points);
        }
        
        // Load water quality data
        if (data.water_quality) {
            displayInsights('waterInsights', data.water_quality.insights);
            displayProblems('waterProblems', data.water_quality.problems);
            displayKeyPoints('waterKeyPoints', data.water_quality.key_points);
        }
        
        // Load timber production data
        if (data.timber_production) {
            displayInsights('timberInsights', data.timber_production.insights);
            displayProblems('timberProblems', data.timber_production.problems);
            displayKeyPoints('timberKeyPoints', data.timber_production.key_points);
        }
        
        // Load integrated analysis
        if (data.integrated) {
            displayInsights('integratedInsights', data.integrated.integrated_insights);
            displayProblems('systemicProblems', data.integrated.systemic_problems);
            displayKeyPoints('recommendations', data.integrated.recommendations);
        }
        
        // Create charts if chart data exists
        if (data.charts) {
            if (data.charts.mineral) createMineralChart(data.charts.mineral);
            if (data.charts.water) createWaterChart(data.charts.water);
            if (data.charts.timber) createTimberChart(data.charts.timber);
            if (data.charts.integrated) createIntegratedChart(data.charts.integrated);
        }
        
        // Show all sections
        const dashboardContent = document.getElementById('dashboardContent');
        const integratedSection = document.getElementById('integratedSection');
        
        if (dashboardContent) dashboardContent.style.display = 'flex';
        if (integratedSection) integratedSection.style.display = 'block';
    } catch (error) {
        console.error('Error loading data:', error);
        alert('An error occurred while loading the data. Please try again.');
    } finally {
        if (loadingElement) loadingElement.style.display = 'none';
        if (loadDataBtn) loadDataBtn.disabled = false;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const loadDataBtn = document.getElementById('loadDataBtn');
    if (loadDataBtn) {
        loadDataBtn.addEventListener('click', loadAllData);
    } else {
        // If there's no load button, load data automatically
        loadAllData();
    }
});