"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Mail, RefreshCw, Trash2 } from "lucide-react";
import { useConfirmStore } from "@/store/confirmStore";

const STATUSES = ["new", "contacted", "enrolled", "dropped"];

export default function AdminEnquiriesPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const confirm = useConfirmStore(s => s.confirm);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/enquiries");
      setRows(data.data || []);
    } catch {
      toast.error("Failed to load enquiries", { id: "enq-load" });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`/api/admin/enquiries/${id}`, { status });
      toast.success("Updated");
      load();
    } catch {
      toast.error("Could not update");
    }
  };

  const deleteEnquiry = (id) => {
    confirm({
      title: "Delete Enquiry?",
      message: "This will permanently remove this admission enquiry from the system. This action cannot be undone.",
      confirmText: "Delete Permanently",
      type: "danger",
      onConfirm: async () => {
        try {
          await axios.delete(`/api/admin/enquiries/${id}`);
          toast.success("Deleted");
          load();
        } catch {
          toast.error("Failed to delete");
        }
      }
    });
  };

  return (
    <div style={{ paddingBottom: "48px" }}>
      <div className="page-header" style={{ marginBottom: "var(--space-6)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 className="page-title">Admission enquiries</h1>
            <p className="page-subtitle">
              Submissions from the landing page and register form. Delivery to email/WhatsApp is configured under System settings.
            </p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="spinner" style={{ display: "block", margin: "10vh auto" }} />
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="table-wrap" style={{ border: "none", boxShadow: "none" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Class</th>
                  <th>Message</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "48px", textAlign: "center", color: "var(--color-text-muted)" }}>
                      No enquiries yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r._id}>
                      <td style={{ whiteSpace: "nowrap", fontSize: "12px", lineHeight: "1.4" }}>
                        {r.createdAt ? (
                          <>
                            <div style={{ fontWeight: "600", color: "var(--color-text-primary)" }}>
                              {new Date(r.createdAt).toLocaleDateString()}
                            </div>
                            <div style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>
                              {new Date(r.createdAt).toLocaleTimeString()}
                            </div>
                          </>
                        ) : "—"}
                      </td>
                      <td style={{ fontWeight: 600 }}>{r.name}</td>
                      <td>{r.email}</td>
                      <td>{r.phone}</td>
                      <td>{r.studentClass || "—"}</td>
                      <td style={{ maxWidth: "400px", fontSize: "13px", color: "var(--color-text-primary)", fontWeight: "500" }}>
                        <div style={{ maxHeight: "80px", overflowY: "auto", paddingRight: "4px" }}>
                          {r.message || "—"}
                        </div>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => deleteEnquiry(r._id)}
                          className="btn btn-ghost"
                          style={{ color: "var(--color-error)", padding: "8px" }}
                          title="Delete Enquiry"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
