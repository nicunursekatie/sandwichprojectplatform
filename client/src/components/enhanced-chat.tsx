import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, Users, Hash, Shield, Crown } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import io, { Socket } from "socket.io-client";
import LiveChatHub from "./live-chat-hub";
import ChatMessageComponent from "./chat-message";
import { HelpBubble, helpContent } from "@/components/help-system";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  content: string;
  timestamp: Date;
  channel: string;
  edited?: boolean;
}

interface ChannelInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isPrivate: boolean;
}

const CHANNEL_INFO: Record<string, ChannelInfo> = {
  general: {
    id: "general",
    name: "General",
    description: "Open discussion for all team members",
    icon: <Hash className="h-5 w-5" />,
    isPrivate: false
  },
  "core-team": {
    id: "core-team",
    name: "Core Team",
    description: "Private discussions for core team members",
    icon: <Crown className="h-5 w-5" />,
    isPrivate: true
  },
  committee: {
    id: "committee",
    name: "Committee",
    description: "Committee member discussions",
    icon: <Users className="h-5 w-5" />,
    isPrivate: true
  },
  host: {
    id: "host",
    name: "Host Chat",
    description: "Communication for sandwich collection hosts",
    icon: <Users className="h-5 w-5" />,
    isPrivate: false
  },
  driver: {
    id: "driver",
    name: "Driver Chat",
    description: "Coordination for delivery drivers",
    icon: <Users className="h-5 w-5" />,
    isPrivate: false
  },
  recipient: {
    id: "recipient",
    name: "Recipient Chat",
    description: "Communication for recipient organizations",
    icon: <Users className="h-5 w-5" />,
    isPrivate: false
  }
};

