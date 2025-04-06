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
    
    keyPoints.forEach(point => {
        const div = document.createElement('div');
        div.className = 'key-point-item';
        div.textContent = point;
        container.appendChild(div);
    });
}

// Main function to load and display all data
async function loadAllData() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('loadDataBtn').disabled = true;
    
    try {
        // Load mineral extraction data
        const mineralData = await analyzeWithDeepseek('mineral_extraction');
        displayInsights('mineralInsights', mineralData.insights);
        displayProblems('mineralProblems', mineralData.problems);
        displayKeyPoints('mineralKeyPoints', mineralData.key_points);
        
        // Load water quality data
        const waterData = await analyzeWithDeepseek('water_quality');
        displayInsights('waterInsights', waterData.insights);
        displayProblems('waterProblems', waterData.problems);
        displayKeyPoints('waterKeyPoints', waterData.key_points);
        
        // Load timber production data
        const timberData = await analyzeWithDeepseek('timber_production');
        displayInsights('timberInsights', timberData.insights);
        displayProblems('timberProblems', timberData.problems);
        displayKeyPoints('timberKeyPoints', timberData.key_points);
        
        // Load integrated analysis
        const integratedData = await analyzeWithDeepseek('integrated');
        displayInsights('integratedInsights', integratedData.integrated_insights);
        displayProblems('systemicProblems', integratedData.systemic_problems);
        displayKeyPoints('recommendations', integratedData.recommendations);
        
        // Show all sections
        document.getElementById('dashboardContent').style.display = 'flex';
        document.getElementById('integratedSection').style.display = 'block';
    } catch (error) {
        console.error('Error loading data:', error);
        alert('An error occurred while loading the data. Please try again.');
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('loadDataBtn').disabled = false;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('loadDataBtn').addEventListener('click', loadAllData);
});