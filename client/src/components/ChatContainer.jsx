import React, { useRef, useEffect, useContext, useState } from 'react' 
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { ChatContext } from '../../context/ChatContext'
import { AuthContext } from '../../context/AuthContext'
import { Lock, AlertTriangle, Trash2 } from 'lucide-react'

const ChatContainer = () => {
    const { messages, getMessages, sendMessage, selectedUser, setSelectedUser, deleteMessage, isMessagesLoading, showRightSidebar, setShowRightSidebar } = useContext(ChatContext);
    const { authUser, socket } = useContext(AuthContext);
    const [text, setText] = useState("");
    const [imageStr, setImageStr] = useState("");
    const scrollEnd = useRef(null);

    useEffect(() => {
        if(selectedUser) {
            getMessages(selectedUser._id);
        }
    }, [selectedUser]);

    useEffect(() => {
        if(scrollEnd.current){
            scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Screenshot Detection Heuristics
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'PrintScreen' || (e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5' || e.key === 's' || e.key === 'S'))) {
                if (socket && selectedUser) {
                    socket.emit("screenshotDetected", { receiverId: selectedUser._id });
                }
            }
        };

        const handleVisibilityChange = () => {
            if (document.hidden && socket && selectedUser) {
                // Often switching apps to take screenshot on mobile
                // We could emit a warning but it might be too noisy. Let's keep it purely for explicit keyboard combos for now, 
                // but this could log generic focus-lost warnings in a strict environment.
            }
        };

        window.addEventListener('keyup', handleKeyDown);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            window.removeEventListener('keyup', handleKeyDown);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        }
    }, [socket, selectedUser]);

    const handleSend = async () => {
        if (!text.trim() && !imageStr) return;
        
        const success = await sendMessage({ text, image: imageStr });
        if (success) {
            setText("");
            setImageStr("");
        }
    }

    const handleImage = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImageStr(reader.result);
        reader.readAsDataURL(file);
    }

  if (!selectedUser) {
      return (
        <div className='flex flex-col items-center justify-center gap-4 text-[#00ffcc] bg-black/60 max-md:hidden h-full border-l border-gray-600/50 shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]'>
            <Lock className="w-16 h-16 animate-pulse" />
            <p className='text-xl font-mono'>CIPHERTALK SECURE CHANNEL</p>
            <p className="text-sm font-mono text-gray-400 max-w-md text-center">Select a contact to initiate an End-to-End Encrypted session.</p>
        </div>
      )
  }

  return (
    <div className='h-full flex flex-col relative backdrop-blur-lg bg-[#0a0f16]/90 border-l border-r border-gray-600/30'   >
        { /*--------------Header--------------*/}
        <div className='flex justify-between items-center py-3 px-4 border-b border-[#00ffcc]/30 bg-black/40 shadow-[0_2px_10px_rgba(0,255,204,0.05)]'>
            <div className="flex items-center gap-3">
                <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-10 h-10 object-cover rounded-full border border-gray-500"/>
                <div className='flex flex-col'>
                    <p className='text-lg text-white flex items-center gap-2 font-medium'>
                        {selectedUser.fullName}
                    </p>
                    <p className="text-xs text-[#00ffcc] font-mono flex items-center gap-1">
                        <Lock size={12} /> SECURE CONNECTION ESTABLISHED
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <img onClick={() => setSelectedUser(null)} src={assets.arrow_icon} alt="back" className='cursor-pointer w-6 md:hidden' />
                <img onClick={() => setShowRightSidebar(!showRightSidebar)} src={assets.help_icon} alt="info" className='w-6 opacity-70 cursor-pointer hover:opacity-100 transition-opacity' />
            </div>
        </div>

        { /*--------------Messages--------------*/}
        <div className='flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm scrollbar-thin scrollbar-thumb-gray-700'>
            {isMessagesLoading && <div className="text-center text-[#00ffcc] animate-pulse py-4">Decrypting messages...</div>}
            
            {!isMessagesLoading && messages.map((msg)=>(
                <div key={msg._id} className={`flex items-end gap-2 pr-2 ${String(msg.senderId) === String(authUser._id) ? 'justify-end' : 'justify-start'}`}>
                    
                    {String(msg.senderId) !== String(authUser._id) && (
                        <div className='flex flex-col items-center mb-1'>
                            <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-8 h-8 rounded-full border border-gray-600 mb-1' />
                        </div>
                    )}
                    
                    <div className="flex flex-col group max-w-[70%]">
                        {msg.image && (
                            <img src={msg.image} alt="Decrypted media" className='max-w-[200px] border border-[#00ffcc]/30 rounded-lg overflow-hidden mb-2 shadow-[0_0_10px_rgba(0,255,204,0.1)]'/>
                        )}
                        
                        {msg.text && (
                            <div className={`p-3 rounded-lg relative ${String(msg.senderId) === String(authUser._id) ? 'bg-[#00ffcc]/10 text-[#e0e0e0] border border-[#00ffcc]/30 rounded-br-none' : 'bg-[#1a1e26] text-gray-200 border border-gray-700 rounded-bl-none'}`}>
                                
                                {/* Tamper Warning */}
                                {!msg.hashVerified && !msg.decryptError && (
                                    <div className="absolute -top-3 left-2 bg-red-900 text-red-200 text-[10px] px-2 py-0.5 rounded border border-red-500 flex items-center gap-1">
                                        <AlertTriangle size={10} /> INTEGRITY COMPROMISED
                                    </div>
                                )}
                                
                                <p className={`break-words ${!msg.hashVerified ? 'text-red-400' : ''}`}>{msg.text}</p>
                            </div>
                        )}

                        <div className={`flex items-center gap-2 mt-1 text-[10px] text-gray-500 ${String(msg.senderId) === String(authUser._id) ? 'justify-end' : 'justify-start'}`}>
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {msg.isEncrypted && <Lock size={10} className="text-[#00ffcc]/70" title="End-to-End Encrypted"/>}
                            {String(msg.senderId) === String(authUser._id) && (
                                <button onClick={() => deleteMessage(msg._id)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-2">
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                </div>
            ))}
            <div ref={scrollEnd}></div>
        </div>

        {/*--------------Input--------------*/}
        {imageStr && (
            <div className="absolute bottom-[70px] left-4 bg-[#1a1e26] border border-gray-600 p-2 rounded-lg flex items-center gap-2">
                <img src={imageStr} className="w-16 h-16 object-cover rounded" />
                <button onClick={() => setImageStr("")} className="text-gray-400 hover:text-white pb-14 px-1">✕</button>
            </div>
        )}
        <div className='bg-[#0a0f16] border-t border-gray-700 p-3'>
            <div className='flex items-center bg-[#1a1e26] border border-gray-700 px-3 rounded-full focus-within:border-[#00ffcc]/50 transition-colors shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)]'>
                <input 
                    type="text" 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder='Type secure message...' 
                    className='flex-1 text-sm p-3 border-none bg-transparent outline-none text-[#e0e0e0] font-mono placeholder-gray-500' 
                />
                <input type="file" onChange={handleImage} id='image_upload' accept='image/*' hidden/>
                <label htmlFor="image_upload">
                    <img src={assets.gallery_icon} alt="add img" className='w-5 mr-3 cursor-pointer opacity-70 hover:opacity-100 transition-opacity invert' />
                </label>
                <img onClick={handleSend} src={assets.send_button} alt="Send" className='w-6 cursor-pointer hover:scale-110 transition-transform' style={{filter: 'hue-rotate(130deg)'}} />
            </div>
        </div>
    </div>
  )
}

export default ChatContainer