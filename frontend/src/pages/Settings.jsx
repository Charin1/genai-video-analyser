import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const Settings = () => {
    const [config, setConfig] = useState({ default_model: '', has_groq_key: false, has_google_key: false });
    const [groqKey, setGroqKey] = useState('');
    const [defaultModel, setDefaultModel] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/v1/config/`)
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setDefaultModel(data.default_model);
            });
    }, []);

    const handleSave = async () => {
        setStatus('Saving...');
        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/config/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groq_api_key: groqKey || null,
                    default_model: defaultModel
                })
            });
            const data = await res.json();
            setConfig(data.config);
            setStatus('Saved successfully!');
            setGroqKey(''); // Clear sensitive input
        } catch (e) {
            setStatus('Error saving settings.');
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-[var(--text-main)]">Settings</h1>

            <div className="bg-white/50 backdrop-blur-md rounded-xl p-6 border border-[var(--glass-border)] shadow-sm">
                <h2 className="text-xl font-semibold mb-4 text-[var(--text-main)]">AI Configuration</h2>

                <div className="mb-6">
                    <label className="block text-gray-700 font-medium mb-2">Groq API Key</label>
                    <div className="flex gap-4">
                        <input
                            type="password"
                            placeholder={config.has_groq_key ? "******** (Configured)" : "Enter Groq API Key"}
                            className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-[var(--text-main)] flex-1 focus:outline-none focus:border-[var(--primary-neon)]"
                            value={groqKey}
                            onChange={(e) => setGroqKey(e.target.value)}
                        />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Required for high-speed inference.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Transcription Engine</label>
                        <select
                            value={localStorage.getItem('transcriptionModel') || 'gemini'}
                            onChange={(e) => {
                                localStorage.setItem('transcriptionModel', e.target.value);
                                // Force re-render if needed or just let it be silent
                                setStatus('Saved locally');
                                setTimeout(() => setStatus(''), 2000);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-neon)]"
                        >
                            {config.transcription_models?.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                            {(!config.transcription_models || config.transcription_models.length === 0) && (
                                <>
                                    <option value="gemini">Gemini Pro Vision</option>
                                    <option value="groq">Groq Whisper</option>
                                </>
                            )}
                        </select>
                        <p className="text-sm text-gray-500 mt-1">Engine used for audio-to-text.</p>
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">Analysis Model</label>
                        <select
                            value={localStorage.getItem('analysisModel') || 'openai/gpt-oss-120b'}
                            onChange={(e) => {
                                localStorage.setItem('analysisModel', e.target.value);
                                setStatus('Saved locally');
                                setTimeout(() => setStatus(''), 2000);
                            }}
                            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-[var(--text-main)] focus:outline-none focus:border-[var(--primary-neon)]"
                        >
                            <option value="" disabled>Select Model</option>
                            {config.analysis_models?.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                            {(!config.analysis_models || config.analysis_models.length === 0) && (
                                <option value="openai/gpt-oss-120b">Default (GPT-OSS 120B)</option>
                            )}
                        </select>
                        <p className="text-sm text-gray-500 mt-1">LLM used for report generation.</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                    Save Changes
                </button>

                {status && <p className="mt-4 text-green-400">{status}</p>}
            </div>
        </div>
    );
};

export default Settings;
