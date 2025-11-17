
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { CleaningLog, StaffRole, RoomStatus } from '../types';

const CleaningManagement: React.FC = () => {
    const { data, setData } = useApp();
    const [filterRoom, setFilterRoom] = useState('');
    const [filterStaff, setFilterStaff] = useState('');
    
    const staffMap = useMemo(() => new Map(data.staff.map(s => [s.id, s.name])), [data.staff]);
    const roomMap = useMemo(() => new Map(data.rooms.map(r => [r.id, r.roomNumber])), [data.rooms]);

    const filteredLogs = useMemo(() => {
        return data.cleaningLogs
            .filter(log => filterRoom ? log.roomId === filterRoom : true)
            .filter(log => filterStaff ? log.staffId === filterStaff : true)
            .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime());
    }, [data.cleaningLogs, filterRoom, filterStaff]);

    const handleMarkComplete = (logId: string) => {
        const updatedLogs = data.cleaningLogs.map(log => 
            log.id === logId ? { ...log, completedDate: new Date().toISOString() } : log
        );

        const logToUpdate = data.cleaningLogs.find(log => log.id === logId);
        if (logToUpdate) {
            const updatedRooms = data.rooms.map(room => 
                room.id === logToUpdate.roomId ? { ...room, status: RoomStatus.Available } : room
            );
            setData({ ...data, cleaningLogs: updatedLogs, rooms: updatedRooms });
        } else {
            setData({ ...data, cleaningLogs: updatedLogs });
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">房间打扫日志</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                    <option value="">按房间筛选...</option>
                    {data.rooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber}</option>)}
                </select>
                <select value={filterStaff} onChange={e => setFilterStaff(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                    <option value="">按员工筛选...</option>
                    {data.staff.filter(s => s.role === StaffRole.Cleaning).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button onClick={() => { setFilterRoom(''); setFilterStaff(''); }} className="p-2 bg-gray-300 dark:bg-gray-600 rounded-lg">清除筛选</button>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">房间</th>
                            <th scope="col" className="px-6 py-3">指派给</th>
                            <th scope="col" className="px-6 py-3">指派日期</th>
                            <th scope="col" className="px-6 py-3">完成日期</th>
                            <th scope="col" className="px-6 py-3">状态</th>
                            <th scope="col" className="px-6 py-3">操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <td className="px-6 py-4">{roomMap.get(log.roomId) || 'N/A'}</td>
                                <td className="px-6 py-4">{staffMap.get(log.staffId) || 'N/A'}</td>
                                <td className="px-6 py-4">{new Date(log.assignedDate).toLocaleString()}</td>
                                <td className="px-6 py-4">{log.completedDate ? new Date(log.completedDate).toLocaleString() : '待完成'}</td>
                                <td className="px-6 py-4">
                                    {log.completedDate ? 
                                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full dark:bg-green-900 dark:text-green-300">已完成</span> : 
                                        <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full dark:bg-yellow-900 dark:text-yellow-300">进行中</span>}
                                </td>
                                 <td className="px-6 py-4">
                                    {!log.completedDate && (
                                        <button onClick={() => handleMarkComplete(log.id)} className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">标记为完成</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredLogs.length === 0 && <p className="text-center py-4 text-gray-500">未找到日志。</p>}
            </div>
        </div>
    );
};

export default CleaningManagement;