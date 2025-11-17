
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BuildingOffice2Icon } from './common/Icons';

const Login: React.FC = () => {
    const { data, setCurrentUser } = useApp();
    const [selectedUserId, setSelectedUserId] = useState<string>(data.users[0]?.id || '');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (!selectedUserId) {
            setError('请选择一个用户登录。');
            return;
        }
        const userToLogin = data.users.find(u => u.id === selectedUserId);
        if (userToLogin) {
            setCurrentUser(userToLogin);
        } else {
            setError('未找到该用户。');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="w-full max-w-sm p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <div className="flex flex-col items-center">
                    <BuildingOffice2Icon className="h-12 w-12 text-indigo-500" />
                    <h1 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">酒店管理系统</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">请选择用户登录</p>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            用户
                        </label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={(e) => {
                                setSelectedUserId(e.target.value)
                                setError('')
                            }}
                            className="w-full px-3 py-2 mt-1 text-gray-900 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            {data.users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.username} ({user.role})
                                </option>
                            ))}
                        </select>
                    </div>

                    {error && <p className="text-sm text-red-500">{error}</p>}
                    
                    <div>
                        <button
                            onClick={handleLogin}
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            登录
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;