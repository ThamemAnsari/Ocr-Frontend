import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Calendar, User, Hash, Zap, RefreshCw, Trash2, Eye, ExternalLink } from 'lucide-react'

const API_BASE_URL = 'https://ocr-8tbh.onrender.com'

export default function LogsSection() {
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [expandedId, setExpandedId] = useState(null)

    useEffect(() => {
        loadLogs()
    }, [])

    const loadLogs = async () => {
        setLoading(true)
        try {
            const response = await fetch(`${API_BASE_URL}/logs?limit=50`)
            const data = await response.json()
            setLogs(data.logs || [])
        } catch (error) {
            console.error('Error loading logs:', error)
        } finally {
            setLoading(false)
        }
    }

    const deleteLog = async (id, e) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this neural trace?')) return

        try {
            const response = await fetch(`${API_BASE_URL}/logs/${id}`, { method: 'DELETE' })
            if (response.ok) {
                setLogs(logs.filter(log => log.id !== id))
            }
        } catch (error) {
            console.error('Error deleting log:', error)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="logs-section"
        >
            <div className="logs-header">
                <div className="header-info">
                    <h2>Intelligence Logs</h2>
                    <p className="hero-subtitle">Real-time trace of document neural processing</p>
                </div>
                <button
                    className="btn btn-secondary"
                    onClick={loadLogs}
                    disabled={loading}
                    style={{ padding: '0.8rem 1.5rem', fontSize: '0.85rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
                    {loading ? 'Refreshing...' : 'Refresh Logs'}
                </button>
            </div>

            <div className="logs-container">
                {logs.length === 0 ? (
                    <div className="loading-container">
                        <div className="loading-spinner" />
                        <p>Scanning matrix for history...</p>
                    </div>
                ) : (
                    <div className="logs-list">
                        {logs.map((log, index) => (
                            <motion.div
                                key={log.id}
                                className="log-item-container"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.3 }}
                                whileHover={{ scale: 1.01 }}
                            >
                                <div
                                    className="log-item"
                                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                >
                                    <div className="log-status">
                                        {log.success ? <CheckCircle size={24} className="text-green" /> : <XCircle size={24} className="text-red" />}
                                    </div>

                                    <div className="log-content">
                                        <div className="log-main">
                                            <span className="log-filename">{log.filename}</span>
                                            <span className={`log-badge ${log.doc_type}`}>{log.doc_type}</span>
                                        </div>

                                        <div className="log-details">
                                            <div className="detail-item">
                                                <Zap size={14} className="text-purple" />
                                                <span>{log.method === 'gemini_vision' ? 'Gemini' : 'macOCR'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <Hash size={14} />
                                                <span>{log.total_tokens || 0} tokens</span>
                                            </div>
                                            <div className="detail-item">
                                                <Clock size={14} />
                                                <span>{log.processing_time_ms ? `${log.processing_time_ms}ms` : 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="log-meta" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                        <div style={{ textAlign: 'right' }}>
                                            <div className="log-timestamp" style={{ justifyContent: 'flex-end' }}>
                                                <Calendar size={12} />
                                                {new Date(log.timestamp).toLocaleDateString()}
                                            </div>
                                            <div className="expand-hint">{expandedId === log.id ? 'CLOSE' : 'VIEW DATA'}</div>
                                        </div>
                                        <motion.button
                                            className="btn-delete"
                                            onClick={(e) => deleteLog(log.id, e)}
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                            whileTap={{ scale: 0.9 }}
                                            style={{ color: 'var(--red)', background: 'rgba(245, 87, 108, 0.1)', border: 'none', padding: '0.5rem', borderRadius: '10px', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={16} />
                                        </motion.button>
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {expandedId === log.id && (
                                        <motion.div
                                            className="log-expansion"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <div className="expansion-content" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
                                                {/* Image on the side in logs too! */}
                                                <div className="expansion-image" style={{ background: '#000', borderRadius: '15px', height: '100%', minHeight: '200px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                    {log.image_url ? (
                                                        <img src={log.image_url} alt="Reference" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                    ) : (
                                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Image not found</div>
                                                    )}
                                                </div>

                                                <div className="expansion-data-grid" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                                    <div className="expansion-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                                                        <div className="expansion-card">
                                                            <h6>Identity</h6>
                                                            <div className="expansion-row"><User size={14} className="text-purple" /> <span>Student: <b style={{ color: 'white' }}>{log.student_name || 'Anonymous'}</b></span></div>
                                                            <div className="expansion-row"><Hash size={14} className="text-purple" /> <span>ID: <b style={{ color: 'white' }}>{log.scholarship_id || 'N/A'}</b></span></div>
                                                        </div>
                                                        <div className="expansion-card">
                                                            <h6>Neural Metrics</h6>
                                                            <div className="expansion-row"><span>Input Units:</span> <span className="text-purple" style={{ fontWeight: 700 }}>{log.input_tokens || 0}</span></div>
                                                            <div className="expansion-row"><span>Output Units:</span> <span className="text-purple" style={{ fontWeight: 700 }}>{log.output_tokens || 0}</span></div>
                                                        </div>
                                                    </div>

                                                    {log.extracted_data && (
                                                        <div className="expansion-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
                                                            <h6>Extracted Intelligence</h6>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                                                {Object.entries(JSON.parse(log.extracted_data)).map(([key, value]) => {
                                                                    if (['success', 'method', 'token_usage', 'processing_time_ms', 'image_url', 'filename'].includes(key)) return null;
                                                                    return (
                                                                        <div key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                                                                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{key}</div>
                                                                            <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 600 }}>{value || 'N/A'}</div>
                                                                        </div>
                                                                    )
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}

                                                    {!log.success && log.error_message && (
                                                        <div className="error-box" style={{ background: 'rgba(245, 87, 108, 0.05)', padding: '1.5rem', borderRadius: '15px', border: '1px solid rgba(245, 87, 108, 0.1)' }}>
                                                            <div style={{ color: 'var(--red)', fontWeight: 800, fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Protocol Failure</div>
                                                            <p style={{ color: 'white', fontSize: '0.9rem' }}>{log.error_message}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    )
}
