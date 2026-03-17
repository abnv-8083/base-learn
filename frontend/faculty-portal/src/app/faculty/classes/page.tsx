'use client';

import React, { useState } from 'react';
import { 
  Video, Mic, Radio, Users, 
  Calendar, Clock, Plus, 
  Settings, Play, MoreVertical,
  CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import styles from './classes.module.css';

const RECORDINGS = [
  { id: 1, title: 'Adv. Quantum Physics - Session 4', duration: '45:20', date: 'Oct 14, 2026', views: 824, status: 'Published' },
  { id: 2, title: 'Thermodynamics Laws & Apps', duration: '38:15', date: 'Oct 12, 2026', views: 542, status: 'Draft' },
  { id: 3, title: 'Nuclear Physics Lab Prep', duration: '1:12:05', date: 'Oct 10, 2026', views: 1205, status: 'Published' },
];

export default function LiveRecordedClasses() {
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Classes & Recordings</h1>
          <p className={styles.subtitle}>Coordinate your live sessions and manage recorded content.</p>
        </div>
        <div className={styles.actionGroup}>
           <button className={`btn btn-secondary ${styles.controlBtn}`}><Settings size={18} /> Config</button>
           <button className={`btn btn-primary ${styles.liveBtn}`}><Radio size={18} /> Go Live Now</button>
        </div>
      </header>

      {/* Main Hub Selection */}
      <div className={styles.hubGrid}>
         <div className={`glass-card ${styles.hubCard} ${styles.hubPrimary}`}>
            <div className={styles.hubIcon}><Video size={32} /></div>
            <div className={styles.hubContent}>
               <h3>Recordings Hub</h3>
               <p>Manage, edit, and publish your recorded lecture series.</p>
               <button className={styles.hubAction}>Browse Library <Plus size={16}/></button>
            </div>
         </div>
         <div className={`glass-card ${styles.hubCard} ${styles.hubSecondary}`}>
            <div className={styles.hubIcon}><Radio size={32} /></div>
            <div className={styles.hubContent}>
               <h3>Live Studio</h3>
               <p>Schedule new live classes and interaction sessions.</p>
               <button className={styles.hubAction}>Create Session <Plus size={16}/></button>
            </div>
         </div>
      </div>

      <section className={styles.contentSection}>
         <div className={styles.sectionHeader}>
            <div className={styles.tabs}>
               {['Overview', 'Recent Recordings', 'Upcoming Live'].map(t => (
                 <button 
                  key={t}
                  className={`${styles.tab} ${activeTab === t ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(t)}
                 >
                   {t}
                 </button>
               ))}
            </div>
         </div>

         <div className={`glass-panel ${styles.panel}`}>
            {activeTab === 'Recent Recordings' ? (
              <div className={styles.recordingsList}>
                 <table className={styles.table}>
                    <thead>
                       <tr>
                          <th>Lecture Title</th>
                          <th>Duration</th>
                          <th>Views</th>
                          <th>Status</th>
                          <th>Action</th>
                       </tr>
                    </thead>
                    <tbody>
                       {RECORDINGS.map(rec => (
                         <tr key={rec.id}>
                            <td>
                               <div className={styles.lectureName}>
                                  <div className={styles.playIcon}><Play size={14} fill="currentColor" /></div>
                                  <div>
                                     <p className={styles.recTitle}>{rec.title}</p>
                                     <p className={styles.recDate}>{rec.date}</p>
                                  </div>
                               </div>
                            </td>
                            <td><span className={styles.duration}>{rec.duration}</span></td>
                            <td><span className={styles.views}>{rec.views}</span></td>
                            <td>
                               <span className={`${styles.statusBadge} ${rec.status === 'Published' ? styles.statPub : styles.statDraft}`}>
                                  {rec.status === 'Published' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                                  {rec.status}
                               </span>
                            </td>
                            <td><button className={styles.moreBtn}><MoreVertical size={16}/></button></td>
                         </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            ) : (
              <div className={styles.placeholderState}>
                 <AlertCircle size={48} className={styles.pIcon} />
                 <h3>Feature coming soon</h3>
                 <p>This section is currently being architected for the next release.</p>
              </div>
            )}
         </div>
      </section>
    </div>
  );
}
