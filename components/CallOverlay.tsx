import React, { useEffect, useRef, useState } from 'react';
import { useCall } from '../context/CallContext';

const CallOverlay: React.FC = () => {
  const { callStatus, remoteUser, isMuted, remoteStream, acceptCall, rejectCall, endCall, toggleMute } = useCall();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (audioRef.current && remoteStream) {
      audioRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    if (callStatus !== "connected") { setDuration(0); return; }
    const interval = setInterval(() => setDuration(d => d + 1), 1000);
    return () => clearInterval(interval);
  }, [callStatus]);

  if (callStatus === "idle") return null;

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center text-white backdrop-blur-sm">
      <audio ref={audioRef} autoPlay />
      <div className="w-24 h-24 bg-gray-600 rounded-full mb-6 flex items-center justify-center text-3xl shadow-lg border-4 border-gray-500">
        {remoteUser?.charAt(0)}
      </div>
      <h2 className="text-2xl font-bold mb-2">{remoteUser}</h2>
      <p className="text-gray-300 mb-12">
        {callStatus === "calling" && "در حال تماس..."}
        {callStatus === "ringing" && "تماس ورودی..."}
        {callStatus === "connected" && formatDuration(duration)}
      </p>

      {callStatus === "ringing" ? (
        <div className="flex gap-6">
          <button onClick={acceptCall} className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-xl hover:bg-green-600 transition shadow-lg">📞</button>
          <button onClick={rejectCall} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30">☎️</button>
        </div>
      ) : (
        <div className="flex gap-6">
          <button onClick={toggleMute} className={`w-14 h-14 rounded-full flex items-center justify-center text-xl transition ${isMuted ? "bg-gray-400" : "bg-gray-700 hover:bg-gray-600"}`}>
            {isMuted ? "🔇" : "🎤"}
          </button>
          <button onClick={endCall} className="w-14 h-14 bg-red-500 rounded-full flex items-center justify-center text-xl hover:bg-red-600 transition shadow-lg shadow-red-500/30">☎️</button>
        </div>
      )}
    </div>
  );
};

export default CallOverlay;