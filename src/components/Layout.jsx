import { useState, useRef } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useProperty } from '../store/PropertyContext';
import {
  LayoutDashboard, Home, Shield, Landmark, TrendingUp,
  ClipboardCheck, DollarSign, Receipt, Scale, Users,
  UserCheck, Wrench, ShieldAlert, Plane, Bell, FolderOpen,
  Brain, FileInput, FileText, Settings, Menu, X, ChevronDown, ChevronRight,
  Download, Upload
} from 'lucide-react';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/intake', icon: FileInput, label: 'Data Intake' },
      { path: '/alerts', icon: Bell, label: 'Alerts & Deadlines' },
    ]
  },
  {
    label: 'Property',
    items: [
      { path: '/property', icon: Home, label: 'Property Profile' },
      { path: '/mortgage', icon: Landmark, label: 'Mortgage & Equity' },
      { path: '/appreciation', icon: TrendingUp, label: 'Value Tracker' },
      { path: '/va-tracker', icon: Shield, label: 'VA Entitlement' },
    ]
  },
  {
    label: 'Rental Operations',
    items: [
      { path: '/rent-readiness', icon: ClipboardCheck, label: 'Rent Readiness' },
      { path: '/cashflow', icon: DollarSign, label: 'Cash Flow' },
      { path: '/tenant', icon: UserCheck, label: 'Tenant Lifecycle' },
      { path: '/maintenance', icon: Wrench, label: 'Maintenance' },
    ]
  },
  {
    label: 'Compliance & Risk',
    items: [
      { path: '/tax', icon: Receipt, label: 'Tax Tracker' },
      { path: '/compliance', icon: Scale, label: 'FL Compliance' },
      { path: '/insurance', icon: ShieldAlert, label: 'Insurance & Risk' },
      { path: '/pm-oversight', icon: Users, label: 'PM Oversight' },
    ]
  },
  {
    label: 'Planning',
    items: [
      { path: '/pcs', icon: Plane, label: 'PCS Readiness' },
      { path: '/decisions', icon: Brain, label: 'Decision Engine' },
      { path: '/documents', icon: FolderOpen, label: 'Documents Vault' },
    ]
  }
];

function Sidebar({ open, onClose, onExport, onImport, fileInputRef }) {
  const [collapsed, setCollapsed] = useState({});

  const toggleGroup = (label) => {
    setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-40
        transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:flex-shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
        overflow-y-auto
      `}>
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-white">Property Analyst</h1>
              <p className="text-xs text-slate-400 mt-0.5">9577 Naples Lane</p>
            </div>
            <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>
        </div>

        <nav className="p-2">
          {navGroups.map(group => (
            <div key={group.label} className="mb-1">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200"
              >
                {group.label}
                {collapsed[group.label] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
              {!collapsed[group.label] && (
                <div className="space-y-0.5">
                  {group.items.map(item => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white font-medium'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`
                      }
                      end={item.path === '/'}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-700 space-y-1">
          <button onClick={onExport} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <Download size={18} /> Export Data
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <Upload size={18} /> Import Data
          </button>
          <input ref={fileInputRef} type="file" accept=".json" onChange={onImport} className="hidden" />
        </div>
      </aside>
    </>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { state, dispatch } = useProperty();
  const fileInputRef = useRef(null);

  const handleExport = () => {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-analyst-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data && data.property) {
          dispatch({ type: 'IMPORT_DATA', data });
        }
      } catch {
        alert('Invalid file. Please select a valid Property Analyst backup file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} onExport={handleExport} onImport={handleImport} fileInputRef={fileInputRef} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Navarre, FL 32566
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
