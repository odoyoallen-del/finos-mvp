import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  return (
    <>
      <SignedIn>
        <DashboardContent />
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

function DashboardContent() {
  const { user, isLoaded } = useUser()
  const [kycStatus, setKycStatus] = useState('unverified')
  const [showKYC, setShowKYC] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return
    fetch(`/api/kyc/status?userId=${user.id}`)
     .then(res => res.json())
     .then(data => {
        setKycStatus(data.kyc_status || 'unverified')
        setLoading(false)
      })
     .catch(() => setLoading(false))
  }, [isLoaded, user])

  if (!isLoaded || loading) {
    return <div className="min-h-screen bg-[#0B1220] flex items-center justify-center text-white">Loading...</div>
  }

  const wallets = [
    { name: 'Daily Wallet', amount: 450, color: 'from-blue-900 to-blue-800', sub: 'Today: 45% used', icon: '💳' },
    { name: 'Emergency Wallet', amount: 25000, color: 'from-red-900 to-red-800', sub: 'Locked', locked: true, icon: '🔒' },
    { name: 'Savings Wallet', amount: 78500, color: 'from-green-900 to-green-800', sub: '+8.4%', icon: '💰' },
    { name: 'Trip Wallet', amount: 52000, color: 'from-purple-900 to-purple-800', sub: '66% of goal', icon: '✈️' },
    { name: 'Business Wallet', amount: 35600, color: 'from-indigo-900 to-indigo-800', sub: 'This month', icon: '💼' },
    { name: 'School Fees Wallet', amount: 24300, color: 'from-orange-900 to-orange-800', sub: 'Next due in 20 days', icon: '🎓' },
  ]

  const totalNetWorth = wallets.reduce((sum, w) => sum + w.amount, 0)

  return (
    <div className="min-h-screen bg-[#0B1220] text-white p-4 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-400 text-sm">Welcome back,</p>
          <h1 className="text-2xl font-bold">{user?.firstName || 'User'} 👋</h1>
        </div>
        <div className="flex gap-3">
          <button className="p-2 rounded-full bg-[#1A2333] hover:bg-[#2A3747]">🔔</button>
          <button className="p-2 rounded-full bg-[#1A2333] hover:bg-[#2A3747]">⚙️</button>
        </div>
      </div>

      {/* Total Net Worth Card */}
      <div className="bg-gradient-to-r from-[#1A2333] to-[#0F1A2A] rounded-2xl p-5 mb-6 border-[#2A3747]">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-sm">Total Net Worth</p>
            <h2 className="text-3xl font-bold mt-1">KES {totalNetWorth.toLocaleString()}</h2>
            <p className="text-green-400 text-sm mt-1">+12.5% this month</p>
          </div>
          <button className="text-gray-400">👁️</button>
        </div>
        <div className="h-20 mt-3 bg-gradient-to-t from-blue-600/20 to-transparent rounded-lg"></div>
      </div>

      {/* KYC Banner */}
      {kycStatus!== 'verified' && (
        <div className="bg-gradient-to-r from-orange-900/50 to-orange-800/50 border-orange-700 rounded-xl p-4 mb-6">
          <p className="font-semibold">Verify your ID to unlock payments</p>
          <p className="text-sm text-gray-300 mt-1">Complete KYC to send money and pay bills</p>
          <button
            onClick={() => setShowKYC(true)}
            className="mt-3 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Start KYC
          </button>
        </div>
      )}

      {/* Wallets Overview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Wallets Overview</h3>
          <button className="text-blue-400 text-sm hover:text-blue-300">See All</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {wallets.map((wallet, i) => (
            <div
              key={i}
              className={`bg-gradient-to-br ${wallet.color} rounded-2xl p-4 border-white/10 ${wallet.locked? 'opacity-60' : ''}`}
            >
              <div className="flex justify-between items-start">
                <p className="text-sm text-gray-300">{wallet.name}</p>
                <span className="text-lg">{wallet.icon}</span>
              </div>
              <p className="text-xl font-bold mt-2">KES {wallet.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-1">{wallet.sub}</p>
              {wallet.sub.includes('%') &&!wallet.sub.includes('goal') && (
                <div className="h-1 bg-white/20 rounded-full mt-2">
                  <div className="h-1 bg-blue-400 rounded-full" style={{width: '45%'}}></div>
                </div>
              )}
              {wallet.sub.includes('goal') && (
                <div className="h-1 bg-white/20 rounded-full mt-2">
                  <div className="h-1 bg-purple-400 rounded-full" style={{width: '66%'}}></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
        <div className="flex justify-between">
          {[
            { name: 'Send', icon: '→' },
            { name: 'Receive', icon: '↓' },
            { name: 'Scan QR', icon: '📱' },
            { name: 'Pay Bill', icon: '📄' },
            { name: 'More', icon: '•••' }
          ].map((action, i) => (
            <button
              key={i}
              disabled={kycStatus!== 'verified'}
              className="flex flex-col items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <div className="w-14 h-14 bg-[#1A2333] hover:bg-[#2A3747] rounded-full flex items-center justify-center text-xl transition">
                {action.icon}
              </div>
              <span className="text-xs">{action.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Insight Card */}
      <div className="bg-gradient-to-r from-[#1A2333] to-[#0F1A2A] rounded-2xl p-4 border-[#2A3747] flex items-center justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">🤖</div>
          <div>
            <p className="font-semibold text-sm">AI Financial Insight</p>
            <p className="text-xs text-gray-400">You spent 20% less on entertainment this week. Great job! 🎉</p>
          </div>
        </div>
        <span className="text-gray-400">→</span>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B1220] border-t border-[#1A2333] flex justify-around py-3">
        {[
          { name: 'Home', icon: '🏠', active: true },
          { name: 'Wallets', icon: '💳', active: false },
          { name: 'Budget', icon: '📊', active: false },
          { name: 'Goals', icon: '🎯', active: false },
          { name: 'More', icon: '☰', active: false }
        ].map((item, i) => (
          <button key={i} className={`flex flex-col items-center text-xs transition ${item.active? 'text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>
            <span className="text-xl">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </div>

      {showKYC && (
        <KYCModal onClose={() => setShowKYC(false)} userId={user.id} onSuccess={() => setKycStatus('verified')} />
      )}
    </div>
  )
}

function KYCModal({ onClose, userId, onSuccess }) {
  const [idNumber, setIdNumber] = useState('')
  const [idType, setIdType] = useState('NATIONAL_ID')
  const [idImage, setIdImage] = useState(null)
  const [selfieImage, setSelfieImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!idNumber ||!idImage ||!selfieImage) {
      setError('Please fill all fields')
      return
    }
    setLoading(true)
    try {
      const idImageB64 = await toBase64(idImage)
      const selfieImageB64 = await toBase64(selfieImage)
      const res = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          id_number: idNumber,
          id_type: idType,
          id_image: idImageB64,
          selfie_image: selfieImageB64
        })
      })
      const data = await res.json()
      if (data.result_code === '1012') {
        onSuccess()
        onClose()
        alert('KYC verified successfully!')
      } else {
        setError(data.result_text || 'Verification failed. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1A2333] rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Verify Your ID</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        {error && (
          <div className="bg-red-900/50 border-red-700 rounded-lg p-3 mb-4 text-sm text-red-300">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">ID Type</label>
            <select value={idType} onChange={(e) => setIdType(e.target.value)} className="w-full bg-[#0B1220] border-[#2A3747] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500">
              <option value="NATIONAL_ID">National ID</option>
              <option value="PASSPORT">Passport</option>
              <option value="DRIVING_LICENSE">Driving License</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">ID Number</label>
            <input type="text" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="12345678" className="w-full bg-[#0B1220] border-[#2A3747] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Upload ID Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setIdImage(e.target.files[0])} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Take Selfie</label>
            <input type="file" accept="image/*" capture="user" onChange={(e) => setSelfieImage(e.target.files[0])} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer hover:file:bg-blue-700" />
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition">
            {loading? 'Verifying...' : 'Submit for Verification'}
          </button>
        </form>
      </div>
    </div>
  )
}
