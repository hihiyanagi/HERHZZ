import React from 'react';

const TestComponent = () => {
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#f0f0f0', 
      border: '2px solid #333',
      margin: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#333', fontSize: '24px' }}>
        🎉 React 正在正常工作！
      </h1>
      <p style={{ color: '#666', fontSize: '16px' }}>
        如果你能看到这个消息，说明 React 应用已经成功启动了。
      </p>
      <p style={{ color: '#999', fontSize: '14px' }}>
        现在我们需要检查其他组件的问题。
      </p>
    </div>
  );
};

export default TestComponent; 