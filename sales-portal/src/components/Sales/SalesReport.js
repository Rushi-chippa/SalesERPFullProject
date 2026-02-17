import React, { useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
    Legend, AreaChart, Area
} from 'recharts';
import './Sales.css';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const SalesReport = ({ sales, salesmen, products }) => {
    const [timeRange, setTimeRange] = useState('all');

    // Filter by time range
    const filterByTime = (data) => {
        if (timeRange === 'all') return data;
        const now = new Date();
        const ranges = {
            '7d': 7,
            '30d': 30,
            '90d': 90,
        };
        const days = ranges[timeRange];
        const cutoff = new Date(now.setDate(now.getDate() - days));
        return data.filter((s) => new Date(s.date) >= cutoff);
    };

    const filteredSales = filterByTime(sales);
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalQuantity = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalDeals = filteredSales.length;
    const avgDeal = totalDeals > 0 ? totalRevenue / totalDeals : 0;

    // Monthly revenue
    const monthlyRevenue = {};
    filteredSales.forEach((sale) => {
        const month = sale.date.substring(0, 7);
        if (!monthlyRevenue[month]) {
            monthlyRevenue[month] = { month, revenue: 0, quantity: 0, deals: 0 };
        }
        monthlyRevenue[month].revenue += sale.totalAmount;
        monthlyRevenue[month].quantity += sale.quantity;
        monthlyRevenue[month].deals += 1;
    });
    const monthlyData = Object.values(monthlyRevenue).sort((a, b) =>
        a.month.localeCompare(b.month)
    );

    // Salesman performance
    const salesmanPerf = salesmen.map((sm) => {
        const smSales = filteredSales.filter((s) => s.salesmanId === sm.id);
        return {
            name: sm.name.split(' ')[0],
            fullName: sm.name,
            avatar: sm.avatar,
            revenue: smSales.reduce((sum, s) => sum + s.totalAmount, 0),
            quantity: smSales.reduce((sum, s) => sum + s.quantity, 0),
            deals: smSales.length,
        };
    }).sort((a, b) => b.revenue - a.revenue);

    // Product performance
    const productPerf = products.map((prod) => {
        const prodSales = filteredSales.filter((s) => s.productId === prod.id);
        return {
            name: prod.name,
            revenue: prodSales.reduce((sum, s) => sum + s.totalAmount, 0),
            quantity: prodSales.reduce((sum, s) => sum + s.quantity, 0),
        };
    }).filter((p) => p.revenue > 0).sort((a, b) => b.revenue - a.revenue);

    // Category breakdown
    const categoryBreakdown = {};
    filteredSales.forEach((sale) => {
        const product = products.find((p) => p.id === sale.productId);
        if (product) {
            const cat = product.category;
            if (!categoryBreakdown[cat]) {
                categoryBreakdown[cat] = { name: cat, value: 0 };
            }
            categoryBreakdown[cat].value += sale.totalAmount;
        }
    });
    const categoryData = Object.values(categoryBreakdown);

    // Daily trend
    const dailyTrend = {};
    filteredSales.forEach((sale) => {
        if (!dailyTrend[sale.date]) {
            dailyTrend[sale.date] = { date: sale.date, revenue: 0, quantity: 0 };
        }
        dailyTrend[sale.date].revenue += sale.totalAmount;
        dailyTrend[sale.date].quantity += sale.quantity;
    });
    const dailyData = Object.values(dailyTrend).sort((a, b) =>
        a.date.localeCompare(b.date)
    );

    // Status breakdown
    const statusData = [
        {
            name: 'Completed',
            value: filteredSales.filter((s) => s.status === 'completed').length,
        },
        {
            name: 'Pending',
            value: filteredSales.filter((s) => s.status === 'pending').length,
        },
    ];

    return (
        <div className="sales-report-page">
            {/* Header */}
            <div className="page-top">
                <div>
                    <h1 className="page-title">📊 Sales Report</h1>
                    <p className="page-subtitle">Comprehensive analytics and performance insights</p>
                </div>
                <div className="time-range-selector">
                    {['7d', '30d', '90d', 'all'].map((range) => (
                        <button
                            key={range}
                            className={`range-btn ${timeRange === range ? 'active' : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range === 'all' ? 'All Time' : `Last ${range}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="report-kpis">
                <div className="kpi-card">
                    <div className="kpi-icon blue">💰</div>
                    <div>
                        <p className="kpi-value">${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                        <p className="kpi-label">Total Revenue</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon green">📦</div>
                    <div>
                        <p className="kpi-value">{totalQuantity.toLocaleString()}</p>
                        <p className="kpi-label">Units Sold</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon purple">🤝</div>
                    <div>
                        <p className="kpi-value">{totalDeals}</p>
                        <p className="kpi-label">Total Deals</p>
                    </div>
                </div>
                <div className="kpi-card">
                    <div className="kpi-icon orange">📈</div>
                    <div>
                        <p className="kpi-value">${avgDeal.toFixed(2)}</p>
                        <p className="kpi-label">Avg Deal Size</p>
                    </div>
                </div>
            </div>

            {/* Charts Row 1 */}
            <div className="report-charts-grid">
                <div className="report-chart-card">
                    <h3>📈 Revenue Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f120" strokeWidth={2} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="report-chart-card">
                    <h3>🥧 Category Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={50}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {categoryData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="report-charts-grid">
                <div className="report-chart-card">
                    <h3>👥 Salesman Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={salesmanPerf.slice(0, 8)} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Bar dataKey="revenue" fill="#6366f1" radius={[0, 8, 8, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="report-chart-card">
                    <h3>📦 Top Products</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={productPerf.slice(0, 8)}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                            <YAxis />
                            <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                            <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly Overview */}
            <div className="report-chart-card full-width">
                <h3>📅 Monthly Overview</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} name="Revenue ($)" />
                        <Line yAxisId="right" type="monotone" dataKey="deals" stroke="#f59e0b" strokeWidth={2} name="Deals" />
                        <Line yAxisId="right" type="monotone" dataKey="quantity" stroke="#10b981" strokeWidth={2} name="Quantity" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Status & Top Performers */}
            <div className="report-charts-grid">
                <div className="report-chart-card">
                    <h3>✅ Status Breakdown</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                label
                            >
                                <Cell fill="#10b981" />
                                <Cell fill="#f59e0b" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="report-chart-card">
                    <h3>🏆 Top Performers</h3>
                    <div className="top-performers-list">
                        {salesmanPerf.slice(0, 5).map((sm, i) => (
                            <div key={i} className="performer-row">
                                <div className="performer-left">
                                    <span className="performer-rank">
                                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                                    </span>
                                    <span className="performer-avatar">{sm.avatar}</span>
                                    <div>
                                        <p className="performer-name">{sm.fullName}</p>
                                        <p className="performer-deals">{sm.deals} deals • {sm.quantity} items</p>
                                    </div>
                                </div>
                                <p className="performer-revenue">
                                    ${sm.revenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalesReport;