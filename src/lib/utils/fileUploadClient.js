// src/lib/utils/fileUploadClient.js
// Client-side utilities for file upload components

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const ALLOWED_FILE_TYPES = {
    resume: {
        extensions: ['.pdf', '.doc', '.docx'],
        mimeTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        maxSize: 5 * 1024 * 1024, // 5MB
    },
    profilePicture: {
        extensions: ['.jpg', '.jpeg', '.png'],
        mimeTypes: ['image/jpeg', 'image/png'],
        maxSize: 2 * 1024 * 1024, // 2MB
    }
};

export class FileUploadError extends Error {
    constructor(message, code) {
        super(message);
        this.name = 'FileUploadError';
        this.code = code;
    }
}

export const validateFileClient = (file, type = 'resume') => {
    const config = ALLOWED_FILE_TYPES[type];
    if (!config) {
        throw new FileUploadError('Invalid file type configuration', 'INVALID_TYPE_CONFIG');
    }

    // Check file size
    if (file.size > config.maxSize) {
        throw new FileUploadError(
            `File size too large. Maximum allowed: ${config.maxSize / (1024 * 1024)}MB`,
            'FILE_TOO_LARGE'
        );
    }

    // Check MIME type
    if (!config.mimeTypes.includes(file.type)) {
        throw new FileUploadError(
            `Invalid file type. Allowed types: ${config.extensions.join(', ')}`,
            'INVALID_MIME_TYPE'
        );
    }

    // Check file extension
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!config.extensions.includes(fileExtension)) {
        throw new FileUploadError(
            `Invalid file extension. Allowed extensions: ${config.extensions.join(', ')}`,
            'INVALID_EXTENSION'
        );
    }

    return true;
};
