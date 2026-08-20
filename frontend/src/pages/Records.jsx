import { useState, useEffect } from 'react'
import { api } from '../services/api'
import toast from 'react-hot-toast'
import { HiOutlineDocumentArrowDown, HiOutlineFunnel, HiPencil, HiTrash, HiXMark, HiMagnifyingGlass, HiOutlineTableCells, HiOutlineEye } from 'react-icons/hi2'
import ConfirmModal from '../components/ConfirmModal'

// Format room number as M1/F1 based on wing
const fmtRoom = (wing, roomnumber) => {
    const prefix = wing === 'female' ? 'F' : 'M';
    return `${prefix}${roomnumber}`;
};


export default function Records() {
    const [allocations, setAllocations] = useState([])
    const [degrees, setDegrees] = useState([])
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState({ wing: '', floorNumber: '', roomType: '', degree: '', fromDate: '', toDate: '', search: '' })

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [activeModalTab, setActiveModalTab] = useState('details') // 'details' or 'reassign'
    const [editingAllocation, setEditingAllocation] = useState(null)
    const [editFloors, setEditFloors] = useState([])
    const [editRooms, setEditRooms] = useState([])
    const [selectedFloorId, setSelectedFloorId] = useState('')
    const [selectedRoomId, setSelectedRoomId] = useState('')
    const [selectedBedId, setSelectedBedId] = useState('')
    const [updating, setUpdating] = useState(false)
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, data: null, title: '', message: '', onConfirm: () => { } })

    // View Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [viewingApplication, setViewingApplication] = useState(null)
    const [fetchingApp, setFetchingApp] = useState(false)
    const [activeViewTab, setActiveViewTab] = useState('personal')

    useEffect(() => {
        loadAllocations()
        loadDegrees()
    }, [])

    const openViewModal = async (allocation) => {
        setIsViewModalOpen(true)
        setViewingApplication(null)
        setFetchingApp(true)
        setActiveViewTab('personal')
        try {
            const apps = await api.getApplications({ search: allocation.studentRollNumber })
            const fullApp = apps.find(a => a.studentRollNumber === allocation.studentRollNumber)
            if (fullApp) {
                setViewingApplication(fullApp)
            } else {
                toast.error('Detailed application record not found. Showing base allocation details.')
                setViewingApplication({
                    studentName: allocation.studentName,
                    studentRollNumber: allocation.studentRollNumber,
                    studentEmail: allocation.studentEmail,
                    studentDegree: allocation.studentDegree || '',
                    studentYear: allocation.studentYear || '1',
                    studentWing: allocation.wing,
                    roomType: allocation.roomType,
                    assignedRoom: allocation.roomnumber,
                    applicationStatus: allocation.paymentStatus === 'success' ? 'Activated' : 'Pending'
                })
            }
        } catch (err) {
            console.error('Failed to load student application details:', err)
            toast.error('Failed to load student application details')
            setViewingApplication({
                studentName: allocation.studentName,
                studentRollNumber: allocation.studentRollNumber,
                studentEmail: allocation.studentEmail,
                studentDegree: allocation.studentDegree || '',
                studentYear: allocation.studentYear || '1',
                studentWing: allocation.wing,
                roomType: allocation.roomType,
                assignedRoom: allocation.roomnumber,
                applicationStatus: allocation.paymentStatus === 'success' ? 'Activated' : 'Pending'
            })
        } finally {
            setFetchingApp(false)
        }
    }


    const loadDegrees = async () => {
        try {
            const data = await api.getDegrees()
            setDegrees(data)
        } catch (err) {
            console.error('Failed to load degrees:', err)
        }
    }

    const loadAllocations = async (f = filters) => {
        try {
            setLoading(true)
            const params = {}
            Object.entries(f).forEach(([k, v]) => { if (v) params[k] = v })
            const data = await api.getAllocations(params)
            setAllocations(data)
        } catch { toast.error('Failed to load records') }
        finally { setLoading(false) }
    }

    const applyFilters = () => loadAllocations(filters)
    const clearFilters = () => { const c = { wing: '', floorNumber: '', roomType: '', degree: '', fromDate: '', toDate: '', search: '' }; setFilters(c); loadAllocations(c) }

    const handleDelete = (id, studentName) => {
        setConfirmModal({
            isOpen: true,
            data: { id, studentName },
            title: 'Delete Allocation',
            message: `Are you sure you want to delete allocation for ${studentName}? This will free up the bed.`,
            onConfirm: () => executeDelete(id)
        })
    }

    const executeDelete = async (id) => {
        try {
            await api.deleteAllocation(id)
            toast.success('Allocation deleted successfully')
            loadAllocations()
            setConfirmModal({ isOpen: false, data: null, title: '', message: '', onConfirm: () => { } }) // Close modal after action
        } catch (err) { toast.error(err.message) }
    }

    const openEditModal = async (allocation) => {
        setEditingAllocation(allocation)
        setIsEditModalOpen(true)
        setActiveModalTab('details')
        setSelectedBedId(allocation.bedId)

        try {
            const floors = await api.getFloors(allocation.wing)
            const activeFloors = floors.filter(f => f.isactive)
            setEditFloors(activeFloors)

            // Find current floor ID
            const currentFloor = activeFloors.find(f => f.floorNumber === allocation.floorNumber)
            if (currentFloor) {
                setSelectedFloorId(currentFloor._id)
                await loadEditRooms(currentFloor._id, allocation)
            }
        } catch (err) { toast.error('Failed to load floor data') }
    }

    const loadEditRooms = async (floorId, currentAlloc = editingAllocation) => {
        try {
            const rooms = await api.getRooms({ floor: floorId })
            setEditRooms(rooms)
            const currentRoom = rooms.find(r => r.roomnumber === (currentAlloc?.roomnumber || editingAllocation?.roomnumber))
            if (currentRoom) setSelectedRoomId(currentRoom._id)
            else setSelectedRoomId('')
        } catch (err) { toast.error('Failed to load rooms') }
    }

    const handleFloorChange = async (floorId) => {
        setSelectedFloorId(floorId)
        setSelectedRoomId('')
        setSelectedBedId('')
        await loadEditRooms(floorId)
    }

    const handleUpdate = async () => {
        if (!selectedRoomId || !selectedBedId) return toast.error('Please select both room and bed')
        try {
            setUpdating(true)
            await api.updateAllocation(editingAllocation._id, {
                roomId: selectedRoomId,
                bedId: selectedBedId
            })
            toast.success('Allocation updated successfully')
            setIsEditModalOpen(false)
            loadAllocations()
        } catch (err) { toast.error(err.message) }
        finally { setUpdating(false) }
    }

    const downloadSecureFile = async (url, filename) => {
        try {
            const token = sessionStorage.getItem('hostel_token');
            const res = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to download file');
            const blob = await res.blob();
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            toast.error(err.message || 'Download failed');
        }
    };

    const handleExport = (fmt) => {
        const params = {}
        Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v })
        const url = api.getExportUrl(fmt, params);
        downloadSecureFile(url, `allocation_records_${new Date().toLocaleDateString()}.${fmt}`);
    }

    return (
        <div className="p-4 sm:p-10 space-y-10 w-full animate-fade-in transition-colors">
            <div className="page-header mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Records & <span className="text-indigo-500 italic">Reports</span></h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mt-1">View allocation records with advanced filtering and export</p>
            </div>

            <div className="filter-bar">
                <div className="form-group">
                    <label className="form-label dark:text-slate-300">Wing</label>
                    <select className="form-select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" value={filters.wing} onChange={e => setFilters({ ...filters, wing: e.target.value })}>
                        <option value="">All Wings</option>
                        <option value="male">♂ Male</option>
                        <option value="female">♀ Female</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label dark:text-slate-300">Floor</label>
                    <select className="form-select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" value={filters.floorNumber} onChange={e => setFilters({ ...filters, floorNumber: e.target.value })}>
                        <option value="">All</option>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>Floor {n}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label dark:text-slate-300">Type</label>
                    <select className="form-select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" value={filters.roomType} onChange={e => setFilters({ ...filters, roomType: e.target.value })}>
                        <option value="">All</option>
                        <option value="single">Single</option>
                        <option value="double">Double</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label dark:text-slate-300">Degree</label>
                    <select className="form-select dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" value={filters.degree} onChange={e => setFilters({ ...filters, degree: e.target.value })}>
                        <option value="">All</option>
                        {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label dark:text-slate-300">From</label>
                    <input type="date" className="form-input dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" value={filters.fromDate} onChange={e => setFilters({ ...filters, fromDate: e.target.value })} />
                </div>
                <div className="form-group">
                    <label className="form-label dark:text-slate-300">To</label>
                    <input type="date" className="form-input dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300" value={filters.toDate} onChange={e => setFilters({ ...filters, toDate: e.target.value })} />
                </div>
                <div className="form-group flex gap-2 items-end">
                    <button className="btn btn-primary btn-sm" onClick={applyFilters}><HiOutlineFunnel /> Apply</button>
                    <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear</button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
                {/* Search Bar on Left */}
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                        <HiMagnifyingGlass className="text-lg" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by Name, Email or Student ID..."
                        className="w-full pl-11 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all dark:text-slate-200"
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    />
                </div>

                {/* Exports & Count on Right */}
                <div className="flex items-center gap-3">
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mr-2">
                        {allocations.length} {allocations.length === 1 ? 'record' : 'records'}
                    </span>
                    <div className="flex items-center gap-2">
                        <button 
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-none cursor-pointer" 
                            onClick={() => handleExport('csv')}
                        >
                            <HiOutlineTableCells className="text-lg" /> CSV
                        </button>
                        <button 
                            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border-none cursor-pointer" 
                            onClick={() => handleExport('pdf')}
                        >
                            <HiOutlineDocumentArrowDown className="text-lg" /> PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="card dark:bg-slate-900 dark:border-slate-800" style={{ padding: 0, overflow: 'hidden', marginBottom: 0 }}>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                                <th className="px-8 py-6 text-left text-[11px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Student Information</th>
                                <th className="px-8 py-6 text-center text-[11px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Room Details</th>
                                <th className="px-8 py-6 text-center text-[11px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Payment</th>
                                <th className="px-8 py-6 text-center text-[11px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Allocated On</th>
                                <th className="px-8 py-6 text-right text-[11px] font-black text-slate-500 dark:text-white/40 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="9" className="text-center py-16 text-slate-400">Loading...</td></tr>
                            ) : allocations.length === 0 ? (
                                <tr><td colSpan="9" className="text-center py-16 text-slate-400">No records found</td></tr>
                            ) : allocations.map(a => (
                                <tr key={a._id} className="hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors group border-b border-slate-50 dark:border-white/5">
                                    <td className="px-8 py-6">
                                        <div>
                                            <div className="font-bold text-[13px] text-slate-800 dark:text-slate-200 leading-tight group-hover:text-indigo-600 transition-colors uppercase">{a.studentName}</div>
                                            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 italic mt-0.5">{a.studentRollNumber}</div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="text-[11px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">{a.roomType} · Bed {a.id || a.bedId}</div>
                                        <div className="text-[9px] text-slate-400 font-bold uppercase">{a.wing} Wing · Floor {a.floorNumber} · Room {a.roomnumber}</div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${a.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                            {a.paymentStatus === 'success' ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center text-[12px] font-bold text-slate-500 dark:text-slate-400">{new Date(a.allocatedAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-1.5">
                                            <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="View Profile & Application Details" onClick={() => openViewModal(a)}><HiOutlineEye /></button>
                                            <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-amber-500 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="Edit Assignment" onClick={() => openEditModal(a)}><HiPencil /></button>
                                            <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-sm" title="Delete Allocation" onClick={() => handleDelete(a._id, a.studentName)}><HiTrash /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Allocation Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modal dark:bg-slate-900 border dark:border-slate-800" onClick={e => e.stopPropagation()}>
                        <div className="modal-header border-b border-slate-100 dark:border-slate-800 px-8 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Update Allocation</h3>
                                <p className="text-xs text-slate-400 font-medium">Manage student record and room assignment</p>
                            </div>
                            <button className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 dark:text-slate-500" onClick={() => setIsEditModalOpen(false)}><HiXMark className="text-xl" /></button>
                        </div>

                        <div className="modal-body p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                            {/* Centered Profile Section */}
                            <div className="profile-centered">
                                <div className="name dark:text-white">{editingAllocation?.studentName}</div>
                                <div className="email dark:text-slate-400">{editingAllocation?.studentEmail}</div>
                            </div>

                            {/* Info Cards Grid */}
                            <div className="student-detail-grid">
                                {[
                                    ['Roll Number', editingAllocation?.studentRollNumber],
                                    ['Degree', editingAllocation?.studentDegree],
                                    ['Year', `Year ${editingAllocation?.studentYear}`],
                                    ['Wing', editingAllocation?.wing === 'male' ? '♂ Male Wing' : '♀ Female Wing'],
                                    ['Phone', '—'],
                                    ['Applied', editingAllocation?.allocatedAt ? new Date(editingAllocation.allocatedAt).toLocaleDateString() : '—'],
                                    ['Current Room', fmtRoom(editingAllocation?.wing, editingAllocation?.roomnumber)],
                                    ['Current Bed', `Bed ${editingAllocation?.bedId}`],
                                    ['Guardian', '—'],
                                    ['Guardian Phone', '—'],
                                ].map(([label, val]) => (
                                    <div key={label} className="detail-item dark:bg-slate-800/50 dark:border-slate-700">
                                        <div className="detail-label dark:text-slate-400">{label}</div>
                                        <div className="detail-value dark:text-slate-200">{val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Reassignment Section */}
                            <div className="space-y-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex flex-col items-center mb-2">
                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 mb-1">Target Room Assignment</div>
                                    <div className="text-xs text-slate-400">Select new location for this student</div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="form-group">
                                        <label className="form-label text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Floor</label>
                                        <select className="form-select h-12 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-primary/20" value={selectedFloorId} onChange={e => handleFloorChange(e.target.value)}>
                                            <option value="">Select Floor</option>
                                            {editFloors.map(f => (
                                                <option key={f._id} value={f._id}>Floor {f.floorNumber} ({f.floorID})</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Target Room</label>
                                        <select className="form-select h-12 rounded-xl bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-primary/20" value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} disabled={!selectedFloorId}>
                                            <option value="">Select Room</option>
                                            {editRooms.map(r => (
                                                <option key={r._id} value={r._id}>Room {r.roomnumber} ({r.type})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {selectedRoomId && (
                                    <div className="space-y-3">
                                        <label className="form-label text-xs font-bold uppercase tracking-wider text-slate-500">Select Available Bed</label>
                                        <div className="flex gap-4">
                                            {['A', 'B'].map((bid) => {
                                                const roomData = editRooms.find(r => r._id === selectedRoomId)
                                                const bedData = roomData?.beds.find(b => b.bedId === bid)

                                                if (bid === 'B' && roomData?.type === 'single') return null

                                                // Robust occupancy check using stringified IDs
                                                const isCurrentlyOccupied = bedData?.isOccupied && String(bedData?.student) !== String(editingAllocation?.student)
                                                const isStudentOwnBed = String(bedData?.student) === String(editingAllocation?.student)
                                                const isSelected = selectedBedId === bid

                                                return (
                                                    <div
                                                        key={bid}
                                                        onClick={() => !isCurrentlyOccupied && setSelectedBedId(bid)}
                                                        className={`relative flex-1 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer overflow-hidden ${isSelected
                                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 ring-4 ring-indigo-500/10'
                                                            : isCurrentlyOccupied
                                                                ? 'border-slate-100 dark:border-slate-800 opacity-40 grayscale cursor-not-allowed bg-slate-50 dark:bg-slate-900/30'
                                                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                                            }`}
                                                    >
                                                        <div className="flex flex-col items-center gap-2 relative z-10">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isSelected ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                                {bid}
                                                            </div>
                                                            <span className={`text-sm font-bold ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500'}`}>
                                                                {isCurrentlyOccupied ? 'Occupied' : isStudentOwnBed ? `Bed ${bid} (Current)` : `Bed ${bid}`}
                                                            </span>
                                                            <div className={`w-2 h-2 rounded-full mt-1 ${isSelected ? 'bg-indigo-500 animate-pulse' : isCurrentlyOccupied ? 'bg-rose-400' : 'bg-emerald-400'}`}></div>
                                                        </div>
                                                        {isStudentOwnBed && !isSelected && <div className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-bold rounded-full border border-indigo-500/20">CURRENT</div>}
                                                        {isSelected && <div className="absolute top-2 right-2 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-[8px] text-white">✓</div>}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Centered Payment Section */}
                            <div className="text-center pt-4">
                                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Verified Refundable Payment Status</div>
                                <div className={`badge ${editingAllocation?.paymentStatus === 'success' ? 'badge-success' :
                                    editingAllocation?.paymentStatus === 'rejected' ? 'badge-rejected' : 'badge-warning'
                                    } py-2 px-6 text-[12px] shadow-sm`}>
                                    {editingAllocation?.paymentStatus === 'success' ? 'Paid' :
                                        editingAllocation?.paymentStatus === 'rejected' ? 'Rejected' : 'Pending Approval'}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer border-t border-slate-100 dark:border-slate-800 px-8 pt-4">
                            <button className="btn btn-ghost h-12 px-6 rounded-xl font-bold" onClick={() => setIsEditModalOpen(false)}>Close</button>
                            <button
                                className="btn btn-primary h-12 px-8 rounded-xl font-bold shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 transform transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
                                onClick={handleUpdate}
                                disabled={updating || !selectedRoomId || !selectedBedId}
                            >
                                {updating ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Saving Changes...</span>
                                    </div>
                                ) : 'Save New Allocation'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
            />

            {/* View Details Modal */}
            {isViewModalOpen && (
                <div className="modal-overlay" onClick={() => setIsViewModalOpen(false)}>
                    <div className="modal max-w-4xl dark:bg-slate-900 border dark:border-slate-800" onClick={e => e.stopPropagation()}>
                        <div className="modal-header border-b border-slate-100 dark:border-slate-800 px-8 pb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <HiOutlineEye className="text-indigo-500" /> Student Profile & Application Details
                                </h3>
                                <p className="text-xs text-slate-400 font-medium">Full information from the student's initial hostel application</p>
                            </div>
                            <button className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-400 dark:text-slate-500" onClick={() => setIsViewModalOpen(false)}><HiXMark className="text-xl" /></button>
                        </div>

                        <div className="modal-body p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                            {fetchingApp ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-12 h-12 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">Loading detailed application information...</p>
                                </div>
                            ) : viewingApplication ? (
                                <>
                                    {/* Quick Header Summary */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 p-6 rounded-2xl gap-4">
                                        <div className="text-center sm:text-left">
                                            <div className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{viewingApplication.studentName}</div>
                                            <div className="text-sm font-semibold text-indigo-500 dark:text-indigo-400 mt-1">{viewingApplication.studentRollNumber} · {viewingApplication.studentEmail}</div>
                                        </div>
                                        <div className="flex flex-col items-center sm:items-end gap-1.5">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Application Status</span>
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-sm ${
                                                viewingApplication.applicationStatus === 'Activated' || viewingApplication.applicationStatus === 'Room Allocated'
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : viewingApplication.applicationStatus === 'Rejected'
                                                        ? 'bg-rose-500/10 text-rose-600'
                                                        : 'bg-amber-500/10 text-amber-600'
                                            }`}>
                                                {viewingApplication.applicationStatus || 'Pending'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tabs Selection Bar */}
                                    <div className="flex border-b border-slate-100 dark:border-slate-800 scrollbar-none overflow-x-auto gap-2">
                                        {[
                                            { id: 'personal', label: 'Personal & Academic' },
                                            { id: 'guardian', label: 'Guardian & Emergency' },
                                            { id: 'medical', label: 'Medical Information' },
                                            { id: 'preferences', label: 'Preferences & Docs' }
                                        ].map(t => (
                                            <button
                                                key={t.id}
                                                onClick={() => setActiveViewTab(t.id)}
                                                className={`px-4 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                                                    activeViewTab === t.id
                                                        ? 'border-indigo-500 text-indigo-500 dark:text-indigo-400'
                                                        : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                                }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Tab Contents */}
                                    <div className="pt-2 animate-fade-in text-left">
                                        {activeViewTab === 'personal' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                {[
                                                    ['Full Name', viewingApplication.studentName || '—'],
                                                    ['Roll / ID Number', viewingApplication.studentRollNumber || '—'],
                                                    ['SLIIT Email', viewingApplication.studentEmail || '—'],
                                                    ['NIC / Passport', viewingApplication.nic || '—'],
                                                    ['Gender', viewingApplication.gender ? (viewingApplication.gender.charAt(0).toUpperCase() + viewingApplication.gender.slice(1)) : '—'],
                                                    ['Date of Birth', viewingApplication.dateOfBirth ? new Date(viewingApplication.dateOfBirth).toLocaleDateString() : '—'],
                                                    ['Contact Number', viewingApplication.contactNumber || '—'],
                                                    ['Permanent Address', viewingApplication.permanentAddress || '—', true],
                                                    ['Faculty', viewingApplication.faculty || '—'],
                                                    ['Registration Number', viewingApplication.registrationNumber || '—'],
                                                    ['Degree Programme', viewingApplication.studentDegree || '—'],
                                                    ['Year of Study', viewingApplication.studentYear ? `Year ${viewingApplication.studentYear}` : '—']
                                                ].map(([label, val, fullWidth]) => (
                                                    <div key={label} className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 ${fullWidth ? 'sm:col-span-2' : ''}`}>
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
                                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{val}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {activeViewTab === 'guardian' && (
                                            <div className="space-y-6">
                                                {/* Guardian Section */}
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-indigo-500 mb-3">Guardian Information</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {[
                                                            ['Guardian Name', viewingApplication.guardianName || '—'],
                                                            ['Guardian Contact Number', viewingApplication.guardianContactNumber || '—']
                                                        ].map(([label, val]) => (
                                                            <div key={label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
                                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{val}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Emergency Contact */}
                                                <div>
                                                    <h4 className="text-xs font-black uppercase tracking-widest text-rose-500 mb-3">Emergency Contact Details</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {[
                                                            ['Emergency Contact Name', viewingApplication.emergencyContactName || '—'],
                                                            ['Emergency Contact Phone', viewingApplication.emergencyContactPhone || '—']
                                                        ].map(([label, val]) => (
                                                            <div key={label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
                                                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{val}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {activeViewTab === 'medical' && (
                                            <div className="space-y-6">
                                                {/* Medical condition status */}
                                                <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">Medical Condition Declarations</span>
                                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                                            Does the student have any medical conditions?
                                                        </span>
                                                    </div>
                                                    <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                                        viewingApplication.hasMedicalCondition 
                                                            ? 'bg-rose-500/10 text-rose-600' 
                                                            : 'bg-emerald-500/10 text-emerald-600'
                                                    }`}>
                                                        {viewingApplication.hasMedicalCondition ? 'YES' : 'NO'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 gap-4">
                                                    {[
                                                        ['Condition Details', viewingApplication.medicalConditionDetails || 'No medical conditions declared.'],
                                                        ['Allergies', viewingApplication.allergies || 'No specific allergies declared.'],
                                                        ['Regular Medications', viewingApplication.regularMedications || 'No regular medications declared.'],
                                                        ['Additional Medical Info', viewingApplication.medicalInfo || 'No additional medical info provided.']
                                                    ].map(([label, val]) => (
                                                        <div key={label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-1 flex-1">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
                                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{val}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Medical Report PDF Link */}
                                                {viewingApplication.medicalReportUrl && (
                                                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex flex-col sm:flex-row justify-between items-center gap-3">
                                                        <div className="text-left">
                                                            <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Medical Report Attachment</div>
                                                            <div className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">Click to view the student's uploaded medical records document</div>
                                                        </div>
                                                        <a 
                                                            href={viewingApplication.medicalReportUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="btn btn-primary btn-sm whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white border-none py-2 px-4 rounded-lg font-bold text-xs uppercase"
                                                        >
                                                            View Document
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {activeViewTab === 'preferences' && (
                                            <div className="space-y-6">
                                                {/* Preference details */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {[
                                                        ['Preferred Hostel', viewingApplication.preferredHostel || '—'],
                                                        ['Student Wing', viewingApplication.studentWing ? (viewingApplication.studentWing.toUpperCase() + ' Wing') : '—'],
                                                        ['Preferred Room Type', viewingApplication.roomType ? (viewingApplication.roomType.charAt(0).toUpperCase() + viewingApplication.roomType.slice(1)) : '—'],
                                                        ['Duration of Stay', viewingApplication.durationOfStay ? `${viewingApplication.durationOfStay} Months` : '—'],
                                                        ['Assigned Room (From DB)', viewingApplication.assignedRoom || '—']
                                                    ].map(([label, val]) => (
                                                        <div key={label} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex flex-col gap-1">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
                                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{val}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Payment Slip Image Link */}
                                                {viewingApplication.paymentSlipUrl && (
                                                    <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 flex flex-col sm:flex-row justify-between items-center gap-3">
                                                        <div className="text-left">
                                                            <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Hostel Fee Payment Slip</div>
                                                            <div className="text-[10px] text-indigo-500 dark:text-indigo-400 mt-0.5">Click to view/download the student's initial registration payment proof</div>
                                                        </div>
                                                        <a 
                                                            href={viewingApplication.paymentSlipUrl} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="btn btn-primary btn-sm whitespace-nowrap bg-indigo-600 hover:bg-indigo-700 text-white border-none py-2 px-4 rounded-lg font-bold text-xs uppercase"
                                                        >
                                                            View Payment Slip
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div className="py-20 text-center text-slate-400 font-semibold">No details could be displayed. Please try again.</div>
                            )}
                        </div>

                        <div className="modal-footer border-t border-slate-100 dark:border-slate-800 px-8 pt-4">
                            <button className="btn btn-ghost h-12 px-6 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 dark:text-white" onClick={() => setIsViewModalOpen(false)}>Close Profile</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
