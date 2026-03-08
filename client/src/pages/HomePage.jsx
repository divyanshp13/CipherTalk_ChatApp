import React, { useContext } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'
import { ChatContext } from '../../context/ChatContext'

const HomePage = () => {
    const { selectedUser, showRightSidebar } = useContext(ChatContext);
    
  return (
    <div className='w-full h-screen bg-[#050a0e] p-2 sm:p-4'>
        <div className={`backdrop-blur-xl bg-[#0a1218]/90 border border-[#00ffcc]/30 rounded flex overflow-hidden h-full relative shadow-[0_0_30px_rgba(0,255,204,0.1)]`}>
            
            {/* Sidebar is always visible unless on mobile with a selected user */}
            <div className={`w-full md:w-[320px] lg:w-[380px] shrink-0 border-r border-[#00ffcc]/20 ${selectedUser ? 'hidden md:block' : 'block'}`}>
               <Sidebar />
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col min-w-0 ${!selectedUser ? 'hidden md:flex' : 'flex'}`}>
               <ChatContainer />
            </div>

            {/* Right Sidebar */}
            {selectedUser && showRightSidebar && (
                <div className={`w-[280px] lg:w-[340px] shrink-0 h-full overflow-hidden bg-[#070c12] border-l border-[#00ffcc]/20 absolute right-0 top-0 z-20 xl:static`}>
                   <RightSidebar />
                </div>
            )}
            
        </div>
    </div>
  )
}
 
export default HomePage