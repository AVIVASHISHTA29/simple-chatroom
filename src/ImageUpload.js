import { getDownloadURL, listAll, ref, uploadBytes } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { storage } from './firebase';

function ImageUpload() {
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState([]);

    useEffect(() => {
        const fetchImages = async () => {
            try {
                const storageRef = ref(storage, 'images');
                const imageList = await listAll(storageRef);
                const urls = await Promise.all(imageList.items.map((item) => getDownloadURL(item)));
                setImages(urls);
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
            setImageUrl(url);
            setUploading(false);
        }
    };

    return (
        <div className="image-upload">
            <input type="file" onChange={handleChange} />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
            {imageUrl && (
                <div className="uploaded-image">
                    <img src={imageUrl} alt="Uploaded" />
                </div>
            )}
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
