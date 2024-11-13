// useSpeechRecognition.js
import { useState, useEffect } from 'react';

const useSpeechRecognition = () => {
    const [transcript, setTranscript] = useState('');
    const [listening, setListening] = useState(false);

    useEffect(() => {
        if (!('webkitSpeechRecognition' in window)) {
            console.warn('Speech Recognition not supported by this browser');
            return;
        }

        const recognition = new window.webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event) => {
            const transcript = Array.from(event.results)
                .map(result => result[0])
                .map(result => result.transcript)
                .join('');
            setTranscript(transcript);
        };

        recognition.onerror = (event) => {
            console.error(event.error);
            setListening(false);
        };

        recognition.onend = () => {
            setListening(false);
        };

        if (listening) {
            recognition.start();
        } else {
            recognition.stop();
        }

        return () => recognition.stop();
    }, [listening]);

    return { transcript, listening, startListening: () => setListening(true), stopListening: () => setListening(false) };
};

export default useSpeechRecognition;
