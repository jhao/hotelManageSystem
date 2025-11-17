
import React, { ReactNode } from 'react';
import { XMarkIcon } from './Icons';

interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isVisible, onClose, title, children }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md m-4 relative max-h-[90vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
