import React from 'react';

const Message = ({ msg, bgColor, onDoubleClick }) => {
  const styles = {
    position: 'fixed',
    top: '25px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 10000,
    minWidth: '280px',
    maxWidth: '90%',
    padding: '16px 24px',
    borderRadius: '12px',
    backgroundColor: bgColor || '#dc3545',
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)',
    cursor: onDoubleClick ? 'pointer' : 'default',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    userSelect: 'none',
  };

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick();
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes message-float-in {
            0% { transform: translate(-50%, -100%); opacity: 0; }
            100% { transform: translate(-50%, 0); opacity: 1; }
          }
          .floating-message {
            animation: message-float-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          }
          .floating-message:hover {
            transform: translate(-50%, -2px) !important;
            box-shadow: 0 15px 50px rgba(0, 0, 0, 0.5) !important;
          }
        `}
      </style>
      <div
        className="floating-message"
        style={styles}
        onDoubleClick={handleDoubleClick}
        title={onDoubleClick ? 'Double click to dismiss' : ''}
      >
        <span
          style={{
            margin: 0,
            pointerEvents: 'none',
            fontSize: '15px',
            lineHeight: '1.4',
            textShadow: '0 1px 2px rgba(0,0,0,0.2)'
          }}
          dangerouslySetInnerHTML={{ __html: msg }}
        />
      </div>
    </>
  );
};

export default Message;
