"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { CalendarDays, Clock, FileText, Video, Sparkles, ChevronRight, Radio, AlertCircle } from "lucide-react";
import Link from "next/link";

function groupByDay(events) {
  const map = {};
  for (const ev of events) {
    const d = new Date(ev.start);
    const key = d.toDateString();
    if (!map[key]) map[key] = [];
    map[key].push(ev);
  }
  return Object.entries(map).sort((a, b) => new Date(a[1][0].start) - new Date(b[1][0].start));
}

const TYPE_CONFIG = {
  live:       { color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', label: 'Live Class', Icon: Radio },
  test:       { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Test Due', Icon: FileText },
  assignment: { color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', label: 'Assignment Due', Icon: AlertCircle },
};

function isToday(dateStr) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function isFuture(dateStr) {
  return new Date(dateStr) > new Date();
}

export default function StudentCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/api/student/calendar");
        setEvents(data.data?.events || []);
      } catch {
        toast.error("Could not load calendar");
        setEvents([]);
      } finally { setLoading(false); }
    })();
  }, []);

  const filtered = filter === 'all' ? events : events.filter(e => e.type === filter);
  const grouped = groupByDay(filtered);
  const upcoming = events.filter(e => isFuture(e.start)).length;
  const todayCount = events.filter(e => isToday(e.start)).length;
  const liveCount = events.filter(e => e.type === 'live').length;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } .cal-fade { animation: fadeUp 0.4s ease both; }`}</style>

      {/* ── Hero ── */}
      <div className="cal-fade" style={{ background: 'linear-gradient(135deg, #0f1629 0%, #1e3a5f 55%, #0f1629 100%)', borderRadius: '28px', padding: '32px 40px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.25) 0%, transparent 70%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'rgba(59,130,246,0.18)', border: '1px solid rgba(59,130,246,0.35)', padding: '5px 13px', borderRadius: '99px', marginBottom: '12px' }}>
              <Sparkles size={12} color="#93c5fd" />
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Schedule</span>
            </div>
            <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '900', color: 'white', letterSpacing: '-0.03em' }}>My Calendar</h1>
            <p style={{ margin: '8px 0 20px', fontSize: '14px', color: 'rgba(147,197,253,0.75)' }}>
              Live sessions and assessment due dates from your batch.{' '}
              <Link href="/student/live-classes" style={{ color: '#93c5fd', fontWeight: '700', textDecoration: 'underline' }}>Open live classes →</Link>
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Upcoming', value: upcoming, color: '#60a5fa' },
                { label: 'Today', value: todayCount, color: '#fbbf24' },
                { label: 'Live Classes', value: liveCount, color: '#f87171' },
              ].map(s => (
                <div key={s.label} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 18px', backdropFilter: 'blur(8px)' }}>
                  <div style={{ fontSize: '20px', fontWeight: '900', color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', fontWeight: '700', marginTop: '2px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Filter ── */}
      <div className="cal-fade" style={{ display: 'flex', gap: '6px', background: 'white', padding: '5px', borderRadius: '14px', border: '1px solid #e8edf5', marginBottom: '24px', width: 'fit-content', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', animationDelay: '0.05s' }}>
        {[['all', 'All Events'], ['live', 'Live Classes'], ['test', 'Tests'], ['assignment', 'Assignments']].map(([val, lbl]) => {
          const cfg = TYPE_CONFIG[val];
          const isActive = filter === val;
          return (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding: '8px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.2s', background: isActive ? (val === 'all' ? '#1e3a5f' : cfg.bg) : 'transparent', color: isActive ? (val === 'all' ? 'white' : cfg.color) : '#64748b', boxShadow: isActive && val !== 'all' ? `0 2px 8px ${cfg.color}30` : 'none' }}>
              {lbl}
            </button>
          );
        })}
      </div>

      {/* ── Calendar Content ── */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: '16px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', border: '3px solid #bfdbfe', borderTopColor: '#3b82f6', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); }}`}</style>
          <p style={{ color: '#94a3b8', fontWeight: '600', fontSize: '14px' }}>Loading your schedule…</p>
        </div>
      ) : grouped.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '100px 40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
          <div style={{ width: '90px', height: '90px', borderRadius: '28px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', transform: 'rotate(-6deg)' }}>
            <CalendarDays size={44} color="#cbd5e1" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '900', color: '#1e293b', marginBottom: '10px' }}>Nothing Scheduled Yet</h2>
          <p style={{ color: '#94a3b8', maxWidth: '340px', lineHeight: 1.6, fontSize: '14px', margin: 0 }}>
            When your instructor schedules live classes or assigns work, dates will show here automatically.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {grouped.map(([dayLabel, dayEvents]) => {
            const dayDate = new Date(dayEvents[0].start);
            const today = isToday(dayEvents[0].start);
            const dayName = dayDate.toLocaleDateString('en-IN', { weekday: 'long' });
            const dateFormatted = dayDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            return (
              <div key={dayLabel} className="cal-fade" style={{ background: 'white', borderRadius: '20px', border: today ? '2px solid #3b82f6' : '1px solid #e8edf5', boxShadow: today ? '0 0 0 4px rgba(59,130,246,0.08)' : '0 2px 12px rgba(15,23,42,0.05)', overflow: 'hidden' }}>
                {/* Day Header */}
                <div style={{ padding: '16px 22px', background: today ? 'linear-gradient(to right,#eff6ff,#dbeafe)' : '#f8fafc', borderBottom: '1px solid #e8edf5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: today ? '#3b82f6' : '#f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: '16px', fontWeight: '900', color: today ? 'white' : '#1e293b', lineHeight: 1 }}>{dayDate.getDate()}</div>
                      <div style={{ fontSize: '9px', fontWeight: '800', color: today ? 'rgba(255,255,255,0.75)' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{dayDate.toLocaleDateString('en-IN', { month: 'short' })}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: today ? '#1d4ed8' : '#1e293b' }}>
                        {dayName}
                        {today && <span style={{ marginLeft: '8px', fontSize: '11px', background: '#3b82f6', color: 'white', padding: '2px 10px', borderRadius: '99px', fontWeight: '800' }}>TODAY</span>}
                      </div>
                      <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500', marginTop: '2px' }}>{dateFormatted}</div>
                    </div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: today ? '#3b82f6' : '#94a3b8', background: today ? '#dbeafe' : '#f1f5f9', padding: '4px 12px', borderRadius: '99px' }}>
                    {dayEvents.length} event{dayEvents.length > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Events list */}
                <div style={{ padding: '8px' }}>
                  {dayEvents.map((ev, i) => {
                    const cfg = TYPE_CONFIG[ev.type] || TYPE_CONFIG.assignment;
                    const Icon = cfg.Icon;
                    return (
                      <div key={ev.id || i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 14px', borderRadius: '14px', marginBottom: i < dayEvents.length - 1 ? '4px' : 0, transition: 'background 0.15s', cursor: 'default' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: cfg.bg, border: `1px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Icon size={17} color={cfg.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{cfg.label}</span>
                          </div>
                          <div style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{ev.title}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', fontWeight: '500' }}>
                            {ev.allDay ? 'All day' : new Date(ev.start).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            {ev.subject ? ` · ${ev.subject}` : ''}
                          </div>
                        </div>
                        <ChevronRight size={15} color="#cbd5e1" />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
