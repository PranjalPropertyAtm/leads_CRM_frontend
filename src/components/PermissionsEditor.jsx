import React, { useEffect, useState } from "react";
import axios from "../lib/axios"; // your preconfigured axios (baseURL + withCredentials)
import { useAuthStore } from "../store/authStore";

const ALL_PERMISSIONS = [
  "leads:view","leads:add","leads:edit","leads:delete","leads:assign",
  "visits:add","visits:view","visits:edit","visits:delete",
  "registrations:add","registrations:view",
  "employees:view","employees:add","employees:edit","employees:delete",
  "masters:manage","reports:view","profile:edit"
];

export default function PermissionEditor({ userId, onSaved }) {
  const [user, setUser] = useState(null);
  const [checked, setChecked] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const { token } = useAuthStore();

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const res = await axios.get("/admin/users");
      const u = res.data.data.find(x => x._id === userId);
      setUser(u);
      setChecked(new Set(u?.permissions || []));
    };
    load().catch(err => console.error(err));
  }, [userId]);

  const toggle = (perm) => {
    const s = new Set(checked);
    if (s.has(perm)) s.delete(perm); else s.add(perm);
    setChecked(s);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { permissions: Array.from(checked) };
      await axios.put(`/admin/users/${userId}/permissions`, payload);
      setSaving(false);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Save perms error", err);
      setSaving(false);
      alert(err.response?.data?.message || "Save failed");
    }
  };

  if (!user) return <div>Loading user...</div>;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-semibold mb-3">Edit Permissions — {user.name}</h3>

      <div className="grid grid-cols-2 gap-2 max-h-72 overflow-auto">
        {ALL_PERMISSIONS.map((p) => (
          <label key={p} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={checked.has(p)}
              onChange={() => toggle(p)}
            />
            <span className="text-sm">{p}</span>
          </label>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <button onClick={save} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded">
          {saving ? "Saving..." : "Save Permissions"}
        </button>
      </div>
    </div>
  );
}
