import React, { useState } from 'react';
import { Customer, Admin, Section } from '../types';
import Header from './Header';
import Sidebar from './Sidebar';
import Overview from './dashboard/Overview';
import Transaction from './dashboard/Transaction';
import Search from './dashboard/Search';
import CustomerList from './dashboard/CustomerList';
import Analytics from './dashboard/Analytics';
import AiInsights from './dashboard/AiInsights';

interface DashboardProps {
  admin: Admin;
  onLogout: () => void;
  onTransaction: (customer: Customer, transaction: { bill: number, points: number }) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ admin, onLogout, onTransaction }) => {
  const [activeSection, setActiveSection] = useState<Section>(Section.Overview);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

  const customers = admin.customers;

  const renderSection = () => {
    const sectionProps = { customers };
    switch (activeSection) {
      case Section.Overview:
        return <Overview {...sectionProps} />;
      case Section.Transaction:
        return <Transaction customers={customers} onTransaction={onTransaction} />;
      case Section.Search:
        return <Search {...sectionProps} />;
      case Section.Customers:
        return <CustomerList {...sectionProps} />;
      case Section.Analytics:
        return <Analytics {...sectionProps} />;
      case Section.AiInsights:
        return <AiInsights {...sectionProps} />;
      default:
        return <Overview {...sectionProps} />;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isCollapsed={isSidebarCollapsed}
      />
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isSidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header
          admin={admin}
          onLogout={onLogout}
          onToggleSidebar={() => setSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className="flex-1 p-6 md:p-10 bg-[#050505]">
            <div className="animate-[fade-slide-up_0.6s_forwards] opacity-0">
                {renderSection()}
            </div>
        </main>
      </div>
      <style>{`
        @keyframes fade-slide-up { 
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); } 
        }
        .animate-\\[fade-slide-up_0\\.6s_forwards\\] {
            animation-fill-mode: forwards;
            animation-name: fade-slide-up;
            animation-duration: 0.6s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
