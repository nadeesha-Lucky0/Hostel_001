import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import RoomManagement from './RoomManagement'
import RoomAllocation from './RoomAllocation'

export default function FloorAndRoomManagement({ allocatingStudent, setAllocatingStudent }) {
    const location = useLocation()
    const navigate = useNavigate()
    
    // Default to 'allocation' if a student is passed, otherwise 'rooms'
    const [activeTab, setActiveTab] = useState(allocatingStudent ? 'allocation' : 'rooms')

    // Also watch location state in case we navigate here with a specific tab
    useEffect(() => {
        if (location.state?.tab) {
            setActiveTab(location.state.tab)
        } else if (allocatingStudent) {
            setActiveTab('allocation')
        }
    }, [location.state, allocatingStudent])

    return (
        <div className="p-4 sm:p-10 space-y-10 w-full animate-fade-in transition-colors">
            <div className="page-header mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Floor & <span className="text-indigo-500 italic">Room</span> Management</h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">Manage hostel infrastructure and assign beds to students</p>
            </div>

            {/* Standardized Premium Tab Navigation */}
            <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-x-auto no-scrollbar mb-8">
                {[
                    { id: 'rooms', label: 'Rooms &\nFloors' },
                    { id: 'allocation', label: 'Student\nAllocations' }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id)
                            navigate('.', { replace: true, state: { tab: tab.id } })
                        }}
                        className={`flex-1 min-w-[120px] sm:min-w-[160px] py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300 border-none cursor-pointer flex flex-col items-center justify-center text-center leading-tight whitespace-pre-line ${
                            activeTab === tab.id
                                ? 'bg-[#FAB95B] text-[#1A3263] shadow-md shadow-[#FAB95B]/20 scale-[1.02]'
                                : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'rooms' ? (
                    <RoomManagement />
                ) : (
                    <RoomAllocation 
                        allocatingStudent={allocatingStudent} 
                        setAllocatingStudent={setAllocatingStudent} 
                    />
                )}
            </div>
        </div>
    )
}
