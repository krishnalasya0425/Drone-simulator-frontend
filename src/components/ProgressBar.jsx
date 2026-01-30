import React from 'react';

const ProgressBar = ({ percentage, showLabel = true, height = 'h-2', color = '#074F06' }) => {
    const clampedPercentage = Math.min(100, Math.max(0, percentage || 0));

    // Color based on percentage
    const getColor = () => {
        if (clampedPercentage >= 80) return '#074F06'; // Green
        if (clampedPercentage >= 50) return '#F59E0B'; // Orange
        return '#EF4444'; // Red
    };

    const barColor = color === '#074F06' ? getColor() : color;

    return (
        <div className="w-full">
            <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
                <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                        width: `${clampedPercentage}%`,
                        backgroundColor: barColor
                    }}
                />
            </div>
            {showLabel && (
                <div className="flex justify-between items-center mt-1">
                    <span className="text-xs font-medium" style={{ color: barColor }}>
                        {clampedPercentage.toFixed(1)}%
                    </span>
                    {clampedPercentage === 100 && (
                        <span className="text-xs font-semibold text-green-600">✓ Complete</span>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProgressBar;
