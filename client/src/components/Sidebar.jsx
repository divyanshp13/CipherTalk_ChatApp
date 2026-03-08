import React, { useContext, useEffect } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import { MoreVertical, Search, LogOut, User as UserIcon } from 'lucide-react'

const Sidebar = () => {
    const navigate = useNavigate();
    const { users, getUsers, selectedUser, setSelectedUser, isUsersLoading } = useContext(ChatContext);
    const { onlineUser, logout, authUser } = useContext(AuthContext);

    useEffect(() => {
        if (authUser) {
            getUsers();
        }
    }, [authUser]);

    const logoutHandler = () => {
        logout();
        navigate('/login');
    }
    
  return (

    <div className={`bg-[#0a1218] h-full flex flex-col font-mono text-white`}>
        {/* Header */}
        <div className='p-4 border-b border-[#00ffcc]/30 bg-[#050a0e]'>
            <div className='flex justify-between items-center mb-4'>
                <div className="flex items-center gap-3">
                    <img src={authUser?.profilePic || assets.avatar_icon} alt="Profile" className='w-8 h-8 rounded border border-[#00ffcc] object-cover' />
                    <span className="text-[#00ffcc] font-bold tracking-wider text-sm">SECURE_COMMS</span>
                </div>
                
                <div className='relative group'>
                    <MoreVertical className="text-gray-400 cursor-pointer hover:text-[#00ffcc] transition-colors" size={20} />
                    
                    <div className='absolute top-full right-0 z-50 w-48 mt-2 rounded border border-[#00ffcc]/50 bg-[#050a0e] shadow-[0_5px_20px_rgba(0,255,204,0.15)] hidden group-hover:block'>
                        <div onClick={() => navigate('/profile')} className='p-3 hover:bg-[#00ffcc]/10 cursor-pointer flex items-center gap-2 border-b border-gray-800 text-sm'>
                            <UserIcon size={14} className="text-[#00ffcc]"/>
                            <span>CONFIGURE ID</span>
                        </div>
                        <div onClick={logoutHandler} className='p-3 hover:bg-red-900/40 cursor-pointer flex items-center gap-2 text-sm text-red-400'>
                            <LogOut size={14}/>
                            <span>TERMINATE SESSION</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className='bg-black border border-gray-700 rounded flex items-center gap-2 py-2 px-3 focus-within:border-[#00ffcc]/60 transition-colors shadow-inner'>
                <Search size={14} className="text-gray-500"/>
                <input type="text" className='bg-transparent border-none outline-none text-[#e0e0e0] text-xs placeholder-gray-600 flex-1' placeholder="SCAN FREQUENCIES..."/>
            </div>
        </div>

        {/* Contacts List */}
        <div className='flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-800'>
            <div className='text-[10px] text-gray-500 font-bold mb-2 ml-2 tracking-widest'>AVAILABLE NODES</div>
            
            <div className='flex flex-col gap-1'>
                {isUsersLoading && <p className="text-center text-xs text-[#00ffcc] animate-pulse mt-4">Scanning network...</p>}
                {!isUsersLoading && users.length === 0 && <p className="text-center text-xs text-red-400 mt-4">NO SIGNAL DETECTED</p>}
                
                {users.map((user, index)=>{
                    const isOnline = onlineUser.includes(user._id);
                    const isSelected = selectedUser?._id === user._id;

                    return (
                    <div onClick={()=>setSelectedUser(user)} key={index} className={`relative flex items-center gap-3 p-3 rounded cursor-pointer transition-all border border-transparent hover:border-[#00ffcc]/30 ${isSelected ? 'bg-[#00ffcc]/10 border-l-2 border-l-[#00ffcc]' : 'hover:bg-[#1a232c]'} `}>
                        
                        <div className="relative">
                            <img src={user?.profilePic || assets.avatar_icon} alt="Profile" className='w-10 h-10 object-cover rounded-sm border border-gray-700' />
                            {isOnline && <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-[#00ffcc] border border-black rounded-full shadow-[0_0_5px_#00ffcc]"></div>}
                        </div>

                        <div className='flex flex-col leading-tight min-w-0 flex-1'>
                            <p className="font-bold text-sm text-white truncate">{user.fullName}</p>
                            {isOnline 
                                ? <span className='text-[#00ffcc] text-[10px] tracking-widest'>ACTIVE</span>
                                : <span className='text-gray-500 text-[10px] tracking-widest'>DORMANT</span>
                            }
                        </div>
                        
                        {/* Optionally add unseen message badge here if available in context */}
                    </div>
                )})}
            </div>
        </div>
    </div>
  )
}

export default Sidebar