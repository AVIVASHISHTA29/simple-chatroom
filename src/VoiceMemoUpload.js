import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { db, storage } from './firebase';

function VoiceMemoUpload({ userName }) {
    const [recording, setRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);

    const startRecording = async () => {
        if (!navigator.mediaDevices.getUserMedia) {
            alert('Your browser does not support recording audio.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.addEventListener('dataavailable', (event) => {
                chunks.push(event.data);
            });

            recorder.addEventListener('stop', async () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                const storageRef = ref(storage, `voice-memos/${Date.now()}.wav`);
                await uploadBytes(storageRef, blob).then(async () => {
                    const url = await getDownloadURL(storageRef);
                    await addDoc(collection(db, 'voice-memos'), {
                        userName,
                        url,
                        timestamp: new Date(),
                    });
                }).catch(error => {
                    console.error('Error uploading voice memo:', error);
                });
            });

            recorder.start();
            setMediaRecorder(recorder);
            setRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    };

    const stopRecording = () => {
        if (mediaRecorder && recording) {
            mediaRecorder.stop();
            setRecording(false);
        }
    };

    return (
        <div className="voice-memo-upload-container">
            {!recording ? (
                <button onClick={startRecording} className="start-recording-button">Start Recording</button>
            ) : (
                <>
                    <p>Recording...</p>
                    <button onClick={stopRecording} className="stop-recording-button">Stop Recording</button>
                </>
            )}
        </div>
    );
}

export default VoiceMemoUpload;
