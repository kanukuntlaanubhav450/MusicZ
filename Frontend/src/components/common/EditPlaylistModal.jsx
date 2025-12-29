import React, { useState, useEffect } from 'react';

const EditPlaylistModal = ({ isOpen, onClose, onSave, currentName }) => {
    const [name, setName] = useState(currentName || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(currentName || '');
    }, [currentName, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        await onSave(name);
        setIsSaving(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Edit Playlist</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                            placeholder="My Awesome Playlist"
                            autoFocus
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-300 font-medium hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving || !name.trim()}
                            className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg hover:shadow-white/20"
                        >
                            {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditPlaylistModal;
