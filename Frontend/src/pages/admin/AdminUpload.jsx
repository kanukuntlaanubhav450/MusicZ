import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { storage, auth } from '../../services/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import toast, { Toaster } from 'react-hot-toast';

const AdminUpload = () => {
    const [formData, setFormData] = useState({
        title: '',
        artist: '',
        category: 'Pop',
        imageUrl: '', // We will simulate uploading this
        audioUrl: ''  // We will simulate uploading this
    });

    const [files, setFiles] = useState({
        image: null,
        audio: null
    });
    const [previewUrl, setPreviewUrl] = useState(null);

    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [type]: file }));
            if (type === 'image') {
                setPreviewUrl(URL.createObjectURL(file));
            }
        }
    };

    // --- Debug Helper ---
    const [logs, setLogs] = useState([]);
    const [showLogs, setShowLogs] = useState(false);
    const addLog = (msg) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

    const handleUpload = async (e) => {
        e.preventDefault();
        setLogs([]); // Clear logs
        addLog("Starting upload process...");

        if (!auth.currentUser) {
            toast.error("You must be logged in to upload files.");
            return;
        }

        if (!files.audio || !files.image) {
            addLog("Error: Missing files");
            toast.error('Please select both audio and image files');
            return;
        }

        setUploading(true);
        setProgress(0);

        try {
            // Helper to upload file
            const uploadFile = async (file, path) => {
                addLog(`Uploading ${file.name} to ${path}...`);
                const storageRef = ref(storage, path);
                const uploadTask = uploadBytesResumable(storageRef, file);

                return new Promise((resolve, reject) => {
                    uploadTask.on('state_changed',
                        (snapshot) => {
                            const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log(`Upload is ${p}% done`);
                            if (file.type.startsWith('audio')) {
                                setProgress(Math.round(p));
                            }
                        },
                        (error) => {
                            addLog(`ERROR uploading ${file.name}: ${error.message} (${error.code})`);
                            console.error("Upload failed:", error);
                            reject(error);
                        },
                        () => {
                            addLog(`SUCCESS ${file.name} uploaded.`);
                            getDownloadURL(uploadTask.snapshot.ref).then(resolve);
                        }
                    );
                });
            };

            // 1. Upload Audio
            const audioFileName = `tracks/${Date.now()}_${files.audio.name}`;
            const audioUrl = await uploadFile(files.audio, audioFileName);

            // 2. Upload Image
            const imageFileName = `images/${Date.now()}_${files.image.name}`;
            const imageUrl = await uploadFile(files.image, imageFileName);

            // 3. Save Metadata
            addLog("Saving metadata to backend...");
            await finalizeUpload(audioUrl, imageUrl);

        } catch (error) {
            addLog(`CRITICAL FAILURE: ${error.message}`);
            console.error("Upload sequence failed", error);
            setUploading(false);
        }
    };

    const finalizeUpload = async (audioUrl, imageUrl) => {
        try {
            const payload = {
                ...formData,
                imageUrl,
                audioUrl
            };

            const res = await fetch('http://localhost:5000/api/tracks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                addLog("Metadata saved successfully!");
                toast.success('Track Uploaded Successfully!');
                setFormData({ title: '', artist: '', category: 'Pop', imageUrl: '', audioUrl: '' });
                setFiles({ image: null, audio: null });
                setPreviewUrl(null);
                setProgress(0);
            } else {
                const err = await res.json();
                addLog(`Metadata save failed: ${err.message}`);
                toast.error('Failed to save metadata: ' + err.message);
            }
        } catch (error) {
            addLog(`Metadata save network error: ${error.message}`);
            console.error("Metadata save error", error);
            toast.error('Error saving track metadata');
        } finally {
            setUploading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto p-8">
                <h1 className="text-4xl font-black text-white mb-8 border-b border-gray-700 pb-4">
                    Upload New Track
                </h1>

                {/* Debug Log Box */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => setShowLogs(!showLogs)}
                        className="text-xs text-gray-500 hover:text-white underline mb-2"
                    >
                        {showLogs ? 'Hide Debug Logs' : 'Show Debug Logs'}
                    </button>

                    {showLogs && (
                        <div className="bg-black/50 p-4 rounded-lg font-mono text-xs text-green-400 border border-green-900 max-h-40 overflow-y-auto">
                            <p className="text-gray-500 mb-2">Debug Logs (Share this if upload fails):</p>
                            {logs.length === 0 && <p className="text-gray-600 italic">Ready to log...</p>}
                            {logs.map((log, i) => <div key={i}>{log}</div>)}
                        </div>
                    )}
                </div>

                <Toaster position="bottom-right" />

                <form onSubmit={handleUpload} className="space-y-8">
                    {/* Metadata Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Track Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                                    placeholder="e.g. Blinding Lights"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Artist Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                                    placeholder="e.g. The Weeknd"
                                    value={formData.artist}
                                    onChange={e => setFormData({ ...formData, artist: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm font-bold mb-2">Category</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none transition-colors"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                >
                                    <option className="text-black" value="Pop">Pop</option>
                                    <option className="text-black" value="Rock">Rock</option>
                                    <option className="text-black" value="HipHop">Hip Hop</option>
                                    <option className="text-black" value="Electronic">Electronic</option>
                                    <option className="text-black" value="R&B">R&B</option>
                                    <option className="text-black" value="Jazz">Jazz</option>
                                    <option className="text-black" value="Classical">Classical</option>
                                    <option className="text-black" value="Country">Country</option>
                                    <option className="text-black" value="Metal">Metal</option>
                                    <option className="text-black" value="Folk">Folk</option>
                                    <option className="text-black" value="Blues">Blues</option>
                                    <option className="text-black" value="Reggae">Reggae</option>
                                    <option className="text-black" value="Latin">Latin</option>
                                    <option className="text-black" value="Indie">Indie</option>
                                    <option className="text-black" value="K-Pop">K-Pop</option>
                                </select>
                            </div>
                        </div>

                        {/* File Drop Section */}
                        <div className="space-y-4">
                            {/* Audio File */}
                            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-green-500 transition-colors bg-white/5 cursor-pointer relative">
                                <input
                                    type="file"
                                    accept="audio/*"
                                    required
                                    onChange={e => handleFileChange(e, 'audio')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="bg-green-500/10 p-4 rounded-full mb-3">
                                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                                </div>
                                <p className="font-bold text-white mb-1">
                                    {files.audio ? files.audio.name : "Drop Audio File Here"}
                                </p>
                                <p className="text-xs text-gray-400">MP3, WAV (Max 10MB)</p>
                            </div>

                            {/* Image File */}
                            <div className="border-2 border-dashed border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors bg-white/5 cursor-pointer relative overflow-hidden group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    required
                                    onChange={e => handleFileChange(e, 'image')}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {previewUrl ? (
                                    <div className="absolute inset-0">
                                        <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none group-hover:bg-black/40 transition-colors">
                                            <p className="text-white font-bold text-shadow">Change Cover</p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-blue-500/10 p-4 rounded-full mb-3">
                                            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        </div>
                                        <p className="font-bold text-white mb-1">
                                            {files.image ? files.image.name : "Drop Cover Art Here"}
                                        </p>
                                        <p className="text-xs text-gray-400">JPG, PNG (Max 2MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    {uploading && (
                        <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-green-500 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={uploading}
                        className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 ${uploading ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-green-500 to-green-600 hover:scale-[1.02] active:scale-[0.98] transition-all text-white'}`}
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Uploading... {progress}%
                            </>
                        ) : (
                            <>
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                                Upload Track
                            </>
                        )}
                    </button>
                </form>
            </div>
        </Layout>
    );
};

export default AdminUpload;
