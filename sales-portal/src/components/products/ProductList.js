import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Table from '../common/Table';
import Button from '../common/Button';
import Modal from '../common/Modal';
import AddProduct from './AddProduct';
import './Products.css';

const ProductList = ({ products, onAdd, onEdit, onDelete, categories }) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [filterCategory, setFilterCategory] = useState('');
    const [filterStock, setFilterStock] = useState('');

    // Get unique categories
    const uniqueCategories = categories || [...new Set(products.map((p) => p.category))];

    // Filter products
    const filteredProducts = products.filter((p) => {
        const matchCategory = filterCategory ? p.category === filterCategory : true;
        const matchStock =
            filterStock === 'low'
                ? p.stock < 50
                : filterStock === 'medium'
                    ? p.stock >= 50 && p.stock <= 200
                    : filterStock === 'high'
                        ? p.stock > 200
                        : true;
        return matchCategory && matchStock;
    });

    // Stats
    const totalProducts = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);
    const lowStockCount = products.filter((p) => p.stock < 50).length;
    const avgPrice = products.length > 0
        ? products.reduce((sum, p) => sum + p.price, 0) / products.length
        : 0;

    const handleEdit = (product) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    const handleDeleteClick = (product) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };

    const handleDeleteConfirm = () => {
        onDelete(selectedProduct.id);
        setShowDeleteModal(false);
        setSelectedProduct(null);
    };

    const { user } = useAuth();

    const columns = [
        {
            header: 'Product',
            accessor: 'name',
            render: (row) => (
                <div className="product-cell">
                    <div className="product-thumb">📦</div>
                    <div>
                        <p className="product-name">{row.name}</p>
                        <p className="product-id">ID: {row.id?.slice(0, 8)}</p>
                    </div>
                </div>
            ),
        },
        {
            header: 'Category',
            accessor: 'category',
            render: (row) => <span className="category-tag">{row.category}</span>,
        },
        {
            header: 'Price',
            accessor: 'price',
            render: (row) => (
                <span className="price-text">${row.price?.toFixed(2)}</span>
            ),
        },
        {
            header: 'Stock',
            accessor: 'stock',
            render: (row) => (
                <div className="stock-cell">
                    <div className="stock-bar-wrapper">
                        <div
                            className={`stock-bar ${row.stock < 50 ? 'low' : row.stock < 200 ? 'medium' : 'high'
                                }`}
                            style={{ width: `${Math.min((row.stock / 500) * 100, 100)}%` }}
                        ></div>
                    </div>
                    <span
                        className={`stock-count ${row.stock < 50 ? 'text-danger' : row.stock < 200 ? 'text-warning' : 'text-success'
                            }`}
                    >
                        {row.stock} units
                    </span>
                </div>
            ),
        },
        {
            header: 'Total Value',
            sortable: false,
            render: (row) => (
                <span className="value-text">
                    ${(row.price * row.stock).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
            ),
        },
        {
            header: 'Actions',
            sortable: false,
            width: '150px',
            render: (row) => (
                <div className="action-cell">
                    <button className="action-btn edit" onClick={() => handleEdit(row)} title="Edit">
                        ✏️
                    </button>
                    <button className="action-btn delete" onClick={() => handleDeleteClick(row)} title="Delete">
                        🗑️
                    </button>
                </div>
            ),
        },
    ].filter(col => user?.role !== 'salesman' || col.header !== 'Actions');

    return (
        <div className="product-list-page">
            {/* Page Header */}
            <div className="page-top">
                <div>
                    <h1 className="page-title">📦 Products</h1>
                    <p className="page-subtitle">Manage your product catalog and inventory</p>
                </div>
                <Button variant="primary" size="lg" icon="➕" onClick={() => setShowAddModal(true)}>
                    Add Product
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="product-stats">
                <div className="mini-stat-card">
                    <span className="mini-stat-icon blue">📦</span>
                    <div>
                        <p className="mini-stat-value">{totalProducts}</p>
                        <p className="mini-stat-label">Total Products</p>
                    </div>
                </div>
                <div className="mini-stat-card">
                    <span className="mini-stat-icon green">💰</span>
                    <div>
                        <p className="mini-stat-value">
                            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                        </p>
                        <p className="mini-stat-label">Inventory Value</p>
                    </div>
                </div>
                <div className="mini-stat-card">
                    <span className="mini-stat-icon red">⚠️</span>
                    <div>
                        <p className="mini-stat-value">{lowStockCount}</p>
                        <p className="mini-stat-label">Low Stock Items</p>
                    </div>
                </div>
                <div className="mini-stat-card">
                    <span className="mini-stat-icon purple">📊</span>
                    <div>
                        <p className="mini-stat-value">${avgPrice.toFixed(2)}</p>
                        <p className="mini-stat-label">Avg. Price</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="product-filters">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    {uniqueCategories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <select
                    value={filterStock}
                    onChange={(e) => setFilterStock(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Stock Levels</option>
                    <option value="low">Low (&lt; 50)</option>
                    <option value="medium">Medium (50-200)</option>
                    <option value="high">High (&gt; 200)</option>
                </select>
                {(filterCategory || filterStock) && (
                    <button
                        className="clear-filters"
                        onClick={() => {
                            setFilterCategory('');
                            setFilterStock('');
                        }}
                    >
                        ✕ Clear Filters
                    </button>
                )}
            </div>

            {/* Table */}
            <Table
                columns={columns}
                data={filteredProducts}
                searchable={true}
                searchPlaceholder="Search products by name..."
                paginate={true}
                pageSize={8}
                emptyMessage="No products found. Add your first product!"
            />

            {/* Add Product Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Product"
                size="md"
            >
                <AddProduct
                    onSubmit={(data) => {
                        onAdd(data);
                        setShowAddModal(false);
                    }}
                    onCancel={() => setShowAddModal(false)}
                    categories={uniqueCategories}
                />
            </Modal>

            {/* Edit Product Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Product"
                size="md"
            >
                <AddProduct
                    initialData={selectedProduct}
                    isEdit={true}
                    onSubmit={(data) => {
                        onEdit(selectedProduct.id, data);
                        setShowEditModal(false);
                    }}
                    onCancel={() => setShowEditModal(false)}
                    categories={uniqueCategories}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Product"
                size="sm"
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDeleteConfirm}>
                            🗑️ Delete
                        </Button>
                    </>
                }
            >
                <div className="delete-confirmation">
                    <span className="delete-icon">⚠️</span>
                    <p>
                        Are you sure you want to delete <strong>{selectedProduct?.name}</strong>?
                    </p>
                    <p className="delete-warning">This action cannot be undone.</p>
                </div>
            </Modal>
        </div>
    );
};

export default ProductList;