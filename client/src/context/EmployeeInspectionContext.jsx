import React, { createContext, useContext, useState, useEffect } from 'react';

const EmployeeInspectionContext = createContext(null);

export const EmployeeInspectionProvider = ({ children }) => {
  const [inspectedEmployee, setInspectedEmployee] = useState(() => {
    try {
      const saved = sessionStorage.getItem('workzen_inspected_employee');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('workzen_inspected_tab') || 'dashboard';
  });

  const selectEmployee = (employee, tab = 'dashboard') => {
    if (!employee) return;
    setInspectedEmployee(employee);
    setActiveTab(tab);
    try {
      sessionStorage.setItem('workzen_inspected_employee', JSON.stringify(employee));
      sessionStorage.setItem('workzen_inspected_tab', tab);
    } catch (e) {
      console.error('SessionStorage error:', e);
    }
  };

  const clearInspectedEmployee = () => {
    setInspectedEmployee(null);
    setActiveTab('dashboard');
    try {
      sessionStorage.removeItem('workzen_inspected_employee');
      sessionStorage.removeItem('workzen_inspected_tab');
    } catch (e) {
      console.error('SessionStorage error:', e);
    }
  };

  const setTab = (tab) => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem('workzen_inspected_tab', tab);
    } catch (e) {
      console.error('SessionStorage error:', e);
    }
  };

  const updateInspectedEmployee = (updatedFields) => {
    if (!inspectedEmployee) return;
    const merged = { ...inspectedEmployee, ...updatedFields };
    setInspectedEmployee(merged);
    try {
      sessionStorage.setItem('workzen_inspected_employee', JSON.stringify(merged));
    } catch (e) {
      console.error('SessionStorage error:', e);
    }
  };

  return (
    <EmployeeInspectionContext.Provider
      value={{
        inspectedEmployee,
        isInspecting: !!inspectedEmployee,
        activeTab,
        selectEmployee,
        clearInspectedEmployee,
        setActiveTab: setTab,
        updateInspectedEmployee,
      }}
    >
      {children}
    </EmployeeInspectionContext.Provider>
  );
};

export const useEmployeeInspection = () => {
  const context = useContext(EmployeeInspectionContext);
  if (!context) {
    throw new Error('useEmployeeInspection must be used within an EmployeeInspectionProvider');
  }
  return context;
};

export default EmployeeInspectionContext;
