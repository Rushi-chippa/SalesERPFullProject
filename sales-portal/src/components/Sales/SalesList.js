import React, { useState } from 'react';
import Table from '../common/Table';
import Button from '../common/Button';
import Modal from '../common/Modal';
import AddSale from './AddSale';
import './Sales.css';

const SalesList = ({ sales, salesmen, products, onAdd, onDelete }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSale, setSelectedSale] = useState(null);
    const [filterSalesman, setFilterSalesman] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');

    // Filter
    const filteredSales = sales
        .filter((s) => {
            const matchSalesman = filterSalesman ? s.salesmanId === filterSalesman : true;
            const matchStatus = filterStatus ? s.status === filterStatus : true;
            const matchDate = filterDate ? s.date === filterDate : true;
            return matchSalesman && matchStatus && matchDate;
        })
        .sort((a, b) => b.date.localeCompare(a.date));

    const totalFiltered = filteredSales.reduce((sum, s) => sum + s.totalAmount, 0);
    const completedCount = filteredSales.filter((s) => s.status === 'completed').length;
    const pendingCount = filteredSales.filter((s) => s.status === 'pending').length;

    const handleDeleteClick = (sale) => {
        setSelectedSale(sale);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        onDelete(selectedSale.id);
        setShowDeleteModal(false);
        setSelectedSale(null);
    };

    const columns = [
        {
            header: 'Date',
            accessor: 'date',
            render: (row) => (
                <span className="date-cell">
                    📅 {row.date}
                </span>
            ),
        },
        {
            header: 'Product',
            render: (row) => {
                const product = products.find((p) => p.id === row.productId);
                return (
                    <div className="sale-product-cell">
                        <span className="sale-product-icon">📦</span>
                        <div>
                            <p className="sale-product-name">{product?.name || 'N/A'}</p>
                            <p className="sale-product-price">${product?.price?.toFixed(2) || '0.00'}/unit</p>
                        </div>
                    </div>
                );
            },
        },
        {
            header: 'Salesman',
            render: (row) => {
                const salesman = salesmen.find((s) => s.id === row.salesmanId);
                return (
                    <div className="sale-salesman-cell">
                        <span>{salesman?.avatar || '👤'}</span>
                        <span>{salesman?.name || 'N/A'}</span>
                    </div>
                );
            },
        },
        {
            header: 'Qty',
            accessor: 'quantity',
            render: (row) => <span className="qty-badge">{row.quantity}</span>,
        },
        {
            header: 'Total',
            accessor: 'totalAmount',
            render: (row) => (
                <span className="total-amount">${row.totalAmount.toFixed(2)}</span>
            ),
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`status-pill ${row.status}`}>{row.status}</span>
            ),
        },
        {
            header: 'Actions',
            sortable: false,
            width: '80px',
            render: (row) => (
                <button
                    className="action-btn delete"
                    onClick={() => handleDeleteClick(row)}
                    title="Delete"
                >
                    🗑️
                </button>
            ),
        },
    ];

    return (
        <div className="sales-page">
            {/* Header */}
            <div className="page-top">
                <div>
                    <h1 className="page-title">💰 Sales Records</h1>
                    <p className="page-subtitle">View and manage all sales transactions</p>
                </div>
                <Button variant="primary" size="lg" icon="➕" onClick={() => setShowAddModal(true)}>
                    Record Sale
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="sales-summary">
                <div className="summary-card total">
                    <p className="summary-label">Total Revenue</p>
                    <p className="summary-value">
                        ${totalFiltered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="summary-card">
                    <p className="summary-label">Records</p>
                    <p className="summary-value">{filteredSales.length}</p>
                </div>
                <div className="summary-card">
                    <p className="summary-label">Completed</p>
                    <p className="summary-value text-success">{completedCount}</p>
                </div>
                <div className="summary-card">
                    <p className="summary-label">Pending</p>
                    <p className="summary-value text-warning">{pendingCount}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="sales-filters">
                <select
                    value={filterSalesman}
                    onChange={(e) => setFilterSalesman(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Salesmen</option>
                    {salesmen.map((sm) => (
                        <option key={sm.id} value={sm.id}>
                            {sm.name}
                        </option>
                    ))}
                </select>
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                </select>
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="filter-select"
                />
                {(filterSalesman || filterStatus || filterDate) && (
                    <button
                        className="clear-filters"
                        onClick={() => {
                            setFilterSalesman('');
                            setFilterStatus('');
                            setFilterDate('');
                        }}
                    >
                        ✕ Clear
                    </button>
                )}
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={filteredSales}
                searchable={false}
                paginate={true}
                pageSize={12}
                emptyMessage="No sales records found. Record your first sale!"
            />

            {/* Add Sale Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Record New Sale"
                size="md"
            >
                <AddSale
                    salesmen={salesmen}
                    products={products}
                    onSubmit={(data) => {
                        onAdd(data);
                        setShowAddModal(false);
                    }}
                    onCancel={() => setShowAddModal(false)}
                />
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Sale Record"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>🗑️ Delete</Button>
                    </>
                }
            >
                <div className="delete-confirmation">
                    <span className="delete-icon">⚠️</span>
                    <p>Delete this sale record?</p>
                    <p className="delete-warning">This action cannot be undone.</p>
                </div>
            </Modal>
        </div>
    );
};

export default SalesList;