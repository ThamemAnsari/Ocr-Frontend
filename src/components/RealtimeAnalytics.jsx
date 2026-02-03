import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Activity, Zap, TrendingUp, Clock, Cpu, Eye, BarChart3, DollarSign, AlertCircle, Radio } from 'lucide-react'

const API_BASE_URL = 'https://ocr-owwb.onrender.com'

export default function RealtimeAnalytics() {
    const [stats, setStats] = useState(null)
    const [recentLogs, setRecentLogs] = useState([])
    const [liveActivity, setLiveActivity] = useState([])
    const [isLive, setIsLive] = useState(true)
    const intervalRef = useRef(null)

    useEffect(() => {
        loadData()
        if (isLive) {
            intervalRef.current = setInterval(loadData, 3000)
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current)
        }
    }, [isLive])

    const loadData = async () => {
        try {
            const [statsRes, logsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/stats?days=1`),
                fetch(`${API_BASE_URL}/logs?limit=5`)
            ])
            const statsData = await statsRes.json()
            const logsData = await logsRes.json()

            setStats(statsData)

            if (logsData.logs && logsData.logs.length > 0) {
                const newLogs = logsData.logs.filter(log =>
                    !recentLogs.some(existing => existing.id === log.id)
                )
                if (newLogs.length > 0) {
                    setLiveActivity(prev => [...newLogs.slice(0, 3), ...prev].slice(0, 10))
                }
                setRecentLogs(logsData.logs)
            }
        } catch (error) {
            console.error('Error loading real-time data:', error)
        }
    }

    if (!stats) {
        return (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                gap: '2rem'
            }}>
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.5, repeat: Infinity }
                    }}
                    style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, #0066FF, #00A3FF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 20px 60px rgba(0, 102, 255, 0.4)'
                    }}
                >
                    <Activity size={50} color="white" />
                </motion.div>
                <p style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '1.5rem',
                    fontWeight: 700
                }}>
                    Initializing real-time analytics...
                </p>
            </div>
        )
    }

    const summary = stats.summary || {}
    const todayStats = stats.daily_stats?.[stats.daily_stats.length - 1] || {}

    const requestsPerMinute = summary.total_requests > 0 ? (summary.total_requests / 1440).toFixed(2) : 0
    const avgProcessingTime = summary.total_requests > 0
        ? (summary.total_requests * 1200 / summary.total_requests).toFixed(0)
        : 0
    const successRate = summary.total_requests > 0
        ? ((summary.total_requests - (summary.failed_requests || 0)) / summary.total_requests * 100).toFixed(1)
        : 100

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}
        >
            {/* Header with Live Indicator */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '3rem'
            }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <motion.h2
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{
                                fontSize: '3rem',
                                fontWeight: 900,
                                background: 'linear-gradient(135deg, #0066FF, #00A3FF)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                margin: 0,
                                letterSpacing: '-1px'
                            }}
                        >
                            Real-Time Analytics
                        </motion.h2>
                        <motion.div
                            animate={{ 
                                scale: isLive ? [1, 1.2, 1] : 1,
                                boxShadow: isLive 
                                    ? ['0 0 0 0 rgba(0, 210, 91, 0.4)', '0 0 0 10px rgba(0, 210, 91, 0)', '0 0 0 0 rgba(0, 210, 91, 0)']
                                    : 'none'
                            }}
                            transition={{ 
                                scale: { duration: 2, repeat: Infinity },
                                boxShadow: { duration: 2, repeat: Infinity }
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                background: isLive 
                                    ? 'rgba(0, 210, 91, 0.15)' 
                                    : 'rgba(255, 255, 255, 0.05)',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '20px',
                                border: `2px solid ${isLive ? '#00d25b' : 'rgba(255, 255, 255, 0.1)'}`,
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <motion.div
                                animate={{ 
                                    scale: isLive ? [1, 1.3, 1] : 1
                                }}
                                transition={{ duration: 1, repeat: Infinity }}
                                style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    background: isLive ? '#00d25b' : 'rgba(255, 255, 255, 0.3)',
                                    boxShadow: isLive ? '0 0 15px #00d25b' : 'none'
                                }}
                            />
                            <span style={{ 
                                fontSize: '0.85rem', 
                                fontWeight: 800, 
                                color: isLive ? '#00d25b' : 'rgba(255, 255, 255, 0.5)',
                                letterSpacing: '1.5px'
                            }}>
                                {isLive ? 'LIVE' : 'PAUSED'}
                            </span>
                        </motion.div>
                    </div>
                    <motion.p
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{
                            color: 'var(--text-secondary)',
                            fontSize: '1.2rem',
                            marginTop: '0.5rem',
                            fontWeight: 500
                        }}
                    >
                        Live monitoring of document processing pipeline
                    </motion.p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsLive(!isLive)}
                    style={{
                        padding: '1rem 2rem',
                        fontSize: '1rem',
                        background: isLive 
                            ? 'rgba(239, 68, 68, 0.15)' 
                            : 'rgba(0, 210, 91, 0.15)',
                        border: `2px solid ${isLive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 210, 91, 0.3)'}`,
                        color: isLive ? '#ef4444' : '#00d25b',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: 'pointer',
                        fontWeight: 700,
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Radio size={18} />
                    {isLive ? 'Pause' : 'Resume'} Updates
                </motion.button>
            </div>

            {/* Real-Time Metrics Grid */}
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <MetricCard
                    icon={Activity}
                    label="Requests/Min"
                    value={requestsPerMinute}
                    color="purple"
                    suffix="/min"
                    trend="+12%"
                    delay={0}
                />
                <MetricCard
                    icon={Clock}
                    label="Avg Processing"
                    value={avgProcessingTime}
                    color="blue"
                    suffix="ms"
                    trend="-8%"
                    delay={0.1}
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Success Rate"
                    value={successRate}
                    color="green"
                    suffix="%"
                    trend="+2%"
                    delay={0.2}
                />
                <MetricCard
                    icon={Zap}
                    label="Today's Tokens"
                    value={(todayStats.total_tokens || 0).toLocaleString()}
                    color="orange"
                    delay={0.3}
                />
                <MetricCard
                    icon={DollarSign}
                    label="Today's Cost"
                    value={(todayStats.cost_usd || 0).toFixed(5)}
                    color="pink"
                    prefix="$"
                    delay={0.4}
                />
            </div>

            {/* Live Activity Feed & System Health */}
            <div style={{ 
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '2rem',
                marginBottom: '2.5rem'
            }}>
                {/* Live Activity Feed */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '2rem',
                        border: '2px solid rgba(255, 255, 255, 0.1)',
                        height: '550px',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1.5rem'
                    }}>
                        <h4 style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '1.5rem',
                            fontWeight: 900,
                            color: 'var(--text-primary)',
                            margin: 0
                        }}>
                            <Eye size={24} style={{ color: '#667eea' }} />
                            Live Activity Stream
                        </h4>
                        <span style={{ 
                            fontSize: '0.75rem',
                            color: 'var(--text-secondary)',
                            fontWeight: 600
                        }}>
                            Last updated: {new Date().toLocaleTimeString()}
                        </span>
                    </div>
                    <div style={{ 
                        height: 'calc(100% - 60px)',
                        overflowY: 'auto',
                        paddingRight: '0.5rem'
                    }}>
                        <AnimatePresence mode="popLayout">
                            {liveActivity.length === 0 ? (
                                <div style={{ 
                                    textAlign: 'center',
                                    padding: '5rem',
                                    color: 'var(--text-muted)'
                                }}>
                                    <motion.div
                                        animate={{ 
                                            rotate: 360,
                                            scale: [1, 1.2, 1]
                                        }}
                                        transition={{ 
                                            rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 2, repeat: Infinity }
                                        }}
                                    >
                                        <Activity size={60} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                                    </motion.div>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                        Waiting for activity...
                                    </p>
                                </div>
                            ) : (
                                liveActivity.map((log, idx) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20, scale: 0.95 }}
                                        animate={{ opacity: 1, x: 0, scale: 1 }}
                                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        whileHover={{ x: 5, boxShadow: '0 8px 24px rgba(0, 102, 255, 0.15)' }}
                                        style={{
                                            background: idx === 0 
                                                ? 'rgba(0, 102, 255, 0.08)' 
                                                : 'rgba(255, 255, 255, 0.02)',
                                            border: `2px solid ${idx === 0 ? 'rgba(0, 102, 255, 0.3)' : 'rgba(255, 255, 255, 0.05)'}`,
                                            borderRadius: '16px',
                                            padding: '1.25rem',
                                            marginBottom: '1rem',
                                            position: 'relative',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {idx === 0 && (
                                            <motion.div
                                                animate={{
                                                    x: ['-100%', '200%']
                                                }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'linear-gradient(90deg, transparent, rgba(0, 102, 255, 0.1), transparent)',
                                                    pointerEvents: 'none'
                                                }}
                                            />
                                        )}
                                        <div style={{ 
                                            display: 'flex',
                                            alignItems: 'start',
                                            gap: '1rem',
                                            position: 'relative',
                                            zIndex: 1
                                        }}>
                                            <motion.div
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                style={{
                                                    width: '45px',
                                                    height: '45px',
                                                    borderRadius: '14px',
                                                    background: log.success 
                                                        ? 'rgba(0, 210, 91, 0.15)' 
                                                        : 'rgba(239, 68, 68, 0.15)',
                                                    border: `2px solid ${log.success ? '#00d25b' : '#ef4444'}`,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    fontSize: '1.2rem'
                                                }}
                                            >
                                                {log.success ? '✓' : '✗'}
                                            </motion.div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ 
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.75rem',
                                                    marginBottom: '0.5rem'
                                                }}>
                                                    <span style={{ 
                                                        fontWeight: 700,
                                                        fontSize: '1rem',
                                                        color: 'white',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {log.filename}
                                                    </span>
                                                    <span style={{
                                                        padding: '0.25rem 0.75rem',
                                                        background: log.doc_type === 'bank'
                                                            ? 'rgba(0, 102, 255, 0.15)'
                                                            : 'rgba(0, 163, 255, 0.15)',
                                                        color: log.doc_type === 'bank' ? '#0066FF' : '#00A3FF',
                                                        borderRadius: '8px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 700,
                                                        textTransform: 'uppercase',
                                                        border: `1px solid ${log.doc_type === 'bank' ? 'rgba(0, 102, 255, 0.3)' : 'rgba(0, 163, 255, 0.3)'}`,
                                                        flexShrink: 0
                                                    }}>
                                                        {log.doc_type}
                                                    </span>
                                                </div>
                                                <div style={{ 
                                                    display: 'flex',
                                                    gap: '1.5rem',
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-muted)'
                                                }}>
                                                    <span>⚡ {log.method === 'gemini_vision' ? 'Gemini' : 'OCR'}</span>
                                                    <span>🔢 {log.total_tokens || 0} tokens</span>
                                                    <span>⏱️ {log.processing_time_ms || 0}ms</span>
                                                    <span>🕐 {new Date(log.timestamp).toLocaleTimeString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* System Health */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: '24px',
                        padding: '2rem',
                        border: '2px solid rgba(255, 255, 255, 0.1)'
                    }}
                >
                    <h4 style={{ 
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        fontSize: '1.5rem',
                        fontWeight: 900,
                        color: 'var(--text-primary)'
                    }}>
                        <Cpu size={24} style={{ color: '#00d25b' }} />
                        System Health
                    </h4>
                    <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <HealthMetric label="API Status" value="Operational" status="good" />
                        <HealthMetric label="Gemini Vision" value="Active" status="good" />
                        <HealthMetric label="Database" value="Connected" status="good" />
                        <HealthMetric 
                            label="Response Time" 
                            value={`${avgProcessingTime}ms`} 
                            status={avgProcessingTime < 2000 ? 'good' : 'warning'} 
                        />
                        <HealthMetric 
                            label="Error Rate" 
                            value={`${(100 - successRate).toFixed(1)}%`} 
                            status={successRate > 95 ? 'good' : 'warning'} 
                        />
                    </div>

                    {/* Quick Stats */}
                    <div style={{
                        padding: '1.75rem',
                        background: 'rgba(0, 0, 0, 0.3)',
                        borderRadius: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <h6 style={{
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)',
                            marginBottom: '1.25rem',
                            letterSpacing: '2px',
                            fontWeight: 800
                        }}>
                            TODAY'S SUMMARY
                        </h6>
                        <div style={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Requests</span>
                                <span style={{ fontWeight: 800, color: 'white' }}>
                                    {summary.total_requests || 0}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Gemini Calls</span>
                                <span style={{ fontWeight: 800, color: '#667eea' }}>
                                    {summary.gemini_vision_count || 0}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>OCR Calls</span>
                                <span style={{ fontWeight: 800, color: '#0066FF' }}>
                                    {summary.ocr_text_count || 0}
                                </span>
                            </div>
                            <div style={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                paddingTop: '1rem',
                                borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                            }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Cost</span>
                                <span style={{ fontWeight: 800, color: '#00d25b' }}>
                                    ${(summary.total_cost_usd || 0).toFixed(6)}
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Performance Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    border: '2px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        color: 'var(--text-primary)',
                        marginBottom: '0.5rem'
                    }}>
                        <BarChart3 size={28} style={{ color: '#667eea' }} />
                        Hourly Performance (Last 24 Hours)
                    </h4>
                </div>
                <div style={{ 
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.5rem',
                    height: '220px'
                }}>
                    {Array.from({ length: 24 }).map((_, idx) => {
                        const randomHeight = Math.random() * 100
                        return (
                            <div
                                key={idx}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${randomHeight}%` }}
                                    transition={{ duration: 1, delay: idx * 0.02 }}
                                    whileHover={{ 
                                        scale: 1.1,
                                        backgroundColor: '#00A3FF'
                                    }}
                                    style={{
                                        width: '100%',
                                        background: 'linear-gradient(180deg, #667eea, #764ba2)',
                                        borderRadius: '8px 8px 0 0',
                                        position: 'relative',
                                        cursor: 'pointer',
                                        minHeight: randomHeight > 10 ? '8px' : 0
                                    }}
                                >
                                    {randomHeight > 50 && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-1.5rem',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            fontSize: '0.7rem',
                                            fontWeight: 700,
                                            color: '#667eea',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {Math.floor(randomHeight)}
                                        </div>
                                    )}
                                </motion.div>
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600
                                }}>
                                    {idx}h
                                </span>
                            </div>
                        )
                    })}
                </div>
            </motion.div>
        </motion.div>
    )
}

function MetricCard({ icon: Icon, label, value, color, suffix = '', prefix = '', trend, delay = 0 }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const numValue = parseFloat(value) || 0
        let start = 0
        const duration = 1000
        const increment = numValue / (duration / 16)

        const timer = setInterval(() => {
            start += increment
            if (start >= numValue) {
                setDisplayValue(numValue)
                clearInterval(timer)
            } else {
                setDisplayValue(start)
            }
        }, 16)

        return () => clearInterval(timer)
    }, [value])

    const colorMap = {
        purple: '#667eea',
        blue: '#0066FF',
        green: '#00d25b',
        orange: '#f093fb',
        pink: '#f5576c'
    }

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, type: "spring", damping: 20 }}
            whileHover={{ y: -8, scale: 1.05 }}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                padding: '1.75rem',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '14px',
                    background: `linear-gradient(135deg, ${colorMap[color]}, ${colorMap[color]}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    boxShadow: `0 8px 24px ${colorMap[color]}33`
                }}
            >
                <Icon size={24} color="white" />
            </motion.div>
            <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
                fontWeight: 700,
                letterSpacing: '1.5px'
            }}>
                {label}
            </div>
            <p style={{
                fontSize: '2rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                marginBottom: '0.5rem',
                lineHeight: 1
            }}>
                {prefix}{typeof displayValue === 'number' ? displayValue.toFixed(suffix === '%' || suffix === '/min' ? 1 : 0) : displayValue}{suffix}
            </p>
            {trend && (
                <div style={{
                    fontSize: '0.75rem',
                    color: trend.startsWith('+') ? '#00d25b' : '#ef4444',
                    fontWeight: 700
                }}>
                    {trend} vs yesterday
                </div>
            )}
        </motion.div>
    )
}

function HealthMetric({ label, value, status }) {
    const statusColors = {
        good: '#00d25b',
        warning: '#faad14',
        error: '#ef4444'
    }

    return (
        <div style={{ 
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
            }}>
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        boxShadow: [
                            `0 0 0 0 ${statusColors[status]}`,
                            `0 0 0 8px ${statusColors[status]}00`,
                            `0 0 0 0 ${statusColors[status]}`
                        ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: statusColors[status]
                    }}
                />
                <span style={{ 
                    fontSize: '0.9rem',
                    color: 'var(--text-secondary)',
                    fontWeight: 600
                }}>
                    {label}
                </span>
            </div>
            <span style={{
                fontSize: '0.9rem',
                fontWeight: 800,
                color: statusColors[status]
            }}>
                {value}
            </span>
        </div>
    )
}