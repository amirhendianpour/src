import React, { useState, useEffect } from 'react';
import { useWebSocket } from './context/WebSocketContext';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import GroupChatArea from './components/GroupChatArea';
import CallOverlay from './components/CallOverlay';
import Login from './components/Login';
import Register from './components/Register';
import { createGroup, getUserGroups, deleteGroup as deleteGroupApi } from './services/groupService';
import type { GroupInfo } from './services/groupService';

const App: React.FC = () => {
  const { connect, isConnected, disconnect, messages, groupUpdateEvent } = useWebSocket();

  const [token, setToken] = useState<string | null>(localStorage.getItem('chat_token'));
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [myUsername, setMyUsername] = useState<string | null>(localStorage.getItem('chat_username'));

  const [chatList, setChatList] = useState<string[]>([]);
  const [activeChat, setActiveChatState] = useState<string | null>(null);
  const [isCallActive, setIsCallActive] = useState<boolean>(false);

  const [groups, setGroups] = useState<GroupInfo[]>([]);
  const [activeGroup, setActiveGroup] = useState<GroupInfo | null>(null);

  const handleAddNewChat = (username: string) => {
    if (!chatList.includes(username)) {
      setChatList(prev => [username, ...prev]);
    }
    setActiveGroup(null);
    setActiveChatState(username);
  };

  const setActiveChat = (username: string) => {
    setActiveGroup(null);
    setActiveChatState(username);
  };

  const handleSelectGroup = (group: GroupInfo) => {
    setActiveChatState(null);
    setActiveGroup(group);
  };

  const handleCreateGroup = async (name: string) => {
    try {
      const newGroup = await createGroup(name);
      setGroups(prev => [newGroup, ...prev]);
      handleSelectGroup(newGroup);
    } catch (err: any) {
      alert('خطا در ساخت گروه: ' + err.message);
    }
  };

  useEffect(() => {
    if (!groupUpdateEvent) return;

    handleRefreshGroups();

    // اگه همین الان داشتیم همون گروهِ حذف‌شده رو نگاه می‌کردیم، خارج شو
    if (groupUpdateEvent.type === "DELETED" && activeGroup?.id === groupUpdateEvent.groupId) {
      setActiveGroup(null);
    }
  }, [groupUpdateEvent]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.sender !== myUsername && !chatList.includes(lastMsg.sender)) {
        setChatList(prev => [lastMsg.sender, ...prev]);
      }
    }
  }, [messages, chatList, myUsername]);

  useEffect(() => {
    if (token) {
      connect(token);
    }
    return () => {
      disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (token) {
      handleRefreshGroups();
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string, username: string) => {
    localStorage.setItem('chat_token', newToken);
    localStorage.setItem('chat_username', username);
    setToken(newToken);
    setMyUsername(username);
  };

  const handleRefreshGroups = () => {
    getUserGroups()
      .then(setGroups)
      .catch(err => console.error('خطا در دریافت گروه‌ها:', err));
  };

  const handleLogout = () => {
    localStorage.removeItem('chat_token');
    localStorage.removeItem('chat_username');
    setToken(null);
    setMyUsername(null);
    disconnect();
  };

  const handleDeleteGroup = async (groupId: number) => {
    const confirmed = window.confirm('آیا از حذف این گروه مطمئن هستید؟ این عملیات غیرقابل بازگشت است و تمام پیام‌های گروه هم حذف می‌شوند.');
    if (!confirmed) return;
    try {
      await deleteGroupApi(groupId);
      setGroups(prev => prev.filter(g => g.id !== groupId));
      if (activeGroup?.id === groupId) {
        setActiveGroup(null);
      }
    } catch (err: any) {
      alert('خطا در حذف گروه: ' + err.message);
    }
  };

  if (!token) {
    if (authView === 'login') {
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setAuthView('register')}
        />
      );
    } else {
      return (
        <Register
          onSwitchToLogin={() => setAuthView('login')}
        />
      );
    }
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans relative overflow-hidden" dir="rtl">

      {!isConnected && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 text-white text-center text-xs p-1 z-50 shadow-md">
          در حال اتصال به سرور...
        </div>
      )}

      <Sidebar
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        chatList={chatList}
        onAddNewChat={handleAddNewChat}
        myUsername={myUsername}
        onLogout={handleLogout}
        groups={groups}
        activeGroupId={activeGroup?.id ?? null}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
        onDeleteGroup={handleDeleteGroup}
      />

      {activeChat ? (
        <ChatArea
          activeChat={activeChat}
          onCallClick={() => setIsCallActive(true)}
        />
      ) : activeGroup ? (
        <GroupChatArea activeGroup={activeGroup} />
      ) : (
        <div className="w-2/3 flex flex-col items-center justify-center bg-[#efeae2]">
          <div className="bg-white/60 px-6 py-3 rounded-full text-gray-500 shadow-sm">
            برای شروع چت، یک مخاطب یا گروه را از لیست انتخاب کنید
          </div>
        </div>
      )}

      {activeChat && (
        <CallOverlay
          isOpen={isCallActive}
          chatName={activeChat}
          onClose={() => setIsCallActive(false)}
        />
      )}

    </div>
  );
};

export default App;