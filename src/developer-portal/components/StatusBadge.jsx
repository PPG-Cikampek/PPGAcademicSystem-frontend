/**
 * StatusBadge Component
 * Reusable badge for consistent status display across Bug Bounty feature
 */

const STATUS_COLORS = {
    pending: 'bg-blue-100 text-blue-800',
    reviewing: 'bg-purple-100 text-purple-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    fixed: 'bg-teal-100 text-teal-800'
};

const STATUS_LABELS = {
    pending: 'Menunggu',
    reviewing: 'Sedang Ditinjau',
    accepted: 'Diterima',
    rejected: 'Ditolak',
    fixed: 'Diperbaiki'
};

const SEVERITY_COLORS = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
};

const SEVERITY_LABELS = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
    critical: 'Kritis'
};

/**
 * @param {Object} props
 * @param {string} props.type - 'status' or 'severity'
 * @param {string} props.value - The status or severity value
 * @param {string} props.className - Additional CSS classes
 */
const StatusBadge = ({ type = 'status', value, className = '' }) => {
    const colors = type === 'severity' ? SEVERITY_COLORS : STATUS_COLORS;
    const labels = type === 'severity' ? SEVERITY_LABELS : STATUS_LABELS;
    
    const normalizedValue = value?.toLowerCase();
    const colorClass = colors[normalizedValue] || 'bg-gray-100 text-gray-800';
    const label = labels[normalizedValue] || value;

    return (
        <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass} ${className}`}
        >
            {label}
        </span>
    );
};

export default StatusBadge;
