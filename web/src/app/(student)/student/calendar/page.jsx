"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CalendarDays, Clock, FileText, Video } from "lucide-react";
import Link from "next/link";

function groupByDay(events) {
  const map = {};
  for (const ev of events) {
    const d = new Date(ev.start);
    const key = d.toDateString();
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  }
  return Object.entries(map).sort(
    (a, b) => new Date(a[1][0].start) - new Date(b[1][0].start)
  );
}

export default function StudentCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/student/calendar");
        setEvents(data.data?.events || []);
      } catch {
        toast.error("Could not load calendar");
        setEvents([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const grouped = groupByDay(events);

  const icon = (type) => {
    if (type === "live") return <Video size={16} />;
    if (type === "test") return <FileText size={16} />;
    return <Clock size={16} />;
  };

  const label = (type) => {
    if (type === "live") return "Live class";
    if (type === "test") return "Test due";
    return "Assignment due";
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My calendar</h1>
        <p className="page-subtitle">
          Live sessions and due dates from your batch.{" "}
          <Link href="/student/live-classes" style={{ fontWeight: 600 }}>
            Open live classes
          </Link>
        </p>
      </div>

      {loading ? (
        <div className="spinner" style={{ display: "block", margin: "10vh auto" }} />
      ) : grouped.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <CalendarDays size={48} strokeWidth={1.25} />
          </div>
          <h2 className="empty-state-title">Nothing scheduled yet</h2>
          <p className="empty-state-message">
            When your instructor schedules live classes or assigns work, dates will show here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {grouped.map(([dayLabel, dayEvents]) => (
            <div key={dayLabel} className="card">
              <div className="card-header">
                <h3 className="card-title" style={{ fontSize: "var(--text-lg)" }}>
                  {dayLabel}
                </h3>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {dayEvents.map((ev) => (
                    <li
                      key={ev.id}
                      style={{
                        padding: "var(--space-4) var(--space-6)",
                        borderBottom: "1px solid var(--color-border)",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "var(--space-3)",
                      }}
                    >
                      <span
                        className="badge"
                        style={{
                          marginTop: "2px",
                          background: "var(--color-accent-subtle)",
                          color: "var(--color-primary)",
                        }}
                      >
                        {icon(ev.type)}
                        <span style={{ marginLeft: 6 }}>{label(ev.type)}</span>
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{ev.title}</div>
                        {!ev.allDay && (
                          <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 4 }}>
                            {new Date(ev.start).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                            {ev.subject ? ` · ${ev.subject}` : ""}
                          </div>
                        )}
                        {ev.allDay && (
                          <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginTop: 4 }}>
                            All day
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
