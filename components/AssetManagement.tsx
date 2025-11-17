
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Asset } from '../types';
import Modal from './common/Modal';
import { PlusCircleIcon, PencilIcon, TrashIcon } from './common/Icons';

const AssetManagement: React.FC = () => {
    const { data, setData, isAdmin } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [formData, setFormData] = useState({ name: '', category: '', location: '', purchaseDate: '', value: 0 });

    const handleOpenModal = (asset: Asset | null = null) => {
        setEditingAsset(asset);
        setFormData(asset ? { ...asset, value: asset.value } : { name: '', category: '', location: '', purchaseDate: new Date().toISOString().split('T')[0], value: 0 });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingAsset(null);
    };

    const handleSave = () => {
        if (!formData.name || !formData.category || !formData.location) {
            alert('名称、类别和位置为必填项。');
            return;
        }

        if (editingAsset) {
            const updatedAssets = data.assets.map(a => a.id === editingAsset.id ? { ...a, ...formData, value: Number(formData.value) } : a);
            setData({ ...data, assets: updatedAssets });
        } else {
            const newAsset: Asset = { id: crypto.randomUUID(), ...formData, value: Number(formData.value) };
            setData({ ...data, assets: [...data.assets, newAsset] });
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (isAdmin && window.confirm('您确定要删除该资产吗？')) {
            setData({ ...data, assets: data.assets.filter(a => a.id !== id) });
        }
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">资产管理</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    添加资产
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">名称</th>
                            <th scope="col" className="px-6 py-3">类别</th>
                            <th scope="col" className="px-6 py-3">位置</th>
                            <th scope="col" className="px-6 py-3">购入日期</th>
                            <th scope="col" className="px-6 py-3">价值</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.assets.map(a => (
                            <tr key={a.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{a.name}</td>
                                <td className="px-6 py-4">{a.category}</td>
                                <td className="px-6 py-4">{a.location}</td>
                                <td className="px-6 py-4">{a.purchaseDate}</td>
                                <td className="px-6 py-4">¥{a.value.toFixed(2)}</td>
                                <td className="px-6 py-4 flex items-center space-x-2">
                                    <button onClick={() => handleOpenModal(a)} className="text-blue-500 hover:text-blue-700"><PencilIcon className="h-5 w-5" /></button>
                                    {isAdmin && <button onClick={() => handleDelete(a.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5" /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isVisible={isModalOpen} onClose={handleCloseModal} title={editingAsset ? '编辑资产' : '添加资产'}>
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block mb-1 font-medium">名称</label>
                            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">类别</label>
                            <input type="text" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">位置</label>
                            <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" placeholder="例如: 房间 101 或 大堂" />
                        </div>
                         <div>
                            <label className="block mb-1 font-medium">购入日期</label>
                            <input type="date" value={formData.purchaseDate} onChange={e => setFormData({...formData, purchaseDate: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                        <div>
                            <label className="block mb-1 font-medium">价值 (¥)</label>
                            <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: parseFloat(e.target.value) || 0})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        </div>
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

export default AssetManagement;