
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AppData, User, UserRole } from '../types';
import { generateSampleData, getInitialData } from '../services/db';

interface AppContextType {
    data: AppData;
    setData: React.Dispatch<React.SetStateAction<AppData>>;
    currentUser: User | null;
    setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
    refreshData: () => void;
    isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<AppData>(getInitialData);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        localStorage.setItem('hotelAppData', JSON.stringify(data));
    }, [data]);
    
    const refreshData = useCallback(() => {
      const freshData = getInitialData();
      if(freshData.users.length === 0) {
        // If data is empty after refresh, it means it was cleared.
        // Let's generate sample data to avoid a blank state.
        const sampleData = generateSampleData();
        setData(sampleData);
      } else {
        setData(freshData);
      }
    }, []);

    const isAdmin = currentUser?.role === UserRole.Admin;

    return (
        <AppContext.Provider value={{ data, setData, currentUser, setCurrentUser, refreshData, isAdmin }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};