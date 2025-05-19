document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding content
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Time filter functionality for chart
    const timeButtons = document.querySelectorAll('.time-btn');
    
    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            timeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Update chart based on time filter
            const timeRange = button.getAttribute('data-time');
            updateChart(timeRange);
        });
    });
    
    // Initialize chart
    let priceChart; // global reference

document.addEventListener('DOMContentLoaded', function () {
    // Existing UI setup code...

    setupTimeButtons(); // ⬅️ Add this line to activate time filter buttons
    fetchChartData('30'); // Default chart: last 30 days
});

    // Simulate price updates
    fetchRealBTCPrice();
    fetchChartData();
    updateStats();
    setInterval(fetchRealBTCPrice, 300000); // Optional: update price every 5 min


    
    // Initialize chart with sample data
    function initializeChart() {
        const ctx = document.getElementById('priceChart').getContext('2d');
        
        // Generate sample data for different time ranges
        const allData = generateSampleData('all');
        
        priceChart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Bitcoin Price (USD)',
                    data: allData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM d, yyyy',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: '#e2e8f0'
                        },
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                return 'Price: $' + context.parsed.y.toLocaleString();
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
    
    // Update chart based on time range
    function updateChart(timeRange) {
        const newData = generateSampleData(timeRange);
        
        priceChart.data.datasets[0].data = newData;
        
        // Adjust time unit based on range
        let timeUnit;
        switch(timeRange) {
            case '24h':
                timeUnit = 'hour';
                break;
            case '7d':
                timeUnit = 'day';
                break;
            case '30d':
                timeUnit = 'day';
                break;
            case '90d':
                timeUnit = 'month';
                break;
            case '1y':
                timeUnit = 'month';
                break;
            default:
                timeUnit = 'year';
        }
        
        priceChart.options.scales.x.time.unit = timeUnit;
        priceChart.update();
    }
    
    // Generate sample data for different time ranges
    function generateSampleData(range) {
        const now = new Date();
        let dataPoints = 100;
        let daysBack = 365;
        
        switch(range) {
            case '24h':
                dataPoints = 24;
                daysBack = 1;
                break;
            case '7d':
                dataPoints = 7;
                daysBack = 7;
                break;
            case '30d':
                dataPoints = 30;
                daysBack = 30;
                break;
            case '90d':
                dataPoints = 90;
                daysBack = 90;
                break;
            case '1y':
                dataPoints = 12;
                daysBack = 365;
                break;
            default:
                dataPoints = 365;
                daysBack = 365 * 3;
        }
        
        const data = [];
        let basePrice = 50000;
        
        for (let i = 0; i < dataPoints; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() - (daysBack * (1 - i/dataPoints)));
            
            // Simulate price movement with some randomness
            const volatility = 0.05;
            const rnd = Math.random();
            let changePercent = 2 * volatility * rnd;
            if (changePercent > volatility) {
                changePercent -= (2 * volatility);
            }
            
            basePrice = basePrice * (1 + changePercent);
            
            data.push({
                x: date,
                y: Math.round(basePrice)
            });
        }
        
        return data;
    }
    
    // Simulate price updates
    function simulatePriceUpdates() {
        const priceElement = document.getElementById('btc-price');
        let currentPrice = parseFloat(priceElement.textContent.replace(/,/g, ''));
        
        // Update price every 5 seconds
        setInterval(() => {
            // Random price change between -0.5% and +0.5%
            const change = (Math.random() - 0.5) / 100;
            currentPrice = currentPrice * (1 + change);
            
            // Update displayed price
            priceElement.textContent = currentPrice.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            
            // Update price change indicator
            const changeElement = document.querySelector('.price-change');
            const changePercent = (change * 100).toFixed(2);
            
            if (change >= 0) {
                changeElement.textContent = `+${changePercent}%`;
                changeElement.classList.remove('negative');
                changeElement.classList.add('positive');
            } else {
                changeElement.textContent = `${changePercent}%`;
                changeElement.classList.remove('positive');
                changeElement.classList.add('negative');
            }
        }, 5000);
    }
    
    // Add click event to info cards in About Us section
    const infoCards = document.querySelectorAll('.info-card');
    
    infoCards.forEach(card => {
        card.addEventListener('click', function() {
            this.querySelector('.info-inner').style.transform = this.querySelector('.info-inner').style.transform === 'rotateY(180deg)' ? 'rotateY(0deg)' : 'rotateY(180deg)';
        });
    });
    async function fetchRealBTCPrice() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
        const data = await response.json();
        const price = data.bitcoin.usd;

        const priceElement = document.getElementById('btc-price');
        priceElement.textContent = price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    } catch (error) {
        console.error("Price fetch failed:", error);
    }
}
function setupTimeButtons() {
    const timeButtons = document.querySelectorAll('.time-btn');

    timeButtons.forEach(button => {
        button.addEventListener('click', () => {
            timeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const timeRange = button.getAttribute('data-time');
            const coingeckoRange = convertToDays(timeRange);
            fetchChartData(coingeckoRange);
        });
    });
}

