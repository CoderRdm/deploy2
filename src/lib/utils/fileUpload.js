// src/lib/utils/fileUpload.js
import path from 'path';
import fs from 'fs/promises';

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

export const validateFile = (file, type = 'resume') => {
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
    const fileExtension = path.extname(file.name).toLowerCase();
    if (!config.extensions.includes(fileExtension)) {
        throw new FileUploadError(
            `Invalid file extension. Allowed extensions: ${config.extensions.join(', ')}`,
            'INVALID_EXTENSION'
        );
    }

    return true;
};

export const generateFileName = (originalName, studentId, type = 'resume') => {
    const timestamp = Date.now();
    const extension = path.extname(originalName);
    const sanitizedName = originalName
        .replace(extension, '')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 20);
    
    return `${type}_${studentId}_${sanitizedName}_${timestamp}${extension}`;
};

export const ensureUploadDirectory = async (dirPath) => {
    try {
        await fs.access(dirPath);
    } catch (error) {
        // Directory doesn't exist, create it
        await fs.mkdir(dirPath, { recursive: true });
    }
};

export const saveFile = async (file, fileName, uploadDir) => {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await ensureUploadDirectory(uploadDir);
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    
    return filePath;
};

export const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

export const getFileUrl = (fileName, type = 'resume') => {
    return `/api/files/${type}/${fileName}`;
};

export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
