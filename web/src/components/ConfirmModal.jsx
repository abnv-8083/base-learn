"use client";

import { useConfirmStore } from '@/store/confirmStore';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ConfirmModal() {
    const { isOpen, title, message, onConfirm, confirmText, cancelText, type, icon: CustomIcon, close } = useConfirmStore();
    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
        if (isOpen) setIsRendered(true);
    }, [isOpen]);

    if (!isOpen && !isRendered) return null;

    const DefaultIcon = type === 'danger' ? AlertTriangle : (type === 'success' ? CheckCircle2 : Info);
    const color = type === 'danger' ? '#ef4444' : (type === 'success' ? '#22c55e' : '#3b82f6');
    const bg = type === 'danger' ? '#fef2f2' : (type === 'success' ? '#f0fdf4' : '#eff6ff');

    const handleConfirm = () => {
        onConfirm();
        close();
    };

    return (
        <div className={`confirm-overlay ${isOpen ? 'active' : ''}`} onClick={close}>
            <style>{`
                .confirm-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; opacity: 0; pointer-events: none; transition: opacity 0.2s ease; }
                .confirm-overlay.active { opacity: 1; pointer-events: auto; }
                .confirm-modal { width: 100%; max-width: 440px; background: white; border-radius: 20px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); overflow: hidden; transform: scale(0.95) translateY(20px); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); opacity: 0; }
                .confirm-overlay.active .confirm-modal { transform: scale(1) translateY(0); opacity: 1; }
                .confirm-header { padding: 24px 24px 16px; display: flex; flex-direction: column; align-items: center; text-align: center; }
                .confirm-icon-wrap { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
                .confirm-title { font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; letter-spacing: -0.01em; }
                .confirm-message { font-size: 15px; color: #64748b; line-height: 1.6; }
                .confirm-footer { padding: 0 24px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .btn-cancel { padding: 12px; border-radius: 12px; border: 1.5px solid #e2e8f0; background: white; color: #475569; font-weight: 600; font-size: 14px; cursor: pointer; transition: all 0.2s; }
                .btn-cancel:hover { background: #f8fafc; border-color: #cbd5e1; color: #1e293b; }
                .btn-confirm { padding: 12px; border-radius: 12px; border: none; color: white; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.2s; }
                .btn-confirm:hover { filter: brightness(1.1); transform: translateY(-1px); }
                .btn-confirm:active { transform: translateY(0); }
            `}</style>

            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
                <div className="confirm-header">
                    <div className="confirm-icon-wrap" style={{ background: bg }}>
                        {CustomIcon ? <CustomIcon size={32} color={color} /> : <DefaultIcon size={32} color={color} />}
                    </div>
                    <h3 className="confirm-title">{title}</h3>
                    <p className="confirm-message">{message}</p>
                </div>
                <div className="confirm-footer">
                    <button onClick={close} className="btn-cancel">{cancelText}</button>
                    <button onClick={handleConfirm} className="btn-confirm" style={{ background: color, boxShadow: `0 4px 14px -2px ${color}60` }}>{confirmText}</button>
                </div>
            </div>
        </div>
    );
}
