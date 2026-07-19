import React, {
    createContext,
    useContext,
    useRef,
    useState,
    ReactNode
} from "react";

import type { IMessage } from "@stomp/stompjs";

import websocketService from "../services/websocketService";

import type { ChatMessage } from "../types/ChatMessage";
import type { Receipt } from "../types/Receipt";
import type { TypingEvent } from "../types/Typing";
import type { GroupMessage } from "../types/GroupMessage";

import { generateId } from "../utils/generateId";

interface ContextType {

    isConnected:boolean;

    messages:ChatMessage[];

    typingUsers:string[];

    groupMessages:GroupMessage[];

    connect:(token:string)=>void;

    disconnect:()=>void;

    sendMessage(recipient:string,content:string,messageType:"TEXT"|"IMAGE",fileUrl?:string):void;

    sendTyping:(recipient:string,isTyping:boolean)=>void;

    sendReceipt:(receipt:Receipt)=>void;

    subscribeToGroups:(groupIds:(string|number)[])=>void;

    sendGroupMessage:(groupId:string|number,content:string)=>void;

}

const WebSocketContext=createContext<ContextType|null>(null);

export const WebSocketProvider=({children}:{children:ReactNode})=>{

    const clientRef=useRef(websocketService);

    const [messages,setMessages]=useState<ChatMessage[]>([]);

    const [typingUsers,setTypingUsers]=useState<string[]>([]);

    const [groupMessages,setGroupMessages]=useState<GroupMessage[]>([]);

    const [isConnected,setIsConnected]=useState(false);

    const connectedRef=useRef(false);

    // یک Map از groupId به subscription، تا هم‌زمان به چند گروه وصل باشیم
    const groupSubscriptionsRef=useRef<Map<number,{unsubscribe:()=>void}>>(new Map());

    const username=localStorage.getItem("chat_username")||"";

    const connect=(token:string)=>{

        if(connectedRef.current)
            return;

        clientRef.current.connect(token);

        const client=clientRef.current.getClient();

        if(!client)
            return;

        client.onConnect=()=>{

            connectedRef.current=true;

            setIsConnected(true);

            console.log("Connected");

            client.subscribe("/user/queue/messages",(message:IMessage)=>{

                const msg:ChatMessage=JSON.parse(message.body);

                setMessages(prev=>{

                    const exists=prev.find(m=>m.id===msg.id);

                    if(exists)
                        return prev;

                    return [...prev,msg];

                });

                if(msg.sender!==username){

                    const receipt:Receipt={

                        messageId:msg.id,

                        recipient:msg.sender,

                        status:"DELIVERED"

                    };

                    client.publish({

                        destination:"/app/chat/receipt",

                        body:JSON.stringify(receipt)

                    });

                }

            });

            client.subscribe("/user/queue/receipts",(message)=>{

                const receipt:Receipt=JSON.parse(message.body);

                setMessages(prev=>

                    prev.map(m=>{

                        if(m.id===receipt.messageId){

                            return{

                                ...m,

                                status:receipt.status

                            }

                        }

                        return m;

                    })

                );

            });

            client.subscribe("/user/queue/typing",(message)=>{

                const event:TypingEvent=JSON.parse(message.body);

                if(event.typing){

                    setTypingUsers(prev=>{

                        if(prev.includes(event.sender!))
                            return prev;

                        return [...prev,event.sender!];

                    });

                }else{

                    setTypingUsers(prev=>

                        prev.filter(x=>x!==event.sender)

                    );

                }

            });

            client.subscribe("/user/queue/group-history",(message)=>{

                const msg:GroupMessage=JSON.parse(message.body);

                setGroupMessages(prev=>{

                    const exists=prev.find(m=>m.id===msg.id);

                    if(exists)
                        return prev;

                    return [...prev,msg];

                });

            });

            client.publish({

                destination:"/app/group/history",

                body:JSON.stringify({})

            });

        };

        client.onDisconnect=()=>{

            connectedRef.current=false;

            setIsConnected(false);

        };

    };

    const disconnect=()=>{

        connectedRef.current=false;

        clientRef.current.disconnect();

        setIsConnected(false);

        groupSubscriptionsRef.current.clear();

    };

    const sendMessage=(recipient:string,content:string,messageType:"TEXT"|"IMAGE"="TEXT",fileUrl?:string)=>{

        const client=clientRef.current.getClient();

        if(!client?.connected)
            return;

        const msg:ChatMessage={
            id:generateId(),
            sender:username,
            recipient,
            content,
            messageType,
            fileUrl,
            timestamp:new Date().toISOString(),
            status:"SENT"

        };

        setMessages(prev=>[...prev,msg]);

        client.publish({

            destination:"/app/chat",

            body:JSON.stringify(msg)

        });

    };

    const sendTyping=(recipient:string,isTyping:boolean)=>{

        const client=clientRef.current.getClient();

        if(!client?.connected)
            return;

        client.publish({

            destination:"/app/chat/typing",

            body:JSON.stringify({

                recipient,

                typing:isTyping

            })

        });

    };

    const sendReceipt=(receipt:Receipt)=>{

        const client=clientRef.current.getClient();

        if(!client?.connected)
            return;

        client.publish({

            destination:"/app/chat/receipt",

            body:JSON.stringify(receipt)

        });

    };

    // به تمام گروه‌های داده‌شده وصل می‌شود؛ گروه‌هایی که از قبل subscribe شدن نادیده گرفته می‌شن (idempotent)
    const subscribeToGroups=(groupIds:(string|number)[])=>{

        const client=clientRef.current.getClient();

        if(!client?.connected)
            return;

        groupIds.forEach(rawId=>{

            const groupId=Number(rawId);

            if(groupSubscriptionsRef.current.has(groupId))
                return;

            const subscription=client.subscribe(`/topic/groups/${groupId}`,(message)=>{
                const msg:GroupMessage=JSON.parse(message.body);

                setGroupMessages(prev=>{

                    const exists=prev.find(m=>m.id===msg.id);

                    if(exists)
                        return prev;

                    return [...prev,msg];

                });

            });

            groupSubscriptionsRef.current.set(groupId,subscription);

        });

    };

    const sendGroupMessage=(groupId:string|number,content:string)=>{

        const client=clientRef.current.getClient();

        if(!client?.connected)
            return;

        const payload={

            id:generateId(),

            groupId:Number(groupId),

            content

        };

        client.publish({

            destination:"/app/group/chat",

            body:JSON.stringify(payload)

        });

    };

    return(

        <WebSocketContext.Provider

            value={{

                isConnected,

                messages,

                typingUsers,

                groupMessages,

                connect,

                disconnect,

                sendMessage,

                sendTyping,

                sendReceipt,

                subscribeToGroups,

                sendGroupMessage

            }}

        >

            {children}

        </WebSocketContext.Provider>

    );

};

export const useWebSocket=()=>{

    const context=useContext(WebSocketContext);

    if(!context)
        throw new Error("WebSocketContext");

    return context;

};