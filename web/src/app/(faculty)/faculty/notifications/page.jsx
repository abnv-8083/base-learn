"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Bell, X } from "lucide-react";

export default function FacultyNotificationsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/auth/notifications");
      setItems(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Could not load notifications");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const dismiss = async (id) => {
    try {
      await axios.delete(`/api/auth/notifications/${id}`);
      setItems((prev) => prev.filter((n) => n._id !== id));
    } catch {
      toast.error("Could not dismiss");
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">Updates from admin and your students’ activity.</p>
      </div>

      {loading ? (
        <div className="spinner" style={{ display: "block", margin: "10vh auto" }} />
      ) : items.length === 0 ? (
        <div className="empty-state">
          <Bell size={40} className="opacity-40" />
          <h2 className="empty-state-title">You’re caught up</h2>
          <p className="empty-state-message">No notifications right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((n) => (
            <div key={n._id} className="card" style={{ padding: "var(--space-4)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <div>
                  <span className={`badge badge-${n.type === "alert" ? "error" : "info"}`} style={{ marginBottom: 8 }}>
                    {n.type || "info"}
                  </span>
                  <p style={{ margin: 0, fontWeight: 500 }}>{n.message}</p>
                  <p style={{ margin: "8px 0 0", fontSize: "12px", color: "var(--color-text-muted)" }}>
                    {n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-icon"
                  aria-label="Dismiss"
                  onClick={() => dismiss(n._id)}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
