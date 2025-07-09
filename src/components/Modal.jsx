// src/components/Modal.jsx
import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    // Optional: You might need to adjust this if running outside browser or for SSR
    // For Next.js, ensure this runs only on the client side if using document.body
    if (typeof window === 'undefined') return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '25px',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                position: 'relative',
                width: '90%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto'
            }}>
                <h2 style={{
                    fontSize: '1.8em',
                    marginBottom: '15px',
                    color: '#333',
                    borderBottom: '1px solid #eee',
                    paddingBottom: '10px'
                }}>{title}</h2>
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5em',
                        cursor: 'pointer',
                        color: '#666',
                    }}
                >
                    &times;
                </button>
                <div style={{ maxHeight: 'calc(90vh - 120px)', overflowY: 'auto' }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body // Append the modal to the body
    );
};

export default Modal;