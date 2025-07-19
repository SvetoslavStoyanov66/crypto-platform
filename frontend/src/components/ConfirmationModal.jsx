import React from 'react';

const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <p style={modalStyles.message}>{message}</p>
        <div style={modalStyles.buttonsContainer}>
          <button 
            onClick={onCancel}
            style={{ ...modalStyles.button, ...modalStyles.cancelButton }}
          >
            No
          </button>
          <button 
            onClick={onConfirm}
            style={{ ...modalStyles.button, ...modalStyles.confirmButton }}
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    width: '300px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  message: {
    marginBottom: '1.5rem',
    color: '#333',
    fontSize: '1.1rem',
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
    minWidth: '80px',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    color: '#333',
  },
  confirmButton: {
    backgroundColor: '#d32f2f',
    color: 'white',
  },
};

export default ConfirmationModal;