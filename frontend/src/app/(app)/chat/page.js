/* jshint esversion: 8 */
"use client";
import React, { useEffect, useState, useRef } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from '@/hooks/auth';

const ChatComponent = () => {
    "use strict";
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const chatContainerRef = useRef(null);
    const hasfetched = useRef(false);

    const  { user } = useAuth({ middleware: 'auth' });

    useEffect(() => {
        if(hasfetched.current) {
            return;
        }
        const connectToHub = async () => {
            const hubConnection = new signalR.HubConnectionBuilder()
                .withUrl("http://localhost:5032/chatHub")
                .withAutomaticReconnect()
                .build();

            try {
                await hubConnection.start();
                console.log("Connected to SignalR Hub");

                // Fetch chat history
                const chatHistory = await hubConnection.invoke("GetChatHistory");
                setMessages(chatHistory.map((msg) => ({ user: msg.user, message: msg.message })));

                // Listen for new messages
                hubConnection.on("ReceiveMessage", (user, newMessage) => {
                    setMessages((prev) => [...prev, { user, message: newMessage }]);
                });

                setConnection(hubConnection);
            } catch (err) {
                console.log("SignalR Connection Error:", err);
            }
        };

        connectToHub();
        hasfetched.current = true;
        return () => {
            if (connection) {
                connection.stop();
            }
        };
    }, []);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (connection && message.trim() !== "") {
            try {
                await connection.invoke("SendMessage", user.username, message);
                setMessage("");
            } catch (err) {
                console.error("SendMessage Error:", err);
            }
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            // Prevent default Enter key behavior (new line) and send message
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col max-w-4xl mx-auto p-4 bg-white shadow-lg rounded-lg">
            <h1 className="text-3xl font-bold text-center text-indigo-600 mb-4">SignalR Chat </h1>
            <div
                ref={chatContainerRef}
                className="flex-grow overflow-auto bg-gray-50 p-4 rounded-lg shadow-inner max-h-80 resize-y"
            >
                <div className="space-y-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className="flex space-x-2">
                            <strong className="text-sm text-blue-500">{msg.user}:</strong>
                            <p className="text-gray-700">{msg.message}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex mt-4">
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-grow px-4 py-2 text-sm border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Type a message..."
                    rows={1}
                />
                <button
                    onClick={sendMessage}
                    className="px-6 py-2 text-sm text-white bg-indigo-600 rounded-r-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatComponent;
