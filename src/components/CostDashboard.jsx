import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { DollarSign, TrendingDown, Percent, Zap, Activity } from 'lucide-react'

const API_BASE_URL = 'https://ocr-8tbh.onrender.com'

export default function CostDashboard() {
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
                <p>Loading cost data...</p>
            </div>
        )
    }

    const summary = stats.summary || {}
    
    // Calculate costs
    const totalCost = summary.total_cost_usd || 0
    const avgCostPerRequest = summary.total_requests > 0 
        ? totalCost / summary.total_requests 
        : 0
    
    // Cost breakdown by method
    const geminiCost = (summary.gemini_vision_count || 0) * 0.000037 // Avg cost per image
    const ocrCost = totalCost - geminiCost
    
    // Projected monthly cost (extrapolate from period)
    const dailyAvg = totalCost / period
    const projectedMonthlyCost = dailyAvg * 30
    
    // Savings from batch processing (estimate 20% savings)
    const potentialSavings = totalCost * 0.20

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="cost-dashboard"
        >
            <div className="stats-header">
                <div className="header-info">
                    <h2>Cost Analytics</h2>
                    <p className="hero-subtitle">Track your API spending & optimize costs</p>
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

            {/* Cost Overview Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <motion.div
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{ background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.05))' }}
                >
                    <div className="stat-icon purple">
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-label">Total Cost</div>
                    <p className="stat-value" style={{ fontSize: '2rem' }}>
                        ${totalCost.toFixed(6)}
                    </p>
                    <p className="stat-sublabel">Last {period} days</p>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.05))' }}
                >
                    <div className="stat-icon blue">
                        <Activity size={24} />
                    </div>
                    <div className="stat-label">Avg Cost/Request</div>
                    <p className="stat-value" style={{ fontSize: '2rem' }}>
                        ${avgCostPerRequest.toFixed(6)}
                    </p>
                    <p className="stat-sublabel">Per document</p>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{ background: 'linear-gradient(135deg, rgba(0, 210, 91, 0.1), rgba(0, 242, 96, 0.05))' }}
                >
                    <div className="stat-icon green">
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-label">Projected Monthly</div>
                    <p className="stat-value" style={{ fontSize: '2rem' }}>
                        ${projectedMonthlyCost.toFixed(4)}
                    </p>
                    <p className="stat-sublabel">Based on current usage</p>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{ background: 'linear-gradient(135deg, rgba(250, 112, 154, 0.1), rgba(240, 147, 251, 0.05))' }}
                >
                    <div className="stat-icon pink">
                        <Percent size={24} />
                    </div>
                    <div className="stat-label">Potential Savings</div>
                    <p className="stat-value" style={{ fontSize: '2rem' }}>
                        ${potentialSavings.toFixed(6)}
                    </p>
                    <p className="stat-sublabel">With batch processing</p>
                </motion.div>
            </div>

            {/* Cost Breakdown */}
            <div className="breakdown-grid" style={{ marginTop: '2rem' }}>
                <div className="breakdown-card">
                    <h4>Cost by Method</h4>
                    <div className="breakdown-list">
                        <CostBreakdownItem 
                            label="Gemini Vision" 
                            value={geminiCost} 
                            total={totalCost} 
                            color="#667eea" 
                            count={summary.gemini_vision_count || 0}
                        />
                        <CostBreakdownItem 
                            label="OCR + AI" 
                            value={ocrCost} 
                            total={totalCost} 
                            color="#4facfe" 
                            count={summary.ocr_text_count || 0}
                        />
                    </div>
                </div>

                <div className="breakdown-card">
                    <h4>Cost Efficiency Tips</h4>
                    <div style={{ padding: '1rem', fontSize: '0.85rem', lineHeight: '1.8' }}>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                            <Zap size={16} className="text-green" style={{ marginTop: '2px' }} />
                            <span><b>Batch Processing:</b> Process multiple files in one API call to reduce overhead</span>
                        </div>
                        <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                            <Zap size={16} className="text-purple" style={{ marginTop: '2px' }} />
                            <span><b>Gemini Vision:</b> Direct image analysis costs ~40x less than traditional OCR</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'start', gap: '0.5rem' }}>
                            <Zap size={16} className="text-blue" style={{ marginTop: '2px' }} />
                            <span><b>Free Tier:</b> First 1,000 requests/day are completely free!</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Daily Cost Chart */}
            <div className="chart-section" style={{ marginTop: '2rem' }}>
                <div className="chart-header">
                    <h4>Daily Cost Trend (USD)</h4>
                </div>
                <div className="chart-container">
                    {(stats.daily_stats || []).slice().reverse().map((day, idx) => {
                        const maxCost = Math.max(...stats.daily_stats.map(d => d.cost_usd || 0), 0.0001)
                        return (
                            <div key={idx} className="chart-bar-wrapper">
                                <motion.div
                                    className="chart-bar"
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(day.cost_usd / maxCost) * 100}%` }}
                                    transition={{ duration: 1, delay: idx * 0.03 }}
                                    style={{ background: 'linear-gradient(180deg, #667eea, #764ba2)' }}
                                >
                                    <div className="chart-value">
                                        {day.cost_usd > 0 ? `$${day.cost_usd.toFixed(5)}` : ''}
                                    </div>
                                </motion.div>
                                <span className="chart-label">
                                    {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Cost Comparison Table */}
            <div className="breakdown-card" style={{ marginTop: '2rem' }}>
                <h4>Cost Comparison: Single vs Batch</h4>
                <table style={{ width: '100%', fontSize: '0.85rem', marginTop: '1rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '0.8rem', textAlign: 'left', color: 'var(--text-muted)' }}>Scenario</th>
                            <th style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--text-muted)' }}>Single Request</th>
                            <th style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--text-muted)' }}>Batch (10 files)</th>
                            <th style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--text-muted)' }}>Savings</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.8rem' }}>10 Bank Passbooks</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--red)' }}>$0.000370</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--green)' }}>$0.000296</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '700', color: 'var(--green)' }}>20%</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '0.8rem' }}>100 Documents</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--red)' }}>$0.003700</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--green)' }}>$0.002960</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '700', color: 'var(--green)' }}>20%</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '0.8rem' }}>1,000 Documents</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--red)' }}>$0.037000</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right', color: 'var(--green)' }}>$0.029600</td>
                            <td style={{ padding: '0.8rem', textAlign: 'right', fontWeight: '700', color: 'var(--green)' }}>20%</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </motion.div>
    )
}

function CostBreakdownItem({ label, value, total, color, count }) {
    const percent = total > 0 ? Math.round((value / total) * 100) : 0
    return (
        <div className="breakdown-item">
            <div className="breakdown-info">
                <div className="breakdown-dot" style={{ backgroundColor: color }} />
                <span className="breakdown-label">{label}</span>
            </div>
            <div className="breakdown-meta">
                <span className="breakdown-percent">{percent}%</span>
                <span className="breakdown-value">${value.toFixed(6)} ({count})</span>
            </div>
        </div>
    )
}