import React, { useState } from 'react';
import { Upload, FileVideo, Loader2, Zap, Shield, Cpu } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import config from '../config';

const Home = () => {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const navigate = useNavigate();

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleUpload(files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            handleUpload(e.target.files[0]);
        }
    };

    const handleUpload = async (file) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${config.API_URL}/api/v1/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                timeout: 300000, // 5 minutes timeout for large videos
            });
            navigate('/dashboard', { state: { data: response.data } });
        } catch (error) {
            console.error('Upload failed:', error);

            let errorMessage = 'Upload failed. Please try again.';

            if (error.response) {
                // Server responded with error
                console.error('Server error:', error.response.data);
                errorMessage = `Server error: ${error.response.data.detail || error.response.statusText}`;
            } else if (error.request) {
                // Request made but no response
                console.error('No response from server:', error.request);
                errorMessage = 'No response from server. Please check if the backend is running.';
            } else {
                // Error in request setup
                console.error('Error:', error.message);
                errorMessage = `Error: ${error.message}`;
            }

            alert(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in relative px-4">

            {/* Hero Text */}
            <div className="text-center mb-12 md:mb-16 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary-neon)] animate-pulse"></span>
                    <span className="text-xs font-medium tracking-widest uppercase text-gray-300">Next Gen Analysis Protocol</span>
                </div>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 neon-gradient-text leading-tight">
                    Unlock Video<br />Intelligence
                </h1>
                <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto font-light px-4">
                    Upload your content to the neural core. Our AI extracts insights, sentiment, and actionable data in seconds.
                </p>
            </div>

            {/* Upload Portal */}
            <div className="relative w-full max-w-3xl group">
                {/* Glow effects behind the card */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-[var(--primary-neon)] to-[var(--secondary-neon)] rounded-[26px] blur opacity-20 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${isDragging ? 'opacity-70' : ''}`}></div>

                <div
                    className={`
            relative cyber-card p-8 md:p-16 flex flex-col items-center justify-center cursor-pointer
            transition-all duration-500 bg-[#030014]/90
            ${isDragging ? 'scale-[1.02] border-[var(--primary-neon)]' : ''}
          `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        accept="video/*"
                        onChange={handleFileSelect}
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-[var(--glass-border)] rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-[var(--primary-neon)] rounded-full border-t-transparent animate-spin"></div>
                                <Loader2 className="absolute inset-0 m-auto w-10 h-10 text-[var(--primary-neon)] animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-bold mb-2">Processing Data Stream</h3>
                            <p className="text-[var(--text-muted)]">Decrypting video patterns...</p>
                        </div>
                    ) : (
                        <>
                            <div className={`
                w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8
                border border-white/10 shadow-[0_0_30px_rgba(0,243,255,0.1)]
                group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(0,243,255,0.3)]
                transition-all duration-500
              `}>
                                <Upload className="w-10 h-10 text-[var(--primary-neon)]" />
                            </div>
                            <h3 className="text-3xl font-bold mb-3">Initiate Upload</h3>
                            <p className="text-[var(--text-muted)] mb-8 text-lg">Drag & drop video file or click to browse</p>

                            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                                {[
                                    { icon: FileVideo, label: 'MP4 / MOV' },
                                    { icon: Shield, label: 'Secure' },
                                    { icon: Cpu, label: 'AI Powered' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5">
                                        <item.icon size={18} className="text-gray-400" />
                                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

        </div>
    );
};

export default Home;
