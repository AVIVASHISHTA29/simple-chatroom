import { addDoc, collection } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useState } from 'react';
import { db, storage } from './firebase';

function ImageUpload({ userName }) {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (image) {
            const storageRef = ref(storage, `images/${image.name}`);
            setUploading(true);
            await uploadBytes(storageRef, image);
            const url = await getDownloadURL(storageRef);
            await addDoc(collection(db, 'images'), {
                userName,
                url,
                timestamp: new Date(),
            });
            setUploading(false);
            setImage(null); // Clear the input file once uploaded
        }
    };

    return (
        <div className="image-upload-container">
            <div className="image-upload">
                <input type="file" onChange={handleChange} disabled={uploading} />
                <button onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
            </div>
        </div>
    );
}

export default ImageUpload;
