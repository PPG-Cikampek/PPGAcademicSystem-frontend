import React from 'react';

const ModalFooter = ({ onClose, onConfirm }) => (
  <div className="flex gap-2 items-center">
    <button
      onClick={onClose}
      className={`${onConfirm ? 'btn-danger-outline' : 'button-primary mt-0'}`}
    >
      {onConfirm ? 'Batal' : 'Tutup'}
    </button>
    {onConfirm && (
      <button onClick={onConfirm} className="button-primary mt-0">
        Ya
      </button>
    )}
  </div>
);

export default ModalFooter;
