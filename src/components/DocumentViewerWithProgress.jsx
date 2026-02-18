import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight, FaSpinner } from 'react-icons/fa';
import { useDocumentProgress } from '../hooks/useProgress';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

const DocumentViewerWithProgress = ({ doc, classId, studentId, onClose }) => {
    // Set up PDF.js worker using Vite's URL import
    useEffect(() => {
        pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(doc.total_pages || 0);
    const [viewedPages, setViewedPages] = useState(new Set([1]));
    const [viewStartTime, setViewStartTime] = useState(null);
    const [pdf, setPdf] = useState(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const progressUpdateInterval = useRef(null);

    const fileType = doc.file_type.toLowerCase();
    const isPDF = fileType.includes('pdf');
    const isImage = fileType.includes('image');
    const isVideo = fileType.includes('video');

    const {
        trackPDFProgress,
        trackImageProgress,
        trackVideoProgress
    } = useDocumentProgress(studentId, doc.id, classId, fileType);

    const token = localStorage.getItem("token");
    const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const fileURL = doc.file_url || `${BASE_URL}/classes/docs/file/${doc.id}${token ? `?token=${token}` : ''}`;

    // Load PDF using PDF.js
    useEffect(() => {
        if (isPDF) {
            setPdfLoading(true);
            const loadPdf = async () => {
                try {
                    const response = await fetch(fileURL);
                    const blob = await response.blob();
                    const arrayBuffer = await blob.arrayBuffer();
                    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdfDoc = await loadingTask.promise;
                    setPdf(pdfDoc);
                    setTotalPages(pdfDoc.numPages);
                } catch (error) {
                    console.error('Error loading PDF:', error);
                } finally {
                    setPdfLoading(false);
                }
            };
            loadPdf();
        }
    }, [isPDF, fileURL]);

    // Initialize view tracking
    useEffect(() => {
        setViewStartTime(Date.now());

        if (isPDF && totalPages > 0) {
            trackPDFProgress(viewedPages.size, totalPages);
        }

        return () => {
            if (progressUpdateInterval.current) {
                clearInterval(progressUpdateInterval.current);
            }
        };
    }, [isPDF, totalPages, trackPDFProgress]);

    // Intersection Observer to track scrolling
    useEffect(() => {
        if (!isPDF || !pdf || !containerRef.current) return;

        const options = {
            root: containerRef.current,
            rootMargin: '0px',
            threshold: 0.5
        };

        const callback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const pageNum = parseInt(entry.target.dataset.pagenum);
                    if (pageNum) {
                        setCurrentPage(pageNum);

                        setViewedPages(prev => {
                            if (prev.has(pageNum)) return prev;
                            const next = new Set(prev);
                            next.add(pageNum);
                            // Only track progress if the size actually changed
                            setTimeout(() => trackPDFProgress(next.size, totalPages), 0);
                            return next;
                        });
                    }
                }
            });
        };

        const observer = new IntersectionObserver(callback, options);

        // We'll observe the page containers inside current component
        const pageElements = containerRef.current.querySelectorAll('.pdf-page-container');
        pageElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [isPDF, pdf, totalPages, trackPDFProgress]);

    // Track image viewing time
    useEffect(() => {
        if (isImage && viewStartTime) {
            trackImageProgress(1);
            const interval = setInterval(() => {
                const viewDuration = Math.floor((Date.now() - viewStartTime) / 1000);
                trackImageProgress(viewDuration);
            }, 5000);
            progressUpdateInterval.current = interval;
            return () => clearInterval(interval);
        }
    }, [isImage, viewStartTime, trackImageProgress]);

    const handleVideoTimeUpdate = () => {
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            if (duration && !isNaN(duration)) {
                trackVideoProgress(currentTime, duration);
            }
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            containerRef.current.querySelector(`[data-pagenum="${prevPage}"]`)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            const nextPage = currentPage + 1;
            containerRef.current.querySelector(`[data-pagenum="${nextPage}"]`)?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-[100] flex items-center justify-center backdrop-blur-sm p-4">
            <button
                onClick={onClose}
                className="fixed top-6 right-6 bg-red-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-2xl hover:bg-red-700 transition-all z-[110] hover:scale-110 active:scale-95"
            >
                <FaTimes size={20} />
            </button>

            <div className="w-full h-full flex items-center justify-center relative">
                {isPDF && (
                    <div className="w-full h-full flex flex-col items-center bg-[#1a1a1a] relative">
                        {pdfLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-50 bg-[#1a1a1a]">
                                <FaSpinner className="animate-spin text-green-500" size={40} />
                            </div>
                        )}

                        <div
                            ref={containerRef}
                            className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center p-4 gap-8 scroll-smooth"
                        >
                            {pdf && Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                <PdfPage
                                    key={pageNum}
                                    pdf={pdf}
                                    pageNum={pageNum}
                                    containerRef={containerRef}
                                />
                            ))}
                        </div>

                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/90 backdrop-blur-xl px-8 py-4 rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110]">
                            <button
                                onClick={goToPreviousPage}
                                disabled={currentPage <= 1}
                                className="p-2 hover:bg-white/10 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed text-white hover:scale-110 active:scale-95"
                            >
                                <FaChevronLeft size={24} />
                            </button>

                            <div className="flex flex-col items-center min-w-[140px]">
                                <span className="text-white font-black text-lg tracking-tight">
                                    Page {currentPage} <span className="text-white/40 font-normal mx-1">/</span> {totalPages}
                                </span>
                                <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-500"
                                        style={{ width: `${totalPages > 0 ? Math.round((viewedPages.size / totalPages) * 100) : 0}%` }}
                                    ></div>
                                </div>
                                <span className="text-[11px] text-green-400 font-bold mt-1 uppercase tracking-widest">
                                    {totalPages > 0 ? Math.round((viewedPages.size / totalPages) * 100) : 0}% Completed
                                </span>
                            </div>

                            <button
                                onClick={goToNextPage}
                                disabled={currentPage >= totalPages}
                                className="p-2 hover:bg-white/10 rounded-full transition-all disabled:opacity-20 disabled:cursor-not-allowed text-white hover:scale-110 active:scale-95"
                            >
                                <FaChevronRight size={24} />
                            </button>
                        </div>
                    </div>
                )}

                {isImage && (
                    <div className="max-w-full max-h-full p-4 overflow-auto flex flex-col items-center gap-4">
                        <img
                            src={fileURL}
                            alt={doc.doc_title}
                            className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl border border-white/10"
                        />
                    </div>
                )}

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

