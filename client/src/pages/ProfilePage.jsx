import React, {useContext, useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { ArrowLeft } from 'lucide-react';

const ProfilePage = () => {

  const { authUser, updateProfile, deleteAccount } = useContext(AuthContext);
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (authUser) {
      setName(authUser.fullName || "");
      setBio(authUser.bio || "");
    }
  }, [authUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    
    let base64Image = authUser.profilePic;
    
    if (selectedImg) {
       const reader = new FileReader();
       reader.readAsDataURL(selectedImg);
       reader.onloadend = async () => {
           base64Image = reader.result;
           await handleCall(base64Image);
       }
    } else {
       await handleCall(base64Image);
    }
  };

  const handleCall = async (profilePic) => {
      const success = await updateProfile({ fullName: name, bio, profilePic });
      setIsUpdating(false);
      if(success) navigate('/');
  }

  const handleDelete = async () => {
      if(window.confirm("CRITICAL WARNING: This will permanently delete your account, identity, and all end-to-end encrypted message history across the entire network. Proceed?")) {
          await deleteAccount();
      }
  }

  return (
    <div className='min-h-screen bg-[#050a0e] text-[#00ffcc] font-mono flex items-center justify-center p-4 selection:bg-[#00ffcc] selection:text-black'>
      <div className='w-full max-w-2xl bg-[#0a1218]/90 border border-green-500/30 flex items-center justify-between max-sm:flex-col-reverse rounded-lg shadow-[0_0_30px_rgba(0,255,204,0.1)] relative'>
        
        <button onClick={() => navigate('/')} className='absolute top-4 left-4 text-gray-400 hover:text-[#00ffcc] transition-colors'>
            <ArrowLeft size={24} />
        </button>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1 mt-8 sm:mt-0">
          <h3 className="text-xl font-bold tracking-widest text-white border-b border-[#00ffcc]/30 pb-2">SYSTEM PROFILE</h3>

          <label htmlFor="avatar" className='flex items-center gap-4 cursor-pointer group mt-4'>
            <input onChange={(e)=>setSelectedImg(e.target.files[0])} type="file" id='avatar' accept='.png, .jpg, .jpeg' hidden/>

            <div className="relative">
              <img src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.avatar_icon)} alt="" className="w-16 h-16 rounded-full border border-[#00ffcc] object-cover group-hover:border-white transition-colors"/>
            </div>

            <span className="text-sm text-gray-400 group-hover:text-white transition-colors">UPLOAD AVATAR</span>
          </label>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">IDENTIFIER_UUID (NAME)</label>
            <input onChange={(e)=>setName(e.target.value)} value={name} type="text" required placeholder='Agent Name' className='p-3 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-[#00ffcc] transition-colors'/>
          </div>

          <div className="flex flex-col gap-1">
             <label className="text-xs text-gray-500">METADATA (BIO)</label>
             <textarea onChange={(e)=>setBio (e.target.value)} value={bio} placeholder="Enter bio sequence" required className="p-3 bg-black border border-gray-700 rounded text-white focus:outline-none focus:border-[#00ffcc] transition-colors" rows={4}></textarea>
          </div>

          <button disabled={isUpdating} type="submit" className="mt-4 bg-[#00ffcc]/10 hover:bg-[#00ffcc]/20 border border-[#00ffcc]/50 text-[#00ffcc] p-3 rounded font-bold tracking-widest transition-all shadow-[0_0_15px_rgba(0,255,204,0.1)] disabled:opacity-50">
            {isUpdating ? 'SYNCING...' : 'COMMIT CHANGES'}
          </button>
          
          <button type="button" onClick={handleDelete} className="mt-2 border border-red-500/50 bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded font-bold tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,0,0.1)]">
              TERMINATE ACCOUNT
          </button>
        </form>
        
        <div className="max-sm:hidden p-10 flex items-center justify-center border-l border-gray-800">
             <img className='max-w-44 aspect-square mix-blend-screen opacity-50' src={assets.logo_big} alt="System Logo"/>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage