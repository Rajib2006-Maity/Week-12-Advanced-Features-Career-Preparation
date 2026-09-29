import React, { useState } from 'react';
import api from '../api/api.js';

const MAX_SIZE_MB = 50;

// Handles picking a file, uploading it to the backend (which forwards to
// Cloudinary), and reporting the resulting media URL back to the parent form.
const UploadForm = ({ onUploaded }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError('');

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File is too large. Max size is ${MAX_SIZE_MB}MB.`);
      return;
    }

    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append('media', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onUploaded({ mediaUrl: data.mediaUrl, mediaType: data.mediaType, mediaPublicId: data.mediaPublicId });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-form">
      <input type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={uploading} />
      {uploading && <p className="upload-form__status">Uploading…</p>}
      {error && <p className="upload-form__error">{error}</p>}
      {preview && !uploading && <img src={preview} alt="Preview" className="upload-form__preview" />}
    </div>
  );
};

export default UploadForm;
