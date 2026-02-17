import React, { useState } from 'react';
import Button from '../common/Button';
import './Sales.css';

const AddSale = ({ salesmen, products, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({
        productId: '',
        salesmanId: '',
        quantity: '',
        date: new Date().toISOString().split('T')[0],
        status: 'completed',
    });
    const [errors, setErrors] = useState({});

    const selectedProduct = products.find((p) => p.id === formData.productId);
    const estimatedTotal =
        selectedProduct && formData.quantity
            ? (selectedProduct.price * parseInt(formData.quantity)).toFixed(2)
            : '0.00';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.productId) newErrors.productId = 'Select a product';
        if (!formData.salesmanId) newErrors.salesmanId = 'Select a salesman';
        if (!formData.quantity || parseInt(formData.quantity) <= 0)
            newErrors.quantity = 'Enter valid quantity';
        if (!formData.date) newErrors.date = 'Select a date';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        onSubmit({
            productId: formData.productId,
            salesmanId: formData.salesmanId,
            quantity: parseInt(formData.quantity),
            date: formData.date,
            status: formData.status,
            totalAmount: selectedProduct.price * parseInt(formData.quantity),
        });
    };

    return (
        <form className="sale-form" onSubmit={handleSubmit}>
            {/* Product */}
            <div className="form-group">
                <label className="form-label">
                    Product <span className="required">*</span>
                </label>
                <select
                    name="productId"
                    value={formData.productId}
                    onChange={handleChange}
                    className={`form-input ${errors.productId ? 'input-error' : ''}`}
                >
                    <option value="">Select a product</option>
                    {products.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name} — ${p.price.toFixed(2)} ({p.quantity} in stock)
                        </option>
                    ))}
                </select>
                {errors.productId && <span className="error-text">{errors.productId}</span>}
            </div>

            {/* Product Preview */}
            {selectedProduct && (
                <div className="selected-product-preview">
                    <div className="sp-info">
                        <span className="sp-icon">📦</span>
                        <div>
                            <p className="sp-name">{selectedProduct.name}</p>
                            <p className="sp-meta">
                                {selectedProduct.category} • ${selectedProduct.price.toFixed(2)} •
                                Stock: {selectedProduct.quantity}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Salesman */}
            <div className="form-group">
                <label className="form-label">
                    Salesman <span className="required">*</span>
                </label>
                <select
                    name="salesmanId"
                    value={formData.salesmanId}
                    onChange={handleChange}
                    className={`form-input ${errors.salesmanId ? 'input-error' : ''}`}
                >
                    <option value="">Select a salesman</option>
                    {salesmen.map((sm) => (
                        <option key={sm.id} value={sm.id}>
                            {sm.avatar} {sm.name} — {sm.region}
                        </option>
                    ))}
                </select>
                {errors.salesmanId && <span className="error-text">{errors.salesmanId}</span>}
            </div>

            {/* Quantity & Date */}
            <div className="form-row">
                <div className="form-group">
                    <label className="form-label">
                        Quantity <span className="required">*</span>
                    </label>
                    <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="0"
                        min="1"
                        className={`form-input ${errors.quantity ? 'input-error' : ''}`}
                    />
                    {errors.quantity && <span className="error-text">{errors.quantity}</span>}
                </div>
                <div className="form-group">
                    <label className="form-label">
                        Date <span className="required">*</span>
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className={`form-input ${errors.date ? 'input-error' : ''}`}
                    />
                    {errors.date && <span className="error-text">{errors.date}</span>}
                </div>
            </div>

            {/* Status */}
            <div className="form-group">
                <label className="form-label">Status</label>
                <div className="status-selector">
                    <label
                        className={`status-option ${formData.status === 'completed' ? 'active completed' : ''}`}
                    >
                        <input
                            type="radio"
                            name="status"
                            value="completed"
                            checked={formData.status === 'completed'}
                            onChange={handleChange}
                        />
                        ✅ Completed
                    </label>
                    <label
                        className={`status-option ${formData.status === 'pending' ? 'active pending' : ''}`}
                    >
                        <input
                            type="radio"
                            name="status"
                            value="pending"
                            checked={formData.status === 'pending'}
                            onChange={handleChange}
                        />
                        ⏳ Pending
                    </label>
                </div>
            </div>

            {/* Total Preview */}
            <div className="sale-total-preview">
                <div className="total-row">
                    <span>Unit Price:</span>
                    <span>${selectedProduct?.price?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="total-row">
                    <span>Quantity:</span>
                    <span>{formData.quantity || 0}</span>
                </div>
                <div className="total-row total-final">
                    <span>Estimated Total:</span>
                    <span className="total-amount-large">${estimatedTotal}</span>
                </div>
            </div>

            {/* Buttons */}
            <div className="form-actions">
                <Button variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="success" type="submit" icon="💰">
                    Record Sale
                </Button>
            </div>
        </form>
    );
};

export default AddSale;