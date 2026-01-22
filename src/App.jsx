import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UploadSection from './components/UploadSection'
import StatsSection from './components/StatsSection'
import LogsSection from './components/LogsSection'
import CostDashboard from './components/CostDashboard'
import RealtimeAnalytics from './components/RealtimeAnalytics'
import ProcessingModal from './components/ProcessingModal'
import { Upload, BarChart3, History, DollarSign, Cpu, Zap, Activity } from 'lucide-react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('upload')
  const [processingState, setProcessingState] = useState(null)

  const tabs = [
    { id: 'upload', label: 'Process', icon: Zap },
    { id: 'realtime', label: 'Real-Time', icon: Activity },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
    { id: 'cost', label: 'Cost Analytics', icon: DollarSign },
    { id: 'logs', label: 'History', icon: History },
  ]

  return (
    <div className="app">
      {/* Animated Background Orbs */}
      <div className="background-orbs">
        <motion.div
          className="orb orb-1"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -50, 40, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="orb orb-2"
          animate={{
            x: [0, -40, 60, 0],
            y: [0, 40, -50, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
            delay: 5
          }}
        />
        <motion.div
          className="orb orb-3"
          animate={{
            x: [0, 30, -40, 0],
            y: [0, -30, 50, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            delay: 10
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container">
          <div className="header-content">
            <motion.div
              className="logo"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="logo-icon" style={{ width: 45, height: 45, borderRadius: 12, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Cpu size={24} />
              </div>
              <h1>DOCUMENT<span style={{ fontWeight: 300, opacity: 0.6 }}>AI</span></h1>
            </motion.div>

            <nav className="nav">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <motion.button
                    key={tab.id}
                    className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </motion.button>
                )
              })}
            </nav>

            <div className="header-badge" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--green)', fontWeight: 700, letterSpacing: '1px' }}>
                ✓ AI POWERED
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="main">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'upload' && (
                <UploadSection
                  onProcessingStart={setProcessingState}
                />
              )}
              {activeTab === 'realtime' && (
                <RealtimeAnalytics />
              )}
              {activeTab === 'stats' && (
                <StatsSection />
              )}
              {activeTab === 'cost' && (
                <CostDashboard />
              )}
              {activeTab === 'logs' && (
                <LogsSection />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Info */}
      <footer style={{ padding: '4rem 0', textAlign: 'center', opacity: 0.4, fontSize: '0.8rem', letterSpacing: '2px' }}>
        <p>© 2026 DOCUMENT AI • INTELLIGENT EXTRACTION • COST OPTIMIZED</p>
      </footer>

      {/* Processing Modal Overlay */}
      <AnimatePresence>
        {processingState && (
          <ProcessingModal
            state={processingState}
            onClose={() => setProcessingState(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default App