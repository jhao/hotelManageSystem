
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Staff, StaffRole } from '../types';
import Modal from './common/Modal';
import { PlusCircleIcon, PencilIcon, TrashIcon } from './common/Icons';

const PersonnelManagement: React.FC = () => {
    const { data, setData, isAdmin } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [formData, setFormData] = useState({ name: '', role: StaffRole.Cleaning });

    const handleOpenModal = (staff: Staff | null = null) => {
        setEditingStaff(staff);
        setFormData(staff ? { name: staff.name, role: staff.role } : { name: '', role: StaffRole.Cleaning });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const handleSave = () => {
        if (!formData.name) {
            alert('员工姓名为必填项。');
            return;
        }

        if (editingStaff) {
            // Edit
            const updatedStaff = data.staff.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s);
            setData({ ...data, staff: updatedStaff });
        } else {
            // Add
            const newStaff: Staff = { id: crypto.randomUUID(), ...formData };
            setData({ ...data, staff: [...data.staff, newStaff] });
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (isAdmin && window.confirm('您确定要删除该员工吗？')) {
            const updatedStaff = data.staff.filter(s => s.id !== id);
            setData({ ...data, staff: updatedStaff });
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">人员管理</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    添加员工
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">姓名</th>
                            <th scope="col" className="px-6 py-3">角色</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.staff.map(s => (
                            <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{s.name}</td>
                                <td className="px-6 py-4">{s.role}</td>
                                <td className="px-6 py-4 flex items-center space-x-2">
                                    <button onClick={() => handleOpenModal(s)} className="text-blue-500 hover:text-blue-700"><PencilIcon className="h-5 w-5" /></button>
                                    {isAdmin && <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5" /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isVisible={isModalOpen} onClose={handleCloseModal} title={editingStaff ? '编辑员工' : '添加员工'}>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">姓名</label>
                        <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">角色</label>
                        <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as StaffRole})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            {Object.values(StaffRole).map(role => <option key={role} value={role}>{role}</option>)}
                        </select>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">取消</button>
                        <button onClick={handleSave} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">保存</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default PersonnelManagement;