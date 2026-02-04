// src/components/Layout.jsx
import { useState, useEffect, useRef } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Sparkles,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  Cpu,
  Activity,
  Database,
  DollarSign,
  LogOut,
  User,
  Settings,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import '../App.css'

function Layout() {
  const { user, logout } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    processed: 1247,
    success: 98.5,
    avgTime: 2.3
  })
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1800)
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
    { path: '/auto-extract', label: 'Auto Extractor', icon: Zap },
    { path: '/extracted-data', label: 'Extracted Data', icon: Database },
    { path: '/cost', label: 'Cost Data', icon: DollarSign }
  ]

  const handleLogout = async () => {
    try {
      await logout()
      console.log('✅ Logged out successfully')
    } catch (error) {
      console.error('❌ Logout error:', error)
    }
  }

  // Enhanced loading screen with better animations
  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated background particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : Math.random() * 1920,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : Math.random() * 1080,
              scale: 0
            }}
            animate={{
              x: typeof window !== 'undefined' ? [
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth,
                Math.random() * window.innerWidth
              ] : [Math.random() * 1920, Math.random() * 1920, Math.random() * 1920],
              y: typeof window !== 'undefined' ? [
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight,
                Math.random() * window.innerHeight
              ] : [Math.random() * 1080, Math.random() * 1080, Math.random() * 1080],
              scale: [0, 1, 0],
              opacity: [0, 0.6, 0]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'easeInOut'
            }}
            style={{
              position: 'absolute',
              width: 4 + Math.random() * 8,
              height: 4 + Math.random() * 8,
              borderRadius: '50%',
              background: 'white',
              boxShadow: '0 0 20px rgba(255,255,255,0.8)'
            }}
          />
        ))}

        {/* Animated gradient waves */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 30%, rgba(255, 255, 255, 0.15) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0
          }}
        />

        {/* Main loading content */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.8,
            ease: [0.34, 1.56, 0.64, 1]
          }}
          style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}
        >
          {/* Outer rotating rings */}
          <div style={{
            width: 140,
            height: 140,
            margin: '0 auto 40px',
            position: 'relative'
          }}>
            {/* Outer ring 1 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '3px solid transparent',
                borderTopColor: 'rgba(255,255,255,0.8)',
                borderRightColor: 'rgba(255,255,255,0.6)'
              }}
            />

            {/* Outer ring 2 - counter rotation */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{
                position: 'absolute',
                width: '85%',
                height: '85%',
                top: '7.5%',
                left: '7.5%',
                borderRadius: '50%',
                border: '3px solid transparent',
                borderBottomColor: 'rgba(255,255,255,0.6)',
                borderLeftColor: 'rgba(255,255,255,0.4)'
              }}
            />

          </div>

          {/* Text content with enhanced animation */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.4,
              duration: 0.6,
              ease: [0.34, 1.56, 0.64, 1]
            }}
            style={{
              color: 'white',
              fontSize: '36px',
              fontWeight: 900,
              marginBottom: '16px',
              letterSpacing: '-1px',
              textShadow: '0 4px 20px rgba(0,0,0,0.3)'
            }}
          >
            TeamEverest AI
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              color: 'rgba(255,255,255,0.95)',
              fontSize: '16px',
              fontWeight: 600,
              letterSpacing: '0.5px',
              marginBottom: '32px',
              textShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}
          >
            Initializing intelligent document processing...
          </motion.p>

          {/* Progress bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            style={{
              width: 280,
              height: 6,
              background: 'rgba(255,255,255,0.2)',
              borderRadius: 10,
              margin: '0 auto',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            <motion.div
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              style={{
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)',
                borderRadius: 10
              }}
            />
          </motion.div>

          {/* Loading dots */}
          <div style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'center',
            marginTop: '32px'
          }}>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  y: [-8, 8, -8],
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 1, 0.4]
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: 'easeInOut'
                }}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 0 15px rgba(255,255,255,0.8)'
                }}
              />
            ))}
          </div>

          {/* Loading status text */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            style={{
              marginTop: '24px',
              fontSize: '13px',
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
              letterSpacing: '1px'
            }}
          >
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              LOADING
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#FAFBFC' }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 16px;
          }
        }

        .animated-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .bg-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          opacity: 0.4;
        }

        .bg-orb-1 {
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, #8B5CF6 0%, transparent 70%);
          top: -200px;
          left: -200px;
          animation: float1 20s ease-in-out infinite;
        }

        .bg-orb-2 {
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, #7C3AED 0%, transparent 70%);
          bottom: -150px;
          right: -150px;
          animation: float2 25s ease-in-out infinite;
        }

        .bg-orb-3 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, #EC4899 0%, transparent 70%);
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: float3 30s ease-in-out infinite;
        }

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(100px, -100px) scale(1.1); }
          66% { transform: translate(-50px, 50px) scale(0.9); }
        }

        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-80px, 80px) scale(1.15); }
          66% { transform: translate(60px, -60px) scale(0.85); }
        }

        @keyframes float3 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.2); }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(40px);
          border-radius: 24px;
          border: 1px solid rgba(139, 92, 246, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05);
        }
      `}</style>

      {/* Animated Background */}
      <div className="animated-bg">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        <div className="container">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 0',
            gap: '32px',
            flexWrap: 'wrap'
          }}>
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              <motion.div
                whileHover={{
                  rotate: [0, -10, 10, -10, 0],
                  boxShadow: '0 12px 48px rgba(139, 92, 246, 0.5)'
                }}
                transition={{ duration: 0.5 }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 18,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
                  border: '2px solid rgba(255, 255, 255, 0.5)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.5), transparent)',
                  opacity: 0.8
                }} />
                <Sparkles size={30} color="white" strokeWidth={2.5} style={{ position: 'relative', zIndex: 1 }} />
              </motion.div>
              <div>
                <h1 style={{
                  marginBottom: 0,
                  lineHeight: 1,
                  fontSize: '26px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.5px'
                }}>
                  TeamEverest
                </h1>
                <p style={{
                  fontSize: '11px',
                  color: '#64748B',
                  margin: 0,
                  marginTop: 6,
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
              background: '#F1F5F9',
              padding: '6px',
              borderRadius: '14px',
              boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
            }}>
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <NavLink
                    key={tab.path}
                    to={tab.path}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px 28px',
                      borderRadius: '10px',
                      border: 'none',
                      background: isActive
                        ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                        : 'transparent',
                      color: isActive ? 'white' : '#475569',
                      fontWeight: 600,
                      fontSize: '15px',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isActive ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none'
                    })}
                  >
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </NavLink>
                )
              })}
            </nav>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              {/* Live Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                style={{
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'center',
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.15)'
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#8B5CF6',
                    lineHeight: 1,
                    letterSpacing: '-0.5px'
                  }}>
                    {stats.processed.toLocaleString()}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginTop: '4px',
                    fontWeight: 700
                  }}>
                    Processed
                  </div>
                </div>
                <div style={{ width: '1px', height: '36px', background: 'rgba(139, 92, 246, 0.2)' }} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: 800,
                    color: '#10B981',
                    lineHeight: 1,
                    letterSpacing: '-0.5px'
                  }}>
                    {stats.success.toFixed(1)}%
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: '#64748B',
                    textTransform: 'uppercase',
                    letterSpacing: '0.8px',
                    marginTop: '4px',
                    fontWeight: 700
                  }}>
                    Success
                  </div>
                </div>
              </motion.div>

              {/* User Menu */}
              <div style={{ position: 'relative' }} ref={menuRef}>
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: '2px solid rgba(139, 92, 246, 0.2)',
                    background: showUserMenu
                      ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)'
                      : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '14px',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                  }}>
                    {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
                      {user?.name || user?.username || 'User'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>
                      {user?.email}
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={18} color="#8B5CF6" />
                  </motion.div>
                </motion.button>

                {/* User Dropdown */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        background: 'white',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                        minWidth: '240px',
                        overflow: 'hidden',
                        zIndex: 1000
                      }}
                    >
                      {/* User Info Header */}
                      <div style={{
                        padding: '20px',
                        borderBottom: '1px solid #F1F5F9',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(124, 58, 237, 0.05) 100%)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                          <div style={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 700,
                            fontSize: '16px',
                            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                          }}>
                            {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <div style={{
                              fontSize: '15px',
                              fontWeight: 700,
                              color: '#1E293B',
                              marginBottom: '2px'
                            }}>
                              {user?.name || user?.username}
                            </div>
                            <div style={{
                              fontSize: '12px',
                              color: '#64748B',
                              fontWeight: 500
                            }}>
                              {user?.email}
                            </div>
                          </div>
                        </div>

                        {/* User Role Badge */}
                        {user?.is_admin && (
                          <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase'
                          }}>
                            <Shield size={12} />
                            Admin
                          </div>
                        )}
                      </div>

                      {/* Menu Items */}
                      <div style={{ padding: '8px' }}>
                        <motion.button
                          whileHover={{ background: '#F8FAFC' }}
                          onClick={() => {
                            setShowUserMenu(false)
                            // Navigate to profile/settings if you have that route
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#475569',
                            transition: 'all 0.2s',
                            borderRadius: '10px',
                            textAlign: 'left'
                          }}
                        >
                          <User size={18} />
                          View Profile
                        </motion.button>

                        <motion.button
                          whileHover={{ background: '#F8FAFC' }}
                          onClick={() => {
                            setShowUserMenu(false)
                            // Navigate to settings if you have that route
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: '#475569',
                            transition: 'all 0.2s',
                            borderRadius: '10px',
                            textAlign: 'left'
                          }}
                        >
                          <Settings size={18} />
                          Settings
                        </motion.button>
                      </div>

                      {/* Divider */}
                      <div style={{ height: '1px', background: '#F1F5F9', margin: '4px 0' }} />

                      {/* Logout Button */}
                      <div style={{ padding: '8px' }}>
                        <motion.button
                          onClick={() => {
                            setShowUserMenu(false)
                            handleLogout()
                          }}
                          whileHover={{
                            background: 'linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%)',
                            scale: 1.02
                          }}
                          whileTap={{ scale: 0.98 }}
                          style={{
                            width: '100%',
                            padding: '12px 16px',
                            border: 'none',
                            background: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#DC2626',
                            transition: 'all 0.2s',
                            borderRadius: '10px',
                            textAlign: 'left'
                          }}
                        >
                          <LogOut size={18} />
                          Sign Out
                        </motion.button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Feature Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          padding: '20px 0',
          boxShadow: '0 4px 24px rgba(139, 92, 246, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <motion.div
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            backgroundSize: '200% 100%'
          }}
        />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '24px',
            alignItems: 'center'
          }}>
            {[
              { icon: Zap, label: '3x Faster', value: 'Streaming Mode', color: '#FCD34D' },
              { icon: Shield, label: '99.9% Accurate', value: 'AI-Powered', color: '#86EFAC' },
              { icon: TrendingUp, label: '80% Cost Cut', value: 'Smart Tokens', color: '#93C5FD' },
              { icon: Clock, label: `${stats.avgTime.toFixed(1)}s Avg`, value: 'Real-time', color: '#F9A8D4' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.05, y: -4 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  color: 'white',
                  padding: '4px'
                }}
              >
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 4px 12px ${feature.color}40`
                  }}
                >
                  <feature.icon size={22} />
                </motion.div>
                <div>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-0.3px'
                  }}>
                    {feature.label}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    opacity: 0.9,
                    marginTop: '4px',
                    fontWeight: 500
                  }}>
                    {feature.value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content - Outlet for child routes */}
      <main style={{
        padding: '56px 0',
        minHeight: 'calc(100vh - 300px)',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="container">
          <Outlet />
        </div>
      </main>

      {/* Enhanced Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        style={{
          background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
          padding: '64px 0 32px',
          marginTop: '80px',
          borderTop: '4px solid',
          borderImage: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 100%) 1',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '56px',
            marginBottom: '48px'
          }}>
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                marginBottom: '20px'
              }}>
                <div style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)'
                }}>
                  <Sparkles size={22} color="white" />
                </div>
                <h3 style={{
                  color: 'white',
                  margin: 0,
                  fontSize: '22px',
                  fontWeight: 800,
                  letterSpacing: '-0.5px'
                }}>
                  TeamEverest
                </h3>
              </div>
              <p style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: '15px',
                lineHeight: 1.7,
                margin: 0
              }}>
                Intelligent document processing powered by cutting-edge AI technology.
                Automate your workflows with confidence and precision.
              </p>
            </div>

            <div>
              <h4 style={{
                color: 'white',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px'
              }}>
                Features
              </h4>
              <ul style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                {[
                  { icon: CheckCircle, text: 'Auto Extraction' },
                  { icon: Activity, text: 'Batch Processing' },
                  { icon: Cpu, text: 'Smart Filtering' },
                  { icon: TrendingUp, text: 'Real-time Analytics' }
                ].map((item, i) => (
                  <motion.li
                    key={i}
                    whileHover={{ x: 4 }}
                    style={{
                      color: 'rgba(255, 255, 255, 0.75)',
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      transition: 'color 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.75)'}
                  >
                    <item.icon size={16} style={{ color: '#8B5CF6' }} />
                    {item.text}
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{
                color: 'white',
                marginBottom: '20px',
                fontSize: '14px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1.2px'
              }}>
                Performance
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { label: 'Documents Processed', value: stats.processed.toLocaleString(), color: '#8B5CF6' },
                  { label: 'Success Rate', value: `${stats.success.toFixed(1)}%`, color: '#10B981' },
                  { label: 'Average Time', value: `${stats.avgTime.toFixed(1)}s`, color: '#EC4899' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{
                      fontSize: '28px',
                      fontWeight: 800,
                      color: stat.color,
                      lineHeight: 1,
                      letterSpacing: '-0.5px'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginTop: '6px',
                      fontWeight: 500
                    }}>
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            paddingTop: '32px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <p style={{
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: '14px',
              margin: 0,
              letterSpacing: '0.5px'
            }}>
              © 2026 TeamEverest • AI Document Intelligence • All Rights Reserved
            </p>
            <div style={{
              display: 'flex',
              gap: '32px',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              {['Privacy Policy', 'Terms of Service', 'Contact'].map((link, i) => (
                <motion.span
                  key={i}
                  whileHover={{ color: 'white' }}
                  style={{
                    cursor: 'pointer',
                    transition: 'color 0.3s'
                  }}
                >
                  {link}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

export default Layout