
import React from 'react';
import { useApp } from '../context/AppContext';
import { generateSampleData, clearData, exportData } from '../services/db';
import { ArrowDownTrayIcon, ArrowPathIcon, SparklesIcon } from './common/Icons';

const SystemManagement: React.FC = () => {
    const { refreshData, isAdmin } = useApp();

    const handleGenerateSample = () => {
        if (window.confirm('这将添加示例数据。任何现有数据都将被保留。是否继续？')) {
            generateSampleData();
            refreshData();
            alert('示例数据已成功生成！');
        }
    };

    const handleInitialize = () => {
        if (isAdmin && window.confirm('警告：此操作将永久删除所有数据。您确定要继续吗？')) {
            clearData();
            refreshData();
            alert('所有数据已被清除。已重新生成示例数据作为基础。');
        } else if (!isAdmin) {
             alert('您必须是管理员才能执行此操作。');
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">系统管理</h2>
            <div className="space-y-4 max-w-md">
                <button 
                    onClick={exportData}
                    className="w-full flex items-center justify-center p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    导出所有数据
                </button>
                <button 
                    onClick={handleGenerateSample}
                    className="w-full flex items-center justify-center p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    生成样例数据
                </button>
                 <button 
                    onClick={handleInitialize}
                    disabled={!isAdmin}
                    className="w-full flex items-center justify-center p-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed"
                >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    初始化/重置数据
                </button>
                {!isAdmin && <p className="text-sm text-yellow-600 dark:text-yellow-400">初始化/重置数据是管理员专属操作。</p>}
            </div>
        </div>
    );
};

export default SystemManagement;