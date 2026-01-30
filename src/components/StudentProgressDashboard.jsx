import React, { useState, useEffect } from 'react';
import { FaBook, FaImage, FaVideo, FaCheckCircle } from 'react-icons/fa';
import ProgressBar from './ProgressBar';
import progressAPI from '../entities/progress';

const StudentProgressDashboard = ({ studentId }) => {
    const [classesProgress, setClassesProgress] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentProgress();
    }, [studentId]);

    const fetchStudentProgress = async () => {
        if (!studentId) return;

        setLoading(true);
        try {
            const response = await progressAPI.getStudentAllClassesProgress(studentId);
            if (response.data.success) {
                setClassesProgress(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching student progress:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (classesProgress.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No progress data available yet.</p>
                <p className="text-sm text-gray-400 mt-2">Start viewing class materials to track your progress!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#074F06' }}>
                My Learning Progress
            </h2>

            {classesProgress.map((classProgress) => (
                <div
                    key={classProgress.class_id}
                    className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-100 hover:border-green-200 transition-all"
                >
                    {/* Class Header */}
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">
                            {classProgress.class_name}
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                                {classProgress.completed_documents}/{classProgress.total_documents} completed
                            </span>
                            {classProgress.overall_completion_percentage >= 100 && (
                                <FaCheckCircle className="text-green-600" size={20} />
                            )}
                        </div>
                    </div>

                    {/* Overall Progress */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
                            <span className="text-lg font-bold" style={{ color: '#074F06' }}>
                                {parseFloat(classProgress.overall_completion_percentage).toFixed(1)}%
                            </span>
                        </div>
                        <ProgressBar
                            percentage={parseFloat(classProgress.overall_completion_percentage)}
                            showLabel={false}
                            height="h-3"
                        />
                    </div>

                    {/* Progress by Type */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        {/* PDF Progress */}
                        {parseFloat(classProgress.pdf_completion_percentage) > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaBook className="text-red-600" size={16} />
                                    <span className="text-sm font-semibold text-gray-700">PDFs</span>
                                </div>
                                <ProgressBar
                                    percentage={parseFloat(classProgress.pdf_completion_percentage)}
                                    height="h-2"
                                />
                            </div>
                        )}

                        {/* Image Progress */}
                        {parseFloat(classProgress.image_completion_percentage) > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaImage className="text-blue-600" size={16} />
                                    <span className="text-sm font-semibold text-gray-700">Images</span>
                                </div>
                                <ProgressBar
                                    percentage={parseFloat(classProgress.image_completion_percentage)}
                                    height="h-2"
                                />
                            </div>
                        )}

                        {/* Video Progress */}
                        {parseFloat(classProgress.video_completion_percentage) > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <FaVideo className="text-purple-600" size={16} />
                                    <span className="text-sm font-semibold text-gray-700">Videos</span>
                                </div>
                                <ProgressBar
                                    percentage={parseFloat(classProgress.video_completion_percentage)}
                                    height="h-2"
                                />
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StudentProgressDashboard;
