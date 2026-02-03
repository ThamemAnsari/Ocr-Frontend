import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, Calendar, User, Hash, Zap, RefreshCw, Trash2, Eye, FileText, ChevronDown, ChevronUp } from 'lucide-react'

const API_BASE_URL = 'https://ocr-owwb.onrender.com'

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
            style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}
        >
            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '3rem'
            }}>
                <div>
                    <motion.h2
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        style={{ 
                            fontSize: '3rem', 
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #0066FF, #00A3FF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            marginBottom: '0.5rem',
                            letterSpacing: '-1px'
                        }}
                    >
                        Intelligence Logs
                    </motion.h2>
                    <motion.p
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        style={{ 
                            color: 'var(--text-secondary)', 
                            fontSize: '1.2rem',
                            fontWeight: 500
                        }}
                    >
                        Real-time trace of document neural processing
                    </motion.p>
                </div>
                <motion.button
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={loadLogs}
                    disabled={loading}
                    style={{ 
                        padding: '1rem 2rem', 
                        fontSize: '1rem', 
                        background: loading 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 102, 255, 0.1)',
                        border: '2px solid rgba(0, 102, 255, 0.3)',
                        color: '#0066FF',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 700,
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)'
                    }}
                >
                    <motion.div
                        animate={{ rotate: loading ? 360 : 0 }}
                        transition={{ duration: 1, repeat: loading ? Infinity : 0, ease: "linear" }}
                    >
                        <RefreshCw size={18} />
                    </motion.div>
                    {loading ? 'Refreshing...' : 'Refresh Logs'}
                </motion.button>
            </div>

            {/* Logs Container */}
            <AnimatePresence mode="wait">
                {logs.length === 0 ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: '400px',
                            gap: '2rem'
                        }}
                    >
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
                            <FileText size={40} color="white" />
                        </motion.div>
                        <p style={{ 
                            color: 'var(--text-secondary)', 
                            fontSize: '1.2rem',
                            fontWeight: 600
                        }}>
                            Scanning matrix for history...
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="logs"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1.25rem'
                        }}
                    >
                        {logs.map((log, index) => (
                            <LogItem
                                key={log.id}
                                log={log}
                                index={index}
                                isExpanded={expandedId === log.id}
                                onToggle={() => setExpandedId(expandedId === log.id ? null : log.id)}
                                onDelete={deleteLog}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function LogItem({ log, index, isExpanded, onToggle, onDelete }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: index * 0.05, type: "spring", damping: 20 }}
            whileHover={{ scale: 1.01, x: 5 }}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '24px',
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: isExpanded ? '0 12px 40px rgba(0, 102, 255, 0.15)' : 'none',
                transition: 'all 0.3s ease'
            }}
        >
            {/* Animated border */}
            <motion.div
                animate={{
                    background: log.success
                        ? ['linear-gradient(180deg, #00d25b, #00a847)', 'linear-gradient(180deg, #00a847, #00d25b)']
                        : ['linear-gradient(180deg, #ef4444, #dc2626)', 'linear-gradient(180deg, #dc2626, #ef4444)']
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

            {/* Main Content */}
            <div
                onClick={onToggle}
                style={{
                    padding: '1.75rem 2rem 1.75rem 2.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.5rem'
                }}
            >
                {/* Status Icon */}
                <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.5 }}
                    style={{ flexShrink: 0 }}
                >
                    {log.success ? (
                        <CheckCircle size={28} style={{ color: '#00d25b' }} />
                    ) : (
                        <XCircle size={28} style={{ color: '#ef4444' }} />
                    )}
                </motion.div>

                {/* File Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '1rem',
                        marginBottom: '0.75rem'
                    }}>
                        <span style={{ 
                            fontSize: '1.1rem', 
                            fontWeight: 700, 
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        }}>
                            {log.filename}
                        </span>
                        <motion.span
                            whileHover={{ scale: 1.1 }}
                            style={{
                                padding: '0.4rem 1rem',
                                background: log.doc_type === 'bank' 
                                    ? 'rgba(0, 102, 255, 0.15)' 
                                    : 'rgba(0, 163, 255, 0.15)',
                                color: log.doc_type === 'bank' ? '#0066FF' : '#00A3FF',
                                borderRadius: '8px',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                border: `2px solid ${log.doc_type === 'bank' ? 'rgba(0, 102, 255, 0.3)' : 'rgba(0, 163, 255, 0.3)'}`,
                                flexShrink: 0
                            }}
                        >
                            {log.doc_type === 'bank' ? '🏦 Bank' : '📄 Bill'}
                        </motion.span>
                    </div>

                    <div style={{ 
                        display: 'flex', 
                        gap: '2rem',
                        fontSize: '0.9rem',
                        color: 'var(--text-secondary)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Zap size={14} style={{ color: '#667eea', flexShrink: 0 }} />
                            <span style={{ fontWeight: 600 }}>
                                {log.method === 'gemini_vision' ? 'Gemini' : 'macOCR'}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Hash size={14} style={{ flexShrink: 0 }} />
                            <span style={{ fontWeight: 600 }}>{log.total_tokens || 0} tokens</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={14} style={{ flexShrink: 0 }} />
                            <span style={{ fontWeight: 600 }}>
                                {log.processing_time_ms ? `${log.processing_time_ms}ms` : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Meta Info */}
                <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                    flexShrink: 0
                }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            gap: '0.5rem',
                            fontSize: '0.9rem',
                            color: 'var(--text-secondary)',
                            marginBottom: '0.25rem'
                        }}>
                            <Calendar size={14} />
                            {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <motion.div
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            style={{
                                fontSize: '0.75rem',
                                color: '#0066FF',
                                fontWeight: 700,
                                letterSpacing: '1px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                gap: '0.35rem'
                            }}
                        >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {isExpanded ? 'CLOSE' : 'VIEW DATA'}
                        </motion.div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.15, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => onDelete(log.id, e)}
                        style={{
                            color: '#ef4444',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '2px solid rgba(239, 68, 68, 0.2)',
                            padding: '0.65rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Trash2 size={18} />
                    </motion.button>
                </div>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ 
                            padding: '0 2rem 2rem 2.5rem',
                            borderTop: '2px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '350px 1fr', 
                                gap: '2rem',
                                paddingTop: '2rem'
                            }}>
                                {/* Image Preview */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    style={{
                                        background: '#000',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        border: '2px solid rgba(255, 255, 255, 0.05)',
                                        height: '350px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    {log.image_url ? (
                                        <img 
                                            src={log.image_url} 
                                            alt="Reference" 
                                            style={{ 
                                                width: '100%', 
                                                height: '100%', 
                                                objectFit: 'contain' 
                                            }} 
                                        />
                                    ) : (
                                        <div style={{ 
                                            color: 'rgba(255, 255, 255, 0.3)', 
                                            fontSize: '0.9rem',
                                            textAlign: 'center'
                                        }}>
                                            Image not found
                                        </div>
                                    )}
                                </motion.div>

                                {/* Data Grid */}
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '1.5rem' 
                                }}>
                                    {/* Identity Card */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 }}
                                        style={{
                                            padding: '1.5rem',
                                            background: 'rgba(0, 102, 255, 0.05)',
                                            borderRadius: '16px',
                                            border: '2px solid rgba(0, 102, 255, 0.2)'
                                        }}
                                    >
                                        <h6 style={{ 
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            color: '#0066FF',
                                            marginBottom: '1rem',
                                            letterSpacing: '1.5px'
                                        }}>
                                            IDENTITY
                                        </h6>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <User size={16} style={{ color: '#667eea' }} />
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                    Student: 
                                                </span>
                                                <b style={{ color: 'white', fontSize: '0.9rem' }}>
                                                    {log.student_name || 'Anonymous'}
                                                </b>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <Hash size={16} style={{ color: '#667eea' }} />
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                    ID: 
                                                </span>
                                                <b style={{ color: 'white', fontSize: '0.9rem' }}>
                                                    {log.scholarship_id || 'N/A'}
                                                </b>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Neural Metrics */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        style={{
                                            padding: '1.5rem',
                                            background: 'rgba(102, 126, 234, 0.05)',
                                            borderRadius: '16px',
                                            border: '2px solid rgba(102, 126, 234, 0.2)'
                                        }}
                                    >
                                        <h6 style={{ 
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            color: '#667eea',
                                            marginBottom: '1rem',
                                            letterSpacing: '1.5px'
                                        }}>
                                            NEURAL METRICS
                                        </h6>
                                        <div style={{ 
                                            display: 'grid',
                                            gridTemplateColumns: '1fr 1fr',
                                            gap: '1rem'
                                        }}>
                                            <div>
                                                <span style={{ 
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    Input Units:
                                                </span>
                                                <div style={{ 
                                                    color: '#667eea',
                                                    fontWeight: 700,
                                                    fontSize: '1.1rem',
                                                    marginTop: '0.25rem'
                                                }}>
                                                    {log.input_tokens || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <span style={{ 
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-secondary)'
                                                }}>
                                                    Output Units:
                                                </span>
                                                <div style={{ 
                                                    color: '#667eea',
                                                    fontWeight: 700,
                                                    fontSize: '1.1rem',
                                                    marginTop: '0.25rem'
                                                }}>
                                                    {log.output_tokens || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Extracted Data */}
                                    {log.extracted_data && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.25 }}
                                            style={{
                                                padding: '1.5rem',
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                borderRadius: '16px',
                                                border: '2px solid rgba(255, 255, 255, 0.05)'
                                            }}
                                        >
                                            <h6 style={{ 
                                                fontSize: '0.75rem',
                                                fontWeight: 800,
                                                color: '#00d25b',
                                                marginBottom: '1rem',
                                                letterSpacing: '1.5px'
                                            }}>
                                                EXTRACTED INTELLIGENCE
                                            </h6>
                                            <div style={{ 
                                                display: 'grid', 
                                                gridTemplateColumns: '1fr 1fr', 
                                                gap: '1rem' 
                                            }}>
                                                {Object.entries(JSON.parse(log.extracted_data)).map(([key, value]) => {
                                                    if (['success', 'method', 'token_usage', 'processing_time_ms', 'image_url', 'filename'].includes(key)) return null;
                                                    return (
                                                        <div 
                                                            key={key} 
                                                            style={{ 
                                                                borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                                                                paddingBottom: '0.75rem' 
                                                            }}
                                                        >
                                                            <div style={{ 
                                                                fontSize: '0.7rem', 
                                                                color: 'var(--text-muted)', 
                                                                textTransform: 'uppercase',
                                                                marginBottom: '0.35rem',
                                                                letterSpacing: '1px'
                                                            }}>
                                                                {key}
                                                            </div>
                                                            <div style={{ 
                                                                fontSize: '0.95rem', 
                                                                color: 'white', 
                                                                fontWeight: 600 
                                                            }}>
                                                                {value || 'N/A'}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Error Message */}
                                    {!log.success && log.error_message && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.08)',
                                                padding: '1.5rem',
                                                borderRadius: '16px',
                                                border: '2px solid rgba(239, 68, 68, 0.2)'
                                            }}
                                        >
                                            <div style={{ 
                                                color: '#ef4444', 
                                                fontWeight: 800, 
                                                fontSize: '0.75rem', 
                                                textTransform: 'uppercase',
                                                marginBottom: '0.75rem',
                                                letterSpacing: '1.5px'
                                            }}>
                                                PROTOCOL FAILURE
                                            </div>
                                            <p style={{ 
                                                color: 'white', 
                                                fontSize: '0.95rem',
                                                margin: 0,
                                                lineHeight: 1.6
                                            }}>
                                                {log.error_message}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}