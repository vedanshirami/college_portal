import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Heading from "../../components/Heading";
import DeleteConfirm from "../../components/DeleteConfirm";
import axiosWrapper from "../../utils/AxiosWrapper";

const emptyForm = {
  name: "",
  description: "",
  coverImageUrl: "",
  website: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  instagram: "",
  facebook: "",
  x: "",
  linkedin: "",
  youtube: "",
  status: "active",
};

const Societies = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("societies");

  // Coordinators management (inside this page only)
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [coordinators, setCoordinators] = useState([]);
  const [coordinatorsLoading, setCoordinatorsLoading] = useState(false);
  const [selectedSocietyId, setSelectedSocietyId] = useState("");
  const [studentQuery, setStudentQuery] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const token = localStorage.getItem("userToken");

  const title = useMemo(() => (editing ? "Edit Society" : "Add Society"), [editing]);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await axiosWrapper.get("/admin/societies", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(resp.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load societies");
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!selectedSocietyId && items?.length) {
      setSelectedSocietyId(String(items[0]?._id || ""));
    }
  }, [items, selectedSocietyId]);

  const loadStudents = async () => {
    setStudentsLoading(true);
    try {
      const resp = await axiosWrapper.get("/student", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStudents(resp.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load students");
    }
    setStudentsLoading(false);
  };

  const loadCoordinators = async () => {
    setCoordinatorsLoading(true);
    try {
      const resp = await axiosWrapper.get("/admin/coordinators", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoordinators(resp.data?.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to load coordinators");
    }
    setCoordinatorsLoading(false);
  };

  useEffect(() => {
    if (activeTab !== "coordinators") return;
    loadStudents();
    loadCoordinators();
  }, [activeTab]);

  const filteredStudents = useMemo(() => {
    const q = studentQuery.trim().toLowerCase();
    if (!q) return students;
    return (students || []).filter((s) => {
      const name = `${s?.firstName || ""} ${s?.lastName || ""}`.toLowerCase();
      const email = String(s?.email || "").toLowerCase();
      return name.includes(q) || email.includes(q);
    });
  }, [students, studentQuery]);

  const coordinatorsForSelectedSociety = useMemo(() => {
    const sid = String(selectedSocietyId || "");
    return (coordinators || []).filter((c) => {
      const s0 = c?.societies?.[0]?._id || c?.societies?.[0];
      return sid && String(s0 || "") === sid;
    });
  }, [coordinators, selectedSocietyId]);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const startEdit = (society) => {
    setEditing(society);
    setForm({
      name: society?.name || "",
      description: society?.description || "",
      coverImageUrl: society?.coverImageUrl || "",
      website: society?.website || "",
      contactName: society?.contact?.name || "",
      contactEmail: society?.contact?.email || "",
      contactPhone: society?.contact?.phone || "",
      instagram: society?.socials?.instagram || "",
      facebook: society?.socials?.facebook || "",
      x: society?.socials?.x || "",
      linkedin: society?.socials?.linkedin || "",
      youtube: society?.socials?.youtube || "",
      status: society?.status || "active",
    });
    setOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        description: form.description,
        coverImageUrl: form.coverImageUrl,
        website: form.website,
        contact: {
          name: form.contactName,
          email: form.contactEmail,
          phone: form.contactPhone,
        },
        socials: {
          instagram: form.instagram,
          facebook: form.facebook,
          x: form.x,
          linkedin: form.linkedin,
          youtube: form.youtube,
        },
        status: form.status,
      };

      if (editing?._id) {
        await axiosWrapper.patch(`/admin/societies/${editing._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Society updated");
      } else {
        await axiosWrapper.post("/admin/societies", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Society created");
      }

      setOpen(false);
      setEditing(null);
      setForm(emptyForm);
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || "Failed to save society");
    }
  };

  const requestDelete = (id) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await axiosWrapper.delete(`/admin/societies/${deletingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Society deleted");
      setDeleteOpen(false);
      setDeletingId(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to delete society");
    }
  };

  const assignCoordinator = async () => {
    if (!selectedSocietyId) return toast.error("Select a society");
    if (!selectedStudentId) return toast.error("Select a student");

    setAssigning(true);
    try {
      await axiosWrapper.post(
        "/admin/coordinators",
        { studentId: selectedStudentId, societyId: selectedSocietyId, status: "active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Coordinator assigned");
      setSelectedStudentId("");
      loadCoordinators();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to assign coordinator");
    }
    setAssigning(false);
  };

  const unassignCoordinator = async (coordinatorId) => {
    if (!coordinatorId) return;
    setAssigning(true);
    try {
      await axiosWrapper.patch(
        `/admin/coordinators/${coordinatorId}`,
        { societies: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Coordinator unassigned");
      loadCoordinators();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to unassign");
    }
    setAssigning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Heading title="Societies" />
        {activeTab === "societies" ? (
          <button
            onClick={startCreate}
            className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white"
          >
            Add Society
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab("societies")}
          className={`px-4 py-2 rounded-xl border text-sm ${
            activeTab === "societies"
              ? "bg-primary-500 hover:bg-primary-600 text-white border-primary-500"
              : "bg-dark-800 hover:bg-dark-700 text-slate-200 border-dark-700"
          }`}
        >
          Societies
        </button>
        <button
          onClick={() => setActiveTab("coordinators")}
          className={`px-4 py-2 rounded-xl border text-sm ${
            activeTab === "coordinators"
              ? "bg-primary-500 hover:bg-primary-600 text-white border-primary-500"
              : "bg-dark-800 hover:bg-dark-700 text-slate-200 border-dark-700"
          }`}
        >
          Coordinators
        </button>
      </div>

      {activeTab === "societies" ? (
        <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-dark-700 text-slate-200 font-semibold">Society List</div>

          {loading ? (
            <div className="p-6 text-slate-400">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-6 text-slate-400">No societies found.</div>
          ) : (
            <div className="divide-y divide-dark-700">
              {items.map((s) => (
                <div key={s._id} className="p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="text-slate-200 font-semibold">{s.name}</div>
                    {s.description ? <div className="text-sm text-slate-400">{s.description}</div> : null}
                    <div className="mt-1 text-xs text-slate-500">Status: {s.status || "active"}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startEdit(s)}
                      className="px-3 py-1.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => requestDelete(s._id)}
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
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-dark-700 text-slate-200 font-semibold">Assign Coordinator</div>

            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Society</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={selectedSocietyId}
                  onChange={(e) => setSelectedSocietyId(e.target.value)}
                >
                  {(items || []).map((s) => (
                    <option key={s?._id} value={s?._id}>
                      {s?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Search student</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  placeholder="Search by name or email"
                  value={studentQuery}
                  onChange={(e) => setStudentQuery(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Student</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  disabled={studentsLoading}
                >
                  <option value="">Select student</option>
                  {(filteredStudents || []).map((st) => (
                    <option key={st?._id} value={st?._id}>
                      {st?.firstName} {st?.lastName} ({st?.email})
                    </option>
                  ))}
                </select>
                {studentsLoading ? <div className="text-xs text-slate-500 mt-2">Loading students...</div> : null}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={assignCoordinator}
                  disabled={assigning || studentsLoading}
                  className="px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white disabled:opacity-60"
                >
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-dark-800 border border-dark-700 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-dark-700 text-slate-200 font-semibold">Assigned Coordinators</div>

            {coordinatorsLoading ? (
              <div className="p-6 text-slate-400">Loading...</div>
            ) : coordinatorsForSelectedSociety.length === 0 ? (
              <div className="p-6 text-slate-400">No coordinators assigned.</div>
            ) : (
              <div className="divide-y divide-dark-700">
                {coordinatorsForSelectedSociety.map((c) => (
                  <div key={c?._id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-slate-200 font-semibold">
                        {c?.studentId?.firstName || c?.firstName} {c?.studentId?.lastName || c?.lastName}
                      </div>
                      <div className="text-sm text-slate-400">{c?.studentId?.email || c?.email}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => unassignCoordinator(c?._id)}
                        disabled={assigning}
                        className="px-3 py-1.5 rounded-xl bg-dark-700 hover:bg-dark-600 text-red-300 text-xs disabled:opacity-60"
                      >
                        Unassign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <DeleteConfirm
        isOpen={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeletingId(null);
        }}
        onConfirm={confirmDelete}
        message="Are you sure you want to delete this society?"
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
                <label className="block text-xs text-slate-400 mb-1">Name *</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  required
                />
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

              <div>
                <label className="block text-xs text-slate-400 mb-1">Cover Pic (URL)</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.coverImageUrl}
                  onChange={(e) => setForm((p) => ({ ...p, coverImageUrl: e.target.value }))}
                  placeholder="https://..."
                />
                {form.coverImageUrl ? (
                  <div className="mt-2">
                    <img
                      src={form.coverImageUrl}
                      alt="cover preview"
                      className="w-full h-40 object-cover rounded-xl border border-dark-600"
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Website</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                  value={form.website}
                  onChange={(e) => setForm((p) => ({ ...p, website: e.target.value }))}
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Contact Name</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.contactName}
                    onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Contact Email</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.contactEmail}
                    onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Contact Phone</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.contactPhone}
                    onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Instagram</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.instagram}
                    onChange={(e) => setForm((p) => ({ ...p, instagram: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Facebook</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.facebook}
                    onChange={(e) => setForm((p) => ({ ...p, facebook: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">X</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.x}
                    onChange={(e) => setForm((p) => ({ ...p, x: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">LinkedIn</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.linkedin}
                    onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">YouTube</label>
                  <input
                    className="w-full px-3 py-2 rounded-xl bg-dark-700 border border-dark-600 text-white"
                    value={form.youtube}
                    onChange={(e) => setForm((p) => ({ ...p, youtube: e.target.value }))}
                  />
                </div>
              </div>

              <div>
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

export default Societies;
