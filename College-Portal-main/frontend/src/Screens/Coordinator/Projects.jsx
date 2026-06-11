import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";

const emptyForm = {
  title: "",
  link: "",
  description: "",
};

const Projects = ({ societyId }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("userToken");

  const title = useMemo(() => (editing ? "Edit Project" : "Add Project"), [editing]);

  const load = useCallback(async () => {
    if (!societyId) return;
    setLoading(true);
    try {
      const resp = await axiosWrapper.get(`/coordinator/societies/${societyId}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(resp.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load projects");
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

  const startEdit = (p) => {
    setEditing(p);
    setForm({
      title: p?.title || "",
      link: p?.link || "",
      description: p?.description || "",
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        link: form.link,
        description: form.description,
      };

      if (editing?._id) {
        await axiosWrapper.patch(`/coordinator/projects/${editing._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Project updated");
      } else {
        await axiosWrapper.post(`/coordinator/societies/${societyId}/projects`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Project added");
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Failed to save project");
    }
  };

  const requestDelete = (id) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await axiosWrapper.delete(`/coordinator/projects/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Project deleted");
      setDeleteOpen(false);
      setDeletingId(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading title="Projects" />
        <button
          onClick={startCreate}
          className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
        >
          Add Project
        </button>
      </div>

      <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-dark-700 text-slate-200 font-semibold">Project List</div>

        {loading ? (
          <div className="p-6 text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-slate-400">No projects found.</div>
        ) : (
          <div className="divide-y divide-dark-700">
            {items.map((p) => (
              <div key={p._id} className="p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-slate-200 font-semibold">{p.title}</div>
                  <div className="text-sm text-slate-400">
                    {p.link ? (
                      <a className="text-primary-400 hover:underline" href={p.link} target="_blank" rel="noreferrer">
                        {p.link}
                      </a>
                    ) : null}
                  </div>
                  {p.description ? <div className="mt-1 text-sm text-slate-400">{p.description}</div> : null}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(p)}
                    className="px-3 py-1.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => requestDelete(p._id)}
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
        message="Are you sure you want to delete this project?"
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
                  onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Link</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.link}
                  onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Description</label>
                <textarea
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
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

export default Projects;
