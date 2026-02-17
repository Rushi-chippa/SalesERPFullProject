import React from 'react';

const TopSalesmen = ({ salesmen }) => {
    if (!salesmen || salesmen.length === 0) {
        return (
            <div className="no-data">
                <p>No salesmen data available</p>
            </div>
        );
    }

    const maxSales = Math.max(...salesmen.map(s => s.totalSales));

    return (
        <div className="top-salesmen-list">
            {salesmen.map((salesman, index) => (
                <div key={salesman.id} className="salesman-item">
                    <div className="salesman-rank">
                        {index + 1}
                    </div>
                    <div className="salesman-info">
                        <div className="salesman-name">{salesman.name}</div>
                        <div className="salesman-count">
                            {salesman.salesCount} sales
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${(salesman.totalSales / maxSales) * 100}%`
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="salesman-amount">
                        ${salesman.totalSales.toLocaleString()}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default TopSalesmen;