import { create } from 'zustand';

export const useConfirmStore = create((set) => ({
    isOpen: false,
    title: 'Confirm Action',
    message: 'Are you sure you want to proceed?',
    onConfirm: () => {},
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger', // danger, info, primary
    icon: null,

    confirm: ({ title, message, onConfirm, confirmText, cancelText, type, icon }) => {
        set({
            isOpen: true,
            title: title || 'Confirm Action',
            message: message || 'Are you sure you want to proceed?',
            onConfirm: onConfirm || (() => {}),
            confirmText: confirmText || 'Confirm',
            cancelText: cancelText || 'Cancel',
            type: type || 'danger',
            icon: icon || null
        });
    },

    close: () => set({ isOpen: false })
}));
