import React from "react";

const InfoModal = ({ isOpen, onClose, title, message, type = "info" }) => {
    if (!isOpen) return null;

    const isError = type === "error";
    const isSuccess = type === "success";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Card */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-200">

                {/* Header Bar */}
                <div className={`h-2 w-full ${isError ? 'bg-red-500' : isSuccess ? 'bg-green-500' : 'bg-blue-500'}`}></div>

                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full mb-4 ${isError ? 'bg-red-100 text-red-600' :
                            isSuccess ? 'bg-green-100 text-green-600' :
                                'bg-blue-100 text-blue-600'
                        }`}>
                        {isError && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {isSuccess && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        )}
                        {!isError && !isSuccess && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-6">
                        {message}
                    </p>

                    <button
                        onClick={onClose}
                        className={`w-full py-2.5 px-4 rounded-xl text-white font-medium text-sm transition-transform active:scale-95 ${isError ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/30' :
                                isSuccess ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/30' :
                                    'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                            }`}
                    >
                        Okay, Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;
