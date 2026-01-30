
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../entities/axios";
import { classAPI } from "../../entities/class";
import testAPI from "../../entities/test";
import {
    FiUser,
    FiBook,
    FiFileText,
    FiArrowLeft,
    FiArrowRight,
    FiAward,
    FiHash,
    FiMapPin,
    FiShield,
    FiDownload,
    FiCheckCircle
} from "react-icons/fi";
import { FaBook, FaImage, FaVideo } from 'react-icons/fa';
import progressAPI from "../../entities/progress";
import ProgressBar from "../../components/ProgressBar";

const StudentDetails = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [classes, setClasses] = useState([]);
    const [classesProgress, setClassesProgress] = useState([]);
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStudentData();
    }, [studentId]);

    const fetchStudentData = async () => {
        try {
            setLoading(true);
            // 1. Fetch student basic info
            let userData = null;
            try {
                const userRes = await api.get(`/users/${studentId}`);
                userData = userRes.data;
            } catch (e) {
                console.warn("Individual user fetch failed, trying collection fetch...");
            }

            // If specific fetch is missing detailed fields, try fetching from the dashboard collection 
            // which we know has the full details (army_id, batch_no, regiment)
            if (!userData || !userData.army_id) {
                const allStudentsRes = await api.get(`/otp/admin-dashboard?role=student`);
                const foundStudent = (allStudentsRes.data || []).find(s => String(s.id) === String(studentId));
                if (foundStudent) {
                    userData = { ...userData, ...foundStudent };
                }
            }

            setStudent(userData);

            // 2. Fetch classes
            const classesData = await classAPI.getAllClasses(studentId, "Student");

            // FILTER FOR INSTRUCTOR: If logged in as Instructor, only show classes assigned to them
            const currentRole = localStorage.getItem("role");
            const currentUserId = localStorage.getItem("id");
            let filteredClasses = classesData || [];
            if (currentRole === "Instructor" && currentUserId) {
                filteredClasses = filteredClasses.filter(cls => String(cls.instructor_id) === String(currentUserId));
            }
            setClasses(filteredClasses);

            // 3. Fetch tests & scores
            const testsData = await testAPI.getAllTests(studentId, "Student");

            // FILTER FOR INSTRUCTOR: Only show tests from their classes
            let filteredTests = testsData || [];
            if (currentRole === "Instructor" && currentUserId) {
                filteredTests = filteredTests.filter(t => String(t.instructor_id) === String(currentUserId));
            }
            setTests(filteredTests);

            // 4. Fetch classes progress
            const progressRes = await progressAPI.getStudentAllClassesProgress(studentId);
            if (progressRes.data.success) {
                let progressData = progressRes.data.data || [];
                // FILTER PROGRESS: If Instructor, only show progress for classes they own
                if (currentRole === "Instructor" && currentUserId) {
                    progressData = progressData.filter(p => filteredClasses.some(cls => cls.id === p.class_id));
                }
                setClassesProgress(progressData);
            }

        } catch (err) {
            console.error("Error fetching student details:", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#074F06]"></div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-green-50">
                <p className="text-xl font-bold text-gray-700 mb-4">Student not found</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#074F06] text-white rounded-lg"
                >
                    <FiArrowLeft /> Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f0fdf4] pb-12">
            {/* Top Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-green-50 rounded-full transition-colors text-gray-600"
                        >
                            <FiArrowLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-[#074F06]">Student Profile</h1>
                            <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Management Console</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/users/download-profile/${studentId}`, "_blank")}
                            className="flex items-center gap-2 px-4 py-2 bg-[#074F06] text-white rounded-lg font-bold shadow-md hover:bg-[#053d05] transition-all transform hover:scale-105 active:scale-95"
                        >
                            <FiDownload size={18} />
                            Download Profile PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-8 mt-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT COLUMN: Profile Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="h-24 bg-[#074F06] relative">
                                <div className="absolute -bottom-10 left-8">
                                    <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center border-4 border-white">
                                        <FiUser size={40} className="text-[#074F06]" />
                                    </div>
                                </div>
                            </div>
                            <div className="pt-14 pb-8 px-8">
                                <h2 className="text-2xl font-bold text-gray-900">{student.name}</h2>
                                <p className="text-gray-500 font-medium">Army ID: {student.army_id || student.armyId || "N/A"}</p>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="p-2 bg-green-50 rounded-lg text-[#074F06]">
                                            <FiShield size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Regiment</p>
                                            <p className="font-semibold">{student.regiment || "N/A"}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 text-gray-600">
                                        <div className="p-2 bg-green-50 rounded-lg text-[#074F06]">
                                            <FiHash size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-gray-400">Batch Number</p>
                                            <p className="font-semibold">{student.batch_no || student.batchNo || student.batch || "N/A"}</p>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                        {/* Performance Stats Bagde */}
                        <div className="bg-[#D5F2D5] rounded-2xl p-6 border-2 border-[#074F06] border-opacity-20 shadow-md">
                            <h3 className="text-[#074F06] font-bold mb-4 flex items-center gap-2">
                                <FiAward /> Quick Stats
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white bg-opacity-50 p-3 rounded-xl border border-white">
                                    <p className="text-[10px] uppercase font-bold text-gray-500">Tests Completed</p>
                                    <p className="text-xl font-bold text-[#074F06]">
                                        {tests.filter(t => t.score !== null).length} / {tests.length}
                                    </p>
                                </div>
                                <div className="bg-white bg-opacity-50 p-3 rounded-xl border border-white">
                                    <p className="text-[10px] uppercase font-bold text-gray-500">Classes</p>
                                    <p className="text-xl font-bold text-[#074F06]">{classes.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Classes & Tests */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* CLASSES SECTION */}
                        <section>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FiBook className="text-[#074F06]" /> Enrolled Classes
                                </h3>
                                <span className="bg-[#074F06] text-white text-xs font-bold px-2 py-1 rounded">
                                    {classes.length}
                                </span>
                            </div>

                            {classes.length === 0 ? (
                                <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-gray-300">
                                    <p className="text-gray-400 font-medium">No classes assigned yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {classes.map((cls) => {
                                        const progress = classesProgress.find(p => p.class_id === cls.id);
                                        return (
                                            <div key={cls.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group cursor-pointer"
                                                onClick={() => navigate(`/${cls.id}/docs`)}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <h4 className="font-bold text-lg text-gray-800 group-hover:text-[#074F06] transition-colors">{cls.class_name}</h4>
                                                        {progress && (
                                                            <p className="text-[10px] font-semibold text-gray-400">
                                                                {progress.completed_documents}/{progress.total_documents} items completed
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="p-2 bg-green-50 rounded-lg text-[#074F06] group-hover:bg-[#074F06] group-hover:text-white transition-all">
                                                        <FiArrowRight size={18} />
                                                    </div>
                                                </div>

                                                {/* Progress Section */}
                                                {progress && (
                                                    <div className="mt-4 pt-3 border-t border-gray-50">
                                                        <div className="flex items-center justify-between mb-1.5">
                                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">Learning Progress</span>
                                                            <span className="text-xs font-bold text-[#074F06]">
                                                                {parseFloat(progress.overall_completion_percentage || 0).toFixed(0)}%
                                                            </span>
                                                        </div>
                                                        <ProgressBar
                                                            percentage={parseFloat(progress.overall_completion_percentage || 0)}
                                                            showLabel={false}
                                                            height="h-1.5"
                                                        />

                                                        {/* Detailed micro-stats */}
                                                        <div className="flex items-center gap-3 mt-3 opacity-80">
                                                            <div className="flex items-center gap-1.5">
                                                                <FaBook size={10} className="text-red-500" />
                                                                <span className="text-[10px] font-bold text-gray-600">{Math.round(progress.pdf_completion_percentage)}%</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <FaImage size={10} className="text-blue-500" />
                                                                <span className="text-[10px] font-bold text-gray-600">{Math.round(progress.image_completion_percentage)}%</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <FaVideo size={10} className="text-purple-500" />
                                                                <span className="text-[10px] font-bold text-gray-600">{Math.round(progress.video_completion_percentage)}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                        {/* TESTS SECTION */}
                        <section>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FiFileText className="text-[#074F06]" /> Attempted Tests
                                </h3>
                                <span className="bg-[#074F06] text-white text-xs font-bold px-2 py-1 rounded">
                                    {tests.filter(t => t.score !== null).length}
                                </span>
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-[#074F06] text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Test Name</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center">Score</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {tests.map((t) => {
                                            const attempted = t.score !== null;
                                            return (
                                                <tr key={t.id} className="hover:bg-green-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-gray-800">{t.title || t.test_title}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase">{t.exam_type || 'STANDARD'}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {attempted ? (
                                                            <span className="text-[10px] font-black uppercase tracking-tighter text-green-600 bg-green-100 px-2 py-0.5 rounded">Completed</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Not Attempted</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {attempted ? (
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-lg font-black text-[#074F06]">{t.score} <span className="text-gray-300 text-xs">/ {t.total_questions}</span></span>
                                                                <div className="w-16 bg-gray-100 h-1.5 rounded-full mt-1">
                                                                    <div
                                                                        className="bg-[#074F06] h-full rounded-full"
                                                                        style={{ width: `${(t.score / t.total_questions) * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-gray-300 font-bold">--</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {attempted && (
                                                            <button
                                                                onClick={() => navigate(`/review/${t.test_set_id}/${studentId}`)}
                                                                className="px-3 py-1.5 rounded-lg bg-[#D5F2D5] text-[#074F06] text-xs font-bold hover:bg-[#074F06] hover:text-white transition-all shadow-sm"
                                                            >
                                                                View Review
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {tests.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-medium">
                                                    No test history found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
