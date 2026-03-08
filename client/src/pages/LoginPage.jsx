import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext'
import assets from '../assets/assets'
import { Shield } from 'lucide-react'

const LoginPage = () => {
    const [currState, setCurrState] = useState("Sign up")
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [bio, setBio] = useState("")
    const [isDataSubmitted, setIsDataSubmitted] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false);
    const { login, signUp } = React.useContext(AuthContext);
    const navigate = useNavigate();

    const onSubmitHandler = async (event) => {
        event.preventDefault();

        // When "Sign up" is clicked for the first time, just show the bio step.
        if (currState === "Sign up" && !isDataSubmitted) {
            setIsDataSubmitted(true);
            return;
        }

        setIsProcessing(true);
        if (currState === "Sign up") {
            const success = await signUp(fullName, email, password, bio);
            if (success) navigate('/');
        } else {
            const success = await login(email, password);
            if (success) navigate('/');
        }
        setIsProcessing(false);
    }

    return (
        <div className='min-h-screen bg-[#050a0e] text-[#00ffcc] font-mono flex items-center justify-center p-4 selection:bg-[#00ffcc] selection:text-black'>
            <div className='w-full max-w-5xl flex gap-12 sm:gap-20 items-center justify-center max-md:flex-col'>
                
                {/* Left Side: Logo/Branding */}
                <div className="flex flex-col items-center gap-6 max-md:mb-8">
                    <div className="relative group">
                        <img src={assets.logo_big} alt="CipherTalk Logo" className='w-[200px] sm:w-[300px] drop-shadow-[0_0_15px_rgba(0,255,204,0.3)] filter brightness-125 group-hover:drop-shadow-[0_0_25px_rgba(0,255,204,0.6)] transition-all duration-500' />
                        <div className="absolute inset-0 bg-[#00ffcc] opacity-0 group-hover:opacity-10 mix-blend-screen transition-opacity duration-500 rounded-full blur-xl"></div>
                    </div>
                    <div className="flex flex-col items-center">
                        <p className="text-sm sm:text-base text-gray-400 font-bold tracking-[0.2em] uppercase text-center flex items-center gap-2">
                           <Shield size={16} className="text-[#00ffcc]" /> Secure System Access
                        </p>
                        <p className="text-xs text-green-700/60 mt-2 text-center max-w-xs">END-TO-END ENCRYPTED PROTOCOL INITIATED</p>
                    </div>
                </div>

                {/* Right Side: Form */}
                <form onSubmit={onSubmitHandler} className='w-full max-w-md bg-[#0a1218]/90 border border-[#00ffcc]/30 p-8 sm:p-10 flex flex-col gap-6 rounded-sm shadow-[0_0_30px_rgba(0,255,204,0.05)] relative overflow-hidden'>
                    
                    {/* Decorative Corner Lines */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#00ffcc] opacity-50"></div>
                    <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#00ffcc] opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-[#00ffcc] opacity-50"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#00ffcc] opacity-50"></div>

                    <h2 className='font-bold text-xl sm:text-2xl tracking-widest flex justify-between items-center border-b border-[#00ffcc]/20 pb-3 text-white uppercase'>
                        {currState === "Sign up" ? "Initialize Agent" : "Authenticate Phase"}
                        {isDataSubmitted && (
                            <button type="button" onClick={() => setIsDataSubmitted(false)} disabled={isProcessing} className="text-xs border border-gray-600 px-2 py-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50">
                                ◄ BACK
                            </button>
                        )}
                    </h2>
                    
                    <div className="space-y-4">
                        {currState === "Sign up" && !isDataSubmitted && (
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] text-gray-500 tracking-wider">AGENT_NAME</label>
                                <input value={fullName} onChange={(e) => setFullName(e.target.value)} type="text" className='w-full p-3 bg-black/60 border border-gray-700 rounded text-white focus:outline-none focus:border-[#00ffcc] transition-colors shadow-inner' placeholder="Enter Alias" required disabled={isProcessing} />
                            </div>
                        )} 

                        {!isDataSubmitted && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 tracking-wider">NODE_ADDRESS (EMAIL)</label>
                                    <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder='operator@network.local' required className='w-full p-3 bg-black/60 border border-gray-700 rounded text-[#00ffcc] focus:outline-none focus:border-[#00ffcc] transition-colors shadow-inner' disabled={isProcessing} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-gray-500 tracking-wider">SECRET_KEY (PASSWORD)</label>
                                    <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder='••••••••••••' required className='w-full p-3 bg-black/60 border border-gray-700 rounded text-white focus:outline-none focus:border-[#00ffcc] transition-colors shadow-inner' disabled={isProcessing} />
                                </div>
                            </>
                        )}
                        
                        {currState === "Sign up" && isDataSubmitted && (
                            <div className="flex flex-col gap-1 animate-pulse">
                                <label className="text-[10px] text-[#00ffcc]/70 tracking-wider">AGENT_PUBLIC_METADATA (BIO)</label>
                                <textarea onChange={(e)=>setBio(e.target.value)} value={bio} rows={4} className='w-full p-3 bg-black/60 border border-[#00ffcc]/50 rounded text-white focus:outline-none focus:border-[#00ffcc] transition-colors shadow-[inset_0_0_10px_rgba(0,255,204,0.1)]' placeholder='Describe your node properties...' required disabled={isProcessing}></textarea>
                            </div>
                        )}
                    </div>

                    <button type='submit' disabled={isProcessing} className='w-full mt-2 py-4 bg-[#00ffcc]/10 border border-[#00ffcc]/50 hover:bg-[#00ffcc]/20 text-[#00ffcc] hover:text-white font-bold tracking-widest rounded transition-all shadow-[0_0_15px_rgba(0,255,204,0.1)] hover:shadow-[0_0_25px_rgba(0,255,204,0.3)] disabled:opacity-50 disabled:cursor-not-allowed'>
                        {isProcessing ? "PROCESSING PROTOCOL..." : (
                            currState === "Sign up" 
                                ? (isDataSubmitted ? "GENERATE RSA KEYS & ESTABLISH" : "PREPARE INITIALIZATION")
                                : "AUTHORIZE CONNECTION"
                        )}
                    </button>

                    <div className='flex flex-col items-center gap-3 mt-4'>
                        {currState === "Sign up" ? (
                            <p className='text-xs text-gray-400'>Signal recognized? <span onClick={() => {setCurrState("Login"); setIsDataSubmitted(false)}} className='font-bold tracking-wider text-[#00ffcc] cursor-pointer hover:underline'>AUTHENTICATE HERE</span></p>
                        ) : (
                            <p className='text-xs text-gray-400'>New to the network? <span onClick={() => setCurrState("Sign up")} className='font-bold tracking-wider text-[#00ffcc] cursor-pointer hover:underline'>INITIALIZE HERE</span></p>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginPage