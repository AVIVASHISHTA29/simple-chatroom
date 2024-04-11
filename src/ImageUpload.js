import { addDoc, collection, onSnapshot } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { db, storage } from './firebase';

function ImageUpload() {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const imageCollection = collection(db, 'images');
                const unsubscribe = onSnapshot(imageCollection, (snapshot) => {
                    const urls = snapshot.docs.map((doc) => doc.data().url);
                    setImages(urls);
                });

                return () => unsubscribe();
            } catch (error) {
                console.error('Error fetching images:', error);
            }
        };

        fetchImages();
    }, []);

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
                url,
                timestamp: new Date()
            });
            setUploading(false);
        }
    };

    return (
        <div className="image-upload-container">
            <div className="image-upload">
                <input type="file" onChange={handleChange} />
                <button onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
            </div>
            <div className="image-list">
                {images.map((url, index) => (
                    <div key={index} className="image-item">
                        <img src={url} alt={`Image ${index}`} />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ImageUpload;
