import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { dataService } from '../services/dataService';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement,
    Filler
);

const Analytics = () => {
    const { getPredictions, getReportsData } = useData();
    const [reportData, setReportData] = useState(null);
    const [predictionData, setPredictionData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [dateRange, setDateRange] = useState({
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
    });

    const [rfmData, setRfmData] = useState([]);
    const [abcData, setAbcData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch basic report data
                const reportRes = await getReportsData({ start_date: dateRange.start, end_date: dateRange.end });
                setReportData(reportRes.data);

                // Fetch AI Predictions & Advanced Analytics
                const [predictRes, rfmRes, abcRes] = await Promise.all([
                    getPredictions(),
                    dataService.getRFMAnalysis(),
                    dataService.getABCAnalysis()
                ]);

                setPredictionData(predictRes.data);
                setRfmData(rfmRes.data);
                setAbcData(abcRes.data);

            } catch (err) {
                console.error("Failed to load analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dateRange, getReportsData, getPredictions]);

    if (loading) {
        return <div className="p-6">Loading analytics...</div>;
    }

    if (!reportData) {
        return <div className="p-6">Failed to load analytics data.</div>;
    }

    const { sales_by_salesman, sales_by_product, sales_by_month } = reportData;

    // Helper to calculate totals from backend response
    const totalRevenue = Object.values(sales_by_salesman).reduce((sum, s) => sum + s.amount, 0);
    const totalOrders = Object.values(sales_by_salesman).reduce((sum, s) => sum + s.count, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Chart Data
    const salesmanChartData = {
        labels: Object.keys(sales_by_salesman),
        datasets: [
            {
                label: 'Sales Amount',
                data: Object.values(sales_by_salesman).map(s => s.amount),
                backgroundColor: [
                    '#1890ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96'
                ],
            },
        ],
    };

    const productChartData = {
        labels: Object.keys(sales_by_product),
        datasets: [
            {
                label: 'Revenue by Product',
                data: Object.values(sales_by_product).map(p => p.amount),
                backgroundColor: '#1890ff',
            },
        ],
    };

    const monthlyChartData = {
        labels: Object.keys(sales_by_month),
        datasets: [
            {
                label: 'Monthly Sales',
                data: Object.values(sales_by_month),
                borderColor: '#1890ff',
                backgroundColor: 'rgba(24, 144, 255, 0.1)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    // Prediction Chart Data
    let predictionChartData = null;
    if (predictionData && predictionData.history && predictionData.forecast) {
        const historyLabels = predictionData.history.map(d => new Date(d.date).toLocaleDateString('default', { month: 'short', year: '2-digit' }));
        const forecastLabels = predictionData.forecast.map(d => new Date(d.date).toLocaleDateString('default', { month: 'short', year: '2-digit' }));

        predictionChartData = {
            labels: [...historyLabels, ...forecastLabels],
            datasets: [
                {
                    label: 'Historical Sales',
                    data: [...predictionData.history.map(d => d.amount), ...new Array(predictionData.forecast.length).fill(null)],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    tension: 0.3,
                    fill: false,
                    pointRadius: 4,
                },
                {
                    label: 'Predicted Sales',
                    data: [...new Array(predictionData.history.length).fill(null), ...predictionData.forecast.map(d => d.predicted_amount)],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: false,
                    pointRadius: 4,
                }
            ]
        };
    }

    // RFM Chart Data
    const rfmSegments = rfmData.reduce((acc, curr) => {
        acc[curr.segment] = (acc[curr.segment] || 0) + 1;
        return acc;
    }, {});

    // Group customers by segment for tooltip
    const rfmDetails = rfmData.reduce((acc, curr) => {
        if (!acc[curr.segment]) acc[curr.segment] = [];
        acc[curr.segment].push(`${curr.customer_name} (₹${curr.monetary})`);
        return acc;
    }, {});

    const rfmChartData = {
        labels: Object.keys(rfmSegments),
        datasets: [{
            data: Object.values(rfmSegments),
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        }]
    };

    const rfmOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        const customers = rfmDetails[label] || [];
                        const topCustomers = customers.slice(0, 5); // Show top 5
                        const remaining = customers.length - 5;

                        let lines = [`${label}: ${value} Customers`];
                        topCustomers.forEach(c => lines.push(`  • ${c}`));
                        if (remaining > 0) lines.push(`  ...and ${remaining} more`);

                        return lines;
                    }
                }
            },
            legend: {
                position: 'bottom'
            }
        }
    };

    // ABC Chart Data
    // abcData is now [{product_id, name, amount, class}, ...]
    // We need to group by class
    const abcGroups = { A: [], B: [], C: [] };
    if (Array.isArray(abcData)) {
        abcData.forEach(item => {
            if (abcGroups[item.class]) {
                abcGroups[item.class].push(item);
            }
        });
    }

    const abcChartData = {
        labels: ['Class A', 'Class B', 'Class C'],
        datasets: [{
            label: 'Product Count',
            data: [abcGroups.A.length, abcGroups.B.length, abcGroups.C.length],
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        }]
    };

    const abcOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const label = context.label;
                        const className = label.split(' ')[1]; // "Class A" -> "A"
                        const products = abcGroups[className] || [];
                        const value = context.raw;

                        // Sort by amount desc
                        products.sort((a, b) => b.amount - a.amount);

                        const topProducts = products.slice(0, 5);
                        const remaining = products.length - 5;

                        let lines = [`${label}: ${value} Products`];
                        topProducts.forEach(p => lines.push(`  • ${p.name} (₹${p.amount})`));
                        if (remaining > 0) lines.push(`  ...and ${remaining} more`);

                        return lines;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    return (
        <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Analytics Dashboard</h1>
                    <p className="text-slate-500">Visual insights and AI predictions</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="bg-transparent border-none text-sm text-slate-600 focus:ring-0"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="bg-transparent border-none text-sm text-slate-600 focus:ring-0"
                    />
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-2xl">💰</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-800">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl">📦</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Orders</p>
                        <p className="text-2xl font-bold text-slate-800">{totalOrders}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-2xl">📊</div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Avg. Order Value</p>
                        <p className="text-2xl font-bold text-slate-800">₹{avgOrderValue.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            {/* AI Prediction Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <span>🤖</span> AI Sales Forecast
                        </h3>
                        <p className="text-sm text-slate-500">Predicted revenue for the next 6 months</p>
                    </div>
                </div>

                <div className="h-80">
                    {predictionChartData ? (
                        <Line data={predictionChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    ) : (
                        <div className="h-full flex items-center justify-center text-slate-400">Not enough data for prediction</div>
                    )}
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Sales Trend</h3>
                    <div className="h-64">
                        <Line data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Sales by Salesman</h3>
                    <div className="h-64">
                        <Pie data={salesmanChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue by Product</h3>
                    <div className="h-64">
                        <Bar data={productChartData} options={{ responsive: true, maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Advanced Analytics Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Customer Segmentation (RFM)</h3>
                    <div className="h-64">
                        <Pie data={rfmChartData} options={rfmOptions} />
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Champions</span>
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">Loyal</span>
                        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">At Risk</span>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-slate-800 mb-6">Inventory Health (ABC Analysis)</h3>
                    <div className="h-64">
                        <Bar data={abcChartData} options={abcOptions} />
                    </div>
                    <p className="text-sm text-center text-slate-500 mt-4">
                        Class A items contribute to 80% of revenue. Keep them in stock!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
