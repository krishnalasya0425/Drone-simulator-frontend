import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useDocumentProgress } from '../hooks/useProgress';

const DocumentViewerWithProgress = ({ doc, classId, studentId, onClose }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewStartTime, setViewStartTime] = useState(null);
    const videoRef = useRef(null);
    const progressUpdateInterval = useRef(null);

    const fileType = doc.file_type.toLowerCase();
    const isPDF = fileType.includes('pdf');
    const isImage = fileType.includes('image');
    const isVideo = fileType.includes('video');

    const {
        progress,
        trackPDFProgress,
        trackImageProgress,
        trackVideoProgress
    } = useDocumentProgress(studentId, doc.id, classId, fileType);

    // Initialize view tracking
    useEffect(() => {
        setViewStartTime(Date.now());

        // Trigger initial progress for PDF and Video so it's not 0%
        if (isPDF) {
            trackPDFProgress(1, totalPages);
        }

        return () => {
            if (progressUpdateInterval.current) {
                clearInterval(progressUpdateInterval.current);
            }
        };
    }, [isPDF, totalPages, trackPDFProgress]);

    // Track image viewing time
    useEffect(() => {
        if (isImage && viewStartTime) {
            // First update immediately
            trackImageProgress(1);

            const interval = setInterval(() => {
                const viewDuration = Math.floor((Date.now() - viewStartTime) / 1000);
                trackImageProgress(viewDuration);
            }, 5000);

            progressUpdateInterval.current = interval;
            return () => clearInterval(interval);
        }
    }, [isImage, viewStartTime, trackImageProgress]);

    // Track video progress
    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;

            if (duration && !isNaN(duration)) {
                trackVideoProgress(currentTime, duration);
            }
        }
    };

    const token = localStorage.getItem("token");
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fileURL = doc.file_url || `${BASE_URL}/classes/docs/file/${doc.id}${token ? `?token=${token}` : ''}`;

    // Track PDF page changes
    const handlePageChange = (newPage) => {
        const pageNum = parseInt(newPage);
        if (pageNum >= 1 && (totalPages === 1 || pageNum <= totalPages)) {
            setCurrentPage(pageNum);
            trackPDFProgress(pageNum, totalPages);
        }
    };

    // PDF Navigation
    const goToPreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        // If we don't know total pages, we just allow going forward
        handlePageChange(currentPage + 1);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
            {/* Floating Close Button */}
            <button
                onClick={onClose}
                className="fixed top-6 right-6 bg-red-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-2xl hover:bg-red-700 transition-all z-[110] hover:scale-110 active:scale-95"
            >
                <FaTimes size={20} />
            </button>

            {/* Content Area */}
            <div className="w-full h-full flex items-center justify-center relative">
                {/* PDF Viewer */}
                {isPDF && (
                    <div className="w-full h-full flex flex-col items-center bg-[#1a1a1a]">
                        <iframe
                            src={`${fileURL}#page=${currentPage}`}
                            className="w-full h-full bg-white border-0 shadow-2xl"
                            title={doc.doc_title}
                            onLoad={(e) => {
                                // PDF total pages is hard to get from iframe, 
                                // so we'll rely on user manual input or assume a large number
                                if (totalPages === 1) setTotalPages(20); // Default or placeholder
                            }}
                        />
                    </div>
                )}

                {/* Image Viewer */}
                {isImage && (
                    <div className="max-w-full max-h-full p-4 overflow-auto flex flex-col items-center gap-4">
                        <img
                            src={fileURL}
                            alt={doc.doc_title}
                            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
                        />

                    </div>
                )}

                {/* Video Player */}
                {isVideo && (
                    <div className="max-w-6xl w-full p-6">
                        <video
                            ref={videoRef}
                            src={fileURL}
                            controls
                            className="w-full rounded-2xl shadow-2xl border border-white/10 bg-black"
                            onTimeUpdate={handleVideoTimeUpdate}
                            onLoadedMetadata={(e) => {
                                if (e.target.duration) {
                                    trackVideoProgress(0, e.target.duration);
                                }
                            }}
                        >
                            Your browser does not support the video tag.
                        </video>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentViewerWithProgress;
