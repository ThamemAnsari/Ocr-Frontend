import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import UploadSection from './components/UploadSection'
import StatsSection from './components/StatsSection'
import LogsSection from './components/LogsSection'
import CostDashboard from './components/CostDashboard'
import RetrospectiveSlides from './components/RealtimeAnalytics'
import ProcessingModal from './components/ProcessingModal'
import { 
  Upload, 
  BarChart3, 
  History, 
  DollarSign, 
  Cpu, 
  Zap, 
  Activity, 
  Search,
  Sparkles,
  TrendingUp,
  Shield,
  Clock
} from 'lucide-react'
import StudentScholarshipLookup from './components/StudentScholarshipLookup'
import './App.css'
import BarcodeExtractor from './components/BarcodeExtractor'
import AutoExtractor from './components/AutoExtractor'

function App() {
  const [activeTab, setActiveTab] = useState('auto-extract')
  const [processingState, setProcessingState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    processed: 1247,
    success: 98.5,
    avgTime: 2.3
  })

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Animate stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        processed: prev.processed + Math.floor(Math.random() * 3),
        success: Math.min(99.9, prev.success + (Math.random() * 0.1)),
        avgTime: Math.max(1.5, prev.avgTime - (Math.random() * 0.05))
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const tabs = [
    { id: 'auto-extract', label: 'Auto Extractor', icon: Zap, description: 'Intelligent batch processing' }
  ]

  // Loading screen
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)',
        }} />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 80,
              height: 80,
              margin: '0 auto 24px',
              borderRadius: '50%',
              border: '4px solid rgba(255,255,255,0.3)',
              borderTopColor: 'white',
            }}
          />
          <h2 style={{ color: 'white', fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
            Loading TeamEverest AI
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
            Initializing intelligent document processing...
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="app" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Enhanced Animated Background */}
      <div className="background-orbs">
        <motion.div
          className="orb orb-1"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -80, 60, 0],
            scale: [1, 1.3, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            background: 'radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <motion.div
          className="orb orb-2"
          animate={{
            x: [0, -60, 80, 0],
            y: [0, 60, -70, 0],
            scale: [1, 0.8, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 5
          }}
          style={{
            background: 'radial-gradient(circle, rgba(118, 75, 162, 0.4) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <motion.div
          className="orb orb-3"
          animate={{
            x: [0, 40, -60, 0],
            y: [0, -40, 70, 0],
            scale: [1, 1.1, 0.85, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 10
          }}
          style={{
            background: 'radial-gradient(circle, rgba(253, 185, 19, 0.3) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
      </div>

      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: 0
            }}
            animate={{
              y: [null, -100, Math.random() * window.innerHeight],
              x: [null, Math.random() * 100 - 50],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.5)',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.5)'
            }}
          />
        ))}
      </div>

      {/* Enhanced Header */}
      <motion.header
        className="header"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div className="container">
          <div className="header-content" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            padding: '16px 0',
            gap: '32px'
          }}>
            {/* Logo */}
            <motion.div
              className="logo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
            >
              <motion.div
                className="logo-icon"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.4)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                whileHover={{
                  rotate: [0, -10, 10, -10, 0],
                  boxShadow: '0 12px 48px rgba(102, 126, 234, 0.6)'
                }}
                transition={{ duration: 0.5 }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4), transparent)',
                  opacity: 0.8
                }} />
                <Sparkles size={28} color="white" strokeWidth={2.5} style={{ position: 'relative', zIndex: 1 }} />
              </motion.div>
              <div>
                <h1 style={{ 
                  marginBottom: 0, 
                  lineHeight: 1,
                  fontSize: '24px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}>
                  TeamEverest
                </h1>
                <p style={{
                  fontSize: '11px',
                  color: '#7F8C8D',
                  margin: 0,
                  marginTop: 4,
                  letterSpacing: '2px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  AI Document Intelligence
                </p>
              </div>
            </motion.div>

            {/* Navigation */}
            <nav style={{ 
              display: 'flex', 
              gap: '8px',
              background: '#F8F9FA',
              padding: '6px',
              borderRadius: '12px',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
            }}>
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <motion.button
                    key={tab.id}
                    className={`nav-btn ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive 
                        ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        : 'transparent',
                      color: isActive ? 'white' : '#2C3E50',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: isActive ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                    }}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </motion.button>
                )
              })}
            </nav>

            {/* Live Stats Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              style={{ 
                display: 'flex', 
                gap: '16px', 
                alignItems: 'center',
                padding: '8px 16px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '10px',
                border: '1px solid rgba(102, 126, 234, 0.2)'
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 700, 
                  color: '#667eea',
                  lineHeight: 1
                }}>
                  {stats.processed.toLocaleString()}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#7F8C8D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginTop: '2px'
                }}>
                  Processed
                </div>
              </div>
              <div style={{ width: '1px', height: '32px', background: 'rgba(0,0,0,0.1)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '18px', 
                  fontWeight: 700, 
                  color: '#27AE60',
                  lineHeight: 1
                }}>
                  {stats.success.toFixed(1)}%
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#7F8C8D',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginTop: '2px'
                }}>
                  Success
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Feature Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px 0',
          boxShadow: '0 4px 24px rgba(102, 126, 234, 0.2)'
        }}
      >
        <div className="container">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-around', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '24px'
          }}>
            {[
              { icon: Zap, label: '3x Faster Processing', value: 'Optimized' },
              { icon: Shield, label: '99.9% Accuracy', value: 'AI-Powered' },
              { icon: TrendingUp, label: '80% Cost Reduction', value: 'Smart Tokens' },
              { icon: Clock, label: `${stats.avgTime.toFixed(1)}s Avg Time`, value: 'Real-time' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'white'
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <feature.icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1 }}>
                    {feature.label}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                    {feature.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="main" style={{ padding: '48px 0', minHeight: 'calc(100vh - 300px)' }}>
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -40, scale: 0.95 }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
              }}
            >
              {activeTab === 'auto-extract' && <AutoExtractor />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Enhanced Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{ 
          background: 'linear-gradient(135deg, #2C3E50 0%, #34495E 100%)',
          padding: '48px 0',
          marginTop: '64px',
          borderTop: '4px solid',
          borderImage: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%) 1',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '48px',
            marginBottom: '32px'
          }}>
            {/* Company Info */}
            <div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Sparkles size={20} color="white" />
                </div>
                <h3 style={{ color: 'white', margin: 0, fontSize: '20px', fontWeight: 700 }}>
                  TeamEverest
                </h3>
              </div>
              <p style={{ 
                color: 'rgba(255, 255, 255, 0.7)', 
                fontSize: '14px',
                lineHeight: 1.6,
                margin: 0
              }}>
                Intelligent document processing powered by cutting-edge AI technology. 
                Automate your workflows with confidence.
              </p>
            </div>

            {/* Features */}
            <div>
              <h4 style={{ 
                color: 'white', 
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Features
              </h4>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {['Auto Extraction', 'Batch Processing', 'Smart Filtering', 'Real-time Analytics'].map(item => (
                  <li key={item} style={{ 
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ 
                      width: '4px', 
                      height: '4px', 
                      borderRadius: '50%', 
                      background: '#667eea' 
                    }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stats */}
            <div>
              <h4 style={{ 
                color: 'white', 
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Performance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'Documents Processed', value: stats.processed.toLocaleString() },
                  { label: 'Success Rate', value: `${stats.success.toFixed(1)}%` },
                  { label: 'Average Time', value: `${stats.avgTime.toFixed(1)}s` }
                ].map(stat => (
                  <div key={stat.label}>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 700, 
                      color: 'white',
                      lineHeight: 1
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginTop: '4px'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{ 
            paddingTop: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.5)', 
              fontSize: '13px',
              margin: 0,
              letterSpacing: '1px'
            }}>
              © 2026 TeamEverest • AI Document Intelligence • All Rights Reserved
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '24px',
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              <span style={{ cursor: 'pointer' }}>Privacy Policy</span>
              <span style={{ cursor: 'pointer' }}>Terms of Service</span>
              <span style={{ cursor: 'pointer' }}>Contact</span>
            </div>
          </div>
        </div>
      </motion.footer>

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