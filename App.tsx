
import React, { useState, useCallback, useMemo } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './components/Dashboard';
import PersonnelManagement from './components/PersonnelManagement';
import RoomManagement from './components/RoomManagement';
import CleaningManagement from './components/CleaningManagement';
import LinenManagement from './components/LinenManagement';
import AssetManagement from './components/AssetManagement';
import UserManagement from './components/UserManagement';
import SystemManagement from './components/SystemManagement';
import Login from './components/Login';
import { BuildingOffice2Icon, UsersIcon, SwatchIcon, SparklesIcon, ArchiveBoxIcon, UserGroupIcon, Cog6ToothIcon, Squares2X2Icon, ArrowRightOnRectangleIcon, UserCircleIcon } from './components/common/Icons';

type View = 'dashboard' | 'personnel' | 'rooms' | 'cleaning' | 'linen' | 'assets' | 'users' | 'system';

const NAV_ITEMS = [
  { id: 'dashboard', label: '仪表盘', icon: Squares2X2Icon },
  { id: 'personnel', label: '人员管理', icon: UsersIcon },
  { id: 'rooms', label: '房间管理', icon: BuildingOffice2Icon },
  { id: 'cleaning', label: '房间打扫', icon: SparklesIcon },
  { id: 'linen', label: '布草管理', icon: SwatchIcon },
  { id: 'assets', label: '资产管理', icon: ArchiveBoxIcon },
  { id: 'users', label: '用户管理', icon: UserGroupIcon },
  { id: 'system', label: '系统管理', icon: Cog6ToothIcon },
];

const AppContent: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('dashboard');
    const { currentUser, setCurrentUser } = useApp();

    const handleLogout = () => {
        setCurrentUser(null);
    };
    
    const renderView = useCallback(() => {
        switch (activeView) {
            case 'dashboard': return <Dashboard setActiveView={setActiveView} />;
            case 'personnel': return <PersonnelManagement />;
            case 'rooms': return <RoomManagement />;
            case 'cleaning': return <CleaningManagement />;
            case 'linen': return <LinenManagement />;
            case 'assets': return <AssetManagement />;
            case 'users': return <UserManagement />;
            case 'system': return <SystemManagement />;
            default: return <Dashboard setActiveView={setActiveView}/>;
        }
    }, [activeView]);
    
    const currentTitle = useMemo(() => NAV_ITEMS.find(item => item.id === activeView)?.label || '仪表盘', [activeView]);

    if (!currentUser) {
        return <Login />;
    }

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col">
                <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
                    <BuildingOffice2Icon className="h-8 w-8 text-indigo-500" />
                    <h1 className="text-xl font-bold ml-2">酒店管理系统</h1>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveView(item.id as View)}
                            className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
                                activeView === item.id
                                    ? 'bg-indigo-500 text-white'
                                    : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                        >
                            <item.icon className="h-5 w-5 mr-3" />
                            {item.label}
                        </button>
                    ))}
                </nav>
                 <div className="p-4 border-t dark:border-gray-700">
                    <div className="flex items-center p-2 rounded-lg bg-gray-100 dark:bg-gray-700 mb-2">
                        <UserCircleIcon className="h-8 w-8 text-gray-500 dark:text-gray-400" />
                        <div className="ml-2">
                            <p className="text-sm font-semibold">{currentUser.username}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.role}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-150 bg-red-500 text-white hover:bg-red-600">
                        <ArrowRightOnRectangleIcon className="h-5 w-5 mr-2"/>
                        退出登录
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white dark:bg-gray-800 border-b dark:border-gray-700 flex items-center justify-between px-6">
                    <h2 className="text-2xl font-semibold">{currentTitle}</h2>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    {renderView()}
                </div>
            </main>
        </div>
    );
};


const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;