const PdfPage = ({ pdf, pageNum, containerRef }) => {
    const canvasRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { root: containerRef.current, rootMargin: '400px' }
        );
        if (canvasRef.current?.parentElement) {
            observer.observe(canvasRef.current.parentElement);
        }
        return () => observer.disconnect();
    }, [containerRef]);

    useEffect(() => {
        if (!isVisible || !pdf) return;
        let renderTask = null;
        const renderPage = async () => {
            try {
                const page = await pdf.getPage(pageNum);
                const viewport = page.getViewport({ scale: 1.5 });
                const canvas = canvasRef.current;
                if (!canvas) return;
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                renderTask = page.render({ canvasContext: context, viewport: viewport });
                await renderTask.promise;
            } catch (error) {
                if (error.name !== 'RenderingCancelledException') {
                    console.error('Error rendering page:', error);
                }
            }
        };
        renderPage();
        return () => {
            if (renderTask) renderTask.cancel();
        };
    }, [isVisible, pdf, pageNum]);

    return (
        <div
            className="pdf-page-container bg-white shadow-2xl mb-4 transition-opacity duration-500 overflow-hidden rounded-lg border border-white/10"
            data-pagenum={pageNum}
            style={{ minHeight: '800px', width: 'fit-content' }}
        >
            <canvas ref={canvasRef} className="max-w-full h-auto" />
            {!isVisible && (
                <div className="w-full h-[800px] flex items-center justify-center bg-zinc-900 text-white/20">
                    <FaSpinner className="animate-spin mr-2" /> Loading Page {pageNum}...
                </div>
            )}
        </div>
    );
};

export default DocumentViewerWithProgress;
