
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Room, RoomStatus, Guest, Booking, Staff, StaffRole } from '../types';
import { CheckCircleIcon, WrenchScrewdriverIcon, UserIcon, SparklesIcon, BuildingOffice2Icon } from './common/Icons';
import Modal from './common/Modal';

const statusConfig = {
    [RoomStatus.Available]: {
        color: 'bg-green-100 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-200',
        icon: <CheckCircleIcon className="h-5 w-5" />,
        label: '可用'
    },
    [RoomStatus.Occupied]: {
        color: 'bg-blue-100 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-200',
        icon: <UserIcon className="h-5 w-5" />,
        label: '入住'
    },
    [RoomStatus.Cleaning]: {
        color: 'bg-yellow-100 dark:bg-yellow-900 border-yellow-500 text-yellow-800 dark:text-yellow-200',
        icon: <SparklesIcon className="h-5 w-5" />,
        label: '打扫中'
    },
    [RoomStatus.Maintenance]: {
        color: 'bg-red-100 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-200',
        icon: <WrenchScrewdriverIcon className="h-5 w-5" />,
        label: '维修中'
    },
};

const StatCard: React.FC<{ title: string; value: number | string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    </div>
);

interface RoomActionModalProps {
    room: Room | null;
    onClose: () => void;
}

