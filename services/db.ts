
import { AppData, StaffRole, RoomStatus, LinenStatus, UserRole } from '../types';

export const getInitialData = (): AppData => {
    const savedData = localStorage.getItem('hotelAppData');
    if (savedData) {
        try {
            return JSON.parse(savedData);
        } catch (error) {
            console.error("Failed to parse data from localStorage", error);
        }
    }
    // Generate sample data if no data exists
    return generateSampleData();
};

export const generateSampleData = (): AppData => {
    const data: AppData = {
        staff: [
            { id: crypto.randomUUID(), name: '爱丽丝', role: StaffRole.Cleaning },
            { id: crypto.randomUUID(), name: '鲍勃', role: StaffRole.Cleaning },
            { id: crypto.randomUUID(), name: '查理', role: StaffRole.FrontDesk },
            { id: crypto.randomUUID(), name: '戴安娜', role: StaffRole.Manager },
            { id: crypto.randomUUID(), name: '伊桑', role: StaffRole.Maintenance },
        ],
        rooms: [],
        guests: [],
        bookings: [],
        cleaningLogs: [],
        linens: [],
        linenCleaningLogs: [],
        assets: [],
        users: [
            { id: 'user-admin', username: 'Admin', role: UserRole.Admin },
            { id: 'user-standard', username: '普通用户张三', role: UserRole.User },
        ],
    };

    // Generate Rooms
    for (let floor = 1; floor <= 5; floor++) {
        for (let roomNum = 1; roomNum <= 10; roomNum++) {
            const roomNumber = `${floor}0${roomNum}`;
            data.rooms.push({
                id: crypto.randomUUID(),
                floor,
                roomNumber,
                capacity: (roomNum % 3 === 0) ? 4 : 2,
                status: RoomStatus.Available,
                currentBookingId: null,
                bookingHistory: [],
            });
        }
    }

    // Generate Linens
    const linenTypes = ['枕套', '床单', '被套', '浴巾', '毛巾'];
    linenTypes.forEach(name => {
        for (let i = 0; i < 50; i++) {
            data.linens.push({
                id: crypto.randomUUID(),
                name,
                price: Math.floor(Math.random() * 20) + 5,
                status: LinenStatus.InStock,
            });
        }
    });

    // Generate Assets
     const assetTypes = [
        { name: '电视', category: '电子产品' }, { name: '迷你冰箱', category: '电子产品' },
        { name: '电水壶', category: '电子产品' }, { name: '床架', category: '家具' },
        { name: '床垫', category: '家具' }, { name: '书桌', category: '家具' },
        { name: '椅子', category: '家具' }, { name: '台灯', category: '家具' },
        { name: '淋浴喷头', category: '管道' }, { name: '水龙头', category: '管道' },
    ];
    data.rooms.forEach(room => {
        assetTypes.slice(0, Math.floor(Math.random() * (assetTypes.length - 4)) + 4).forEach(assetType => {
            data.assets.push({
                id: crypto.randomUUID(),
                name: assetType.name,
                category: assetType.category,
                location: `房间 ${room.roomNumber}`,
                purchaseDate: new Date(Date.now() - Math.random() * 3 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                value: Math.floor(Math.random() * 500) + 50,
            });
        });
    });

    localStorage.setItem('hotelAppData', JSON.stringify(data));
    return data;
};

export const clearData = () => {
    localStorage.removeItem('hotelAppData');
};

export const exportData = () => {
    const data = localStorage.getItem('hotelAppData');
    if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `hotel-data-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
};