import React, { useEffect, useRef, useState } from "react";
import { useWebSocket } from "../context/WebSocketContext";
import { addMemberToGroup } from "../services/groupService";
import { compareByTime } from "../utils/sortMessages";

interface GroupInfo {
    id: number;
    name: string;
}

interface Props {
    activeGroup: GroupInfo;
}

const GroupChatArea: React.FC<Props> = ({ activeGroup }) => {
    const { groupMessages, sendGroupMessage } = useWebSocket();
    const [text, setText] = useState("");
    const [newMember, setNewMember] = useState("");
    const [showAddMember, setShowAddMember] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);
    const username = localStorage.getItem("chat_username") || "";

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [groupMessages]);

    const chatMessages = groupMessages
        .filter((msg) => msg.groupId === activeGroup.id)
        .sort(compareByTime);

    const handleSend = () => {
        if (!text.trim()) return;
        sendGroupMessage(activeGroup.id, text);
        setText("");
    };

    const handleAddMember = async () => {
        if (!newMember.trim()) return;
        try {
            await addMemberToGroup(activeGroup.id, newMember.trim());
            alert(`کاربر ${newMember.trim()} به گروه اضافه شد.`);
            setNewMember("");
            setShowAddMember(false);
        } catch (err: any) {
            alert("خطا: " + err.message);
        }
    };

    const formatTime = (timestamp?: string) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="flex-1 flex flex-col bg-[#efeae2] h-full" dir="rtl">
            {/* Header */}
            <div className="h-16 bg-white border-b flex items-center justify-between px-5 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-300 rounded-full flex items-center justify-center text-green-700 font-bold">
                        {activeGroup.name.charAt(0)}
                    </div>
                    <span className="font-bold text-gray-800">{activeGroup.name}</span>
                </div>
                <button
                    onClick={() => setShowAddMember(prev => !prev)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                >
                    + افزودن عضو
                </button>
            </div>

            {showAddMember && (
                <div className="bg-white border-b p-3 flex gap-2">
                    <input
                        className="flex-1 border rounded-lg p-2 text-sm"
                        placeholder="نام کاربری عضو جدید"
                        value={newMember}
                        onChange={(e) => setNewMember(e.target.value)}
                        dir="ltr"
                    />
                    <button
                        onClick={handleAddMember}
                        className="bg-green-500 text-white px-3 rounded-lg text-sm hover:bg-green-600"
                    >
                        افزودن
                    </button>
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {chatMessages.map((msg) => {
                    const mine = msg.sender === username;
                    return (
                        <div key={msg.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-2 shadow ${
                                    mine
                                        ? "bg-green-100 rounded-2xl rounded-tl-none"
                                        : "bg-white rounded-2xl rounded-tr-none"
                                }`}
                            >
                                {!mine && (
                                    <div className="text-xs font-bold text-blue-600 mb-1">
                                        {msg.sender}
                                    </div>
                                )}
                                <div>{msg.content}</div>
                                <div className="text-xs text-gray-400 mt-1 text-left">
                                    {formatTime(msg.timestamp)}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-gray-100 flex gap-2 items-center">
                <input
                    className="flex-1 p-3 rounded-full border-none focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder="پیام خود را بنویسید..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSend();
                    }}
                />
                <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className="bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition disabled:bg-blue-300"
                >
                    ارسال
                </button>
            </div>
        </div>
    );
};

export default GroupChatArea;