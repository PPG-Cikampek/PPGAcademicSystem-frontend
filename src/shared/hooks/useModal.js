import { useState, useCallback } from 'react';

export default function useModal(initialState = { title: '', message: '', onConfirm: null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modal, setModal] = useState(initialState);

  const openModal = useCallback((modalData = {}) => {
    setModal({ ...initialState, ...modalData });
    setIsOpen(true);
  }, [initialState]);

  const closeModal = useCallback(() => setIsOpen(false), []);

  return {
    isOpen,
    modal,
    openModal,
    closeModal,
    setModal,
    setIsOpen,
  };
}
