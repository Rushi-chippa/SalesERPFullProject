import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import Modal from '../common/Modal';
import './Salesmen.css';

const SalesmenList = ({ salesmen, sales, onAdd, onEdit, onDelete }) => {
    const navigate = useNavigate();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedSalesman, setSelectedSalesman] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRegion, setFilterRegion] = useState('');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        region: '',
        avatar: '👨‍💼',
        joinDate: new Date().toISOString().split('T')[0],
    });

    const avatars = ['👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '🧑‍💼', '🧔', '👩‍🦰', '👨‍🦱'];
    const regions = ['North', 'South', 'East', 'West', 'Central'];

    // Get unique regions
    const uniqueRegions = [...new Set(salesmen.map((s) => s.region))];

    // Salesman stats
    const getSalesmanStats = (smId) => {
        const smSales = sales.filter((s) => s.salesmanId === smId);
        return {
            totalRevenue: smSales.reduce((sum, s) => sum + s.totalAmount, 0),
            totalQuantity: smSales.reduce((sum, s) => sum + s.quantity, 0),
            deals: smSales.length,
        };
    };

    // Filter
    const filteredSalesmen = salesmen.filter((sm) => {
        const matchSearch =
            sm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sm.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRegion = filterRegion ? sm.region === filterRegion : true;
        return matchSearch && matchRegion;
    });

    // Sort by revenue
    const sortedSalesmen = [...filteredSalesmen].sort((a, b) => {
        const aStats = getSalesmanStats(a.id);
        const bStats = getSalesmanStats(b.id);
        return bStats.totalRevenue - aStats.totalRevenue;
    });

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        onAdd(formData);
        setShowAddModal(false);
        setFormData({
            name: '', email: '', phone: '', region: '', avatar: '👨‍💼',
            joinDate: new Date().toISOString().split('T')[0],
        });
    };

    const handleDeleteConfirm = () => {
        onDelete(selectedSalesman.id);
        setShowDeleteModal(false);
        setSelectedSalesman(null);
    };

    const getRankBadge = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    return (
        <div className="salesmen-page">
            {/* Page Header */}
            <div className="page-top">
                <div>
                    <h1 className="page-title">👥 Sales Team</h1>
                    <p className="page-subtitle">Manage and monitor your sales force</p>
                </div>
                <Button variant="primary" size="lg" icon="➕" onClick={() => setShowAddModal(true)}>
                    Add Salesman
                </Button>
            </div>

            {/* Filters & Search */}
            <div className="salesmen-toolbar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    value={filterRegion}
                    onChange={(e) => setFilterRegion(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Regions</option>
                    {uniqueRegions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
                <div className="view-toggle">
                    <button
                        className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                    >
                        ▦
                    </button>
                    <button
                        className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                    >
                        ☰
                    </button>
                </div>
            </div>

            {/* Results count */}
            <p className="results-count">
                Showing {sortedSalesmen.length} of {salesmen.length} salesmen
            </p>

            {/* Grid View */}
            {viewMode === 'grid' ? (
                <div className="salesmen-grid">
                    {sortedSalesmen.map((sm, index) => {
                        const stats = getSalesmanStats(sm.id);
                        return (
                            <div
                                key={sm.id}
                                className={`salesman-card ${index < 3 ? `rank-${index + 1}` : ''}`}
                            >
                                <div className="salesman-card-top">
                                    <span className="rank-badge">{getRankBadge(index)}</span>
                                    <div className="salesman-card-actions">
                                        <button
                                            className="sm-action-btn"
                                            onClick={() => navigate(`/salesmen/${sm.id}`)}
                                            title="View Details"
                                        >
                                            👁️
                                        </button>
                                        <button
                                            className="sm-action-btn danger"
                                            onClick={() => {
                                                setSelectedSalesman(sm);
                                                setShowDeleteModal(true);
                                            }}
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>

                                <div className="salesman-card-avatar">{sm.avatar}</div>
                                <h3 className="salesman-card-name">{sm.name}</h3>
                                <p className="salesman-card-email">{sm.email}</p>
                                <div className="salesman-card-meta">
                                    <span>📍 {sm.region}</span>
                                    <span>📞 {sm.phone}</span>
                                </div>

                                <div className="salesman-card-stats">
                                    <div className="sm-card-stat">
                                        <p className="sm-card-stat-value">
                                            ${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                                        </p>
                                        <p className="sm-card-stat-label">Revenue</p>
                                    </div>
                                    <div className="sm-card-stat">
                                        <p className="sm-card-stat-value">{stats.totalQuantity}</p>
                                        <p className="sm-card-stat-label">Items</p>
                                    </div>
                                    <div className="sm-card-stat">
                                        <p className="sm-card-stat-value">{stats.deals}</p>
                                        <p className="sm-card-stat-label">Deals</p>
                                    </div>
                                </div>

                                <button
                                    className="view-profile-btn"
                                    onClick={() => navigate(`/salesmen/${sm.id}`)}
                                >
                                    View Profile →
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View */
                <div className="salesmen-list-view">
                    {sortedSalesmen.map((sm, index) => {
                        const stats = getSalesmanStats(sm.id);
                        return (
                            <div key={sm.id} className="salesman-list-item">
                                <div className="list-item-left">
                                    <span className="list-rank">{getRankBadge(index)}</span>
                                    <span className="list-avatar">{sm.avatar}</span>
                                    <div className="list-info">
                                        <h4>{sm.name}</h4>
                                        <p>{sm.email} • 📍 {sm.region}</p>
                                    </div>
                                </div>
                                <div className="list-item-stats">
                                    <div className="list-stat">
                                        <span className="list-stat-value">${stats.totalRevenue.toFixed(0)}</span>
                                        <span className="list-stat-label">Revenue</span>
                                    </div>
                                    <div className="list-stat">
                                        <span className="list-stat-value">{stats.deals}</span>
                                        <span className="list-stat-label">Deals</span>
                                    </div>
                                </div>
                                <div className="list-item-actions">
                                    <button className="sm-action-btn" onClick={() => navigate(`/salesmen/${sm.id}`)}>
                                        👁️
                                    </button>
                                    <button
                                        className="sm-action-btn danger"
                                        onClick={() => {
                                            setSelectedSalesman(sm);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {sortedSalesmen.length === 0 && (
                <div className="empty-state-full">
                    <span>👥</span>
                    <h3>No salesmen found</h3>
                    <p>Add your first team member to get started!</p>
                    <Button variant="primary" icon="➕" onClick={() => setShowAddModal(true)}>
                        Add Salesman
                    </Button>
                </div>
            )}

            {/* Add Salesman Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="Add New Salesman"
                size="md"
            >
                <form className="salesman-form" onSubmit={handleAddSubmit}>
                    <div className="form-group">
                        <label className="form-label">Avatar</label>
                        <div className="avatar-picker">
                            {avatars.map((a) => (
                                <span
                                    key={a}
                                    className={`avatar-option ${formData.avatar === a ? 'selected' : ''}`}
                                    onClick={() => setFormData({ ...formData, avatar: a })}
                                >
                                    {a}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Full Name <span className="required">*</span></label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="John Smith"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email <span className="required">*</span></label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            placeholder="john@company.com"
                            className="form-input"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Phone <span className="required">*</span></label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                                placeholder="555-0101"
                                className="form-input"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Region <span className="required">*</span></label>
                            <select
                                name="region"
                                value={formData.region}
                                onChange={handleFormChange}
                                className="form-input"
                                required
                            >
                                <option value="">Select Region</option>
                                {regions.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" icon="➕">Add Salesman</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Salesman"
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
                    <p>Delete <strong>{selectedSalesman?.name}</strong>?</p>
                    <p className="delete-warning">All associated data will be removed.</p>
                </div>
            </Modal>
        </div>
    );
};

export default SalesmenList;