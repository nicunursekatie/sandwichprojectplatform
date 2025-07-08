import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { MessageCircle, Send, User, Crown, Heart, ChevronLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useMessageReads } from "@/hooks/useMessageReads";
import type { Recipient, Message } from "@shared/schema";

interface RecipientWithContacts extends Recipient {
  contacts: any[];
}

export default function RecipientChat() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize read tracking hook
  const { useAutoMarkAsRead } = useMessageReads();

  // Get user profile for display name
  const { data: userProfile } = useQuery({
    queryKey: ["/api/auth/profile"],
    enabled: !!user,
  });

  // Get user name from profile or fallback to email prefix
  const getUserName = () => {
    if (userProfile && typeof userProfile === 'object') {
      const profile = userProfile as any;
      if (profile.displayName) {
        return profile.displayName;
      }
      if (profile.firstName) {
        return profile.firstName;
      }
    }
    if (user && typeof user === 'object' && 'email' in user && user.email) {
      return String(user.email).split('@')[0];
    }
    return 'Team Member';
  };

  const canDeleteMessage = (message: Message) => {
    const currentUser = user as any;
    const isOwner = message.sender === getUserName();
    const isSuperAdmin = currentUser?.role === "super_admin";
    const isAdmin = currentUser?.role === "admin";
    const hasModeratePermission = currentUser?.permissions?.includes("moderate_messages");
    
    return isOwner || isSuperAdmin || isAdmin || hasModeratePermission;
  };

  const { data: recipients = [] } = useQuery<RecipientWithContacts[]>({
    queryKey: ['/api/recipients-with-contacts'],
  });

  // Get or create recipient conversation
  const { data: recipientConversation } = useQuery({
    queryKey: ["/api/conversations/recipient", selectedRecipient?.id],
    queryFn: async () => {
      if (!selectedRecipient) return null;
      const response = await apiRequest('POST', '/api/conversations', {
        type: 'recipient',
        name: `${selectedRecipient.name} Recipient Chat`,
        metadata: { recipientId: selectedRecipient.id }
      });
      return response;
    },
    enabled: !!selectedRecipient,
  });

  // Fetch messages for recipient conversation
  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ["/api/conversations", recipientConversation?.id, "messages"],
    enabled: !!recipientConversation,
    refetchInterval: 3000,
  });
  const [optimisticMessages, setOptimisticMessages] = useState<Message[] | null>(null);
  const displayedMessages = optimisticMessages || messages;

  // Auto-mark messages as read when viewing recipient chat
  useAutoMarkAsRead(
    selectedRecipient ? `recipient-${selectedRecipient.id}` : "", 
    messages, 
    !!selectedRecipient
  );

  useEffect(() => {
    setOptimisticMessages(null);
    if (recipientConversation?.id) {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", recipientConversation.id, "messages"] });
    }
  }, [recipientConversation?.id]);

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      if (!recipientConversation) throw new Error("No conversation available");
      return await apiRequest('POST', `/api/conversations/${recipientConversation.id}/messages`, {
        content: data.content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", recipientConversation?.id, "messages"] });
      setNewMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  });

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest('DELETE', `/api/messages/${messageId}`);
    },
    onMutate: async (messageId: number) => {
      setOptimisticMessages((prev) => {
        const base = prev || messages;
        return base.filter((m) => m.id !== messageId);
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", recipientConversation?.id, "messages"] });
      setOptimisticMessages(null);
      toast({
        title: "Message deleted",
        description: "The message has been removed",
      });
    },
    onError: () => {
      setOptimisticMessages(null);
      queryClient.invalidateQueries({ queryKey: ["/api/conversations", recipientConversation?.id, "messages"] });
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    sendMessageMutation.mutate({
      content: newMessage.trim()
    });
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!selectedRecipient) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center">
          <MessageCircle className="w-6 h-6 mr-2" />
          Recipient Communication Hub
        </h2>
        
        <div className="grid gap-4">
          {recipients.map((recipient) => (
            <Card 
              key={recipient.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedRecipient(recipient)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-white" style={{backgroundColor: 'var(--tsp-teal)'}}>
                        {recipient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold flex items-center">
                        {recipient.name}
                        {recipient.status === 'lead' && (
                          <Crown className="w-4 h-4 ml-2 text-amber-500" />
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{recipient.phone || 'No phone'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={recipient.status === 'active' ? 'default' : 'secondary'}>
                      {recipient.status}
                    </Badge>
                    <Heart className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b bg-white dark:bg-gray-900">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedRecipient(null)}
            className="p-1"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarFallback className="text-white text-sm" style={{backgroundColor: 'var(--tsp-teal)'}}>
              {selectedRecipient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold flex items-center">
              {selectedRecipient.name}
              {selectedRecipient.status === 'lead' && (
                <Crown className="w-4 h-4 ml-2 text-amber-500" />
              )}
            </h3>
            <p className="text-xs text-gray-600">Recipient Chat</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {displayedMessages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            displayedMessages.map((message) => (
              <div key={message.id} className="flex space-x-3 group">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gray-500 text-white text-xs">
                    {message.sender?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'TM'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{message.sender}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {/* Show delete button for message owners or super admins */}
                    {canDeleteMessage(message) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMessageMutation.mutate(message.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        disabled={deleteMessageMutation.isPending}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white dark:bg-gray-900 space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-600">Posting as:</span>
          <span className="text-sm font-semibold text-gray-800">{getUserName()}</span>
        </div>
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`Message ${selectedRecipient.name}...`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 