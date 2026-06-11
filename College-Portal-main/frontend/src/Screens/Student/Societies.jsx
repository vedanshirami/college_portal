import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { useSelector } from "react-redux";
import Events from "../Coordinator/Events";
import Achievements from "../Coordinator/Achievements";
import Projects from "../Coordinator/Projects";
import axiosWrapper from "../../utils/AxiosWrapper";

/*
const safeOpen = (url) => {
  const u = (url || "").trim();
  if (!u) return;
  const hasProtocol = /^https?:\/\//i.test(u);
  window.open(hasProtocol ? u : `https://${u}`, "_blank", "noopener,noreferrer");
};

const formatWhen = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    import React, { useEffect, useMemo, useState } from "react";
    import { toast } from "react-hot-toast";
    import { useSelector } from "react-redux";
    import Events from "../Coordinator/Events";
    import Achievements from "../Coordinator/Achievements";
    import Projects from "../Coordinator/Projects";
    import axiosWrapper from "../../utils/AxiosWrapper";

    const safeOpen = (url) => {
      const raw = (url || "").trim();
      if (!raw) return;
      const hasProtocol = /^https?:\/\//i.test(raw);
      window.open(hasProtocol ? raw : `https://${raw}`, "_blank", "noopener,noreferrer");
    };

    const formatWhen = (iso) => {
      if (!iso) return "";
      try {
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "";
        return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
      } catch {
        return "";
      }
    };

    const Societies = () => {
      const userData = useSelector((state) => state?.userData) || {};
      const token = localStorage.getItem("userToken");

      const [emailOverride, setEmailOverride] = useState("");
      const email = useMemo(() => {
        const fromRedux = userData?.email ? String(userData.email).trim().toLowerCase() : "";
        const fromOverride = emailOverride ? String(emailOverride).trim().toLowerCase() : "";
        return fromRedux || fromOverride;
      }, [userData, emailOverride]);

      const [societies, setSocieties] = useState([]);
      const [subscribedIds, setSubscribedIds] = useState(new Set());
      const [loading, setLoading] = useState(false);

      const [selectedSociety, setSelectedSociety] = useState(null);
      const [isModalOpen, setIsModalOpen] = useState(false);

      const [coordinatorSociety, setCoordinatorSociety] = useState(null);
      const [coordinatorTab, setCoordinatorTab] = useState("events");

      const ensureEmail = async () => {
        if (email) return;
        if (!token) return;
        try {
          const resp = await axiosWrapper.get("/student/my-details", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const fetchedEmail = resp.data?.data?.email;
          if (fetchedEmail) setEmailOverride(String(fetchedEmail));
        } catch {
          // ignore
        }
      };

      const load = async () => {
        setLoading(true);
        try {
          const [socResp, subResp] = await Promise.all([
            axiosWrapper.get("/societies/highlights"),
            email
              ? axiosWrapper.get(`/societies/subscriptions?email=${encodeURIComponent(email)}`)
              : Promise.resolve({ data: { data: [] } }),
          ]);

          const list = socResp.data?.data || [];
          setSocieties(Array.isArray(list) ? list : []);

          const subs = subResp.data?.data || [];
          setSubscribedIds(new Set((subs || []).map((s) => String(s.societyId))));
        } catch (e) {
          toast.error(e?.response?.data?.message || "Failed to load societies");
        }
        setLoading(false);
      };

      const loadCoordinatorSociety = async () => {
        if (!token) return;
        try {
          const resp = await axiosWrapper.get("/coordinator/societies", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const list = resp.data?.data || [];
          setCoordinatorSociety(list[0] || null);
        } catch {
          setCoordinatorSociety(null);
        }
      };

      useEffect(() => {
        ensureEmail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [token]);

      useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [email]);

      useEffect(() => {
        loadCoordinatorSociety();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [token]);

      const toggleSubscribe = async (societyId) => {
        if (!email) {
          toast.error("Email not found. Please re-login.");
          return;
        }

        const id = String(societyId);
        const isSubscribed = subscribedIds.has(id);

        try {
          if (isSubscribed) {
            await axiosWrapper.post(`/societies/${id}/unsubscribe`, { email });
            const next = new Set(subscribedIds);
            next.delete(id);
            setSubscribedIds(next);
            toast.success("Unsubscribed");
          } else {
            await axiosWrapper.post(`/societies/${id}/subscribe`, { email });
            const next = new Set(subscribedIds);
            next.add(id);
            setSubscribedIds(next);
            toast.success("Subscribed");
          }
        } catch (e) {
          toast.error(e?.response?.data?.message || "Request failed");
        }
      };

      const openSociety = (society) => {
        setSelectedSociety(society);
        setIsModalOpen(true);
      };

      const closeModal = () => {
        setIsModalOpen(false);
        setTimeout(() => setSelectedSociety(null), 200);
      };

      const selectedSocials = useMemo(() => {
        const socials = selectedSociety?.socials || {};
        return [
          socials.instagram ? { label: "Instagram", url: socials.instagram } : null,
          socials.facebook ? { label: "Facebook", url: socials.facebook } : null,
          socials.x ? { label: "X", url: socials.x } : null,
          socials.linkedin ? { label: "LinkedIn", url: socials.linkedin } : null,
          socials.youtube ? { label: "YouTube", url: socials.youtube } : null,
        ].filter(Boolean);
      }, [selectedSociety]);

      return (
        <div className="space-y-8">
          <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-cyan-500 rounded-3xl p-10 text-white shadow-2xl">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
              <div
                className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>

            <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
              <div className="space-y-3">
                <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30">
                  Student Hub
                </div>
                <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">Societies</h1>
                <p className="text-white/90 text-lg font-medium max-w-2xl">
                  Subscribe to get event updates. Click any society to see full details.
                </p>
              </div>

              <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/30 shadow-xl">
                <div className="text-5xl font-black bg-gradient-to-br from-white to-cyan-100 bg-clip-text text-transparent">
                  {societies.length}
                </div>
                <div className="text-sm text-white/90 font-semibold mt-1">Active Societies</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
            <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-primary-500/10 to-cyan-500/10">
              <h2 className="text-2xl font-bold text-slate-100">All Societies</h2>
              <p className="text-slate-400 text-sm mt-1">Card shows cover + name + subscribe only</p>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
                <p className="text-slate-400 mt-4">Loading societies...</p>
              </div>
            ) : societies.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-lg">No societies found.</p>
              </div>
            ) : (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {societies.map((s) => {
                  const isSubscribed = subscribedIds.has(String(s?._id));
                  const cover = String(s?.coverImageUrl || s?.coverUrl || s?.cover || s?.imageUrl || "").trim();

                  return (
                    <div
                      key={s?._id}
                      onClick={() => openSociety(s)}
                      className="bg-gradient-to-br from-dark-900 to-dark-800 border border-dark-700/50 rounded-3xl overflow-hidden hover:border-primary-500/70 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                    >
                      <div
                        className="relative h-44 w-full bg-dark-800"
                        style={
                          cover
                            ? {
                                backgroundImage: `url(${cover})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }
                            : undefined
                        }
                      >
                        {!cover ? (
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-cyan-500/30" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />
                        )}
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="text-slate-100 text-xl font-black line-clamp-1">{s?.name}</div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSubscribe(s?._id);
                          }}
                          className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg transform hover:scale-[1.02] ${
                            isSubscribed
                              ? "bg-gradient-to-r from-dark-700 to-dark-600 hover:from-dark-600 hover:to-dark-500 text-slate-200 border border-dark-600/50"
                              : "bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white shadow-primary-500/50"
                          }`}
                        >
                          {isSubscribed ? "🔕 Unsubscribe" : "🔔 Subscribe"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {coordinatorSociety ? (
            <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 rounded-3xl overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-primary-500/10 to-cyan-500/10">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl p-3 shadow-lg">
                      <span className="text-2xl">👨‍💼</span>
                    </div>
                    <div>
                      <div className="text-slate-200 font-bold text-lg">Coordinator Dashboard</div>
                      <div className="text-sm text-slate-400">
                        Managing: <span className="text-primary-300 font-semibold">{coordinatorSociety?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCoordinatorTab("events")}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                        coordinatorTab === "events"
                          ? "bg-gradient-to-r from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/50"
                          : "bg-dark-700/80 hover:bg-dark-600 text-slate-200 border border-dark-600/50"
                      }`}
                    >
                      📅 Events
                    </button>
                    <button
                      onClick={() => setCoordinatorTab("achievements")}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                        coordinatorTab === "achievements"
                          ? "bg-gradient-to-r from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/50"
                          : "bg-dark-700/80 hover:bg-dark-600 text-slate-200 border border-dark-600/50"
                      }`}
                    >
                      🏆 Achievements
                    </button>
                    <button
                      onClick={() => setCoordinatorTab("projects")}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                        coordinatorTab === "projects"
                          ? "bg-gradient-to-r from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/50"
                          : "bg-dark-700/80 hover:bg-dark-600 text-slate-200 border border-dark-600/50"
                      }`}
                    >
                      💡 Projects
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {coordinatorTab === "events" ? (
                  <Events societyId={coordinatorSociety?._id} />
                ) : coordinatorTab === "achievements" ? (
                  <Achievements societyId={coordinatorSociety?._id} />
                ) : (
                  <Projects societyId={coordinatorSociety?._id} />
                )}
              </div>
            </div>
          ) : null}

          {selectedSociety ? (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
                isModalOpen ? "bg-black/80 backdrop-blur-sm" : "bg-black/0"
              }`}
            >
              <div
                className={`bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
                  isModalOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
                }`}
              >
                <div className="relative border-b border-dark-700/50 overflow-hidden">
                  <div
                    className="h-48 bg-dark-800"
                    style={
                      selectedSociety?.coverImageUrl
                        ? {
                            backgroundImage: `url(${selectedSociety.coverImageUrl})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {!selectedSociety?.coverImageUrl ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-primary-500/20 to-cyan-500/30" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />
                    )}
                  </div>

                  <div className="absolute top-4 right-4">
                    <button
                      onClick={closeModal}
                      className="text-slate-200 hover:text-white bg-black/30 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm transition-all duration-200 border border-white/10"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="p-8 -mt-10 relative">
                    <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-white mb-3 border border-white/10">
                      Society Details
                    </div>
                    <div className="text-3xl font-black text-slate-100 mb-2">{selectedSociety?.name}</div>
                    {selectedSociety?.description ? (
                      <div className="text-slate-300 text-base leading-relaxed">{selectedSociety.description}</div>
                    ) : (
                      <div className="text-slate-400 italic">No description available</div>
                    )}
                  </div>
                </div>

                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                  {(selectedSociety?.website || selectedSociety?.contact?.email || selectedSociety?.contact?.phone) ? (
                    <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5">
                      <div className="text-slate-200 font-bold text-lg mb-3">Website & Contact</div>

                      <div className="space-y-3">
                        {selectedSociety?.website ? (
                          <button
                            onClick={() => safeOpen(selectedSociety.website)}
                            className="w-full text-left px-4 py-3 bg-dark-800/80 hover:bg-dark-700/80 rounded-xl transition-all duration-300 flex items-center gap-3 border border-dark-600/30"
                          >
                            <span className="text-lg">🌐</span>
                            <span className="text-primary-300 font-medium">{selectedSociety.website}</span>
                          </button>
                        ) : null}

                        {selectedSociety?.contact?.email ? (
                          <div className="px-4 py-3 bg-dark-800/80 rounded-xl flex items-center gap-3 border border-dark-600/30">
                            <span className="text-lg">📧</span>
                            <span className="text-slate-300">{selectedSociety.contact.email}</span>
                          </div>
                        ) : null}

                        {selectedSociety?.contact?.phone ? (
                          <div className="px-4 py-3 bg-dark-800/80 rounded-xl flex items-center gap-3 border border-dark-600/30">
                            <span className="text-lg">📱</span>
                            <span className="text-slate-300">{selectedSociety.contact.phone}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {selectedSocials.length ? (
                    <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5">
                      <div className="text-slate-200 font-bold text-lg mb-3">Social Media</div>
                      <div className="flex flex-wrap gap-2">
                        {selectedSocials.map((si) => (
                          <button
                            key={si.label}
                            onClick={() => safeOpen(si.url)}
                            className="text-sm px-4 py-2 rounded-full bg-dark-700/70 hover:bg-dark-600 text-slate-200 border border-dark-600/50 transition-all"
                          >
                            {si.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selectedSociety?.nextEvent ? (
                    <div className="bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border border-primary-500/30 rounded-2xl p-5">
                      <div className="text-slate-200 font-bold text-lg mb-3">Upcoming Event</div>
                      <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/50">
                        <div className="text-slate-100 font-bold text-lg mb-2">{selectedSociety?.nextEvent?.title}</div>
                        <div className="text-sm text-slate-400">{formatWhen(selectedSociety?.nextEvent?.scheduledAt)}</div>
                        {selectedSociety?.nextEvent?.venue ? (
                          <div className="text-sm text-slate-500 mt-1">Venue: {selectedSociety.nextEvent.venue}</div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}

                  {Array.isArray(selectedSociety?.projects) && selectedSociety.projects.length ? (
                    <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5">
                      <div className="text-slate-200 font-bold text-lg mb-3">Projects</div>
                      <div className="space-y-3">
                        {selectedSociety.projects.slice(0, 5).map((p) => (
                          <div
                            key={p?._id}
                            className="flex items-center justify-between gap-3 bg-dark-800/80 rounded-xl p-4 border border-dark-600/30"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-slate-100 font-bold line-clamp-1">{p?.title}</div>
                              {p?.techStack ? (
                                <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.techStack}</div>
                              ) : null}
                            </div>
                            {p?.link ? (
                              <button
                                onClick={() => safeOpen(p.link)}
                                className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white text-sm font-bold"
                              >
                                View
                              </button>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5 space-y-4">
                    <div className="text-sm text-slate-400">Subscribe to get email updates for new events.</div>
                    <button
                      onClick={() => toggleSubscribe(selectedSociety?._id)}
                      className={`w-full py-4 rounded-xl text-base font-bold transition-all duration-300 shadow-lg ${
                        subscribedIds.has(String(selectedSociety?._id))
                          ? "bg-gradient-to-r from-dark-700 to-dark-600 hover:from-dark-600 hover:to-dark-500 text-slate-200 border border-dark-600/50"
                          : "bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white shadow-primary-500/50"
                      }`}
                    >
                      {subscribedIds.has(String(selectedSociety?._id)) ? "🔕 Unsubscribe" : "🔔 Subscribe"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      );
    };
                    <div className="text-slate-200 font-bold text-lg">Contact Information</div>
                  </div>
                  <div className="space-y-3">
                    {selectedSociety?.website ? (
                      <button
                        onClick={() => safeOpen(selectedSociety.website)}
                        className="w-full text-left px-4 py-3 bg-dark-800/80 hover:bg-dark-700/80 rounded-xl transition-all duration-300 flex items-center gap-3 border border-dark-600/30 group"
                      >
                        <span className="text-lg">🌐</span>
                        <span className="text-primary-300 group-hover:text-primary-200 font-medium">{selectedSociety.website}</span>
                      </button>
                    ) : null}
                    {selectedSociety?.contact?.email ? (
                      <div className="px-4 py-3 bg-dark-800/80 rounded-xl flex items-center gap-3 border border-dark-600/30">
                        <span className="text-lg">📧</span>
                        <span className="text-slate-300">{selectedSociety.contact.email}</span>
                      </div>
                    ) : null}
                    {selectedSociety?.contact?.phone ? (
                      <div className="px-4 py-3 bg-dark-800/80 rounded-xl flex items-center gap-3 border border-dark-600/30">
                        <span className="text-lg">📱</span>
                        <span className="text-slate-300">{selectedSociety.contact.phone}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {selectedSociety?.nextEvent ? (
                <div className="bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border border-primary-500/30 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">📅</span>
                    <div className="text-slate-200 font-bold text-lg">Upcoming Event</div>
                  </div>
                  <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/50">
                    <div className="text-slate-100 font-bold text-lg mb-2">{selectedSociety.nextEvent.title}</div>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
                      <span>⏰</span>
                      <span>{formatWhen(selectedSociety.nextEvent.scheduledAt)}</span>
                    </div>
                    {selectedSociety.nextEvent.venue ? (
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <span>📍</span>
                        <span>{selectedSociety.nextEvent.venue}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {Array.isArray(selectedSociety?.projects) && selectedSociety.projects.length ? (
                <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">💡</span>
                    <div className="text-slate-200 font-bold text-lg">Projects</div>
                  </div>
                  <div className="space-y-3">
                    {selectedSociety.projects.slice(0, 3).map((p) => (
                      <div key={p?._id} className="flex items-center justify-between gap-3 bg-dark-800/80 rounded-xl p-4 border border-dark-600/30 hover:border-primary-500/30 transition-all duration-300">
                        <div className="min-w-0 flex-1">
                          <div className="text-slate-100 font-bold line-clamp-1 mb-1">{p?.title}</div>
                          {p?.techStack ? <div className="text-xs text-slate-500 line-clamp-1">{p.techStack}</div> : null}
                        </div>
                        {p?.link ? (
                          <button
                            onClick={() => safeOpen(p.link)}
                            className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white text-sm font-bold shadow-lg transition-all duration-300"
                          >
                            View →
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span>📬</span>
                    <span>Get email updates for events</span>
                  </div>
                  <div className="text-slate-400 font-semibold">
                    {subscribedIds.size} subscription{subscribedIds.size !== 1 ? 's' : ''}
                  </div>
                </div>
                <button
                  onClick={() => toggleSubscribe(selectedSociety._id)}
                  className={`w-full py-4 rounded-xl text-base font-bold transition-all duration-300 shadow-lg transform hover:scale-105 ${
                    subscribedIds.has(String(selectedSociety._id))
                      ? "bg-gradient-to-r from-dark-700 to-dark-600 hover:from-dark-600 hover:to-dark-500 text-slate-200 border border-dark-600/50"
                      : "bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white shadow-primary-500/50"
                  }`}
                >
                  {subscribedIds.has(String(selectedSociety._id)) ? "🔕 Unsubscribe" : "🔔 Subscribe for Updates"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Societies;

*/

