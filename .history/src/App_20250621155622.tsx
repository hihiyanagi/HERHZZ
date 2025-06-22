const App = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333' }}>🎉 HerHzzz 测试页面</h1>
      <p>如果你能看到这个页面，说明React应用正常工作了！</p>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>✅ 基本功能测试</h2>
        <ul>
          <li>✅ HTML 加载正常</li>
          <li>✅ JavaScript 执行正常</li>
          <li>✅ React 组件渲染正常</li>
          <li>✅ CSS 样式应用正常</li>
        </ul>
      </div>
      <div style={{ 
        background: '#e3f2fd', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px',
        border: '1px solid #2196f3'
      }}>
        <h3>🔧 下一步</h3>
        <p>现在我们知道基础功能正常，可以逐步恢复完整的应用功能。</p>
      </div>
    </div>
  )
}

export default App
