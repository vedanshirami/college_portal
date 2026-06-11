import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import axiosWrapper from "../../utils/AxiosWrapper";
import DeleteConfirm from "../../components/DeleteConfirm";

const Alumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    position: "",
    yearPassedOut: "",
    branch: "",
    bio: "",
    profile: "",
  });
  const token = localStorage.getItem("userToken");

  const loadAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await axiosWrapper.get("/admin/alumni", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlumni(resp.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load alumni");
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadAlumni();
  }, [loadAlumni]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        yearPassedOut: form.yearPassedOut ? Number(form.yearPassedOut) : undefined,
      };

      const resp = await axiosWrapper.post("/admin/alumni", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const createdData = resp.data?.data;
      if (createdData?.emailSent) {
        toast.success(resp.data?.message || "Alumni created and email sent");
      } else {
        toast.error(resp.data?.message || "Alumni created (email not sent)");
        if (createdData?.tempPassword) {
          toast(`Temporary password (dev): ${createdData.tempPassword}`);
        }
        if (createdData?.emailError) {
          toast(`Email error: ${String(createdData.emailError).slice(0, 160)}`);
        }
      }
      setOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        company: "",
        position: "",
        yearPassedOut: "",
        branch: "",
        bio: "",
        profile: "",
      });
      loadAlumni();
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Failed to create alumni");
    }
  };

  const requestDelete = (id) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await axiosWrapper.delete(`/admin/alumni/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Alumni deleted");
      setDeleteOpen(false);
      setDeletingId(null);
      loadAlumni();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete alumni");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading title="Alumni" />
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
        >
          Add Alumni
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-dark-700 text-slate-200 font-semibold">
          Alumni List
        </div>
        {loading ? (
          <div className="p-6 text-slate-400">Loading...</div>
        ) : alumni.length === 0 ? (
          <div className="p-6 text-slate-400">No alumni found.</div>
        ) : (
          <div className="divide-y divide-dark-700">
            {alumni.map((a) => (
              <div key={a._id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-slate-200 font-semibold">
                    {a.firstName} {a.lastName}
                  </div>
                  <div className="text-sm text-slate-400">{a.email}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {(a.company || "") + (a.position ? ` • ${a.position}` : "")}
                    {a.yearPassedOut ? ` • Class of ${a.yearPassedOut}` : ""}
                    {a.branch ? ` • ${a.branch}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-slate-500">{a.status || "active"}</div>
                  <button
                    onClick={() => requestDelete(a._id)}
                    className="px-3 py-1.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs"
                    title="Delete alumni"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <DeleteConfirm
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this alumni? This action cannot be undone."
      />

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <div className="text-slate-200 font-semibold">Add Alumni</div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={submit} className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">First Name *</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Last Name *</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Email *</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Company</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.company}
                  onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Position</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.position}
                  onChange={(e) => setForm((p) => ({ ...p, position: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Year Passed Out</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.yearPassedOut}
                  onChange={(e) => setForm((p) => ({ ...p, yearPassedOut: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Branch</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.branch}
                  onChange={(e) => setForm((p) => ({ ...p, branch: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Bio</label>
                <textarea
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Profile (optional URL or filename)</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.profile}
                  onChange={(e) => setForm((p) => ({ ...p, profile: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
                >
                  Create & Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Alumni;
