import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('Checking connection...')

  useEffect(() => {
    // Fetch ke Backend port 5000
    fetch('http://localhost:5000/')
      .then(res => res.text())
      .then(data => setStatus(data))
      .catch(err => setStatus('Connection Failed! Is backend running?'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">SaaS Starter Kit</h1>
        <p className="text-gray-700">Backend Status:</p>
        <p className="font-mono bg-black text-green-400 p-2 rounded mt-2">
          {status}
        </p>
      </div>
    </div>
  )
}

export default App