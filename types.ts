
export enum StaffRole {
    Cleaning = '保洁',
    FrontDesk = '前台',
    Finance = '财务',
    Maintenance = '维修',
    Manager = '经理'
}

export interface Staff {
    id: string;
    name: string;
    role: StaffRole;
}

export enum RoomStatus {
    Available = '可用',
    Occupied = '入住',
    Cleaning = '打扫中',
    Maintenance = '维修中'
}

export interface Guest {
    id: string;
    name: string;
    idNumber: string;
    phone: string;
}

export interface Booking {
    id: string;
    guestId: string;
    checkIn: string;
    checkOut: string | null;
}

export interface Room {
    id: string;
    floor: number;
    roomNumber: string;
    capacity: number;
    status: RoomStatus;
    currentBookingId: string | null;
    bookingHistory: string[]; // Array of booking IDs
}

export interface CleaningLog {
    id: string;
    roomId: string;
    staffId: string;
    assignedDate: string;
    completedDate: string | null;
    notes?: string;
}

export enum LinenStatus {
    InStock = '库存',
    InUse = '使用中',
    PendingWash = '待清洗',
    Washing = '清洗中'
}

export interface Linen {
    id: string;
    name: string;
    price: number;
    status: LinenStatus;
}

export interface LinenCleaningLog {
    id: string;
    linenIds: string[];
    staffId: string;

    sentDate: string;
    returnedDate: string | null;
}

export interface Asset {
    id: string;
    name: string;
    category: string;
    location: string; // roomId or 'Lobby', 'Kitchen', etc.
    purchaseDate: string;
    value: number;
}

export enum UserRole {
    Admin = '管理员',
    User = '普通用户'
}

export interface User {
    id: string;
    username: string;
    role: UserRole;
}

// Represents all data stored in the application
export interface AppData {
    staff: Staff[];
    rooms: Room[];
    guests: Guest[];
    bookings: Booking[];
    cleaningLogs: CleaningLog[];
    linens: Linen[];
    linenCleaningLogs: LinenCleaningLog[];
    assets: Asset[];
    users: User[];
}