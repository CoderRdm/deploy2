// src/components/student/ResumeUploader.jsx
'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
    Upload, 
    File, 
    X, 
    Download, 
    CheckCircle, 
    AlertCircle,
    FileText,
    Trash2,
    Eye
} from 'lucide-react';
import { formatFileSize } from '../../lib/utils/fileUploadClient';
import toast from 'react-hot-toast';

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const ResumeUploader = ({ currentResume, onResumeUpdate }) => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const validateFile = useCallback((file) => {
        setError(null);

        if (!file) {
            setError('Please select a file');
            return false;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            setError('Invalid file type. Please upload a PDF, DOC, or DOCX file');
            return false;
        }

        if (file.size > MAX_SIZE) {
            setError(`File size too large. Maximum allowed: ${formatFileSize(MAX_SIZE)}`);
            return false;
        }

        return true;
    }, []);

    const uploadFile = useCallback(async (file) => {
        if (!validateFile(file)) return;

        setUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/student/upload/resume', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            toast.success('Resume uploaded successfully!');
            onResumeUpdate && onResumeUpdate(data.resume);
            setUploadProgress(100);
            
            // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

        } catch (error) {
            console.error('Upload error:', error);
            setError(error.message);
            toast.error(error.message);
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 2000);
        }
    }, [validateFile, onResumeUpdate]);

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadFile(e.dataTransfer.files[0]);
        }
    }, [uploadFile]);

    const handleChange = useCallback((e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            uploadFile(e.target.files[0]);
        }
    }, [uploadFile]);

    const handleDelete = async () => {
        if (!currentResume || !confirm('Are you sure you want to delete your resume?')) {
            return;
        }

        try {
            const response = await fetch('/api/student/upload/resume', {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Delete failed');
            }

            toast.success('Resume deleted successfully');
            onResumeUpdate && onResumeUpdate(null);

        } catch (error) {
            console.error('Delete error:', error);
            toast.error(error.message);
        }
    };

    const handleView = () => {
        if (currentResume && currentResume.url) {
            window.open(currentResume.url, '_blank');
        }
    };

    const handleDownload = () => {
        if (currentResume && currentResume.url) {
            const link = document.createElement('a');
            link.href = currentResume.url;
            link.download = currentResume.originalName || 'resume';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Resume Management
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {currentResume ? (
                    <div className="space-y-4">
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                <strong>Resume uploaded:</strong> {currentResume.originalName}
                            </AlertDescription>
                        </Alert>

                        <div className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <File className="h-8 w-8 text-blue-600" />
                                    <div>
                                        <p className="font-medium text-sm">{currentResume.originalName}</p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(currentResume.fileSize)} • 
                                            Uploaded {new Date(currentResume.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleView}
                                        className="flex items-center gap-1"
                                    >
                                        <Eye className="h-4 w-4" />
                                        View
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDownload}
                                        className="flex items-center gap-1"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleDelete}
                                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 mb-2">Want to upload a new resume?</p>
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                            >
                                Replace Resume
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                            dragActive 
                                ? 'border-blue-400 bg-blue-50' 
                                : 'border-gray-300 hover:border-gray-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleChange}
                            className="hidden"
                            disabled={uploading}
                        />
                        
                        <div className="space-y-4">
                            <div className="flex justify-center">
                                <Upload className={`h-12 w-12 ${uploading ? 'text-blue-600' : 'text-gray-400'}`} />
                            </div>
                            
                            <div>
                                <p className="text-lg font-medium text-gray-900 mb-1">
                                    {uploading ? 'Uploading...' : 'Upload your resume'}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Drag and drop your file here, or{' '}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        browse
                                    </button>
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Supports PDF, DOC, DOCX up to {formatFileSize(MAX_SIZE)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {uploading && uploadProgress > 0 && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Uploading...</span>
                            <span>{Math.round(uploadProgress)}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Resume Tips:</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Keep your resume updated with recent projects and achievements</li>
                        <li>• Ensure your contact information is current</li>
                        <li>• Use a professional format and font</li>
                        <li>• Highlight relevant skills and experiences for the roles you're applying to</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default ResumeUploader;
