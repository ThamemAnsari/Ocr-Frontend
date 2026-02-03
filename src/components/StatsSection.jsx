import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Zap, TrendingUp, TrendingDown, Activity, BarChart3, PieChart, Sparkles, Brain, Cpu, Database, Clock, FileText } from 'lucide-react'

const API_BASE_URL = 'https://ocr-owwb.onrender.com'
const FREE_TIER_LIMIT = 1000

export default function EnhancedStatsSection() {
    const [stats, setStats] = useState(null)
    const [period, setPeriod] = useState(30)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [period])

    const loadStats = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/stats?days=${period}`)
            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error('Error loading stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading || !stats) {
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
                        boxShadow: '0 20px 60px rgba(0, 102, 255, 0.4)',
                        position: 'relative'
                    }}
                >
                    <Sparkles size={50} color="white" />
                </motion.div>
                <motion.div
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{ textAlign: 'center' }}
                >
                    <p style={{ 
                        color: 'var(--text-primary)', 
                        fontSize: '1.5rem', 
                        fontWeight: 700,
                        marginBottom: '0.5rem'
                    }}>
                        Processing Analytics Data...
                    </p>
                    <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '1.1rem'
                    }}>
                        Analyzing {period} days of activity
                    </p>
                </motion.div>
            </div>
        )
    }

    const summary = stats.summary || {}
    const dailyStats = stats.daily_stats || []

    const avgTokensPerRequest = summary.total_requests > 0
        ? Math.round(summary.total_tokens / summary.total_requests)
        : 0

    const successRate = summary.total_requests > 0
        ? Math.round((summary.success_count / summary.total_requests) * 100)
        : 0

    const isUnderFreeTier = summary.total_requests < FREE_TIER_LIMIT

    const statCards = [
        {
            label: 'Total Tokens',
            value: summary.total_tokens || 0,
            icon: Zap,
            color: 'purple',
            subtext: 'processed'
        },
        {
            label: 'Input Tokens',
            value: summary.total_input_tokens || 0,
            icon: TrendingDown,
            color: 'blue',
            subtext: 'received'
        },
        {
            label: 'Output Tokens',
            value: summary.total_output_tokens || 0,
            icon: TrendingUp,
            color: 'green',
            subtext: 'generated'
        },
        {
            label: 'Total Requests',
            value: summary.total_requests || 0,
            icon: Activity,
            color: 'orange',
            subtext: 'completed'
        },
    ]

    const maxTokens = Math.max(...dailyStats.map(d => d.total_tokens || 0), 100)

    return (
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem', minHeight: '100vh' }}>
            {/* Hero Header */}
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                style={{
                    background: 'linear-gradient(135deg, #0066FF 0%, #00A3FF 100%)',
                    borderRadius: '32px',
                    padding: '3.5rem',
                    marginBottom: '2.5rem',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 102, 255, 0.3)'
                }}
            >
                {/* Animated particles */}
                {[...Array(25)].map((_, i) => (
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
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        marginBottom: '2rem'
                    }}>
                        <div>
                            <motion.div
                                initial={{ x: -20 }}
                                animate={{ x: 0 }}
                                style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1.5rem',
                                    marginBottom: '0.75rem'
                                }}
                            >
                                <motion.div
                                    animate={{ rotate: [0, 360] }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                >
                                    <Brain size={60} color="white" />
                                </motion.div>
                                <div>
                                    <h2 style={{
                                        fontSize: '3.5rem',
                                        fontWeight: 900,
                                        color: 'white',
                                        margin: 0,
                                        lineHeight: 1,
                                        textShadow: '0 4px 20px rgba(0,0,0,0.2)',
                                        letterSpacing: '-2px'
                                    }}>
                                        Analytics Intelligence
                                    </h2>
                                    <p style={{
                                        fontSize: '1.2rem',
                                        color: 'rgba(255,255,255,0.95)',
                                        marginTop: '0.75rem',
                                        fontWeight: 500
                                    }}>
                                        Real-time token consumption & processing insights
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        <motion.select
                            whileHover={{ scale: 1.05, y: -2 }}
                            value={period}
                            onChange={(e) => setPeriod(Number(e.target.value))}
                            style={{
                                padding: '1rem 2rem',
                                background: 'rgba(255,255,255,0.2)',
                                border: '2px solid rgba(255,255,255,0.3)',
                                borderRadius: '16px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <option value={7}>📅 7 Days</option>
                            <option value={30}>📅 30 Days</option>
                            <option value={90}>📅 90 Days</option>
                        </motion.select>
                    </div>

                    {/* Free Tier Status */}
                    {isUnderFreeTier && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{
                                padding: '1.25rem 2rem',
                                background: 'rgba(255, 255, 255, 0.15)',
                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                backdropFilter: 'blur(10px)'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Sparkles size={28} color="white" />
                            </motion.div>
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontSize: '1.1rem', 
                                    fontWeight: 800, 
                                    color: 'white',
                                    marginBottom: '0.25rem'
                                }}>
                                    🎉 Under Free Tier Limit
                                </div>
                                <div style={{ 
                                    fontSize: '0.95rem', 
                                    color: 'rgba(255, 255, 255, 0.9)'
                                }}>
                                    {summary.total_requests} / {FREE_TIER_LIMIT} requests used • All processing at zero cost
                                </div>
                            </div>
                            <div style={{
                                padding: '0.75rem 1.5rem',
                                background: 'rgba(255, 255, 255, 0.2)',
                                borderRadius: '12px',
                                fontSize: '0.95rem',
                                fontWeight: 800,
                                color: 'white'
                            }}>
                                100% FREE
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Main Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                {statCards.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <motion.div
                            key={stat.label}
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1, type: "spring", damping: 20 }}
                            whileHover={{ y: -8, scale: 1.03 }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '24px',
                                padding: '2rem',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                        >
                            <motion.div
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '16px',
                                    background: `linear-gradient(135deg, ${
                                        stat.color === 'purple' ? '#667eea, #764ba2' :
                                        stat.color === 'blue' ? '#0066FF, #00A3FF' :
                                        stat.color === 'green' ? '#00d25b, #00a847' :
                                        '#f093fb, #f5576c'
                                    })`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '1.5rem',
                                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                                }}
                            >
                                <Icon size={32} color="white" />
                            </motion.div>

                            <div style={{
                                fontSize: '0.75rem',
                                color: 'var(--text-secondary)',
                                marginBottom: '0.75rem',
                                fontWeight: 700,
                                letterSpacing: '1.5px',
                                textTransform: 'uppercase'
                            }}>
                                {stat.label}
                            </div>

                            <AnimatedNumber
                                value={stat.value}
                                style={{
                                    fontSize: '2.5rem',
                                    fontWeight: 900,
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.5rem',
                                    lineHeight: 1
                                }}
                            />

                            <div style={{
                                fontSize: '0.9rem',
                                color: 'var(--text-secondary)',
                                fontWeight: 600
                            }}>
                                {stat.subtext}
                            </div>

                            {/* Animated glow */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.2, 0, 0.2]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    width: '100%',
                                    height: '100%',
                                    background: `radial-gradient(circle, ${
                                        stat.color === 'purple' ? 'rgba(102, 126, 234, 0.3)' :
                                        stat.color === 'blue' ? 'rgba(0, 102, 255, 0.3)' :
                                        stat.color === 'green' ? 'rgba(0, 210, 91, 0.3)' :
                                        'rgba(240, 147, 251, 0.3)'
                                    } 0%, transparent 70%)`,
                                    transform: 'translate(-50%, -50%)',
                                    pointerEvents: 'none'
                                }}
                            />
                        </motion.div>
                    )
                })}
            </div>

            {/* Additional Metrics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '1.5rem',
                marginBottom: '2.5rem'
            }}>
                <MetricCard
                    icon={Cpu}
                    label="Avg Tokens/Request"
                    value={avgTokensPerRequest}
                    delay={0.4}
                />
                <MetricCard
                    icon={Database}
                    label="Success Rate"
                    value={`${successRate}%`}
                    delay={0.5}
                />
                <MetricCard
                    icon={Clock}
                    label="Gemini Vision Calls"
                    value={summary.gemini_vision_count || 0}
                    delay={0.6}
                />
            </div>

            {/* Daily Consumption Chart */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    padding: '2.5rem',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    marginBottom: '2.5rem'
                }}
            >
                <div style={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div>
                        <h4 style={{
                            fontSize: '2rem',
                            fontWeight: 900,
                            color: 'var(--text-primary)',
                            marginBottom: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                        }}>
                            <BarChart3 size={36} style={{ color: '#0066FF' }} />
                            Daily Consumption Matrix
                        </h4>
                        <p style={{ 
                            fontSize: '1rem', 
                            color: 'var(--text-secondary)',
                            fontWeight: 500
                        }}>
                            Token usage distribution over the past {period} days
                        </p>
                    </div>
                    <div style={{
                        padding: '0.85rem 1.75rem',
                        background: 'rgba(0, 102, 255, 0.1)',
                        border: '2px solid rgba(0, 102, 255, 0.2)',
                        borderRadius: '14px',
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: '#0066FF'
                    }}>
                        Peak: {Math.max(...dailyStats.map(d => d.total_tokens), 0).toLocaleString()} tokens
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '0.5rem',
                    height: '300px',
                    paddingTop: '2rem'
                }}>
                    {dailyStats.slice().reverse().map((day, idx) => {
                        const height = (day.total_tokens / maxTokens) * 100
                        const isHighUsage = day.total_tokens > maxTokens * 0.7

                        return (
                            <div
                                key={idx}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    minWidth: '20px'
                                }}
                            >
                                <AnimatePresence>
                                    {day.total_tokens > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            style={{
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                color: isHighUsage ? '#ef4444' : '#0066FF'
                                            }}
                                        >
                                            {day.total_tokens > 1000
                                                ? `${(day.total_tokens / 1000).toFixed(1)}k`
                                                : day.total_tokens
                                            }
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.8, delay: idx * 0.03, ease: "easeOut" }}
                                    whileHover={{ scale: 1.1, opacity: 1 }}
                                    style={{
                                        width: '100%',
                                        background: isHighUsage
                                            ? 'linear-gradient(180deg, #ef4444, #dc2626)'
                                            : 'linear-gradient(180deg, #0066FF, #00A3FF)',
                                        borderRadius: '8px 8px 0 0',
                                        minHeight: day.total_tokens > 0 ? '4px' : 0,
                                        cursor: 'pointer',
                                        position: 'relative',
                                        boxShadow: isHighUsage
                                            ? '0 -4px 20px rgba(239, 68, 68, 0.4)'
                                            : '0 -4px 20px rgba(0, 102, 255, 0.3)',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <motion.div
                                        animate={{
                                            y: ['-100%', '200%']
                                        }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.3), transparent)'
                                        }}
                                    />
                                </motion.div>

                                <span style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-secondary)',
                                    fontWeight: 600,
                                    transform: 'rotate(-45deg)',
                                    transformOrigin: 'center',
                                    whiteSpace: 'nowrap',
                                    marginTop: '0.5rem'
                                }}>
                                    {new Date(day.date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric'
                                    })}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </motion.div>

            {/* Breakdown Section */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '2rem'
            }}>
                <BreakdownCard
                    title="Model Distribution"
                    icon={PieChart}
                    items={[
                        {
                            label: 'Gemini Vision',
                            value: summary.gemini_vision_count || 0,
                            total: summary.total_requests || 1,
                            color: '#0066FF'
                        },
                        {
                            label: 'macOCR + AI',
                            value: summary.ocr_text_count || 0,
                            total: summary.total_requests || 1,
                            color: '#00A3FF'
                        }
                    ]}
                    delay={0.8}
                />

                <BreakdownCard
                    title="Document Classification"
                    icon={FileText}
                    items={[
                        {
                            label: 'Bank Passbooks',
                            value: summary.bank_count || 0,
                            total: summary.total_requests || 1,
                            color: '#667eea'
                        },
                        {
                            label: 'College Bills',
                            value: summary.bill_count || 0,
                            total: summary.total_requests || 1,
                            color: '#00d25b'
                        }
                    ]}
                    delay={0.9}
                />
            </div>
        </div>
    )
}

function MetricCard({ icon: Icon, label, value, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, type: "spring" }}
            whileHover={{ scale: 1.05, y: -5 }}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                padding: '2rem',
                cursor: 'pointer'
            }}
        >
            <Icon size={32} style={{ color: '#0066FF', marginBottom: '1rem' }} />
            <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
                fontWeight: 700,
                letterSpacing: '1px'
            }}>
                {label}
            </div>
            <div style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                lineHeight: 1
            }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </div>
        </motion.div>
    )
}

function BreakdownCard({ title, icon: Icon, items, delay = 0 }) {
    return (
        <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay, type: "spring" }}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '2.5rem',
                border: '2px solid rgba(255, 255, 255, 0.1)'
            }}
        >
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <Icon size={32} style={{ color: '#0066FF' }} />
                <h4 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: 900, 
                    color: 'var(--text-primary)',
                    margin: 0
                }}>
                    {title}
                </h4>
            </div>

            <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                {items.map((item, index) => (
                    <BreakdownItem key={index} {...item} index={index} />
                ))}
            </div>
        </motion.div>
    )
}

function BreakdownItem({ label, value, total, color, index }) {
    const percent = Math.round((value / total) * 100)

    return (
        <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
            }}
        >
            <motion.div
                whileHover={{ scale: 1.4, rotate: 360 }}
                transition={{ duration: 0.5 }}
                style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 16px ${color}`,
                    flexShrink: 0
                }}
            />
            <span style={{
                flex: 1,
                fontSize: '1rem',
                fontWeight: 600,
                color: 'var(--text-primary)'
            }}>
                {label}
            </span>
            <span style={{
                fontSize: '1.2rem',
                fontWeight: 800,
                color: color
            }}>
                {percent}%
            </span>
            <span style={{
                fontSize: '0.9rem',
                fontWeight: 600,
                color: 'var(--text-secondary)'
            }}>
                {value}
            </span>
        </motion.div>
    )
}

function AnimatedNumber({ value, style }) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        let start = 0
        const end = value
        if (start === end) return setDisplayValue(end)

        const duration = 1500
        const increment = end / (duration / 16)

        const timer = setInterval(() => {
            start += increment
            if (start >= end) {
                setDisplayValue(end)
                clearInterval(timer)
            } else {
                setDisplayValue(Math.floor(start))
            }
        }, 16)

        return () => clearInterval(timer)
    }, [value])

    return <div style={style}>{displayValue.toLocaleString()}</div>
}