import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Key, Activity, Lock, Cpu, Server, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SecurityDashboard = () => {
    const navigate = useNavigate();
    const [attackSimulation, setAttackSimulation] = useState(null);
    const [logs, setLogs] = useState([]);

    const addLog = (msg) => {
        setLogs(prev => [...prev.slice(-4), msg]);
    };

    const simulateMitM = () => {
        setAttackSimulation('mitm');
        setLogs([]);
        addLog("[*] Intercepting socket connection...");
        setTimeout(() => addLog("[*] Packet captured from stream."), 1000);
        setTimeout(() => addLog("[!] Hex Dump: 0x54686973206973..."), 2000);
        setTimeout(() => addLog("[x] Decryption failed: Missing AES-256 Session Key"), 3000);
        setTimeout(() => addLog("[-] Target data remains secure. Attack neutralized."), 4000);
    };

    const simulateReplay = () => {
        setAttackSimulation('replay');
        setLogs([]);
        addLog("[*] Capturing encrypted packet...");
        setTimeout(() => addLog("[*] Cloning packet signature..."), 1000);
        setTimeout(() => addLog("[*] Emitting cloned packet to Server..."), 2000);
        setTimeout(() => addLog("[x] Request denied: HMAC Tamper Detection / Replay detected."), 3000);
        setTimeout(() => addLog("[-] Connection dropped for malicious client."), 4000);
    };

    const simulateBruteForce = () => {
        setAttackSimulation('brute');
        setLogs([]);
        addLog("[*] Initializing brute force on RSA-2048 Private Key...");
        setTimeout(() => addLog("[*] 5,000,000 keys/sec. Estimating time..."), 1000);
        setTimeout(() => addLog("[x] ETA: 300 trillion years. Computation limits reached."), 2500);
        setTimeout(() => addLog("[-] Attack aborted. Cryptography holding strong."), 4000);
    };

    return (
        <div className="min-h-screen bg-[#050a0e] text-green-400 font-mono p-8 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-center border-b border-green-500/30 pb-4">
                    <div className="flex items-center gap-4">
                        <ShieldAlert size={40} className="text-[#00ffcc] animate-pulse" />
                        <div>
                            <h1 className="text-3xl font-bold tracking-widest text-white shadow-[#00ffcc]">CIPHERTALK <span className="text-[#00ffcc]">SECURITY OS</span></h1>
                            <p className="text-xs text-green-500/60 mt-1">ADVANCED CRYPTOGRAPHY SIMULATION DASHBOARD v1.0.0</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/')} className="px-4 py-2 border border-green-500/50 hover:bg-green-500/10 text-green-400 rounded transition-colors text-sm">
                        RETURN TO CHAT
                    </button>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-[#0a1218] border border-green-500/20 p-5 rounded-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 blur-2xl rounded-full"></div>
                        <Lock className="text-[#00ffcc] mb-3" size={24} />
                        <p className="text-gray-400 text-xs">TRANSPORT LAYER</p>
                        <p className="text-xl text-white font-bold mt-1">AES-256 + DES</p>
                    </div>
                    <div className="bg-[#0a1218] border border-green-500/20 p-5 rounded-lg relative overflow-hidden group">
                        <Key className="text-purple-400 mb-3" size={24} />
                        <p className="text-gray-400 text-xs">KEY EXCHANGE</p>
                        <p className="text-xl text-white font-bold mt-1">RSA-2048 (PFS)</p>
                    </div>
                    <div className="bg-[#0a1218] border border-green-500/20 p-5 rounded-lg relative overflow-hidden group">
                        <Activity className="text-red-400 mb-3" size={24} />
                        <p className="text-gray-400 text-xs">INTEGRITY</p>
                        <p className="text-xl text-white font-bold mt-1">SHA-256 HASH</p>
                    </div>
                    <div className="bg-[#0a1218] border border-[#00ffcc]/30 p-5 rounded-lg relative overflow-hidden shadow-[0_0_15px_rgba(0,255,204,0.1)]">
                        <Shield className="text-[#00ffcc] mb-3" size={24} />
                        <p className="text-gray-400 text-xs">SECURITY SCORE</p>
                        <p className="text-2xl text-[#00ffcc] font-bold mt-1">9.8 / 10</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    
                    {/* Attack Simulation Panel */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="bg-[#0a1218] border border-red-500/20 rounded-lg p-6">
                            <h2 className="text-xl text-white flex items-center gap-2 mb-6 border-b border-gray-800 pb-2">
                                <Cpu className="text-red-500" /> THREAT SIMULATION MODULE
                            </h2>
                            <div className="flex gap-4 mb-8">
                                <button onClick={simulateMitM} className="flex-1 py-3 bg-black border border-red-900 hover:border-red-500 hover:bg-red-500/10 text-red-500 transition-all rounded text-sm hover:shadow-[0_0_10px_rgba(255,0,0,0.2)]">
                                    Man-in-the-Middle Attack
                                </button>
                                <button onClick={simulateReplay} className="flex-1 py-3 bg-black border border-orange-900 hover:border-orange-500 hover:bg-orange-500/10 text-orange-500 transition-all rounded text-sm">
                                    Replay Attack
                                </button>
                                <button onClick={simulateBruteForce} className="flex-1 py-3 bg-black border border-yellow-900 hover:border-yellow-500 hover:bg-yellow-500/10 text-yellow-500 transition-all rounded text-sm">
                                    Brute Force keys
                                </button>
                            </div>

                            {/* Terminal Window */}
                            <div className="bg-black border border-gray-800 rounded p-4 h-64 font-mono text-sm relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-8 bg-gray-900 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                    <span className="text-gray-500 text-xs ml-4">root@cipher-attack:~#</span>
                                </div>
                                <div className="mt-10 space-y-2">
                                    {!attackSimulation && <p className="text-gray-600 italic">Waiting for simulation trigger...</p>}
                                    {logs.map((log, i) => (
                                        <p key={i} className={`typing-animation ${log.startsWith('[x]') ? 'text-red-500' : log.startsWith('[-]') ? 'text-green-500' : 'text-gray-300'}`}>
                                            {log}
                                        </p>
                                    ))}
                                    {attackSimulation && logs.length > 0 && <span className="animate-pulse inline-block w-2 h-4 bg-green-500 ml-1"></span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cryptography Info Panel */}
                    <div className="space-y-6">
                        <div className="bg-[#0a1218] border border-blue-500/20 rounded-lg p-6 h-full flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl text-white flex items-center gap-2 mb-6 border-b border-gray-800 pb-2">
                                    <Server className="text-blue-500" /> ENCRYPTION PIPELINE
                                </h2>
                                <div className="space-y-4 text-sm text-gray-300">
                                    <div className="p-3 border border-gray-800 rounded bg-black">
                                        <p className="text-xs text-blue-400 mb-1">1. AUTHENTICATION</p>
                                        <p>Client authenticates with Server. Server responds with Peer Public Keys (RSA-2048).</p>
                                    </div>
                                    <div className="p-3 border border-gray-800 rounded bg-black">
                                        <p className="text-xs text-blue-400 mb-1">2. KEY GENERATION</p>
                                        <p>Client generates a one-time AES-256 session key for Perfect Forward Secrecy.</p>
                                    </div>
                                    <div className="p-3 border border-gray-800 rounded bg-black text-xs leading-relaxed">
                                        <p className="text-xs text-purple-400 mb-1">3. MULTI-LAYER ENCRYPTION</p>
                                        <p className="line-through text-gray-600">Plaintext</p>
                                        <p>↳ AES-256 (Session Key)</p>
                                        <p className="pl-4">↳ DES Layer 2</p>
                                        <p className="pl-8 text-[#00ffcc]">↳ Ciphertext Transmitted</p>
                                    </div>
                                    <div className="p-3 border border-gray-800 rounded bg-black">
                                        <p className="text-xs text-red-400 mb-1">4. INTEGRITY CHECK</p>
                                        <p>Digital signature (RSA) + SHA-256 guarantees sender identity and prevents tampering.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Global Styles for typing effect locally */}
            <style dangerouslySetInnerHTML={{__html: `
                .typing-animation {
                    overflow: hidden;
                    white-space: nowrap;
                    animation: typing 0.5s steps(40, end);
                }
                @keyframes typing {
                    from { max-width: 0 }
                    to { max-width: 100% }
                }
            `}} />
        </div>
    );
};

export default SecurityDashboard;
