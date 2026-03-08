import React, { useContext } from 'react'
import assets from '../assets/assets'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { ShieldAlert, Activity, Key, Database, Fingerprint, LogOut, Terminal, Network } from 'lucide-react'

const RightSidebar = () => {
  const { selectedUser } = useContext(ChatContext);
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate('/login');
  }

  if (!selectedUser) return null;

  return (
    <div className="w-full h-full relative overflow-y-auto bg-gradient-to-b from-[#060d13] to-[#04080b] border-l border-[#00ffcc]/10 shadow-[inset_10px_0_30px_rgba(0,0,0,0.8)] flex flex-col pb-12">
        {/* Header / Avatar Area */}
        <div className='flex flex-col items-center pt-12 pb-6 px-6 relative'>
            
            {/* Background Glow */}
            <div className="absolute top-10 w-40 h-40 bg-[#00ffcc]/10 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="relative group perspective-1000">
                <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-[#00ffcc] to-purple-600 shadow-[0_0_20px_rgba(0,255,204,0.3)] group-hover:shadow-[0_0_40px_rgba(0,255,204,0.6)] transition-all duration-500 ease-out">
                    <img 
                      src={selectedUser.profilePic || assets.avatar_icon} 
                      alt="Agent Profile" 
                      className='w-full h-full object-cover rounded-full border-4 border-[#060d13] transform group-hover:scale-[1.02] transition-transform duration-300' 
                    /> 
                </div>
                {/* Active Status Badge */}
                <div className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-[#00ffcc] border-[3px] border-[#060d13] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                </div>
            </div>

            <h1 className='text-xl sm:text-2xl font-bold tracking-[0.15em] text-white mt-6 uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'>
                {selectedUser.fullName}
            </h1>
            
            <p className='text-[#00ffcc]/80 text-[10px] tracking-[0.3em] uppercase mt-2 font-mono flex items-center gap-2'>
                <Fingerprint size={12} /> SECURE AGENT NODE
            </p>

            <div className="w-full mt-6 bg-[#00ffcc]/5 border border-[#00ffcc]/10 rounded-lg p-4 backdrop-blur-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#00ffcc]/50 group-hover:bg-[#00ffcc] transition-colors"></div>
                <p className='text-gray-400 text-xs text-center italic font-light leading-relaxed'>
                    "{selectedUser.bio || 'Waiting for protocol initialization...'}"
                </p>
            </div>
        </div>

        {/* Dynamic Division */}
        <div className="flex items-center justify-center gap-2 opacity-30 my-2">
           <div className="w-2 h-2 rounded-full bg-[#00ffcc]"></div>
           <div className="w-12 h-px bg-gradient-to-r from-[#00ffcc] to-transparent"></div>
           <Terminal size={12} className="text-[#00ffcc]" />
           <div className="w-12 h-px bg-gradient-to-l from-[#00ffcc] to-transparent"></div>
           <div className="w-2 h-2 rounded-full bg-[#00ffcc]"></div>
        </div>

        {/* Security Params */}
        <div className="px-6 py-6 space-y-5 flex-grow">
            <h3 className="text-white text-xs font-bold tracking-widest flex items-center gap-3">
                <Network size={16} className="text-[#00ffcc]" /> ENCRYPTION TUNNEL
            </h3>
            
            <div className="grid grid-cols-1 gap-3 font-mono">
                {/* Param 1 */}
                <div className="bg-[#0a1218] border border-gray-800 hover:border-purple-500/50 p-4 rounded-xl flex justify-between items-center group transition-colors shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                            <Key size={14} className="text-purple-400"/> 
                        </div>
                        <span className="text-[11px] text-gray-400 uppercase tracking-widest">Key Exchange</span>
                    </div>
                    <span className="text-[11px] font-bold text-purple-400 tracking-wider bg-purple-400/10 px-2 py-1 rounded">RSA-2048</span>
                </div>

                {/* Param 2 */}
                <div className="bg-[#0a1218] border border-gray-800 hover:border-blue-500/50 p-4 rounded-xl flex justify-between items-center group transition-colors shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <Database size={14} className="text-blue-400"/> 
                        </div>
                        <span className="text-[11px] text-gray-400 uppercase tracking-widest">Transport</span>
                    </div>
                    <span className="text-[11px] font-bold text-blue-400 tracking-wider bg-blue-400/10 px-2 py-1 rounded">AES-256</span>
                </div>

                {/* Param 3 */}
                <div className="bg-[#0a1218] border border-gray-800 hover:border-emerald-500/50 p-4 rounded-xl flex justify-between items-center group transition-colors shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                            <Activity size={14} className="text-emerald-400"/> 
                        </div>
                        <span className="text-[11px] text-gray-400 uppercase tracking-widest">Integrity</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 tracking-wider bg-emerald-400/10 px-2 py-1 rounded">SHA-256 HMAC</span>
                </div>
            </div>

            <button 
                onClick={() => navigate('/security')} 
                className="w-full mt-6 py-4 bg-gradient-to-r from-red-950/40 to-black hover:from-red-900/60 transition-all border border-red-500/30 hover:border-red-500/80 text-red-400 hover:text-red-300 rounded-xl text-xs font-bold tracking-[0.2em] shadow-[0_0_15px_rgba(255,0,0,0.1)] hover:shadow-[0_0_30px_rgba(255,0,0,0.25)] flex justify-center items-center gap-3 group"
            >
                <ShieldAlert size={16} className="group-hover:scale-110 transition-transform" /> 
                <span>ATTACK SIMULATOR</span>
            </button>
        </div>
        
        {/* Footer Actions */}
        <div className="px-6 pt-4 pb-6 mt-auto">
            <button 
                onClick={handleLogout} 
                className='w-full py-4 bg-transparent border border-gray-800 hover:border-[#00ffcc]/50 hover:bg-[#00ffcc]/5 text-gray-500 hover:text-[#00ffcc] text-[10px] font-mono font-bold tracking-[0.25em] rounded-xl transition-all flex items-center justify-center gap-2 group'
            >
                <LogOut size={14} className="group-hover:-translate-x-1 transition-transform" /> TERMINATE SESSION
            </button> 
        </div>
    </div>
  )
}

export default RightSidebar