function convertToDays(range) {
    switch (range) {
        case '24h': return '1';
        case '7d': return '7';
        case '30d': return '30';
        case '90d': return '90';
        case '1y': return '365';
        case 'all': return 'max';
        default: return '30';
    }
}

async function fetchChartData(days) {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=${days}`);
        const data = await response.json();

        const prices = data.prices.map(p => ({
            x: new Date(p[0]),
            y: p[1]
        }));

        if (priceChart) {
            priceChart.data.datasets[0].data = prices;
            priceChart.update();
        } else {
            const ctx = document.getElementById('priceChart').getContext('2d');
            priceChart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [{
                        label: 'Bitcoin Price (USD)',
                        data: prices,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.1,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                tooltipFormat: 'MMM d, yyyy',
                                displayFormats: {
                                    hour: 'HH:mm',
                                    day: 'MMM d',
                                    month: 'MMM yyyy',
                                    year: 'yyyy'
                                }
                            },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: false,
                            grid: { color: '#e2e8f0' },
                            ticks: {
                                callback: value => '$' + value.toLocaleString()
                            }
                        }
                    },
                    plugins: {
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            callbacks: {
                                label: context => 'Price: $' + context.parsed.y.toLocaleString()
                            }
                        },
                        legend: { display: false }
                    },
                    interaction: {
                        mode: 'nearest',
                        axis: 'x',
                        intersect: false
                    }
                }
            });
        }
    } catch (error) {
        console.error("Failed to fetch chart data:", error);
    }
}


async function fetchChartData() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=30');
        const data = await response.json();

        const prices = data.prices.map(p => ({
            x: new Date(p[0]),
            y: p[1]
        }));

        const ctx = document.getElementById('priceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Bitcoin Price (USD)',
                    data: prices,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            tooltipFormat: 'MMM d, yyyy',
                            displayFormats: { day: 'MMM d' }
                        },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: false,
                        grid: { color: '#e2e8f0' },
                        ticks: {
                            callback: value => '$' + value.toLocaleString()
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: context => 'Price: $' + context.parsed.y.toLocaleString()
                        }
                    },
                    legend: { display: false }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    } catch (error) {
        console.error("Chart data fetch failed:", error);
    }
}
async function updateStats() {
    try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true');
        const data = await response.json();
        const mkt = data.market_data;

        document.getElementById('stat-price').textContent = `$${mkt.current_price.usd.toLocaleString()}`;
        document.getElementById('stat-24h').textContent = `$${mkt.low_24h.usd.toLocaleString()} / $${mkt.high_24h.usd.toLocaleString()}`;
        document.getElementById('stat-7d').textContent = `$${mkt.low_7d.usd.toLocaleString()} / $${mkt.high_7d.usd.toLocaleString()}`;
        document.getElementById('stat-marketcap').innerHTML = `$${(mkt.market_cap.usd / 1e12).toFixed(2)}T <span class="positive">${mkt.market_cap_change_percentage_24h.toFixed(2)}%</span>`;
        document.getElementById('stat-volume').innerHTML = `$${(mkt.total_volume.usd / 1e9).toFixed(2)}B <span class="positive">+${(mkt.total_volume.usd > 0 ? 5.67 : 0)}%</span>`;
        document.getElementById('stat-supply').textContent = `${mkt.circulating_supply.toLocaleString()} BTC`;
    } catch (err) {
        console.error("Failed to update stats:", err);
    }
}


        
});