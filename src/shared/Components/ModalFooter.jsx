import React from 'react';
import LoadingCircle from './UIElements/LoadingCircle';

const ModalFooter = ({ isLoading, onClose, onConfirm, confirmLabel = 'Ya', closeLabel = 'Tutup', showConfirm = false }) => (
  <div className="flex gap-2 items-center">
    <button
      onClick={onClose}
      className={`${showConfirm ? 'btn-danger-outline' : 'button-primary mt-0 '} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isLoading}
    >
      {isLoading ? <LoadingCircle size={18} /> : null}
      {closeLabel}
    </button>
    {showConfirm && (
      <button onClick={onConfirm} className={`button-primary mt-0 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={isLoading}>
        {isLoading ? <LoadingCircle size={18} /> : null}
        {confirmLabel}
      </button>
    )}
  </div>
);

export default ModalFooter;