export default function EnhancedChat() {
  const [selectedChannel, setSelectedChannel] = useState<string>("general");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const channelInfo = CHANNEL_INFO[selectedChannel];

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socketUrl = `${window.location.protocol}//${window.location.host}`;
    const socketInstance = io(socketUrl, {
      transports: ["polling", "websocket"],
      upgrade: true,
      rememberUpgrade: false
    });

    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("Chat connected to Socket.IO");
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      setIsJoined(false);
      console.log("Chat disconnected from Socket.IO");
    });

    socketInstance.on("joined-channel", ({ channel }) => {
      if (channel === selectedChannel) {
        setIsJoined(true);
        console.log(`Successfully joined channel: ${channel}`);
      }
    });

    socketInstance.on("new-message", (message: ChatMessage) => {
      if (message.channel === selectedChannel) {
        setMessages(prev => [...prev, {
          ...message,
          timestamp: new Date(message.timestamp)
        }]);
      }
    });

    socketInstance.on("message-history", (history: ChatMessage[]) => {
      const formattedHistory = history.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp || msg.createdAt)
      }));
      setMessages(formattedHistory);
    });

    socketInstance.on("message-edited", (editedMessage: ChatMessage) => {
      if (editedMessage.channel === selectedChannel) {
        setMessages(prev => prev.map(msg => 
          msg.id === editedMessage.id 
            ? { ...editedMessage, timestamp: new Date(editedMessage.timestamp) }
            : msg
        ));
        toast({
          title: "Message edited",
          description: "The message has been updated.",
        });
      }
    });

    socketInstance.on("message-deleted", ({ messageId, deletedBy }) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast({
        title: "Message deleted",
        description: `Message was deleted by ${deletedBy}`,
      });
    });

    socketInstance.on("error", ({ message }) => {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user, selectedChannel]);

  // Join channel when selected channel changes
  useEffect(() => {
    if (socket && isConnected && user && selectedChannel) {
      setIsJoined(false);
      setMessages([]); // Clear messages when switching channels
      
      const displayName = user.displayName || user.firstName || user.email || "User";
      console.log("Chat sending user data:", { 
        displayName: user.displayName, 
        firstName: user.firstName, 
        email: user.email,
        finalName: displayName 
      });
      
      socket.emit("join-channel", {
        channel: selectedChannel,
        userId: user.id,
        userName: displayName
      });

      // Mark all messages in this channel as read when joining
      markChannelAsRead(selectedChannel);
    }
  }, [socket, isConnected, user, selectedChannel]);

  // Function to mark all messages in a channel as read
  const markChannelAsRead = async (channel: string) => {
    try {
      const response = await fetch('/api/message-notifications/mark-chat-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ channel })
      });

      if (response.ok) {
        console.log(`Marked all messages in ${channel} as read`);
        // Trigger a refresh of unread counts in the nav bar
        window.dispatchEvent(new CustomEvent('refreshNotifications'));
      } else {
        console.warn(`Failed to mark ${channel} messages as read:`, response.statusText);
      }
    } catch (error) {
      console.error(`Error marking ${channel} messages as read:`, error);
    }
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim() || !selectedChannel) return;

    socket.emit("send-message", {
      channel: selectedChannel,
      content: newMessage.trim()
    });

    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    if (!socket) return;
    
    socket.emit("edit-message", {
      messageId: parseInt(messageId),
      newContent
    });
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!socket) return;
    
    if (window.confirm("Are you sure you want to delete this message?")) {
      socket.emit("delete-message", {
        messageId: parseInt(messageId)
      });
    }
  };

  const formatMessageTime = (timestamp: Date) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true });
    } catch {
      return "now";
    }
  };

  const getChannelHeaderClass = () => {
    if (selectedChannel === "core-team") {
      return "bg-gradient-to-r from-amber-500 to-orange-500 text-white";
    }
    return "bg-[#236383] text-white";
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-200px)] bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden relative z-10">
      {/* Sidebar with live previews - Mobile responsive */}
      <div className="md:block">
        <LiveChatHub 
          onChannelSelect={setSelectedChannel}
          selectedChannel={selectedChannel}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Chat Header - Mobile responsive */}
        <div className={`px-3 sm:px-4 md:px-6 py-3 sm:py-4 ${getChannelHeaderClass()}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <div className="flex-shrink-0">
                {channelInfo?.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold truncate">{channelInfo?.name}</h3>
                <p className="text-xs sm:text-sm opacity-90 truncate hidden sm:block">{channelInfo?.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {channelInfo?.isPrivate && (
                <Badge variant="secondary" className="bg-white/20 text-white text-xs hidden sm:inline-flex">
                  Private
                </Badge>
              )}
              <Badge 
                variant={isConnected ? "default" : "destructive"}
                className={`text-xs ${isConnected ? "bg-green-500" : ""}`}
              >
                <span className="hidden sm:inline">{isConnected ? "Connected" : "Disconnected"}</span>
                <span className="sm:hidden">{isConnected ? "●" : "○"}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages Area - Mobile responsive */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-4 bg-gray-50 dark:bg-gray-800 min-h-0">
          {!isJoined ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-[#236383] mx-auto mb-3 sm:mb-4"></div>
                <p className="text-sm sm:text-base">Joining {channelInfo?.name}...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full px-4">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <div className="text-2xl sm:text-4xl mb-3 sm:mb-4">{channelInfo?.icon}</div>
                <h4 className="text-base sm:text-lg font-medium mb-2">Welcome to {channelInfo?.name}!</h4>
                <p className="text-sm sm:text-base">This is the beginning of your conversation.</p>
                <p className="text-xs sm:text-sm mt-2">Send a message to get started.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <ChatMessageComponent
                  key={message.id}
                  message={message}
                  onEdit={handleEditMessage}
                  onDelete={handleDeleteMessage}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input - Mobile responsive */}
        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Message ${channelInfo?.name || "chat"}...`}
              disabled={!isConnected || !isJoined}
              className="flex-1 text-sm sm:text-base h-10 sm:h-11"
            />
            <Button 
              onClick={sendMessage}
              disabled={!isConnected || !isJoined || !newMessage.trim()}
              className="bg-[#236383] hover:bg-[#1a4d66] text-white h-10 sm:h-11 w-10 sm:w-11 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {!isConnected && (
            <p className="text-xs text-red-500 mt-1">Disconnected - trying to reconnect...</p>
          )}
        </div>
      </div>
    </div>
  );
}