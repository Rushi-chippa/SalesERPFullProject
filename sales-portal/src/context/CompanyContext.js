import React, { createContext, useContext, useState, useEffect } from 'react';
// import { dataService } from '../services/dataService';

const CompanyContext = createContext(null);

export const useCompany = () => {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompany must be used within a CompanyProvider');
    }
    return context;
};

export const CompanyProvider = ({ children }) => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load company data from localStorage
        const companyData = localStorage.getItem('company');
        if (companyData) {
            setCompany(JSON.parse(companyData));
        }
        setLoading(false);
    }, []);

    const updateCompany = (data) => {
        const updated = { ...company, ...data };
        setCompany(updated);
        localStorage.setItem('company', JSON.stringify(updated));
    };

    const value = {
        company,
        loading,
        updateCompany,
        setCompany,
    };

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
};