const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME;

exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(req.file.originalname);
    const blobName = `file-${uniqueSuffix}${ext}`;

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(req.file.buffer, {
      blobHTTPHeaders: { blobContentType: req.file.mimetype }
    });

    const fileUrl = blockBlobClient.url; 

    res.json({
  success: true,
  filePath: fileUrl,       
  blobName: blobName,      
  file: {
    filename: blobName,
    originalName: req.file.originalname,
    size: req.file.size
    }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};