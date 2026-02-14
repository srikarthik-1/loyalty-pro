import React, { useState, useCallback } from 'react';
import { Customer, Admin } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [admins, setAdmins] = useLocalStorage<Record<string, Admin>>('loyaltyAdmins', {});
  const [loggedInAdmin, setLoggedInAdmin] = useState<Admin | null>(null);

  const handleLogin = useCallback(async (username: string, password: string): Promise<boolean> => {
    const admin = admins[username];
    if (admin && admin.password === password) {
      setLoggedInAdmin(admin);
      return true;
    }
    return false;
  }, [admins]);

  const handleRegister = useCallback(async (name: string, username: string, password: string): Promise<boolean> => {
    if (admins[username]) {
      return false; // Username exists
    }
    const newAdmin: Admin = {
      username,
      password, // Should be hashed in a real app
      name,
      customers: [], // Start with no customers
    };
    const newAdmins = { ...admins, [username]: newAdmin };
    setAdmins(newAdmins);
    setLoggedInAdmin(newAdmin);
    return true;
  }, [admins, setAdmins]);

  const handleLogout = useCallback(() => {
    setLoggedInAdmin(null);
  }, []);

  const handleTransaction = (customer: Customer, transaction: { bill: number, points: number }) => {
    if (!loggedInAdmin) return;
    
    setAdmins(prevAdmins => {
      const currentAdmin = prevAdmins[loggedInAdmin.username];
      if (!currentAdmin) return prevAdmins;

      const prevCustomers = currentAdmin.customers;
      const existingCustomerIndex = prevCustomers.findIndex(c => c.mobile === customer.mobile);
      const newHistoryEntry = { date: new Date().toISOString(), bill: transaction.bill, points: transaction.points };
      
      let updatedCustomers: Customer[];

      if (existingCustomerIndex > -1) {
        // Update existing customer
        updatedCustomers = [...prevCustomers];
        const existingCustomer = updatedCustomers[existingCustomerIndex];
        updatedCustomers[existingCustomerIndex] = {
          ...existingCustomer,
          points: existingCustomer.points + transaction.points,
          totalSpent: existingCustomer.totalSpent + transaction.bill,
          history: [...(existingCustomer.history || []), newHistoryEntry]
        };
      } else {
        // Add new customer
        const newCustomer: Customer = {
          ...customer,
          points: transaction.points,
          totalSpent: transaction.bill,
          history: [newHistoryEntry]
        };
        updatedCustomers = [...prevCustomers, newCustomer];
      }

      const updatedAdmin: Admin = { ...currentAdmin, customers: updatedCustomers };
      const newAdmins = { ...prevAdmins, [loggedInAdmin.username]: updatedAdmin };
      
      // Also update the loggedInAdmin state to reflect changes immediately in the UI
      setLoggedInAdmin(updatedAdmin);

      return newAdmins;
    });
  };
  
  const renderContent = () => {
    if (loggedInAdmin) {
      return (
        <Dashboard 
          admin={loggedInAdmin}
          onLogout={handleLogout} 
          onTransaction={handleTransaction}
        />
      );
    } else {
      return (
        <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5]">
      {renderContent()}
    </div>
  );
};

export default App;
