import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Zap, TrendingUp, TrendingDown, Activity, Info } from 'lucide-react'

const API_BASE_URL = 'https://ocr-8tbh.onrender.com'

export default function StatsSection() {
    const [stats, setStats] = useState(null)
    const [period, setPeriod] = useState(30)

    useEffect(() => {
        loadStats()
    }, [period])

    const loadStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats?days=${period}`)
            const data = await response.json()
            setStats(data)
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    if (!stats) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
                <p>Crunching neural data...</p>
            </div>
        )
    }

    const summary = stats.summary || {}
    const dailyStats = stats.daily_stats || []

    const statCards = [
        { label: 'Total Tokens', value: summary.total_tokens || 0, icon: Zap, color: 'purple' },
        { label: 'Input Tokens', value: summary.total_input_tokens || 0, icon: TrendingDown, color: 'blue' },
        { label: 'Output Tokens', value: summary.total_output_tokens || 0, icon: TrendingUp, color: 'green' },
        { label: 'Total Requests', value: summary.total_requests || 0, icon: Activity, color: 'orange' },
    ]

    const maxTokens = Math.max(...dailyStats.map(d => d.total_tokens || 0), 100)

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="stats-container"
        >
            <div className="stats-header">
                <div className="header-info">
                    <h2>Analytics Intelligence</h2>
                    <p className="hero-subtitle">Visualizing token consumption & processing overhead</p>
                </div>
                <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                    className="select-field"
                >
                    <option value={7}>7 Days</option>
                    <option value={30}>30 Days</option>
                    <option value={90}>90 Days</option>
                </select>
            </div>

            <div className="stats-grid">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon
                    const gradients = {
                        purple: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.05))',
                        blue: 'linear-gradient(135deg, rgba(79, 172, 254, 0.15), rgba(0, 242, 254, 0.05))',
                        green: 'linear-gradient(135deg, rgba(0, 242, 254, 0.15), rgba(0, 210, 91, 0.05))',
                        orange: 'linear-gradient(135deg, rgba(254, 225, 64, 0.15), rgba(250, 173, 20, 0.05))'
                    }
                    return (
                        <motion.div
                            key={stat.label}
                            className="stat-card"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            style={{ background: gradients[stat.color] }}
                        >
                            <div className={`stat-icon ${stat.color}`}>
                                <Icon size={24} />
                            </div>
                            <div className="stat-label">{stat.label}</div>
                            <AnimatedNumber value={stat.value} />
                        </motion.div>
                    )
                })}
            </div>

            <div className="chart-section">
                <div className="chart-header">
                    <h4>Daily Consumption Matrix</h4>
                </div>
                <div className="chart-container">
                    {dailyStats.slice().reverse().map((day, idx) => (
                        <div key={idx} className="chart-bar-wrapper">
                            <motion.div
                                className="chart-bar"
                                initial={{ height: 0 }}
                                animate={{ height: `${(day.total_tokens / maxTokens) * 100}%` }}
                                transition={{ duration: 1, delay: idx * 0.03 }}
                            >
                                <div className="chart-value">{day.total_tokens > 0 ? (day.total_tokens > 1000 ? (day.total_tokens / 1000).toFixed(1) + 'k' : day.total_tokens) : ''}</div>
                            </motion.div>
                            <span className="chart-label">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="breakdown-grid">
                <div className="breakdown-card">
                    <h4>Model Distribution</h4>
                    <div className="breakdown-list">
                        <BreakdownItem label="Gemini Vision" value={summary.gemini_vision_count || 0} total={summary.total_requests || 1} color="#667eea" />
                        <BreakdownItem label="macOCR + AI" value={summary.ocr_text_count || 0} total={summary.total_requests || 1} color="#4facfe" />
                    </div>
                </div>
                <div className="breakdown-card">
                    <h4>Document Classification</h4>
                    <div className="breakdown-list">
                        <BreakdownItem label="Bank Passbooks" value={summary.bank_count || 0} total={summary.total_requests || 1} color="#f093fb" />
                        <BreakdownItem label="College Bills" value={summary.bill_count || 0} total={summary.total_requests || 1} color="#fa709a" />
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function BreakdownItem({ label, value, total, color }) {
    const percent = Math.round((value / total) * 100)
    return (
        <div className="breakdown-item">
            <div className="breakdown-info">
                <div className="breakdown-dot" style={{ backgroundColor: color }} />
                <span className="breakdown-label">{label}</span>
            </div>
            <div className="breakdown-meta">
                <span className="breakdown-percent">{percent}%</span>
                <span className="breakdown-value">{value}</span>
            </div>
        </div>
    )
}

function AnimatedNumber({ value }) {
    const [displayValue, setDisplayValue] = useState(0)
    useEffect(() => {
        let start = 0
        const end = value
        if (start === end) return setDisplayValue(end)
        const duration = 1000
        const timer = setInterval(() => {
            start += Math.ceil(end / 60)
            if (start >= end) {
                setDisplayValue(end)
                clearInterval(timer)
            } else {
                setDisplayValue(start)
            }
        }, 16)
        return () => clearInterval(timer)
    }, [value])
    return <p className="stat-value">{displayValue.toLocaleString()}</p>
}
