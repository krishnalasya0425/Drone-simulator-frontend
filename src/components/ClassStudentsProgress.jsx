import React, { useState, useEffect } from 'react';
import { FaBook, FaImage, FaVideo, FaChartBar } from 'react-icons/fa';
import ProgressBar from './ProgressBar';
import { useAllStudentsProgress } from '../hooks/useProgress';

const ClassStudentsProgress = ({ classId, className }) => {
    const { studentsProgress, loading, refreshStudentsProgress } = useAllStudentsProgress(classId);
    const [sortBy, setSortBy] = useState('overall'); // overall, name, completed

    // Sort students
    const sortedStudents = [...studentsProgress].sort((a, b) => {
        switch (sortBy) {
            case 'name':
                return a.student_name.localeCompare(b.student_name);
            case 'completed':
                return b.completed_documents - a.completed_documents;
            case 'overall':
            default:
                return parseFloat(b.overall_completion_percentage) - parseFloat(a.overall_completion_percentage);
        }
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (studentsProgress.length === 0) {
        return (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
                <FaChartBar className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500">No student progress data available yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                    Progress will appear once students start viewing class materials.
                </p>
            </div>
        );
    }

    // Calculate class statistics
    const avgProgress = studentsProgress.length > 0
        ? studentsProgress.reduce((sum, s) => sum + parseFloat(s.overall_completion_percentage), 0) / studentsProgress.length
        : 0;

    const totalCompleted = studentsProgress.filter(s => parseFloat(s.overall_completion_percentage) >= 100).length;

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border-2 border-green-200">
                <h2 className="text-2xl font-bold mb-4" style={{ color: '#074F06' }}>
                    {className} - Student Progress
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Average Progress</p>
                        <p className="text-3xl font-bold" style={{ color: '#074F06' }}>
                            {avgProgress.toFixed(1)}%
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Total Students</p>
                        <p className="text-3xl font-bold text-gray-800">
                            {studentsProgress.length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600 mb-1">Completed</p>
                        <p className="text-3xl font-bold text-green-600">
                            {totalCompleted}
                        </p>
                    </div>
                </div>
            </div>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Sort by:</span>
                <button
                    onClick={() => setSortBy('overall')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${sortBy === 'overall'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Progress
                </button>
                <button
                    onClick={() => setSortBy('name')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${sortBy === 'name'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Name
                </button>
                <button
                    onClick={() => setSortBy('completed')}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${sortBy === 'completed'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    Completed
                </button>
            </div>

            {/* Students Progress Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b-2 border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Army ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Overall Progress
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <FaBook className="inline mr-1" /> PDFs
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <FaImage className="inline mr-1" /> Images
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    <FaVideo className="inline mr-1" /> Videos
                                </th>
                                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Completed
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {sortedStudents.map((student) => (
                                <tr key={student.student_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="font-medium text-gray-900">{student.student_name}</div>
                                        <div className="text-sm text-gray-500">{student.batch_no}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {student.army_id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-48">
                                            <ProgressBar
                                                percentage={parseFloat(student.overall_completion_percentage)}
                                                height="h-2"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {parseFloat(student.pdf_completion_percentage).toFixed(0)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {parseFloat(student.image_completion_percentage).toFixed(0)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-semibold text-gray-700">
                                            {parseFloat(student.video_completion_percentage).toFixed(0)}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm font-medium text-gray-700">
                                            {student.completed_documents}/{student.total_documents}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ClassStudentsProgress;
