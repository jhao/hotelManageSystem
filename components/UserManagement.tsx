
import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const UserManagement: React.FC = () => {
    const { data, setData, isAdmin } = useApp();

    const handleRoleChange = (userId: string, newRole: UserRole) => {
        if (isAdmin) {
            const updatedUsers = data.users.map(u => u.id === userId ? { ...u, role: newRole } : u);
            setData({ ...data, users: updatedUsers });
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">用户管理</h2>
             <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">用户名</th>
                            <th scope="col" className="px-6 py-3">角色</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.users.map(u => (
                            <tr key={u.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{u.username}</td>
                                <td className="px-6 py-4">
                                    <select 
                                        value={u.role} 
                                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                        disabled={!isAdmin}
                                        className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {!isAdmin && <p className="mt-4 text-sm text-yellow-600 dark:text-yellow-400">您必须是管理员才能修改用户角色。</p>}
            </div>
        </div>
    );
};

export default UserManagement;