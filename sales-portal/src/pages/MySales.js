
import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MySales = () => {
    const { sales, products, deleteSale, loading } = useData();
    const { user } = useAuth();
    const location = useLocation();

    // Filter sales to show only the current user's sales
    const mySales = sales.filter(s => s.user_id === user.id);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this sale?')) {
            const result = await deleteSale(id);
            if (result.success) {
                toast.success('Sale deleted!');
            } else {
                toast.error(result.message);
            }
        }
    };

    const calculateTotal = () => {
        return mySales.reduce((sum, sale) => sum + sale.amount, 0);
    };

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Unknown Product';
    };

    const exportToCSV = () => {
        if (mySales.length === 0) return;

        const headers = ['Date', 'Product', 'Client/Trader', 'Quantity', 'Amount'];
        const rows = mySales.map(sale => [
            new Date(sale.date).toLocaleDateString(),
            getProductName(sale.product_id),
            sale.customer_name || 'N/A',
            sale.quantity,
            `₹${sale.amount}`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "my_sales.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const exportToPDF = () => {
        if (mySales.length === 0) return;

        const doc = new jsPDF();

        // Add Title
        doc.setFontSize(18);
        doc.text("My Sales Report", 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        doc.text(`Salesman: ${user.name}`, 14, 36);

        // Define Table Columns and Rows
        const tableColumn = ["Date", "Product", "Client/Trader", "Quantity", "Amount"];
        const tableRows = [];

        const sortedSales = [...mySales].sort((a, b) => new Date(a.date) - new Date(b.date));

        sortedSales.forEach(sale => {
            const saleData = [
                new Date(sale.date).toLocaleDateString('en-GB'),
                getProductName(sale.product_id),
                sale.customer_name || 'N/A',
                sale.quantity,
                `Rs. ${sale.amount.toLocaleString()}`
            ];
            tableRows.push(saleData);
        });

        // Generate Table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 3 },
            headStyles: { fillColor: [66, 139, 202] },
        });

        // Save PDF
        doc.save("my_sales.pdf");
    };

    if (loading) {
        return <div className="loading">Loading sales...</div>;
    }

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">My Sales</h1>
                    <p className="text-slate-500 mt-1">Track your personal sales performance</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportToPDF}
                        disabled={mySales.length === 0}
                        className={`flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm hover:shadow-md ${mySales.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span>📄</span> PDF
                    </button>
                    <button
                        onClick={exportToCSV}
                        disabled={mySales.length === 0}
                        className={`flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm hover:shadow-md ${mySales.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <span>📊</span> CSV
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                        💰
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">My Revenue</p>
                        <p className="text-2xl font-bold text-slate-800">₹{calculateTotal().toLocaleString()}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                        📦
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">My Transactions</p>
                        <p className="text-2xl font-bold text-slate-800">{mySales.length}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                        📊
                    </div>
                    <div>
                        <p className="text-slate-500 text-sm font-medium uppercase tracking-wide">Avg. Transaction</p>
                        <p className="text-2xl font-bold text-slate-800">
                            ₹{mySales.length > 0 ? Math.round(calculateTotal() / mySales.length).toLocaleString() : 0}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sales Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="p-5">Date</th>
                                <th className="p-5">Product</th>
                                <th className="p-5">Client / Trader</th>
                                <th className="p-5 text-center">Quantity</th>
                                <th className="p-5 text-right">Amount</th>
                                <th className="p-5 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mySales.length > 0 ? (
                                [...mySales].sort((a, b) => new Date(a.date) - new Date(b.date)).map((sale) => (
                                    <tr key={sale.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-5 text-slate-600 font-medium">
                                            {new Date(sale.date).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'short', day: 'numeric'
                                            })}
                                        </td>
                                        <td className="p-5">
                                            <span className="text-slate-800 font-medium block">
                                                {getProductName(sale.product_id)}
                                            </span>
                                        </td>
                                        <td className="p-5 text-slate-600">
                                            {sale.customer_name || <span className="text-slate-400 italic">N/A</span>}
                                        </td>
                                        <td className="p-5 text-center">
                                            <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-sm font-medium">
                                                {sale.quantity}
                                            </span>
                                        </td>
                                        <td className="p-5 text-right font-bold text-slate-800">
                                            ₹{sale.amount.toLocaleString()}
                                        </td>
                                        <td className="p-5 text-center">
                                            <button
                                                className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                onClick={() => handleDelete(sale.id)}
                                                title="Delete Record"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="text-3xl">📭</span>
                                            <p>No sales records found. Start recording today!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>


        </div>
    );
};

export default MySales;
