import React, { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import axiosWrapper from "../../utils/AxiosWrapper";
import Heading from "../../components/Heading";
import { socketURL } from "../../socketUrl";

const ChatWindow = ({ student, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const socketRef = useRef(null);

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const resp = await axiosWrapper.get(`/alumni/chat/with/${student._id}/messages?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMessages(resp.data?.data || []);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load messages");
      }
    };
    loadHistory();
  }, [student?._id, token]);

  useEffect(() => {
    if (!token) return;
    const s = io(socketURL(), {
      auth: { token },
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = s;

    s.on("chat:receive", (payload) => {
      // Only append messages for this partner
      const partnerId = String(student._id);
      if (
        (payload.fromRole === "student" && String(payload.fromUserId) === partnerId) ||
        (payload.toRole === "student" && String(payload.toUserId) === partnerId)
      ) {
        setMessages((prev) => [...prev, payload]);
      }
    });

    return () => {
      s.disconnect();
    };
  }, [student?._id, token]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    socketRef.current?.emit("chat:send", {
      toRole: "student",
      toUserId: student._id,
      text,
    });
    setMessage("");
  };

  const renderText = (m) => m.text || m?.text;
  const renderSender = (m) => m.senderRole || m.fromRole;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-dark-700">
          <div className="text-slate-200 font-semibold">
            Chat with {student.firstName} {student.lastName}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>

        <div className="h-[420px] overflow-y-auto p-4 space-y-3 bg-dark-900">
          {messages.map((m, idx) => {
            const senderRole = renderSender(m);
            const isMine = senderRole === "alumni";
            return (
              <div key={m._id || idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${isMine ? "bg-primary-500 text-white" : "bg-dark-700 text-slate-200"}`}>
                  {renderText(m)}
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-dark-700 bg-dark-800">
          <input
            className="flex-1 px-4 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white outline-none"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
            disabled={!message.trim()}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

const StudentConnect = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const token = localStorage.getItem("userToken");

  const loadConversations = useCallback(async () => {
    try {
      const resp = await axiosWrapper.get("/alumni/chat/conversations", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setConversations(resp.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load conversations");
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return (
    <div>
      <Heading title="Student Connect" />

      <div className="mt-6 space-y-3">
        {conversations.length === 0 ? (
          <div className="text-slate-400">No conversations yet.</div>
        ) : (
          conversations.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedStudent(c.partner)}
              className="w-full text-left p-4 rounded-2xl bg-dark-800 border border-dark-700 hover:border-dark-600"
            >
              <div className="flex items-center justify-between">
                <div className="text-slate-200 font-semibold">
                  {c.partner?.firstName} {c.partner?.lastName}
                </div>
                <div className="text-xs text-slate-500">
                  {c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleString() : ""}
                </div>
              </div>
              <div className="mt-1 text-sm text-slate-400 truncate">{c.lastMessageText || ""}</div>
            </button>
          ))
        )}
      </div>

      {selectedStudent && (
        <ChatWindow
          student={selectedStudent}
          onClose={() => {
            setSelectedStudent(null);
            loadConversations();
          }}
        />
      )}
    </div>
  );
};

export default StudentConnect;
