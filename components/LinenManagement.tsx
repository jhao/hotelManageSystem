
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Linen, LinenStatus } from '../types';
import Modal from './common/Modal';
import { PlusCircleIcon } from './common/Icons';

const LinenManagement: React.FC = () => {
    const { data, setData } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [csvData, setCsvData] = useState('');
    const [filterStatus, setFilterStatus] = useState<LinenStatus | ''>('');

    const handleBulkImport = () => {
        const lines = csvData.trim().split('\n');
        const newLinens: Linen[] = [];
        lines.forEach(line => {
            const [name, price, status] = line.split(',');
            if (name && price && status && Object.values(LinenStatus).includes(status.trim() as LinenStatus)) {
                newLinens.push({
                    id: crypto.randomUUID(),
                    name: name.trim(),
                    price: parseFloat(price.trim()),
                    status: status.trim() as LinenStatus
                });
            }
        });
        if (newLinens.length > 0) {
            setData({ ...data, linens: [...data.linens, ...newLinens] });
        }
        setIsModalOpen(false);
        setCsvData('');
    };
    
    const filteredLinens = useMemo(() => {
        return data.linens.filter(linen => filterStatus ? linen.status === filterStatus : true);
    }, [data.linens, filterStatus]);
    
    const statusCounts = useMemo(() => {
        return data.linens.reduce((acc, linen) => {
            acc[linen.status] = (acc[linen.status] || 0) + 1;
            return acc;
        }, {} as Record<LinenStatus, number>);
    }, [data.linens]);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">布草库存</h2>
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        批量导入
                    </button>
                </div>
                
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {Object.values(LinenStatus).map(status => (
                        <div key={status} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                           <p className="text-sm text-gray-500 dark:text-gray-400">{status}</p>
                           <p className="text-2xl font-bold">{statusCounts[status] || 0}</p>
                        </div>
                    ))}
                </div>

                <div>
                    <label htmlFor="status-filter" className="block mb-2 text-sm font-medium">按状态筛选</label>
                    <select id="status-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value as LinenStatus | '')} className="p-2 border rounded dark:bg-gray-700 dark:border-gray-600">
                        <option value="">所有状态</option>
                        {Object.values(LinenStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                <div className="overflow-x-auto mt-4">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">编号</th>
                                <th scope="col" className="px-6 py-3">名称</th>
                                <th scope="col" className="px-6 py-3">价格</th>
                                <th scope="col" className="px-6 py-3">状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLinens.slice(0, 100).map(l => ( // limit to 100 for performance
                                <tr key={l.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                    <td className="px-6 py-4 text-xs font-mono">{l.id.substring(0, 8)}</td>
                                    <td className="px-6 py-4">{l.name}</td>
                                    <td className="px-6 py-4">¥{l.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">{l.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredLinens.length > 100 && <p className="text-center py-2 text-sm text-gray-500">仅显示前100条，共{filteredLinens.length}条。</p>}
                </div>
            </div>

            <Modal isVisible={isModalOpen} onClose={() => setIsModalOpen(false)} title="批量导入布草">
                <p className="text-sm text-gray-500 mb-2">输入CSV格式数据: 名称,价格,状态</p>
                <p className="text-xs text-gray-400 mb-4">例如: 枕套,10.50,库存</p>
                <textarea
                    value={csvData}
                    onChange={e => setCsvData(e.target.value)}
                    rows={10}
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                    placeholder="床单,25.00,库存&#10;浴巾,15.75,待清洗"
                ></textarea>
                <div className="flex justify-end space-x-2 pt-4">
                    <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-lg">取消</button>
                    <button onClick={handleBulkImport} className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600">导入</button>
                </div>
            </Modal>
        </div>
    );
};

export default LinenManagement;