const RoomActionModal: React.FC<RoomActionModalProps> = ({ room, onClose }) => {
    const { data, setData } = useApp();
    const [guestName, setGuestName] = useState('');
    const [guestId, setGuestId] = useState('');
    const [guestPhone, setGuestPhone] = useState('');
    const [assignedCleaner, setAssignedCleaner] = useState('');

    if (!room) return null;
    
    const cleaningStaff = data.staff.filter(s => s.role === StaffRole.Cleaning);

    const handleCheckIn = () => {
        if (!guestName || !guestId) {
            alert('住客姓名和证件号码为必填项。');
            return;
        }
        const newGuest: Guest = { id: crypto.randomUUID(), name: guestName, idNumber: guestId, phone: guestPhone };
        const newBooking: Booking = { id: crypto.randomUUID(), guestId: newGuest.id, checkIn: new Date().toISOString(), checkOut: null };
        
        const updatedRooms = data.rooms.map(r => r.id === room.id ? { ...r, status: RoomStatus.Occupied, currentBookingId: newBooking.id, bookingHistory: [...r.bookingHistory, newBooking.id] } : r);

        setData({
            ...data,
            guests: [...data.guests, newGuest],
            bookings: [...data.bookings, newBooking],
            rooms: updatedRooms
        });
        onClose();
    };

    const handleCheckOut = () => {
         const updatedBookings = data.bookings.map(b => b.id === room.currentBookingId ? { ...b, checkOut: new Date().toISOString() } : b);
         const updatedRooms = data.rooms.map(r => r.id === room.id ? { ...r, status: RoomStatus.Cleaning, currentBookingId: null } : r);

         setData({
             ...data,
             bookings: updatedBookings,
             rooms: updatedRooms,
         });
         onClose();
    };

    const handleAssignCleaning = () => {
        if(!assignedCleaner) {
            alert("请选择一位保洁人员。");
            return;
        }
        const newLog: any = {
            id: crypto.randomUUID(),
            roomId: room.id,
            staffId: assignedCleaner,
            assignedDate: new Date().toISOString(),
            completedDate: null
        };
        const updatedRooms = data.rooms.map(r => r.id === room.id ? { ...r, status: RoomStatus.Cleaning } : r);

        setData({ ...data, rooms: updatedRooms, cleaningLogs: [...data.cleaningLogs, newLog]});
        onClose();
    };

    const handleMarkClean = () => {
        const updatedRooms = data.rooms.map(r => r.id === room.id ? { ...r, status: RoomStatus.Available } : r);
        const updatedLogs = data.cleaningLogs.map(log => log.roomId === room.id && !log.completedDate ? {...log, completedDate: new Date().toISOString()} : log);
        setData({ ...data, rooms: updatedRooms, cleaningLogs: updatedLogs });
        onClose();
    };
    
    const handleSetMaintenance = (isMaintenance: boolean) => {
        const newStatus = isMaintenance ? RoomStatus.Maintenance : RoomStatus.Available;
        const updatedRooms = data.rooms.map(r => r.id === room.id ? {...r, status: newStatus} : r);
        setData({...data, rooms: updatedRooms});
        onClose();
    };
    
    const currentBooking = room.currentBookingId ? data.bookings.find(b => b.id === room.currentBookingId) : null;
    const currentGuest = currentBooking ? data.guests.find(g => g.id === currentBooking.guestId) : null;

    return (
        <Modal isVisible={!!room} onClose={onClose} title={`房间 ${room.roomNumber} - ${statusConfig[room.status].label}`}>
            <div className="space-y-6">
                {room.status === RoomStatus.Available && (
                    <div>
                        <h3 className="font-semibold text-lg mb-2">办理入住</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder="住客姓名" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            <input type="text" placeholder="住客证件号码" value={guestId} onChange={e => setGuestId(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            <input type="text" placeholder="住客电话 (可选)" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 col-span-1 md:col-span-2" />
                        </div>
                        <button onClick={handleCheckIn} className="mt-4 w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">入住</button>
                    </div>
                )}

                {room.status === RoomStatus.Occupied && currentGuest && (
                     <div>
                        <h3 className="font-semibold text-lg mb-2">住客信息</h3>
                        <p><strong>姓名:</strong> {currentGuest.name}</p>
                        <p><strong>证件号:</strong> {currentGuest.idNumber}</p>
                        <p><strong>电话:</strong> {currentGuest.phone}</p>
                        <p><strong>入住时间:</strong> {new Date(currentBooking?.checkIn || '').toLocaleString()}</p>
                        <button onClick={handleCheckOut} className="mt-4 w-full bg-red-500 text-white p-2 rounded hover:bg-red-600">退房</button>
                    </div>
                )}
                
                {room.status === RoomStatus.Occupied && (
                     <div className="pt-4 border-t dark:border-gray-600">
                        <button onClick={handleAssignCleaning} className="w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600">指派打扫</button>
                     </div>
                )}

                {(room.status === RoomStatus.Available || room.status === RoomStatus.Maintenance) && (
                     <div className="pt-4 border-t dark:border-gray-600">
                        <h3 className="font-semibold text-lg mb-2">指派打扫</h3>
                        <select value={assignedCleaner} onChange={e => setAssignedCleaner(e.target.value)} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                            <option value="">选择保洁员</option>
                            {cleaningStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <button onClick={handleAssignCleaning} disabled={!assignedCleaner} className="mt-2 w-full bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 disabled:bg-gray-400">指派</button>
                    </div>
                )}
                
                {room.status === RoomStatus.Cleaning && (
                    <div className="pt-4 border-t dark:border-gray-600">
                        <button onClick={handleMarkClean} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">标记为已打扫</button>
                    </div>
                )}
                
                <div className="pt-4 border-t dark:border-gray-600">
                  {room.status !== RoomStatus.Maintenance ? (
                    <button onClick={() => handleSetMaintenance(true)} className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600">设为维修中</button>
                  ) : (
                    <button onClick={() => handleSetMaintenance(false)} className="w-full bg-gray-500 text-white p-2 rounded hover:bg-gray-600">清除维修状态</button>
                  )}
                </div>

            </div>
        </Modal>
    );
};

const RoomCard: React.FC<{ room: Room, onClick: () => void }> = ({ room, onClick }) => {
    const { data } = useApp();
    const config = statusConfig[room.status];
    
    const currentBooking = room.currentBookingId ? data.bookings.find(b => b.id === room.currentBookingId) : null;
    const currentGuest = currentBooking ? data.guests.find(g => g.id === currentBooking.guestId) : null;

    return (
        <button onClick={onClick} className={`p-4 rounded-lg shadow-md border-l-4 ${config.color} flex flex-col justify-between transform hover:scale-105 transition-transform duration-200`}>
            <div>
                <div className="flex justify-between items-center">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{room.roomNumber}</p>
                    <span title={config.label}>{config.icon}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{room.floor}楼</p>
            </div>
            <div className="mt-2 text-left">
                {room.status === RoomStatus.Occupied && currentGuest && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">住客: {currentGuest.name}</p>
                )}
                 {room.status === RoomStatus.Cleaning && (
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">需要打扫</p>
                )}
            </div>
        </button>
    );
};

const Dashboard: React.FC<{setActiveView: (view: any) => void}> = () => {
    const { data } = useApp();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

    const stats = useMemo(() => {
        const total = data.rooms.length;
        const occupied = data.rooms.filter(r => r.status === RoomStatus.Occupied).length;
        const available = data.rooms.filter(r => r.status === RoomStatus.Available).length;
        const cleaning = data.rooms.filter(r => r.status === RoomStatus.Cleaning).length;
        return { total, occupied, available, cleaning, occupancy: total > 0 ? ((occupied / total) * 100).toFixed(1) : 0 };
    }, [data.rooms]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="总房间数" value={stats.total} icon={<BuildingOffice2Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-300"/>} color="bg-indigo-100 dark:bg-indigo-900"/>
                <StatCard title="已入住" value={stats.occupied} icon={<UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-300"/>} color="bg-blue-100 dark:bg-blue-900"/>
                <StatCard title="可用" value={stats.available} icon={<CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-300"/>} color="bg-green-100 dark:bg-green-900"/>
                <StatCard title="待打扫" value={stats.cleaning} icon={<SparklesIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-300"/>} color="bg-yellow-100 dark:bg-yellow-900"/>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">房间总览</h3>
                 <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-4">
                    {data.rooms.sort((a,b) => a.roomNumber.localeCompare(b.roomNumber)).map(room => (
                        <RoomCard key={room.id} room={room} onClick={() => setSelectedRoom(room)} />
                    ))}
                </div>
            </div>
            
            <RoomActionModal room={selectedRoom} onClose={() => setSelectedRoom(null)} />
        </div>
    );
};

export default Dashboard;