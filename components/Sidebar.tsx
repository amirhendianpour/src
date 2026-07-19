import React, { useState } from 'react';

interface GroupInfo {
  id: number;
  name: string;
  role?: string;
}

interface SidebarProps {
  activeChat: string | null;
  setActiveChat: (chatName: string) => void;
  chatList: string[];
  onAddNewChat: (user: string) => void;
  myUsername: string | null;
  onLogout: () => void;
  groups: GroupInfo[];
  activeGroupId: number | null;
  onSelectGroup: (group: GroupInfo) => void;
  onCreateGroup: (name: string) => void;
  onDeleteGroup: (groupId: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeChat,
  setActiveChat,
  chatList,
  onAddNewChat,
  myUsername,
  onLogout,
  groups,
  activeGroupId,
  onSelectGroup,
  onCreateGroup,
  onDeleteGroup
}) => {

  const [newChatInput, setNewChatInput] = useState('');
  const [newGroupInput, setNewGroupInput] = useState('');
  const [tab, setTab] = useState<'chats' | 'groups'>('chats');

  const handleStartChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (newChatInput.trim()) {
      onAddNewChat(newChatInput.trim());
      setNewChatInput('');
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupInput.trim()) {
      onCreateGroup(newGroupInput.trim());
      setNewGroupInput('');
    }
  };

  return (
    <div className="w-1/3 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">پیام‌رسان من</h1>
        <button
          onClick={onLogout}
          className="text-red-500 hover:text-red-700 text-sm bg-red-50 px-3 py-1 rounded-full transition"
        >
          خروج ({myUsername})
        </button>
      </div>

      {/* تب‌ها */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setTab('chats')}
          className={`flex-1 py-2 text-sm font-semibold transition ${
            tab === 'chats' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          چت‌های خصوصی
        </button>
        <button
          onClick={() => setTab('groups')}
          className={`flex-1 py-2 text-sm font-semibold transition ${
            tab === 'groups' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'
          }`}
        >
          گروه‌ها
        </button>
      </div>

      {tab === 'chats' ? (
        <>
          <div className="p-3 border-b border-gray-200 bg-white">
            <form onSubmit={handleStartChat} className="flex gap-2">
              <input
                type="text"
                value={newChatInput}
                onChange={(e) => setNewChatInput(e.target.value)}
                placeholder="نام کاربری برای شروع چت..."
                className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                dir="ltr"
              />
              <button type="submit" className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-600 transition">
                + چت
              </button>
            </form>
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            {chatList.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4">هیچ چتی ندارید. یک نام کاربری وارد کنید!</p>
            ) : (
              chatList.map((chatUser, index) => (
                <div
                  key={index}
                  onClick={() => setActiveChat(chatUser)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${
                    activeChat === chatUser ? 'bg-blue-50 border-r-4 border-blue-500' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg uppercase shadow-sm">
                    {chatUser.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{chatUser}</h3>
                    <p className="text-xs text-green-500">آنلاین</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          <div className="p-3 border-b border-gray-200 bg-white">
            <form onSubmit={handleCreateGroup} className="flex gap-2">
              <input
                type="text"
                value={newGroupInput}
                onChange={(e) => setNewGroupInput(e.target.value)}
                placeholder="نام گروه جدید..."
                className="flex-1 p-2 rounded-lg border border-gray-300 focus:outline-none focus:border-green-500 text-sm"
              />
              <button type="submit" className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-600 transition">
                + گروه
              </button>
            </form>
          </div>

          <div className="overflow-y-auto flex-1 p-2">
            {groups.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4">هنوز گروهی نساخته‌اید.</p>
            ) : (
              groups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => onSelectGroup(group)}
                  className={`p-3 mb-2 rounded-lg cursor-pointer flex items-center gap-3 transition-colors ${
                    activeGroupId === group.id ? 'bg-green-50 border-r-4 border-green-500' : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center text-green-700 font-bold text-lg shadow-sm">
                    {group.name ? group.name.charAt(0) : "؟"}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{group.name || "گروه بدون‌نام"}</h3>
                    <p className="text-xs text-gray-400">{group.role === 'ADMIN' ? 'ادمین' : 'عضو'}</p>
                  </div>
                  {group.role === 'ADMIN' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGroup(group.id);
                      }}
                      className="text-red-400 hover:text-red-600 text-sm p-1"
                      title="حذف گروه"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default Sidebar;