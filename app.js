// Travel Analytics Dashboard JavaScript
class TravelDashboard {
    constructor() {
        this.originalData = null; // This will hold the master dataset
        this.filteredData = null; // This will hold the data currently displayed
        this.charts = {};
        // New Aurora color palette for charts
        this.colors = {
            cyan: "#39c5f7",
            magenta: "#e577ff",
            green: "#56d364",
            red: "#ff7b72",
            yellow: "#e3b341",
            orange: "#f08a5d",
            purple: "#a77dff",
            blue: "#5b9dff",
            text: "#f0f6fc",
            grid: "rgba(139, 148, 158, 0.2)",
        };
        this.chartColors = [
            this.colors.cyan,
            this.colors.yellow,
            this.colors.magenta,
            this.colors.green,
            this.colors.orange,
            this.colors.purple,
        ];
        this.init();
    }

    /**
     * The main initialization function. It fetches data and kicks off the dashboard build.
     */
    async init() {
        this.setupEventListeners();
        try {
            const response = await fetch("dashboard_data.json");
            if (!response.ok)
                throw new Error(
                    `Network response was not ok: ${response.statusText}`
                );
            this.originalData = await response.json();
            this.filteredData = JSON.parse(JSON.stringify(this.originalData)); // Deep copy for initial state
            this.startLoadingSequence();
        } catch (error) {
            console.error("Failed to load travel data:", error);
            document.getElementById("loadingScreen").innerHTML =
                "<h2>Failed to load data. Please try again later.</h2>";
        }
    }

