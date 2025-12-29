import React from 'react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm border border-white/10 shadow-2xl transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-300 mb-6">{message}</p>

                <div className="flex items-center gap-3 justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors font-medium"
                    >
                        No
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold transition-colors"
                    >
                        Yes, Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
