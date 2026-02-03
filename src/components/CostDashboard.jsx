import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { DollarSign, FileText, Calendar, Search, Download, TrendingUp, CheckCircle, XCircle, Zap, AlertCircle, Gift, Crown, Sparkles } from 'lucide-react'

const API_BASE_URL = 'https://ocr-owwb.onrender.com'
const USD_TO_INR = 83.50
const FREE_TIER_DAILY_LIMIT = 1000
const FREE_TIER_RPM_LIMIT = 15

export default function EnhancedCostDashboard() {
    const [logs, setLogs] = useState([])
    const [totalCost, setTotalCost] = useState(0)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [stats, setStats] = useState(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [logsRes, totalCostRes, statsRes] = await Promise.all([
                fetch(`${API_BASE_URL}/logs?limit=1000`),
                fetch(`${API_BASE_URL}/stats/total-cost`),
                fetch(`${API_BASE_URL}/stats?days=1`)
            ])

            const logsData = await logsRes.json()
            const totalData = await totalCostRes.json()
            const statsData = await statsRes.json()

            setLogs(logsData.logs || [])
            setTotalCost(totalData.total_cost_usd || 0)
            setStats(statsData)
        } catch (error) {
            console.error('Error loading data:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.student_name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter = filterType === 'all' || log.doc_type === filterType
        return matchesSearch && matchesFilter
    })

    const filteredTotal = filteredLogs.reduce((sum, log) => sum + (parseFloat(log.cost_usd) || 0), 0)

    const today = new Date().toISOString().split('T')[0]
    const todayLogs = logs.filter(log => log.timestamp?.startsWith(today))
    const todayRequests = todayLogs.length
    const isFreeTier = todayRequests <= FREE_TIER_DAILY_LIMIT
    const actualCost = isFreeTier ? 0 : totalCost
    const savings = isFreeTier ? totalCost : 0

    if (loading) {
        return (
            <div className="loading-container" style={{
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
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #0066FF, #00A3FF)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 20px 60px rgba(0, 102, 255, 0.4)'
                    }}
                >
                    <Sparkles size={40} color="white" />
                </motion.div>
                <motion.p
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ 
                        color: 'var(--text-primary)', 
                        fontSize: '1.3rem', 
                        fontWeight: 700,
                        textAlign: 'center'
                    }}
                >
                    Loading analytics...
                </motion.p>
            </div>
        )
    }

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem', minHeight: '100vh' }}>
            {/* Free Tier Banner */}
            <AnimatePresence>
                {isFreeTier && (
                    <motion.div
                        initial={{ y: -30, opacity: 0, scale: 0.9 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: -30, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", damping: 20 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(0, 163, 255, 0.05) 100%)',
                            backdropFilter: 'blur(20px)',
                            border: '2px solid rgba(0, 102, 255, 0.2)',
                            borderRadius: '24px',
                            padding: '1.5rem 2rem',
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1.5rem',
                            boxShadow: '0 8px 32px rgba(0, 102, 255, 0.15)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <motion.div
                            animate={{
                                background: [
                                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                                    'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'
                                ],
                                x: ['-100%', '200%']
                            }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                pointerEvents: 'none'
                            }}
                        />
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Gift size={48} style={{ color: '#0066FF' }} />
                        </motion.div>
                        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0066FF', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
                                🎉 FREE TIER ACTIVE
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
                                {todayRequests} / {FREE_TIER_DAILY_LIMIT} daily requests • You're saving ${totalCost.toFixed(4)} (₹{(totalCost * USD_TO_INR).toFixed(2)})
                            </div>
                        </div>
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                padding: '0.85rem 1.75rem',
                                background: 'linear-gradient(135deg, #0066FF, #00A3FF)',
                                borderRadius: '16px',
                                fontSize: '1rem',
                                fontWeight: 800,
                                color: 'white',
                                boxShadow: '0 8px 24px rgba(0, 102, 255, 0.3)',
                                position: 'relative',
                                zIndex: 1
                            }}
                        >
                            100% FREE
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hero Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 20 }}
                style={{
                    background: 'linear-gradient(135deg, #0066FF 0%, #00A3FF 100%)',
                    borderRadius: '32px',
                    padding: '3.5rem',
                    marginBottom: '2rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 102, 255, 0.3)'
                }}
            >
                {/* Animated background particles */}
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.random() * 20 - 10, 0],
                            opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        style={{
                            position: 'absolute',
                            width: Math.random() * 10 + 5,
                            height: Math.random() * 10 + 5,
                            borderRadius: '50%',
                            background: 'white',
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`
                        }}
                    />
                ))}

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        >
                            {isFreeTier ? <Gift size={56} color="white" /> : <Crown size={56} color="white" />}
                        </motion.div>
                        <div>
                            <motion.h1
                                initial={{ x: -20 }}
                                animate={{ x: 0 }}
                                style={{ 
                                    fontSize: '3.5rem', 
                                    fontWeight: 900, 
                                    color: 'white', 
                                    margin: 0, 
                                    lineHeight: 1,
                                    textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                    letterSpacing: '-2px'
                                }}
                            >
                                {isFreeTier ? 'Free Tier Dashboard' : 'API Cost Dashboard'}
                            </motion.h1>
                            <motion.p
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                style={{ 
                                    fontSize: '1.2rem', 
                                    color: 'rgba(255,255,255,0.95)', 
                                    marginTop: '0.75rem', 
                                    fontWeight: 500 
                                }}
                            >
                                {isFreeTier ? 'Enjoying unlimited processing at zero cost' : 'Enterprise-grade API analytics'}
                            </motion.p>
                        </div>
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: '2rem',
                        marginTop: '2.5rem'
                    }}>
                        <StatCard
                            icon="💰"
                            label="ACTUAL COST"
                            value={`$${actualCost.toFixed(4)}`}
                            subvalue={`₹${(actualCost * USD_TO_INR).toFixed(2)}`}
                            highlight={actualCost === 0}
                            delay={0}
                        />
                        <StatCard
                            icon="📄"
                            label="TOTAL EXTRACTIONS"
                            value={logs.length}
                            subvalue={`${todayRequests} today`}
                            delay={0.1}
                        />
                        <StatCard
                            icon="⚡"
                            label="THEORETICAL COST"
                            value={`$${totalCost.toFixed(4)}`}
                            subvalue="if paid"
                            delay={0.2}
                        />
                        <StatCard
                            icon="🎁"
                            label="YOU'RE SAVING"
                            value={`$${savings.toFixed(4)}`}
                            subvalue={`₹${(savings * USD_TO_INR).toFixed(2)}`}
                            highlight={savings > 0}
                            delay={0.3}
                        />
                    </div>
                </div>
            </motion.div>

            {/* Usage Progress Bar */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2rem',
                    marginBottom: '2rem',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                            Daily Usage Quota
                        </div>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                            Resets every 24 hours
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <motion.div
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{ 
                                fontSize: '2.5rem', 
                                fontWeight: 900, 
                                color: todayRequests > FREE_TIER_DAILY_LIMIT * 0.8 ? '#ef4444' : '#0066FF',
                                lineHeight: 1
                            }}
                        >
                            {todayRequests}
                        </motion.div>
                        <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            / {FREE_TIER_DAILY_LIMIT} requests
                        </div>
                    </div>
                </div>
                <div style={{
                    width: '100%',
                    height: '16px',
                    background: 'rgba(0, 0, 0, 0.2)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min((todayRequests / FREE_TIER_DAILY_LIMIT) * 100, 100)}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        style={{
                            height: '100%',
                            background: todayRequests > FREE_TIER_DAILY_LIMIT * 0.8
                                ? 'linear-gradient(90deg, #ef4444, #f87171)'
                                : 'linear-gradient(90deg, #0066FF, #00A3FF)',
                            borderRadius: '12px',
                            position: 'relative',
                            boxShadow: todayRequests > FREE_TIER_DAILY_LIMIT * 0.8
                                ? '0 0 20px rgba(239, 68, 68, 0.5)'
                                : '0 0 20px rgba(0, 102, 255, 0.5)'
                        }}
                    >
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
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)'
                            }}
                        />
                    </motion.div>
                </div>
                <AnimatePresence>
                    {todayRequests > FREE_TIER_DAILY_LIMIT * 0.8 && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                marginTop: '1.5rem',
                                padding: '1.25rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '2px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '16px'
                            }}
                        >
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <AlertCircle size={24} color="#ef4444" />
                            </motion.div>
                            <span style={{ color: '#ef4444', fontSize: '1rem', fontWeight: 600 }}>
                                Warning: You're approaching the daily limit. Consider upgrading to paid tier.
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Filters */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '1.75rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                }}
            >
                <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
                    <Search size={20} style={{ 
                        position: 'absolute', 
                        left: '1.25rem', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        color: 'rgba(255, 255, 255, 0.4)' 
                    }} />
                    <input
                        type="text"
                        placeholder="Search by filename or student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '1rem 1rem 1rem 3.5rem',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            color: 'var(--text-primary)',
                            fontSize: '1rem',
                            transition: 'all 0.3s ease',
                            fontWeight: 500
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#0066FF'
                            e.target.style.background = 'rgba(0, 102, 255, 0.05)'
                            e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)'
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
                            e.target.style.boxShadow = 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    {['all', 'bank', 'bill'].map(type => (
                        <motion.button
                            key={type}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setFilterType(type)}
                            style={{
                                padding: '1rem 2rem',
                                background: filterType === type 
                                    ? 'linear-gradient(135deg, #0066FF, #00A3FF)'
                                    : 'rgba(255, 255, 255, 0.05)',
                                border: `2px solid ${filterType === type ? '#0066FF' : 'rgba(255, 255, 255, 0.1)'}`,
                                borderRadius: '16px',
                                color: filterType === type ? 'white' : 'var(--text-primary)',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                transition: 'all 0.3s ease',
                                boxShadow: filterType === type ? '0 8px 24px rgba(0, 102, 255, 0.3)' : 'none'
                            }}
                        >
                            {type === 'all' ? '📋 All' : type === 'bank' ? '🏦 Bank' : '📄 Bill'}
                        </motion.button>
                    ))}
                </div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    style={{
                        padding: '1rem 2rem',
                        background: 'rgba(0, 102, 255, 0.1)',
                        border: '2px solid rgba(0, 102, 255, 0.2)',
                        borderRadius: '16px',
                        fontWeight: 700,
                        color: '#0066FF',
                        boxShadow: '0 8px 24px rgba(0, 102, 255, 0.15)'
                    }}
                >
                    <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>Filtered</div>
                    <div style={{ fontSize: '1.2rem' }}>${filteredTotal.toFixed(6)}</div>
                </motion.div>
            </motion.div>

            {/* Extractions List */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 style={{ 
                        fontSize: '2rem', 
                        fontWeight: 900, 
                        color: 'var(--text-primary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        margin: 0
                    }}>
                        <Sparkles size={32} style={{ color: '#0066FF' }} />
                        Extraction History
                        <span style={{ fontSize: '1.2rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.5)' }}>
                            ({filteredLogs.length} records)
                        </span>
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <AnimatePresence mode="popLayout">
                        {filteredLogs.map((log, index) => (
                            <ExtractionCard key={log.id} log={log} index={index} />
                        ))}
                    </AnimatePresence>
                </div>

                {filteredLogs.length === 0 && (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            textAlign: 'center',
                            padding: '5rem',
                            background: 'rgba(255, 255, 255, 0.03)',
                            borderRadius: '24px',
                            border: '2px dashed rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(20px)'
                        }}
                    >
                        <FileText size={80} style={{ marginBottom: '2rem', opacity: 0.2, color: 'var(--text-muted)' }} />
                        <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>No extractions found</p>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Try adjusting your filters</p>
                    </motion.div>
                )}
            </motion.div>

            {/* Summary Footer */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(0, 102, 255, 0.1) 0%, rgba(0, 163, 255, 0.05) 100%)',
                    border: '2px solid rgba(0, 102, 255, 0.2)',
                    borderRadius: '32px',
                    padding: '3rem',
                    textAlign: 'center',
                    marginTop: '3rem',
                    boxShadow: '0 20px 60px rgba(0, 102, 255, 0.15)',
                    backdropFilter: 'blur(20px)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <motion.div
                    animate={{
                        background: [
                            'radial-gradient(circle at 20% 50%, rgba(0, 102, 255, 0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 50%, rgba(0, 163, 255, 0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 50%, rgba(0, 102, 255, 0.1) 0%, transparent 50%)'
                        ]
                    }}
                    transition={{ duration: 5, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none'
                    }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                        fontSize: '1rem', 
                        color: 'var(--text-secondary)', 
                        marginBottom: '2rem', 
                        textTransform: 'uppercase', 
                        letterSpacing: '4px', 
                        fontWeight: 700 
                    }}>
                        {isFreeTier ? '🎉 FREE TIER BILLING' : '💳 FINAL PAYMENT AMOUNT'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '5rem', marginBottom: '2rem' }}>
                        <div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>USD</div>
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{ fontSize: '4.5rem', fontWeight: 900, color: '#0066FF', lineHeight: 1 }}
                            >
                                ${actualCost.toFixed(4)}
                            </motion.div>
                        </div>
                        <div style={{ fontSize: '4rem', color: 'rgba(255, 255, 255, 0.1)', alignSelf: 'center' }}>|</div>
                        <div>
                            <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>INR</div>
                            <motion.div
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                                style={{ fontSize: '4.5rem', fontWeight: 900, color: '#0066FF', lineHeight: 1 }}
                            >
                                ₹{(actualCost * USD_TO_INR).toFixed(2)}
                            </motion.div>
                        </div>
                    </div>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {isFreeTier
                            ? `🎁 Processed ${logs.length} extractions at ZERO cost • Under free tier limit`
                            : `Total charges for ${logs.length} API extractions • Rate: $1 = ₹${USD_TO_INR}`
                        }
                    </p>
                    <AnimatePresence>
                        {isFreeTier && savings > 0 && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", delay: 0.3 }}
                                style={{
                                    marginTop: '2rem',
                                    padding: '1.5rem',
                                    background: 'rgba(0, 102, 255, 0.15)',
                                    border: '2px solid rgba(0, 102, 255, 0.3)',
                                    borderRadius: '20px',
                                    fontSize: '1.3rem',
                                    fontWeight: 700,
                                    color: '#0066FF'
                                }}
                            >
                                💰 You saved ${savings.toFixed(4)} (₹{(savings * USD_TO_INR).toFixed(2)}) with the free tier!
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}

function StatCard({ icon, label, value, subvalue, highlight, delay = 0 }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, type: "spring", damping: 15 }}
            whileHover={{ y: -8, scale: 1.03 }}
            style={{
                background: highlight 
                    ? 'rgba(0, 102, 255, 0.2)' 
                    : 'rgba(255,255,255,0.15)',
                borderRadius: '24px',
                padding: '2rem',
                border: highlight 
                    ? '2px solid rgba(0, 102, 255, 0.5)' 
                    : '2px solid rgba(255,255,255,0.2)',
                boxShadow: highlight 
                    ? '0 12px 40px rgba(0, 102, 255, 0.3)' 
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(10px)'
            }}
        >
            <motion.div
                animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontSize: '2.5rem', marginBottom: '1rem' }}
            >
                {icon}
            </motion.div>
            <div style={{ 
                fontSize: '0.75rem', 
                color: 'rgba(255,255,255,0.8)', 
                marginBottom: '1rem', 
                fontWeight: 700, 
                letterSpacing: '2px' 
            }}>
                {label}
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', lineHeight: 1 }}>
                {value}
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                {subvalue}
            </div>
            {highlight && (
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0, 0.3]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: '100%',
                        height: '100%',
                        background: 'radial-gradient(circle, rgba(0, 102, 255, 0.3) 0%, transparent 70%)',
                        transform: 'translate(-50%, -50%)',
                        pointerEvents: 'none'
                    }}
                />
            )}
        </motion.div>
    )
}

function ExtractionCard({ log, index }) {
    const cost = parseFloat(log.cost_usd) || 0
    const costINR = cost * USD_TO_INR
    const date = new Date(log.timestamp)

    return (
        <motion.div
            layout
            initial={{ x: -50, opacity: 0, scale: 0.95 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: 50, opacity: 0, scale: 0.95 }}
            transition={{ 
                delay: index * 0.03,
                type: "spring",
                damping: 20
            }}
            whileHover={{ 
                scale: 1.01, 
                x: 8,
                boxShadow: '0 16px 48px rgba(0, 102, 255, 0.2)'
            }}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '1.75rem 2rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                position: 'relative',
                overflow: 'hidden',
                backdropFilter: 'blur(20px)',
                cursor: 'pointer'
            }}
        >
            {/* Animated gradient bar */}
            <motion.div
                animate={{
                    background: [
                        'linear-gradient(180deg, #0066FF, #00A3FF)',
                        'linear-gradient(180deg, #00A3FF, #0066FF)',
                        'linear-gradient(180deg, #0066FF, #00A3FF)'
                    ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '5px',
                    borderRadius: '24px 0 0 24px'
                }}
            />

            {/* Index Badge */}
            <motion.div
                whileHover={{ rotate: 360, scale: 1.2 }}
                transition={{ duration: 0.6 }}
                style={{
                    flexShrink: 0,
                    width: '65px',
                    fontSize: '1.8rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #0066FF, #00A3FF)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textAlign: 'center',
                    cursor: 'pointer'
                }}
            >
                #{index + 1}
            </motion.div>

            {/* File Info */}
            <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <motion.div 
                        whileHover={{ rotate: 360, scale: 1.2 }} 
                        transition={{ duration: 0.4 }}
                        style={{ flexShrink: 0 }}
                    >
                        <FileText size={20} style={{ color: '#0066FF' }} />
                    </motion.div>
                    <span style={{ 
                        fontSize: '1rem', 
                        fontWeight: 700, 
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {log.filename || 'Unknown File'}
                    </span>
                </div>
                {log.student_name && (
                    <div style={{ 
                        fontSize: '0.875rem', 
                        color: 'var(--text-secondary)', 
                        marginLeft: '1.75rem', 
                        fontWeight: 500,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        👤 {log.student_name}
                    </div>
                )}
            </div>

            {/* Date & Time */}
            <div style={{ 
                flexShrink: 0, 
                width: '140px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem'
            }}>
                <div style={{ 
                    fontSize: '0.95rem', 
                    color: 'var(--text-primary)', 
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Calendar size={16} style={{ color: 'rgba(255, 255, 255, 0.5)', flexShrink: 0 }} />
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-secondary)', 
                    fontWeight: 500,
                    paddingLeft: '1.5rem'
                }}>
                    {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>

            {/* Document Type Badge */}
            <motion.div
                whileHover={{ scale: 1.1, rotate: 3 }}
                style={{
                    flexShrink: 0,
                    padding: '0.65rem 1.25rem',
                    background: log.doc_type === 'bank' 
                        ? 'rgba(0, 102, 255, 0.15)' 
                        : 'rgba(0, 163, 255, 0.15)',
                    color: log.doc_type === 'bank' ? '#0066FF' : '#00A3FF',
                    borderRadius: '12px',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    textAlign: 'center',
                    border: `2px solid ${log.doc_type === 'bank' ? 'rgba(0, 102, 255, 0.3)' : 'rgba(0, 163, 255, 0.3)'}`,
                    whiteSpace: 'nowrap'
                }}
            >
                {log.doc_type === 'bank' ? '🏦 Bank' : '📄 Bill'}
            </motion.div>

            {/* Status */}
            <div style={{ flexShrink: 0, width: '110px' }}>
                {log.success ? (
                    <motion.div
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.3 }}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            justifyContent: 'center'
                        }}
                    >
                        <CheckCircle size={20} style={{ color: '#00d25b', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.9rem', color: '#00d25b', fontWeight: 700 }}>Success</span>
                    </motion.div>
                ) : (
                    <motion.div
                        whileHover={{ scale: 1.15 }}
                        transition={{ duration: 0.3 }}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem',
                            justifyContent: 'center'
                        }}
                    >
                        <XCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.9rem', color: '#ef4444', fontWeight: 700 }}>Failed</span>
                    </motion.div>
                )}
            </div>

            {/* Cost Display */}
            <motion.div
                whileHover={{ scale: 1.05, y: -3 }}
                style={{
                    flexShrink: 0,
                    width: '180px',
                    textAlign: 'right',
                    padding: '1rem 1.25rem',
                    background: 'rgba(0, 102, 255, 0.08)',
                    borderRadius: '14px',
                    border: '2px solid rgba(0, 102, 255, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                <motion.div
                    animate={{
                        x: ['-100%', '200%']
                    }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                        pointerEvents: 'none'
                    }}
                />
                <div style={{ 
                    fontSize: '0.65rem', 
                    color: 'rgba(255, 255, 255, 0.6)', 
                    marginBottom: '0.4rem', 
                    fontWeight: 700, 
                    letterSpacing: '1.5px',
                    position: 'relative',
                    zIndex: 1
                }}>
                    COST
                </div>
                <div style={{
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    color: '#0066FF',
                    fontFamily: 'monospace',
                    marginBottom: '0.35rem',
                    position: 'relative',
                    zIndex: 1,
                    lineHeight: 1
                }}>
                    ${cost.toFixed(6)}
                </div>
                <div style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: '#00A3FF',
                    fontFamily: 'monospace',
                    marginBottom: '0.6rem',
                    position: 'relative',
                    zIndex: 1,
                    lineHeight: 1
                }}>
                    ₹{costINR.toFixed(4)}
                </div>
                <div style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255, 255, 255, 0.6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.35rem',
                    position: 'relative',
                    zIndex: 1
                }}>
                    <Zap size={12} />
                    {log.total_tokens || 0} tokens
                </div>
            </motion.div>
        </motion.div>
    )
}