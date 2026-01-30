import { useState, useEffect, useCallback } from 'react';
import progressAPI from '../entities/progress';

/**
 * Hook for tracking document progress
 * @param {number} studentId - Student ID
 * @param {number} docId - Document ID
 * @param {number} classId - Class ID
 * @param {string} docType - Document type ('pdf', 'image', 'video')
 */
export const useDocumentProgress = (studentId, docId, classId, docType) => {
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch existing progress
    const fetchProgress = useCallback(async () => {
        if (!studentId || !docId) return;

        try {
            const response = await progressAPI.getDocumentProgress(studentId, docId);
            if (response.data.success) {
                setProgress(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
        }
    }, [studentId, docId]);

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    // Update progress
    const updateProgress = useCallback(async (progressData) => {
        if (!studentId || !docId || !classId) return;

        setLoading(true);
        try {
            await progressAPI.updateDocumentProgress({
                student_id: studentId,
                doc_id: docId,
                class_id: classId,
                ...progressData
            });

            // Refresh progress data
            await fetchProgress();
        } catch (error) {
            console.error('Error updating progress:', error);
        } finally {
            setLoading(false);
        }
    }, [studentId, docId, classId, fetchProgress]);

    // Helper functions for different document types
    const trackPDFProgress = useCallback((currentPage, totalPages) => {
        const completion = (currentPage / totalPages) * 100;
        return updateProgress({
            completion_percentage: completion,
            total_pages: totalPages,
            pages_read: currentPage
        });
    }, [updateProgress]);

    const trackImageProgress = useCallback((viewDurationSeconds) => {
        // Consider image viewed after 10 seconds
        const completion = Math.min(100, (viewDurationSeconds / 10) * 100);
        return updateProgress({
            completion_percentage: completion,
            view_duration_seconds: viewDurationSeconds
        });
    }, [updateProgress]);

    const trackVideoProgress = useCallback((currentTime, duration) => {
        const completion = (currentTime / duration) * 100;
        return updateProgress({
            completion_percentage: completion,
            video_duration_seconds: Math.floor(duration),
            video_watched_seconds: Math.floor(currentTime)
        });
    }, [updateProgress]);

    return {
        progress,
        loading,
        updateProgress,
        trackPDFProgress,
        trackImageProgress,
        trackVideoProgress,
        refreshProgress: fetchProgress
    };
};

/**
 * Hook for fetching class progress
 * @param {number} studentId - Student ID
 * @param {number} classId - Class ID
 */
export const useClassProgress = (studentId, classId) => {
    const [classProgress, setClassProgress] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchClassProgress = useCallback(async () => {
        if (!studentId || !classId) return;

        setLoading(true);
        try {
            const response = await progressAPI.getClassProgress(studentId, classId);
            if (response.data.success) {
                setClassProgress(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching class progress:', error);
        } finally {
            setLoading(false);
        }
    }, [studentId, classId]);

    useEffect(() => {
        fetchClassProgress();
    }, [fetchClassProgress]);

    return {
        classProgress,
        loading,
        refreshClassProgress: fetchClassProgress
    };
};

/**
 * Hook for fetching all students' progress in a class (for instructors/admins)
 * @param {number} classId - Class ID
 */
export const useAllStudentsProgress = (classId) => {
    const [studentsProgress, setStudentsProgress] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAllStudentsProgress = useCallback(async () => {
        if (!classId) return;

        setLoading(true);
        try {
            const response = await progressAPI.getAllStudentsProgress(classId);
            if (response.data.success) {
                setStudentsProgress(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching students progress:', error);
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => {
        fetchAllStudentsProgress();
    }, [fetchAllStudentsProgress]);

    return {
        studentsProgress,
        loading,
        refreshStudentsProgress: fetchAllStudentsProgress
    };
};
