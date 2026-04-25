import React, { useRef, useState } from 'react';
import Uppy from '@uppy/core';
import XHRUpload from '@uppy/xhr-upload';
import './FileUploader.css';

const FileUploader = ({ onUploadSuccess, currentFile }) => {
  const uppyInstanceRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFileName, setSelectedFileName] = useState('');

  const getUppyInstance = () => {
    if (!uppyInstanceRef.current) {
      const uppy = new Uppy({
        restrictions: {
          maxNumberOfFiles: 1,
          maxFileSize: 10 * 1024 * 1024,
          allowedFileTypes: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.txt', 'image/*']
        },
        autoProceed: true
      })
      .use(XHRUpload, {
        endpoint: `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/upload`,
        fieldName: 'file',
        formData: true
      })
      .on('upload', () => {
        setUploading(true);
        setUploadProgress(0);
      })
      .on('upload-progress', (file, progress) => {
        setUploadProgress(Math.round((progress.bytesUploaded / progress.bytesTotal) * 100));
      })
      .on('upload-success', (file, response) => {
        setUploading(false);
        setUploadProgress(100);
        setSelectedFileName('');

        if (onUploadSuccess && response.body.filePath) {
          onUploadSuccess(response.body.filePath, response.body.blobName);
        }

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        uppy.cancelAll();
      })
      .on('upload-error', (file, error) => {
        setUploading(false);
        setUploadProgress(0);
        setSelectedFileName('');
        console.error('Upload error:', error);
        alert('Upload failed: ' + (error.message || 'Unknown error'));

        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });

      uppyInstanceRef.current = uppy;
    }
    return uppyInstanceRef.current;
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const uppy = getUppyInstance();

    uppy.cancelAll();

    try {
      uppy.addFile({
        name: file.name,
        type: file.type,
        data: file,
      });
      setSelectedFileName(file.name);
    } catch (error) {
      console.error('Error adding file:', error);
      alert(error.message);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-uploader-container">
      {currentFile && (
        <div className="current-file-display">
          <span className="current-file-checkmark">✓</span>
          <div>
            <strong className="current-file-label">Current file:</strong>
            {/* ✅ Handle both Azure URLs and legacy local paths */}
            <div className="current-file-name">
              {currentFile.startsWith('http')
                ? currentFile.split('/').pop()
                : currentFile.split('/').pop()}
            </div>
          </div>
        </div>
      )}

      <div>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
          className="file-input-hidden"
        />

        <div
          onClick={handleButtonClick}
          className={`drop-zone ${uploading ? 'uploading' : ''}`}
        >
          <div className="drop-zone-icon">📁</div>
          <div className="drop-zone-text">
            {uploading ? 'Uploading...' : selectedFileName || 'Click to browse'}
          </div>
          <div className="drop-zone-subtext">
            PDF, Word, Excel, images up to 10MB
          </div>
        </div>

        {uploading && (
          <div className="upload-progress-container">
            <div className="progress-bar-wrapper">
              <div
                className="progress-bar-fill"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <div className="progress-text">
              Uploading: {uploadProgress}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploader;