import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import {
  ArrowRight,
  MessageCircle,
  Briefcase,
  Calendar,
  Building2,
  Mail,
  X,
  Send,
  Paperclip,
  Smile,
} from "lucide-react";
import { io } from "socket.io-client";
import axiosWrapper from "../../utils/AxiosWrapper";
import Loading from "../../components/Loading";
import Heading from "../../components/Heading";
import { socketURL } from "../../socketUrl";

const getProfileSrc = (profile) => {
  if (!profile) return null;
  if (String(profile).startsWith("http")) return profile;
  return `${process.env.REACT_APP_MEDIA_LINK || "https://via.placeholder.com/150"}/${profile}`;
};

const ChatInterface = ({ alumni, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const socketRef = useRef(null);

  const token = localStorage.getItem("userToken");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const resp = await axiosWrapper.get(
          `/student/chat/with/${alumni._id}/messages?limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMessages(resp.data?.data || []);
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed to load messages");
      }
    };
    if (alumni?._id && token) loadHistory();
  }, [alumni?._id, token]);

  useEffect(() => {
    if (!token) return;

    const s = io(socketURL(), {
      auth: { token },
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = s;

    s.on("chat:receive", (payload) => {
      const alumniId = String(alumni._id);
      const belongsToThisChat =
        (payload.fromRole === "alumni" && String(payload.fromUserId) === alumniId) ||
        (payload.toRole === "alumni" && String(payload.toUserId) === alumniId);

      if (belongsToThisChat) {
        setMessages((prev) => [...prev, payload]);
      }
    });

    return () => {
      s.disconnect();
    };
  }, [alumni?._id, token]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const text = message.trim();
    if (!text) return;

    socketRef.current?.emit("chat:send", {
      toRole: "alumni",
      toUserId: alumni._id,
      text,
    });

    setMessage("");
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-800 rounded-2xl shadow-2xl border border-dark-700 w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={getProfileSrc(alumni.profile) || "https://via.placeholder.com/150"}
              alt={alumni.firstName}
              className="w-12 h-12 rounded-full ring-2 ring-white/50"
              onError={(e) => {
                e.target.src = 'https://ui-avatars.com/api/?name=' + alumni.firstName + '+' + alumni.lastName + '&background=fff&color=4F46E5&size=48';
              }}
            />
            <div>
              <h3 className="text-white font-semibold text-lg">
                {alumni.firstName} {alumni.lastName}
              </h3>
              <p className="text-primary-100 text-sm flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                Online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dark-900">
          {messages.map((msg, idx) => {
            const senderRole = msg.senderRole || msg.fromRole;
            const isMine = senderRole === "student";
            const when = msg.createdAt ? new Date(msg.createdAt) : msg.timestamp ? new Date(msg.timestamp) : null;
            return (
            <div
              key={msg._id || idx}
              className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl p-3 ${
                  isMine
                    ? 'bg-primary-500 text-white rounded-br-sm'
                    : 'bg-dark-700 text-slate-200 rounded-bl-sm border border-dark-600'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    isMine ? 'text-primary-100' : 'text-slate-500'
                  }`}
                >
                  {when
                    ? when.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                    : ""}
                </p>
              </div>
            </div>
          );
          })}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="bg-dark-800 border-t border-dark-700 p-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-dark-700 rounded-lg transition-colors"
            >
              <Smile className="h-5 w-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-dark-700 border border-dark-600 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="p-2 bg-primary-500 text-white rounded-xl hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AlumniCard = ({ alumni, onStartChat }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleStartChat = (e) => {
    e.stopPropagation();
    onStartChat(alumni);
  };

  return (
    <div
      className="group relative h-[380px] w-full [perspective:2000px]"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className={`relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] ${
          isFlipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
        }`}
      >
        {/* Front of card */}
        <div
          className={`absolute inset-0 h-full w-full [transform:rotateY(0deg)] [backface-visibility:hidden] overflow-hidden rounded-2xl bg-gradient-to-br from-dark-800 via-dark-800/95 to-dark-700 border border-dark-700 shadow-lg transition-all duration-700 group-hover:shadow-2xl group-hover:border-primary-500/30 ${
            isFlipped ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Background gradient effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/10" />
          
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl" />

          {/* Main content - Centered */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div className="flex flex-col items-center space-y-6">
              {/* Profile Image Section */}
              <div className="relative">
                {/* Animated outer ring */}
                <div className="absolute inset-[-24px] rounded-full bg-gradient-to-r from-cyan-500/30 via-primary-500/30 to-cyan-500/30 animate-pulse" />
                <div className="absolute inset-[-16px] rounded-full border-2 border-primary-500/20" />
                
                {/* Profile Image Container */}
                <div className="relative">
                  <img
                    src={getProfileSrc(alumni.profile) || "https://via.placeholder.com/150"}
                    alt={`${alumni.firstName}'s profile`}
                    className="relative w-36 h-36 object-cover rounded-full ring-[3px] ring-cyan-400 ring-offset-[6px] ring-offset-dark-800 shadow-2xl shadow-primary-500/20 transition-all duration-500 group-hover:scale-105 group-hover:ring-primary-400"
                    onError={(e) => {
                      e.target.src = 'https://ui-avatars.com/api/?name=' + alumni.firstName + '+' + alumni.lastName + '&background=4F46E5&color=fff&size=150';
                    }}
                  />
                  
                  {/* Status indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-[3px] border-dark-800 shadow-lg">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                  </div>
                </div>
              </div>

              {/* Name and Details */}
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-slate-100 transition-all duration-500 ease-out group-hover:translate-y-[-2px]">
                  {alumni.firstName} {alumni.lastName}
                </h3>
                
                {/* Company Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-dark-700/80 backdrop-blur-sm rounded-full border border-primary-500/20 shadow-lg">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold text-slate-200 text-sm">{alumni.company}</span>
                </div>
                
                {/* Position */}
                <p className="text-sm text-slate-300 font-medium px-4">
                  {alumni.position}
                </p>
                
                {/* Year Badge */}
                <div className="inline-flex items-center justify-center gap-2 text-xs text-slate-400 bg-dark-700/50 px-3 py-1.5 rounded-full border border-dark-600">
                  <Calendar className="h-3 w-3 text-primary-400" />
                  <span>Class of {alumni.yearPassedOut}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hover indicator */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-primary-500/20 backdrop-blur-sm rounded-full p-2 shadow-lg border border-primary-500/30">
              <ArrowRight className="h-4 w-4 text-primary-400 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className={`absolute inset-0 h-full w-full [transform:rotateY(180deg)] [backface-visibility:hidden] rounded-2xl p-6 bg-gradient-to-br from-dark-800 via-dark-800/95 to-dark-700 border border-dark-700 shadow-lg flex flex-col transition-all duration-700 group-hover:shadow-2xl group-hover:border-primary-500/30 ${
            !isFlipped ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary-500/5 via-transparent to-primary-500/10" />

          <div className="relative z-10 flex-1 space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 pb-3 border-b border-dark-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 via-primary-500/90 to-primary-500/80 shadow-lg shadow-primary-500/25">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-100">
                  {alumni.firstName} {alumni.lastName}
                </h3>
                <p className="text-xs text-slate-400">{alumni.position}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3">
              <div
                className="flex items-start gap-3 text-sm text-slate-300 transition-all duration-500"
                style={{
                  transform: isFlipped ? 'translateX(0)' : 'translateX(-10px)',
                  opacity: isFlipped ? 1 : 0,
                  transitionDelay: '100ms',
                }}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary-500/10">
                  <Building2 className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <div className="font-medium text-slate-200">{alumni.company}</div>
                  <div className="text-xs text-slate-400">{alumni.position}</div>
                </div>
              </div>

              <div
                className="flex items-center gap-3 text-sm text-slate-300 transition-all duration-500"
                style={{
                  transform: isFlipped ? 'translateX(0)' : 'translateX(-10px)',
                  opacity: isFlipped ? 1 : 0,
                  transitionDelay: '200ms',
                }}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary-500/10">
                  <Calendar className="h-4 w-4 text-primary-400" />
                </div>
                <div>
                  <span className="font-medium text-slate-200">Class of {alumni.yearPassedOut}</span>
                  <div className="text-xs text-slate-400">{alumni.branch}</div>
                </div>
              </div>

              <div
                className="flex items-center gap-3 text-sm text-slate-300 transition-all duration-500"
                style={{
                  transform: isFlipped ? 'translateX(0)' : 'translateX(-10px)',
                  opacity: isFlipped ? 1 : 0,
                  transitionDelay: '300ms',
                }}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary-500/10">
                  <Mail className="h-4 w-4 text-primary-400" />
                </div>
                <div className="text-slate-300 text-xs truncate">{alumni.email}</div>
              </div>

              {/* Bio */}
              <div
                className="pt-2 text-xs text-slate-400 leading-relaxed transition-all duration-500"
                style={{
                  transform: isFlipped ? 'translateY(0)' : 'translateY(10px)',
                  opacity: isFlipped ? 1 : 0,
                  transitionDelay: '400ms',
                }}
              >
                {alumni.bio}
              </div>
            </div>
          </div>

          {/* Start Chat Button */}
          <div className="relative z-10 mt-auto pt-4 border-t border-dark-600">
            <button
              onClick={handleStartChat}
              className="group/btn relative flex items-center justify-between w-full rounded-lg p-3 transition-all duration-300 bg-gradient-to-r from-dark-700 via-dark-700 to-dark-700 hover:from-primary-500/20 hover:via-primary-500/10 hover:to-transparent hover:scale-[1.02] border border-transparent hover:border-primary-500/30"
            >
              <span className="text-sm font-semibold text-slate-100 group-hover/btn:text-primary-400 transition-colors duration-300 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Start Chat
              </span>
              <div className="relative">
                <div className="absolute inset-[-6px] rounded-lg transition-all duration-300 bg-gradient-to-br from-primary-500/20 via-primary-500/10 to-transparent scale-90 opacity-0 group-hover/btn:scale-100 group-hover/btn:opacity-100" />
                <ArrowRight className="relative z-10 h-4 w-4 text-primary-400 transition-all duration-300 group-hover/btn:translate-x-1 group-hover/btn:scale-110" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Alumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const token = localStorage.getItem("userToken");

  const handleStartChat = (alum) => {
    setSelectedAlumni(alum);
    setChatOpen(true);
  };

  const handleCloseChat = () => {
    setChatOpen(false);
    setSelectedAlumni(null);
  };

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosWrapper.get("/student/alumni/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlumni(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching alumni:', error);
      toast.error(error.response?.data?.message || 'Failed to load alumni data');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const filteredAlumni = alumni.filter(alum => {
    const matchesSearch = `${alum.firstName} ${alum.lastName} ${alum.company}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesBranch = selectedBranch === 'all' || alum.branch === selectedBranch;
    return matchesSearch && matchesBranch;
  });

  const branches = ['all', ...new Set(alumni.map(a => a.branch).filter(Boolean))];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="space-y-8">
      <Heading title="Alumni Network" />

      {/* Filters */}
      <div className="bg-dark-800 rounded-2xl p-6 border border-dark-700 shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Search Alumni
            </label>
            <input
              type="text"
              placeholder="Search by name or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border-2 border-dark-600 rounded-md bg-dark-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Filter by Branch
            </label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-2 border-2 border-dark-600 rounded-md bg-dark-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {branches.map(branch => (
                <option key={branch} value={branch}>
                  {branch === 'all' ? 'All Branches' : branch}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Alumni Grid */}
      {filteredAlumni.length === 0 ? (
        <div className="text-center py-12 bg-dark-800 rounded-2xl border border-dark-700">
          <p className="text-slate-400">No alumni found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlumni.map((alum) => (
            <AlumniCard key={alum._id} alumni={alum} onStartChat={handleStartChat} />
          ))}
        </div>
      )}

      {/* Chat Interface */}
      {chatOpen && selectedAlumni && (
        <ChatInterface alumni={selectedAlumni} onClose={handleCloseChat} />
      )}
    </div>
  );
};

export default Alumni;
