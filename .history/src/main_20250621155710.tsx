import { createRoot } from 'react-dom/client'
import App from './App.tsx'

console.log('main.tsx is loading...')

const rootElement = document.getElementById("root")
console.log('Root element:', rootElement)

if (rootElement) {
  const root = createRoot(rootElement)
  console.log('Creating root and rendering App...')
  root.render(<App />)
} else {
  console.error('Root element not found!')
}
