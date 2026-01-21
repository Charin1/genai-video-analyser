import React, { useState, useRef } from 'react';
import { API_BASE_URL } from '../config';

const AudioRecorder = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [status, setStatus] = useState('');
    const mediaRecorderRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];

            mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/mp3' });
                setAudioBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setStatus('Recording...');
        } catch (err) {
            console.error(err);
            setStatus('Microphone access denied.');
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setStatus('Recording stopped.');
    };

    const uploadAudio = async () => {
        if (!audioBlob) return;
        setStatus('Uploading & Processing...');

        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.mp3');

        try {
            const res = await fetch(`${API_BASE_URL}/api/v1/audio/upload`, {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            setStatus('Processed! Check Dashboard for results.');
            console.log(data);
        } catch (e) {
            setStatus('Upload failed.');
        }
    };

    return (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Voice Recorder</h3>

            <div className="flex gap-4 items-center">
                {!isRecording ? (
                    <button
                        onClick={startRecording}
                        className="bg-red-500 hover:bg-red-400 text-white px-4 py-2 rounded-full flex items-center gap-2"
                    >
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                        Record
                    </button>
                ) : (
                    <button
                        onClick={stopRecording}
                        className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-full"
                    >
                        Stop
                    </button>
                )}

                {audioBlob && !isRecording && (
                    <button
                        onClick={uploadAudio}
                        className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg"
                    >
                        Process Audio
                    </button>
                )}
            </div>

            <p className="mt-2 text-gray-400 text-sm">{status}</p>
        </div>
    );
};

export default AudioRecorder;
