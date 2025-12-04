import React from 'react';

const Message = ({ msg, bgColor, onDoubleClick }) => {
  let styles = {
    padding: '1rem',
    marginBottom: '1rem',
    textAlign: 'center',
    color: '#fff',
    fontWeight: 'bold',
    backgroundColor: bgColor,
    cursor: onDoubleClick ? 'pointer' : 'default',
  };

  const handleDoubleClick = () => {
    if (onDoubleClick) {
      onDoubleClick();
    }
  };

  return (
    <div style={styles} onDoubleClick={handleDoubleClick} title={onDoubleClick ? 'Double click to dismiss' : ''}>
      {/* <p>{msg}</p> */}
      <p style={{ margin: 0, pointerEvents: 'none' }} dangerouslySetInnerHTML={{ __html: msg }} />
    </div>
  );
};

export default Message;