const safeOpen = (url) => {
  const raw = (url || "").trim();
  if (!raw) return;
  const hasProtocol = /^https?:\/\//i.test(raw);
  window.open(hasProtocol ? raw : `https://${raw}`, "_blank", "noopener,noreferrer");
};

const formatWhen = (iso) => {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "";
  }
};

const Societies = () => {
  const userData = useSelector((state) => state?.userData);
  const token = localStorage.getItem("userToken");

  const [emailOverride, setEmailOverride] = useState("");
  const email = useMemo(() => {
    const fromRedux = userData?.email ? String(userData.email).trim().toLowerCase() : "";
    const fromOverride = emailOverride ? String(emailOverride).trim().toLowerCase() : "";
    return fromRedux || fromOverride;
  }, [userData, emailOverride]);

  const [societies, setSocieties] = useState([]);
  const [subscribedIds, setSubscribedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const [selectedSociety, setSelectedSociety] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [coordinatorSociety, setCoordinatorSociety] = useState(null);
  const [coordinatorTab, setCoordinatorTab] = useState("events");

  const ensureEmail = async () => {
    if (email) return;
    if (!token) return;
    try {
      const resp = await axiosWrapper.get("/student/my-details", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fetchedEmail = resp.data?.data?.email;
      if (fetchedEmail) setEmailOverride(String(fetchedEmail));
    } catch {
      // ignore
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [socResp, subResp] = await Promise.all([
        axiosWrapper.get("/societies/highlights"),
        email
          ? axiosWrapper.get(`/societies/subscriptions?email=${encodeURIComponent(email)}`)
          : Promise.resolve({ data: { data: [] } }),
      ]);

      const list = socResp.data?.data || [];
      setSocieties(Array.isArray(list) ? list : []);

      const subs = subResp.data?.data || [];
      setSubscribedIds(new Set((subs || []).map((s) => String(s.societyId))));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to load societies");
    }
    setLoading(false);
  };

  const loadCoordinatorSociety = async () => {
    if (!token) return;
    try {
      const resp = await axiosWrapper.get("/coordinator/societies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list = resp.data?.data || [];
      setCoordinatorSociety(list[0] || null);
    } catch {
      setCoordinatorSociety(null);
    }
  };

  useEffect(() => {
    ensureEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  useEffect(() => {
    loadCoordinatorSociety();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const toggleSubscribe = async (societyId) => {
    if (!email) {
      toast.error("Email not found. Please re-login.");
      return;
    }

    const id = String(societyId);
    const isSubscribed = subscribedIds.has(id);

    try {
      if (isSubscribed) {
        await axiosWrapper.post(`/societies/${id}/unsubscribe`, { email });
        const next = new Set(subscribedIds);
        next.delete(id);
        setSubscribedIds(next);
        toast.success("Unsubscribed");
      } else {
        await axiosWrapper.post(`/societies/${id}/subscribe`, { email });
        const next = new Set(subscribedIds);
        next.add(id);
        setSubscribedIds(next);
        toast.success("Subscribed");
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Request failed");
    }
  };

  const openSociety = (society) => {
    setSelectedSociety(society);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedSociety(null), 200);
  };

  const selectedSocials = useMemo(() => {
    const socials = selectedSociety?.socials || {};
    return [
      socials.instagram ? { label: "Instagram", url: socials.instagram } : null,
      socials.facebook ? { label: "Facebook", url: socials.facebook } : null,
      socials.x ? { label: "X", url: socials.x } : null,
      socials.linkedin ? { label: "LinkedIn", url: socials.linkedin } : null,
      socials.youtube ? { label: "YouTube", url: socials.youtube } : null,
    ].filter(Boolean);
  }, [selectedSociety]);

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-500 to-cyan-500 rounded-3xl p-10 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse" />
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
          <div className="space-y-3">
            <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium border border-white/30">
              Student Hub
            </div>
            <h1 className="text-5xl font-black tracking-tight drop-shadow-lg">Societies</h1>
            <p className="text-white/90 text-lg font-medium max-w-2xl">
              Subscribe to get event updates. Click any society to see full details.
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/30 shadow-xl">
            <div className="text-5xl font-black bg-gradient-to-br from-white to-cyan-100 bg-clip-text text-transparent">
              {societies.length}
            </div>
            <div className="text-sm text-white/90 font-semibold mt-1">Active Societies</div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-sm">
        <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-primary-500/10 to-cyan-500/10">
          <h2 className="text-2xl font-bold text-slate-100">All Societies</h2>
          <p className="text-slate-400 text-sm mt-1">Card shows cover + name + subscribe only</p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
            <p className="text-slate-400 mt-4">Loading societies...</p>
          </div>
        ) : societies.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <div className="text-6xl mb-4">🎭</div>
            <p className="text-lg">No societies found.</p>
          </div>
        ) : (
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {societies.map((s) => {
              const isSubscribed = subscribedIds.has(String(s?._id));
              const cover = String(s?.coverImageUrl || s?.coverUrl || s?.cover || s?.imageUrl || "").trim();
              return (
                <div
                  key={s?._id}
                  onClick={() => openSociety(s)}
                  className="bg-gradient-to-br from-dark-900 to-dark-800 border border-dark-700/50 rounded-3xl overflow-hidden hover:border-primary-500/70 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  <div
                    className="relative h-44 w-full bg-dark-800"
                    style={
                      cover
                        ? {
                            backgroundImage: `url(${cover})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }
                        : undefined
                    }
                  >
                    {!cover ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 to-cyan-500/30" />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />
                    )}
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="text-slate-100 text-xl font-black line-clamp-1">{s?.name}</div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSubscribe(s?._id);
                      }}
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg transform hover:scale-[1.02] ${
                        isSubscribed
                          ? "bg-gradient-to-r from-dark-700 to-dark-600 hover:from-dark-600 hover:to-dark-500 text-slate-200 border border-dark-600/50"
                          : "bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white shadow-primary-500/50"
                      }`}
                    >
                      {isSubscribed ? "🔕 Unsubscribe" : "🔔 Subscribe"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {coordinatorSociety ? (
        <div className="bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-dark-700/50 bg-gradient-to-r from-primary-500/10 to-cyan-500/10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-primary-500 to-cyan-500 rounded-2xl p-3 shadow-lg">
                  <span className="text-2xl">👨‍💼</span>
                </div>
                <div>
                  <div className="text-slate-200 font-bold text-lg">Coordinator Dashboard</div>
                  <div className="text-sm text-slate-400">
                    Managing: <span className="text-primary-300 font-semibold">{coordinatorSociety?.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCoordinatorTab("events")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    coordinatorTab === "events"
                      ? "bg-gradient-to-r from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/50"
                      : "bg-dark-700/80 hover:bg-dark-600 text-slate-200 border border-dark-600/50"
                  }`}
                >
                  📅 Events
                </button>
                <button
                  onClick={() => setCoordinatorTab("achievements")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    coordinatorTab === "achievements"
                      ? "bg-gradient-to-r from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/50"
                      : "bg-dark-700/80 hover:bg-dark-600 text-slate-200 border border-dark-600/50"
                  }`}
                >
                  🏆 Achievements
                </button>
                <button
                  onClick={() => setCoordinatorTab("projects")}
                  className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    coordinatorTab === "projects"
                      ? "bg-gradient-to-r from-primary-500 to-cyan-500 text-white shadow-lg shadow-primary-500/50"
                      : "bg-dark-700/80 hover:bg-dark-600 text-slate-200 border border-dark-600/50"
                  }`}
                >
                  💡 Projects
                </button>
              </div>
            </div>
          </div>

          <div className="p-8">
            {coordinatorTab === "events" ? (
              <Events societyId={coordinatorSociety?._id} />
            ) : coordinatorTab === "achievements" ? (
              <Achievements societyId={coordinatorSociety?._id} />
            ) : (
              <Projects societyId={coordinatorSociety?._id} />
            )}
          </div>
        </div>
      ) : null}

      {selectedSociety ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
            isModalOpen ? "bg-black/80 backdrop-blur-sm" : "bg-black/0"
          }`}
          onClick={closeModal}
        >
          <div
            className={`bg-gradient-to-br from-dark-800 to-dark-900 border border-dark-700/50 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
              isModalOpen ? "scale-100 opacity-100" : "scale-90 opacity-0"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative border-b border-dark-700/50 overflow-hidden">
              <div
                className="h-48 bg-dark-800"
                style={
                  selectedSociety?.coverImageUrl
                    ? {
                        backgroundImage: `url(${selectedSociety.coverImageUrl})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {!selectedSociety?.coverImageUrl ? (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-500/30 via-primary-500/20 to-cyan-500/30" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 via-dark-900/20 to-transparent" />
                )}
              </div>

              <div className="absolute top-4 right-4">
                <button
                  onClick={closeModal}
                  className="text-slate-200 hover:text-white bg-black/30 hover:bg-black/40 rounded-full p-2 backdrop-blur-sm transition-all duration-200 border border-white/10"
                >
                  ✕
                </button>
              </div>

              <div className="p-8 -mt-10 relative">
                <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-semibold text-white mb-3 border border-white/10">
                  Society Details
                </div>
                <div className="text-3xl font-black text-slate-100 mb-2">{selectedSociety?.name}</div>
                {selectedSociety?.description ? (
                  <div className="text-slate-300 text-base leading-relaxed">{selectedSociety.description}</div>
                ) : (
                  <div className="text-slate-400 italic">No description available</div>
                )}
              </div>
            </div>

            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {(selectedSociety?.website || selectedSociety?.contact?.email || selectedSociety?.contact?.phone) ? (
                <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5">
                  <div className="text-slate-200 font-bold text-lg mb-3">Website & Contact</div>
                  <div className="space-y-3">
                    {selectedSociety?.website ? (
                      <button
                        onClick={() => safeOpen(selectedSociety.website)}
                        className="w-full text-left px-4 py-3 bg-dark-800/80 hover:bg-dark-700/80 rounded-xl transition-all duration-300 flex items-center gap-3 border border-dark-600/30"
                      >
                        <span className="text-lg">🌐</span>
                        <span className="text-primary-300 font-medium">{selectedSociety.website}</span>
                      </button>
                    ) : null}
                    {selectedSociety?.contact?.email ? (
                      <div className="px-4 py-3 bg-dark-800/80 rounded-xl flex items-center gap-3 border border-dark-600/30">
                        <span className="text-lg">📧</span>
                        <span className="text-slate-300">{selectedSociety.contact.email}</span>
                      </div>
                    ) : null}
                    {selectedSociety?.contact?.phone ? (
                      <div className="px-4 py-3 bg-dark-800/80 rounded-xl flex items-center gap-3 border border-dark-600/30">
                        <span className="text-lg">📱</span>
                        <span className="text-slate-300">{selectedSociety.contact.phone}</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {selectedSocials.length ? (
                <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5">
                  <div className="text-slate-200 font-bold text-lg mb-3">Social Media</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedSocials.map((si) => (
                      <button
                        key={si.label}
                        onClick={() => safeOpen(si.url)}
                        className="text-sm px-4 py-2 rounded-full bg-dark-700/70 hover:bg-dark-600 text-slate-200 border border-dark-600/50 transition-all"
                      >
                        {si.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {selectedSociety?.nextEvent ? (
                <div className="bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border border-primary-500/30 rounded-2xl p-5">
                  <div className="text-slate-200 font-bold text-lg mb-3">Upcoming Event</div>
                  <div className="bg-dark-900/50 rounded-xl p-4 border border-dark-700/50">
                    <div className="text-slate-100 font-bold text-lg mb-2">{selectedSociety?.nextEvent?.title}</div>
                    <div className="text-sm text-slate-400">{formatWhen(selectedSociety?.nextEvent?.scheduledAt)}</div>
                    {selectedSociety?.nextEvent?.venue ? (
                      <div className="text-sm text-slate-500 mt-1">Venue: {selectedSociety.nextEvent.venue}</div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {Array.isArray(selectedSociety?.projects) && selectedSociety.projects.length ? (
                <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5">
                  <div className="text-slate-200 font-bold text-lg mb-3">Projects</div>
                  <div className="space-y-3">
                    {selectedSociety.projects.slice(0, 5).map((p) => (
                      <div
                        key={p?._id}
                        className="flex items-center justify-between gap-3 bg-dark-800/80 rounded-xl p-4 border border-dark-600/30"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-slate-100 font-bold line-clamp-1">{p?.title}</div>
                          {p?.techStack ? (
                            <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.techStack}</div>
                          ) : null}
                        </div>
                        {p?.link ? (
                          <button
                            onClick={() => safeOpen(p.link)}
                            className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white text-sm font-bold"
                          >
                            View
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="bg-gradient-to-br from-dark-900/90 to-dark-800/90 border border-dark-700/50 rounded-2xl p-5 space-y-4">
                <div className="text-sm text-slate-400">Subscribe to get email updates for new events.</div>
                <button
                  onClick={() => toggleSubscribe(selectedSociety?._id)}
                  className={`w-full py-4 rounded-xl text-base font-bold transition-all duration-300 shadow-lg ${
                    subscribedIds.has(String(selectedSociety?._id))
                      ? "bg-gradient-to-r from-dark-700 to-dark-600 hover:from-dark-600 hover:to-dark-500 text-slate-200 border border-dark-600/50"
                      : "bg-gradient-to-r from-primary-500 to-cyan-500 hover:from-primary-600 hover:to-cyan-600 text-white shadow-primary-500/50"
                  }`}
                >
                  {subscribedIds.has(String(selectedSociety?._id)) ? "🔕 Unsubscribe" : "🔔 Subscribe"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Societies;