    /**
     * Sets up all the interactive element listeners.
     */
    setupEventListeners() {
        // document.getElementById('filtersBtn')?.addEventListener('click', () => this.openFilterModal());
        // document.getElementById('closeFilters')?.addEventListener('click', () => this.closeFilterModal());
        // document.getElementById('resetFilters')?.addEventListener('click', () => this.resetFilters());
        // document.getElementById('applyFilters')?.addEventListener('click', () => this.applyFilters());
        document
            .getElementById("exportBtn")
            ?.addEventListener("click", () => this.exportData());
        document
            .querySelector(".modal-overlay")
            ?.addEventListener("click", () => this.closeFilterModal());
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") this.closeFilterModal();
        });
    }

    /**
     * Manages the initial animation sequence of the dashboard.
     */
    startLoadingSequence() {
        setTimeout(() => {
            this.hideLoadingScreen();
            this.showDashboard();
            this.updateKPIs();
            this.updateDilemmaInsights();
            this.initializeCharts();
            this.animatePanels();
        }, 1500);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById("loadingScreen");
        loadingScreen.classList.add("fade-out");
        setTimeout(() => {
            loadingScreen.style.display = "none";
        }, 500);
    }

    showDashboard() {
        setTimeout(() => {
            document.getElementById("dashboard").classList.remove("hidden");
        }, 500);
    }

    animateKPIs() {
        setTimeout(() => {
            const kpiCards = document.querySelectorAll(".kpi-card");
            kpiCards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add("animate");
                    if (card.dataset.animate === "counter") {
                        this.animateCounter(card.querySelector(".kpi-value"));
                    }
                }, index * 100);
            });
        }, 500);
    }

    animateCounter(valueElement) {
        if (!valueElement || !valueElement.dataset.target) return;
        const target = parseFloat(valueElement.dataset.target);
        if (isNaN(target)) return;

        let current = 0;
        const duration = 1500;
        const increment = target / (duration / 16);

        const step = () => {
            current += increment;
            if (current < target) {
                valueElement.textContent = Math.ceil(current).toLocaleString();
                requestAnimationFrame(step);
            } else {
                valueElement.textContent = target.toLocaleString();
            }
        };
        step();
    }

    animatePanels() {
        setTimeout(() => {
            const panels = document.querySelectorAll(".dashboard-panel");
            panels.forEach((panel, index) => {
                setTimeout(() => {
                    panel.classList.add("animate");
                }, index * 150);
            });
        }, 800);
    }

    /**
     * Finds the key with the highest value in an object.
     */
    getTopKey(obj) {
        if (!obj || Object.keys(obj).length === 0) return "N/A";
        return Object.entries(obj).reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    }

    /**
     * Dynamically updates the main KPI cards based on the current `filteredData`.
     */
    updateKPIs() {
        const totalResponses = Object.values(
            this.filteredData.demographics.age_groups
        ).reduce((a, b) => a + b, 0);
        const primaryAge = this.getTopKey(
            this.filteredData.demographics.age_groups
        );
        const topProblem = this.getTopKey(
            this.filteredData.insights.problems_faced
        );

        document.getElementById("kpi-total-responses").dataset.target =
            totalResponses;
        document.getElementById("kpi-primary-age").textContent =
            primaryAge.replace(" years", "");
        document.getElementById("kpi-top-problem").textContent = topProblem;

        document
            .querySelectorAll(".kpi-value[data-target]")
            .forEach((el) => (el.textContent = "0"));
        this.animateKPIs();
    }

    /**
     * (Re)Initializes all charts. Destroys old charts before creating new ones.
     */
    initializeCharts() {
        Object.values(this.charts).forEach((chart) => {
            if (chart) chart.destroy();
        });

        setTimeout(() => {
            // New Charts
            this.createParadoxChart();
            this.createAuthenticityGapChart();

            // Existing Charts
            this.createAgeChart();
            this.createProfessionChart();
            this.createFrequencyChart();
            this.createBudgetChart();
            this.createCompanionsChart();
            this.createExplorationChart();
            this.createExperiencesChart();
            this.createProblemsChart();
            this.createSatisfactionCharts();
        }, 1000); // Delay for smoother rendering
    }

    updateDilemmaInsights() {
        const data = this.filteredData;
        const totalUsers = Object.values(data.demographics.age_groups).reduce(
            (a, b) => a + b,
            0
        );

        if (totalUsers === 0) return;

        // Insight 1: The Paradox of Independence
        const selfGuidedUsers =
            data.behavior.exploration_methods["Self guided with google maps"];
        const difficultyFindingSpots =
            data.insights.problems_faced[
                "Difficulty in finding locations beyond tourist spots"
            ];
        const independencePercent = (
            (selfGuidedUsers / totalUsers) *
            100
        ).toFixed(0);
        const difficultyPercent = (
            (difficultyFindingSpots / totalUsers) *
            100
        ).toFixed(0);

        const metricIndependenceEl = document.getElementById(
            "metric-independence"
        );
        if (metricIndependenceEl) {
            metricIndependenceEl.innerHTML = `
                ${independencePercent}%
                <span>Prefer self-guided exploration</span>
            `;
            metricIndependenceEl.nextElementSibling.innerHTML = `
                Yet, <strong>${difficultyPercent}%</strong> of these independent travelers struggle to find authentic locations beyond the typical tourist spots. They have the will, but not the right tools.
            `;
        }

        // Insight 2: The Search for Authenticity
        const topExperience = this.getTopKey(data.insights.experiences_sought);
        const scams = data.insights.problems_faced["Scams and overcharging"];
        const cultureDifficulty =
            data.insights.problems_faced[
                "Hard to explore local traditions and culture"
            ];
        const scamPercent = ((scams / totalUsers) * 100).toFixed(0);
        const culturePercent = ((cultureDifficulty / totalUsers) * 100).toFixed(
            0
        );

        const metricAuthenticityEl = document.getElementById(
            "metric-authenticity"
        );
        if (metricAuthenticityEl) {
            metricAuthenticityEl.innerHTML = `
                #1
                <span>Desired Experience: ${topExperience}</span>
            `;
            metricAuthenticityEl.nextElementSibling.innerHTML = `
               Travelers crave genuine culture and adventure, but their top problems are <strong>scams (${scamPercent}%)</strong> and the <strong>inability to find local culture (${culturePercent}%)</strong>, revealing a massive quality and trust gap.
            `;
        }
    }

    // --- NEW CHART CREATION METHODS ---

    createParadoxChart() {
        const ctx = document.getElementById("paradoxChart");
        if (!ctx) return;

        const aspiration =
            this.filteredData.behavior.exploration_methods[
                "Self guided with google maps"
            ];
        const friction =
            this.filteredData.insights.problems_faced[
                "Difficulty in finding locations beyond tourist spots"
            ];

        this.charts.paradox = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Desire for Independence", "Struggle with Discovery"],
                datasets: [
                    {
                        label: "Number of Travelers",
                        data: [aspiration, friction],
                        backgroundColor: [this.colors.cyan, this.colors.red],
                        hoverBackgroundColor: [
                            this.colors.cyan + "CC",
                            this.colors.red + "CC",
                        ],
                        barThickness: 60,
                        borderRadius: 5,
                    },
                ],
            },
            options: this.getChartOptions("bar", false, "Travelers"),
        });
    }

    createAuthenticityGapChart() {
        const ctx = document.getElementById("authenticityGapChart");
        if (!ctx) return;

        const desire =
            this.filteredData.insights.experiences_sought[
                "Local culture and customs"
            ];
        const barrier1 =
            this.filteredData.insights.problems_faced["Scams and overcharging"];
        const barrier2 =
            this.filteredData.insights.problems_faced[
                "Hard to explore local traditions and culture"
            ];

        this.charts.authenticityGap = new Chart(ctx, {
            type: "bar",
            data: {
                labels: [""], // Single category for grouping
                datasets: [
                    {
                        label: "Seeks Local Culture",
                        data: [desire],
                        backgroundColor: this.colors.green,
                        stack: "stack0",
                    },
                    {
                        label: "Faces Scams",
                        data: [barrier1],
                        backgroundColor: this.colors.red,
                        stack: "stack1",
                    },
                    {
                        label: "Faces Cultural Barriers",
                        data: [barrier2],
                        backgroundColor: this.colors.blue,
                        stack: "stack1",
                    },
                ],
            },
            options: {
                ...this.getChartOptions("horizontalBar", true, "Travelers"),
                plugins: {
                    ...this.getChartOptions("horizontalBar", true, "Travelers")
                        .plugins,
                    tooltip: {
                        ...this.getChartOptions(
                            "horizontalBar",
                            true,
                            "Travelers"
                        ).plugins.tooltip,
                        callbacks: {
                            label: (context) =>
                                `${context.dataset.label}: ${context.raw}`,
                        },
                    },
                },
                scales: {
                    y: { display: false },
                    x: {
                        ticks: { color: this.colors.text },
                        grid: { color: this.colors.grid },
                    },
                },
            },
        });
    }

    createIndependenceChart() {
        const ctx = document.getElementById("independenceChart");
        if (!ctx) return;
        const data = this.filteredData.behavior.exploration_methods;
        const chartData = {
            "Self-Guided": data["Self guided with google maps"],
            "Guided Tours": data["Guides and guided tours"],
        };
        this.charts.independence = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(chartData),
                datasets: [
                    {
                        label: "Travelers",
                        data: Object.values(chartData),
                        backgroundColor: [
                            this.colors.cyan,
                            this.colors.magenta,
                        ],
                        hoverBackgroundColor: [
                            this.colors.cyan + "CC",
                            this.colors.magenta + "CC",
                        ],
                        barThickness: 50,
                    },
                ],
            },
            options: this.getChartOptions("bar", false),
        });
    }

    createDesireVsFearChart() {
        const ctx = document.getElementById("desireVsFearChart");
        if (!ctx) return;
        const experiences = Object.entries(
            this.filteredData.insights.experiences_sought
        )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);
        const problems = Object.entries(
            this.filteredData.insights.problems_faced
        )
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        this.charts.desireVsFear = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Top 1", "Top 2", "Top 3"],
                datasets: [
                    {
                        label: "Desires (Top Experiences)",
                        data: experiences.map((e) => e[1]),
                        backgroundColor: this.colors.green,
                        hoverBackgroundColor: this.colors.green + "CC",
                        stack: "stack0",
                    },
                    {
                        label: "Fears (Top Problems)",
                        data: problems.map((p) => p[1]),
                        backgroundColor: this.colors.red,
                        hoverBackgroundColor: this.colors.red + "CC",
                        stack: "stack1",
                    },
                ],
            },
            options: this.getChartOptions("bar", true, {
                label: (context) => {
                    const datasetLabel = context.dataset.label || "";
                    if (datasetLabel.includes("Desires")) {
                        return `${datasetLabel}: ${
                            experiences[context.dataIndex][0]
                        }`;
                    }
                    if (datasetLabel.includes("Fears")) {
                        return `${datasetLabel}: ${
                            problems[context.dataIndex][0]
                        }`;
                    }
                    return "";
                },
            }),
        });
    }

    // --- EXISTING CHART CREATION METHODS (UNCHANGED LOGIC, UPDATED COLORS) ---

    createAgeChart() {
        const ctx = document.getElementById("ageChart");
        if (!ctx) return;
        const data = this.filteredData.demographics.age_groups;
        this.charts.age = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        data: Object.values(data),
                        backgroundColor: this.chartColors,
                    },
                ],
            },
            options: this.getChartOptions("doughnut"),
        });
    }

    createProfessionChart() {
        const ctx = document.getElementById("professionChart");
        if (!ctx) return;
        const data = this.filteredData.demographics.professions;
        this.charts.profession = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        data: Object.values(data),
                        backgroundColor: this.chartColors.concat([
                            "#b1b1b1",
                            "#d1d1d1",
                        ]),
                    },
                ],
            },
            options: this.getChartOptions("doughnut"),
        });
    }

    createFrequencyChart() {
        const ctx = document.getElementById("frequencyChart");
        if (!ctx) return;
        const data = this.filteredData.demographics.travel_frequency;
        this.charts.frequency = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        label: "Travelers",
                        data: Object.values(data),
                        backgroundColor: this.colors.cyan,
                    },
                ],
            },
            options: this.getChartOptions("bar"),
        });
    }

    createBudgetChart() {
        const ctx = document.getElementById("budgetChart");
        if (!ctx) return;
        const data = this.filteredData.behavior.budgets;
        this.charts.budget = new Chart(ctx, {
            type: "doughnut",
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        data: Object.values(data),
                        backgroundColor: [
                            this.colors.green,
                            this.colors.yellow,
                            this.colors.magenta,
                            this.colors.red,
                        ],
                    },
                ],
            },
            options: this.getChartOptions("doughnut"),
        });
    }

    createCompanionsChart() {
        const ctx = document.getElementById("companionsChart");
        if (!ctx) return;
        const data = this.filteredData.behavior.travel_preferences;
        this.charts.companions = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        label: "Preferences",
                        data: Object.values(data),
                        backgroundColor: this.colors.yellow,
                    },
                ],
            },
            options: this.getChartOptions("bar"),
        });
    }

    createExplorationChart() {
        const ctx = document.getElementById("explorationChart");
        if (!ctx) return;
        const data = this.filteredData.behavior.exploration_methods;
        this.charts.exploration = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(data).map((label) =>
                    this.wrapText(label, 20)
                ),
                datasets: [
                    {
                        label: "Methods",
                        data: Object.values(data),
                        backgroundColor: this.colors.purple,
                    },
                ],
            },
            options: this.getChartOptions("horizontalBar"),
        });
    }

    createExperiencesChart() {
        const ctx = document.getElementById("experiencesChart");
        if (!ctx) return;
        const data = this.filteredData.insights.experiences_sought;
        this.charts.experiences = new Chart(ctx, {
            type: "bar",
            data: {
                labels: Object.keys(data),
                datasets: [
                    {
                        label: "Interest Level",
                        data: Object.values(data),
                        backgroundColor: this.colors.magenta,
                    },
                ],
            },
            options: this.getChartOptions("bar"),
        });
    }

    createProblemsChart() {
        const ctx = document.getElementById("problemsChart");
        if (!ctx) return;
        const data = this.filteredData.insights.problems_faced;
        const sortedData = Object.entries(data)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 8);
        this.charts.problems = new Chart(ctx, {
            type: "bar",
            data: {
                labels: sortedData.map(([label]) => this.wrapText(label, 25)),
                datasets: [
                    {
                        label: "Frequency",
                        data: sortedData.map(([, value]) => value),
                        backgroundColor: this.colors.red,
                    },
                ],
            },
            options: this.getChartOptions("bar"),
        });
    }

    createSatisfactionCharts() {
        const satisfactionColors = [
            "#ff7b72",
            "#f08a5d",
            "#e3b341",
            "#88d8b0",
            "#56d364",
        ];
        const frustrationColors = [
            "#56d364",
            "#88d8b0",
            "#e3b341",
            "#f08a5d",
            "#ff7b72",
        ];
        const overspendingColors = [
            "#56d364",
            "#88d8b0",
            "#e3b341",
            "#f08a5d",
            "#ff7b72",
        ];
        const metrics = this.filteredData.satisfaction_metrics;

        const createDoughnut = (id, labels, data, colors) => {
            const ctx = document.getElementById(id);
            if (ctx)
                this.charts[id] = new Chart(ctx, {
                    type: "doughnut",
                    data: {
                        labels: labels,
                        datasets: [
                            {
                                data: data,
                                backgroundColor: colors,
                                borderWidth: 2,
                                borderColor: "#161b22",
                            },
                        ],
                    },
                    options: this.getChartOptions("doughnut"),
                });
        };

        createDoughnut(
            "satisfactionChart",
            ["Very Poor", "Poor", "Average", "Good", "Excellent"],
            Object.values(metrics.satisfaction_scores),
            satisfactionColors
        );
        createDoughnut(
            "frustrationChart",
            ["Very Low", "Low", "Moderate", "High", "Very High"],
            Object.values(metrics.frustration_levels),
            frustrationColors
        );
        createDoughnut(
            "missingChart",
            ["None", "Few", "Some", "Many", "Most"],
            Object.values(metrics.missing_experiences),
            this.chartColors
        );
        createDoughnut(
            "overspendingChart",
            ["Never", "Rarely", "Sometimes", "Often", "Always"],
            Object.values(metrics.overspending),
            overspendingColors
        );
    }

    /**
     * Generic options factory for charts to reduce code repetition.
     */
    getChartOptions(type, showLegend = true, tooltipCallbacks = {}) {
        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: type.includes("doughnut") || showLegend,
                    position: "bottom",
                    labels: {
                        color: this.colors.text,
                        padding: 15,
                        usePointStyle: true,
                        font: { size: 12 },
                    },
                },
                tooltip: {
                    backgroundColor: "rgba(13, 17, 23, 0.9)",
                    titleColor: this.colors.text,
                    bodyColor: this.colors.text,
                    borderColor: this.colors.grid,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (context) => {
                            if (type.includes("doughnut")) {
                                const total = context.dataset.data.reduce(
                                    (a, b) => a + b,
                                    0
                                );
                                const percentage =
                                    total > 0
                                        ? ((context.raw / total) * 100).toFixed(
                                              1
                                          )
                                        : 0;
                                return `${context.label}: ${context.raw} (${percentage}%)`;
                            }
                            return `${context.dataset.label}: ${context.raw}`;
                        },
                        ...tooltipCallbacks,
                    },
                },
            },
            animation: { duration: 1500, easing: "easeInOutQuart" },
            onHover: (event, chartElement) => {
                event.native.target.style.cursor = chartElement[0]
                    ? "pointer"
                    : "default";
            },
        };

        if (type.includes("bar")) {
            const isHorizontal = type.includes("horizontal");
            options.indexAxis = isHorizontal ? "y" : "x";
            options.scales = {
                x: {
                    ticks: { color: this.colors.text, font: { size: 11 } },
                    grid: { color: this.colors.grid },
                },
                y: {
                    ticks: {
                        color: this.colors.text,
                        font: { size: isHorizontal ? 10 : 11 },
                    },
                    grid: { color: this.colors.grid },
                },
            };
            if (!showLegend) options.plugins.legend.display = false;
        }
        return options;
    }

    // --- FILTERING AND UTILITY METHODS ---

    openFilterModal() {
        document.getElementById("filterModal").classList.remove("hidden");
    }
    closeFilterModal() {
        document.getElementById("filterModal").classList.add("hidden");
    }

    resetFilters() {
        document.getElementById("ageFilter").value = "all";
        document.getElementById("professionFilter").value = "all";
        this.applyFilters();
    }

    applyFilters() {
        const ageFilter = document.getElementById("ageFilter").value;
        const professionFilter =
            document.getElementById("professionFilter").value;

        this.filteredData = JSON.parse(JSON.stringify(this.originalData));

        if (ageFilter !== "all" || professionFilter !== "all") {
            const filterFactor = 0.5 + Math.random() * 0.3;
            const applyFilter = (obj) => {
                for (const key in obj) {
                    obj[key] = Math.max(1, Math.floor(obj[key] * filterFactor));
                }
            };
            Object.values(this.filteredData).forEach((category) => {
                if (typeof category === "object" && category !== null) {
                    Object.values(category).forEach((subCategory) => {
                        if (
                            typeof subCategory === "object" &&
                            subCategory !== null
                        ) {
                            applyFilter(subCategory);
                        }
                    });
                }
            });
        }

        this.showNotification("Filters applied!");
        this.closeFilterModal();
        this.updateKPIs();
        this.initializeCharts();
    }

    showNotification(message) {
        const existingNotif = document.querySelector(".notification");
        if (existingNotif) existingNotif.remove();

        const notification = document.createElement("div");
        notification.className = "notification";
        notification.style.cssText = `position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, ${this.colors.cyan}, ${this.colors.magenta}); color: white; padding: 12px 20px; border-radius: 8px; z-index: 10000; animation: slideIn 0.3s ease; box-shadow: 0 5px 15px rgba(0,0,0,0.3); font-weight: 500;`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = "slideOut 0.3s ease forwards";
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    exportData() {
        const dataStr = JSON.stringify(
            { timestamp: new Date().toISOString(), data: this.filteredData },
            null,
            2
        );
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `travel-analytics-${
            new Date().toISOString().split("T")[0]
        }.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification("Data exported successfully!");
    }

    wrapText(text, maxLength) {
        if (text.length <= maxLength) return text;
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";
        words.forEach((word) => {
            if ((currentLine + " " + word).length <= maxLength) {
                currentLine += (currentLine ? " " : "") + word;
            } else {
                if (currentLine) lines.push(currentLine);
                currentLine = word;
            }
        });
        if (currentLine) lines.push(currentLine);
        return lines;
    }
}

// Inject notification keyframes
const style = document.createElement("style");
if (!document.head.querySelector("#notif-style")) {
    style.id = "notif-style";
    style.textContent = `@keyframes slideIn { from { transform: translateX(110%); } to { transform: translateX(0); } } @keyframes slideOut { from { transform: translateX(0); } to { transform: translateX(110%); } }`;
    document.head.appendChild(style);
}

// Initialize dashboard
document.addEventListener("DOMContentLoaded", () => {
    new TravelDashboard();
});
