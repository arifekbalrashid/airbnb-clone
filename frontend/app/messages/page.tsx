"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { getConversations, getConversationMessages, sendMessage } from "@/lib/api";
import { Conversation, MessageItem } from "@/types";

function MessagesContent() {
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConvo, setSelectedConvo] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push("/");
      return;
    }

    async function loadConversations() {
      try {
        const res = await getConversations();
        setConversations(res.data);

        // If we came from "Message host" button, auto-select that conversation
        const hostName = searchParams.get("hostName");
        const listingTitle = searchParams.get("listingTitle");
        if (hostName && listingTitle && res.data.length > 0) {
          const match = res.data.find(
            (c) => c.other_user_name === hostName && c.listing_title === listingTitle
          );
          if (match) {
            setSelectedConvo(match);
          }
        }
      } catch (e) {
        console.error("Failed to load conversations:", e);
      } finally {
        setLoading(false);
      }
    }
    loadConversations();
  }, [currentUser, router, authLoading, searchParams]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (!selectedConvo) {
      setMessages([]);
      return;
    }

    async function loadMessages() {
      setMessagesLoading(true);
      try {
        const res = await getConversationMessages(
          selectedConvo!.other_user_id,
          selectedConvo!.listing_id
        );
        setMessages(res.data);
      } catch (e) {
        console.error("Failed to load messages:", e);
      } finally {
        setMessagesLoading(false);
      }
    }
    loadMessages();
  }, [selectedConvo]);

  const handleConvoClick = (convo: Conversation) => {
    setSelectedConvo(convo);
    // Mark as read locally
    setConversations((prev) =>
      prev.map((c) =>
        c.other_user_id === convo.other_user_id && c.listing_id === convo.listing_id
          ? { ...c, unread_count: 0 }
          : c
      )
    );
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConvo || sending) return;
    const text = replyText.trim();
    setReplyText("");
    setSending(true);

    try {
      const res = await sendMessage({
        recipient_id: selectedConvo.other_user_id,
        listing_id: selectedConvo.listing_id,
        content: text,
      });

      // Add the new message to the list
      setMessages((prev) => [...prev, res.data]);

      // Update the conversation's last message
      setConversations((prev) =>
        prev.map((c) =>
          c.other_user_id === selectedConvo.other_user_id &&
          c.listing_id === selectedConvo.listing_id
            ? { ...c, last_message: text, last_message_time: new Date().toISOString() }
            : c
        )
      );
    } catch (e) {
      console.error("Failed to send message:", e);
      setReplyText(text); // Restore the text on failure
    } finally {
      setSending(false);
    }
  };

  function formatTime(isoStr: string): string {
    const d = new Date(isoStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) {
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FF385C] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-6 py-6">
      <div className="flex h-[calc(100vh-120px)] border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {/* Left: Conversation list */}
        <div className="w-full sm:w-96 border-r border-gray-200 flex flex-col shrink-0 bg-white">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>

          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-sm text-gray-400">No messages yet</p>
                <p className="text-xs text-gray-300 mt-1">Message a host from a listing page</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <div
                  key={`${convo.other_user_id}-${convo.listing_id}`}
                  onClick={() => handleConvoClick(convo)}
                  className={`flex gap-3 px-6 py-4 cursor-pointer transition-colors border-b border-gray-100 ${
                    selectedConvo?.other_user_id === convo.other_user_id &&
                    selectedConvo?.listing_id === convo.listing_id
                      ? "bg-gray-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center text-sm font-bold">
                      {convo.other_user_name.charAt(0).toUpperCase()}
                    </div>
                    {convo.unread_count > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#FF385C] rounded-full border-2 border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className={`text-sm truncate ${convo.unread_count > 0 ? "font-semibold text-black" : "font-medium text-gray-900"}`}>
                        {convo.other_user_name}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0 ml-2">{formatTime(convo.last_message_time)}</span>
                    </div>
                    <p className={`text-sm truncate mt-0.5 ${convo.unread_count > 0 ? "text-black font-medium" : "text-gray-500"}`}>
                      {convo.last_message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 truncate">{convo.listing_title}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Conversation view */}
        <div className="hidden sm:flex flex-1 flex-col bg-white relative">
          {selectedConvo ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-white z-10">
                <div>
                  <h2 className="font-semibold">{selectedConvo.other_user_name}</h2>
                  <p className="text-sm text-gray-500">{selectedConvo.listing_title}</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-gray-200 border-t-[#FF385C] rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <p className="text-sm">No messages yet. Say hi!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender_id === currentUser?.id;
                    return (
                      <div key={msg.id} className={`flex gap-4 mb-6 ${isMe ? "justify-end" : ""}`}>
                        {!isMe && (
                          <div className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold shrink-0">
                            {msg.sender_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={`flex flex-col gap-1 max-w-[80%] ${isMe ? "items-end" : ""}`}>
                          <div className="flex items-baseline gap-2">
                            {isMe && <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>}
                            <span className="font-medium text-sm">{isMe ? "You" : msg.sender_name}</span>
                            {!isMe && <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>}
                          </div>
                          <div className={`px-4 py-3 rounded-2xl text-sm ${
                            isMe
                              ? "bg-black text-white rounded-tr-none"
                              : "bg-gray-100 text-gray-800 border border-gray-200 rounded-tl-none"
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                        {isMe && (
                          <div className="w-10 h-10 rounded-full bg-[#FF385C] text-white flex items-center justify-center font-bold shrink-0">
                            {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-gray-200">
                <div className="flex items-end gap-2 bg-gray-100 rounded-2xl p-2 border border-gray-200">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 resize-none max-h-32 min-h-[44px] py-3 px-3 text-sm placeholder-gray-500"
                    rows={1}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                    className={`p-3 rounded-full mb-1 transition-colors shrink-0 ${
                      replyText.trim() && !sending
                        ? "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50/30">
              <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p>Select a conversation to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TravellerMessagesPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#FF385C] rounded-full animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  );
}
