import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  societyId: "",
  status: "active",
};

const Coordinators = () => {
  const [items, setItems] = useState([]);
  const [societies, setSocieties] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("userToken");

  const title = useMemo(() => (editing ? "Edit Coordinator" : "Add Coordinator"), [editing]);

  const load = async () => {
    setLoading(true);
    try {
      const [coordResp, societyResp] = await Promise.all([
        axiosWrapper.get("/admin/coordinators", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axiosWrapper.get("/admin/societies", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setItems(coordResp.data?.data || []);
      setSocieties(societyResp.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load coordinators");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (c) => {
    setEditing(c);
    setForm({
      firstName: c?.firstName || "",
      lastName: c?.lastName || "",
      email: c?.email || "",
      societyId: c?.societies?.[0]?._id || c?.societies?.[0] || "",
      status: c?.status || "active",
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        status: form.status,
        ...(form.societyId ? { societyId: form.societyId } : {}),
      };

      const resp = editing?._id
        ? await axiosWrapper.patch(`/admin/coordinators/${editing._id}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axiosWrapper.post("/admin/coordinators", payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      const createdData = resp.data?.data;
      if (!editing) {
        if (createdData?.emailSent) {
          toast.success(resp.data?.message || "Coordinator created and email sent");
        } else {
          toast.error(resp.data?.message || "Coordinator created (email not sent)");
          if (createdData?.password) {
            toast(`Password (dev): ${createdData.password}`);
          }
        }
      } else {
        toast.success("Coordinator updated");
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Failed to save coordinator");
    }
  };

  const requestDelete = (id) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await axiosWrapper.delete(`/admin/coordinators/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Coordinator deleted");
      setDeleteOpen(false);
      setDeletingId(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete coordinator");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading title="Coordinators" />
        <button
          onClick={startCreate}
          className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
        >
          Add Coordinator
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-dark-700 text-slate-200 font-semibold">Coordinator List</div>

        {loading ? (
          <div className="p-6 text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-slate-400">No coordinators found.</div>
        ) : (
          <div className="divide-y divide-dark-700">
            {items.map((c) => (
              <div key={c._id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-slate-200 font-semibold">
                    {c.firstName} {c.lastName}
                  </div>
                  <div className="text-sm text-slate-400">{c.email}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Society: {c.societies?.[0]?.name || "(not assigned)"} • Status: {c.status || "active"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(c)}
                    className="px-3 py-1.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => requestDelete(c._id)}
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
        message="Are you sure you want to delete this coordinator?"
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

              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Society (one only)</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.societyId}
                  onChange={(e) => setForm((p) => ({ ...p, societyId: e.target.value }))}
                >
                  <option value="">(not assigned)</option>
                  {societies.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 mb-1">Status</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.status}
                  onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
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

export default Coordinators;
