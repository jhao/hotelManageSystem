
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Room, RoomStatus } from '../types';
import Modal from './common/Modal';
import { PlusCircleIcon, PencilIcon, TrashIcon } from './common/Icons';

const RoomManagement: React.FC = () => {
    const { data, setData, isAdmin } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [formData, setFormData] = useState({ floor: 1, roomNumber: '', capacity: 2, status: RoomStatus.Available });

    const handleOpenModal = (room: Room | null = null) => {
        setEditingRoom(room);
        setFormData(room ? { floor: room.floor, roomNumber: room.roomNumber, capacity: room.capacity, status: room.status } : { floor: 1, roomNumber: '', capacity: 2, status: RoomStatus.Available });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRoom(null);
    };

    const handleSave = () => {
        if (!formData.roomNumber || !formData.floor || !formData.capacity) {
            alert('所有字段均为必填项。');
            return;
        }

        if (editingRoom) {
            const updatedRooms = data.rooms.map(r => r.id === editingRoom.id ? { ...r, ...formData, floor: Number(formData.floor), capacity: Number(formData.capacity) } : r);
            setData({ ...data, rooms: updatedRooms });
        } else {
            const newRoom: Room = { 
                id: crypto.randomUUID(), 
                ...formData, 
                floor: Number(formData.floor), 
                capacity: Number(formData.capacity),
                currentBookingId: null,
                bookingHistory: []
            };
            setData({ ...data, rooms: [...data.rooms, newRoom] });
        }
        handleCloseModal();
    };

    const handleDelete = (id: string) => {
        if (isAdmin && window.confirm('您确定要删除该房间吗？此操作不可逆。')) {
            setData({ ...data, rooms: data.rooms.filter(r => r.id !== id) });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">房间管理</h2>
                <button onClick={() => handleOpenModal()} className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                    <PlusCircleIcon className="h-5 w-5 mr-2" />
                    添加房间
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">房间号</th>
                            <th scope="col" className="px-6 py-3">楼层</th>
                            <th scope="col" className="px-6 py-3">可住人数</th>
                            <th scope="col" className="px-6 py-3">状态</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rooms.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber)).map(r => (
                            <tr key={r.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{r.roomNumber}</td>
                                <td className="px-6 py-4">{r.floor}</td>
                                <td className="px-6 py-4">{r.capacity}</td>
                                <td className="px-6 py-4">{r.status}</td>
                                <td className="px-6 py-4 flex items-center space-x-2">
                                    <button onClick={() => handleOpenModal(r)} className="text-blue-500 hover:text-blue-700"><PencilIcon className="h-5 w-5" /></button>
                                    {isAdmin && <button onClick={() => handleDelete(r.id)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5" /></button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isVisible={isModalOpen} onClose={handleCloseModal} title={editingRoom ? '编辑房间' : '添加房间'}>
                <div className="space-y-4">
                     <div>
                        <label className="block mb-1 font-medium">房间号</label>
                        <input type="text" value={formData.roomNumber} onChange={e => setFormData({...formData, roomNumber: e.target.value})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">楼层</label>
                        <input type="number" value={formData.floor} onChange={e => setFormData({...formData, floor: parseInt(e.target.value)})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">可住人数</label>
                        <input type="number" value={formData.capacity} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                    </div>
                     <div>
                        <label className="block mb-1 font-medium">状态</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as RoomStatus})} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            {Object.values(RoomStatus).map(s => <option key={s} value={s}>{s}</option>)}
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

export default RoomManagement;