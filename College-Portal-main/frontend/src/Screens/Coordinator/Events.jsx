import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";

const emptyForm = {
  title: "",
  scheduledAt: "",
  venue: "",
  description: "",
};

const toDatetimeLocal = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const Events = ({ societyId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("userToken");

  const title = useMemo(() => (editing ? "Edit Event" : "Create Event"), [editing]);

  const load = useCallback(async () => {
    if (!societyId) return;
    setLoading(true);
    try {
      const resp = await axiosWrapper.get(`/coordinator/societies/${societyId}/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(resp.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load events");
    }
    setLoading(false);
  }, [societyId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (ev) => {
    setEditing(ev);
    setForm({
      title: ev?.title || "",
      scheduledAt: toDatetimeLocal(ev?.scheduledAt),
      venue: ev?.venue || "",
      description: ev?.description || "",
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        venue: form.venue,
        description: form.description,
        scheduledAt: form.scheduledAt ? new Date(form.scheduledAt).toISOString() : undefined,
      };

      if (editing?._id) {
        await axiosWrapper.patch(`/coordinator/events/${editing._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Event updated");
      } else {
        const resp = await axiosWrapper.post(`/coordinator/societies/${societyId}/events`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const report = resp.data?.data?.emailReport;
        if (report) {
          toast.success(`Event created • Emails: ${report.sent}/${report.total}`);
        } else {
          toast.success("Event created");
        }
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Failed to save event");
    }
  };

  const requestDelete = (id) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await axiosWrapper.delete(`/coordinator/events/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Event deleted");
      setDeleteOpen(false);
      setDeletingId(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete event");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading title="Events" />
        <button
          onClick={startCreate}
          className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
        >
          Create Event
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-dark-700 text-slate-200 font-semibold">Event List</div>

        {loading ? (
          <div className="p-6 text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-slate-400">No events found.</div>
        ) : (
          <div className="divide-y divide-dark-700">
            {items.map((ev) => (
              <div key={ev._id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-slate-200 font-semibold">{ev.title}</div>
                  <div className="text-sm text-slate-400">
                    {ev.scheduledAt ? new Date(ev.scheduledAt).toLocaleString() : ""}
                    {ev.venue ? ` • ${ev.venue}` : ""}
                  </div>
                  {ev.description ? <div className="mt-1 text-sm text-slate-400">{ev.description}</div> : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(ev)}
                    className="px-3 py-1.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => requestDelete(ev._id)}
                    className="px-3 py-1.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-red-300 text-xs"
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
        message="Are you sure you want to delete this event?"
      />

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-dark-700">
              <div className="text-slate-200 font-semibold">{title}</div>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={submit} className="p-4 grid grid-cols-1 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Title *</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Date & Time *</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.scheduledAt}
                    onChange={(e) => setForm((p) => ({ ...p, scheduledAt: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Venue</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.venue}
                    onChange={(e) => setForm((p) => ({ ...p, venue: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-200"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
