import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Search, User, Hash, DollarSign, Activity, Clock, FileText, TrendingUp, Sparkles, AlertCircle } from 'lucide-react'

const API_BASE_URL = 'https://ocr-owwb.onrender.com'

export default function StudentScholarshipLookup() {
    const [searchType, setSearchType] = useState('student')
    const [searchQuery, setSearchQuery] = useState('')
    const [results, setResults] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSearch = async () => {
        if (!searchQuery.trim()) return

        setLoading(true)
        setError(null)
        setResults(null)

        try {
            const endpoint = searchType === 'student' 
                ? `/stats/student/${encodeURIComponent(searchQuery)}`
                : `/stats/scholarship/${encodeURIComponent(searchQuery)}`
            
            const response = await fetch(`${API_BASE_URL}${endpoint}`)
            const data = await response.json()

            if (response.ok) {
                setResults(data)
            } else {
                setError(data.error || 'Search failed')
            }
        } catch (err) {
            setError('Network error. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ maxWidth: '1600px', margin: '0 auto', padding: '2rem' }}
        >
            {/* Header */}
            <div style={{ marginBottom: '3rem' }}>
                <motion.h2
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    style={{
                        fontSize: '3.5rem',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '0.75rem',
                        letterSpacing: '-2px'
                    }}
                >
                    Entity Cost Lookup
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
                    Track costs by student or scholarship ID • Detailed processing history
                </motion.p>
            </div>

            {/* Search Interface */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                style={{
                    background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.1), rgba(0, 242, 254, 0.05))',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '32px',
                    padding: '2.5rem',
                    marginBottom: '3rem',
                    border: '2px solid rgba(79, 172, 254, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated background */}
                <motion.div
                    animate={{
                        background: [
                            'radial-gradient(circle at 0% 0%, rgba(79, 172, 254, 0.15) 0%, transparent 50%)',
                            'radial-gradient(circle at 100% 100%, rgba(0, 242, 254, 0.15) 0%, transparent 50%)',
                            'radial-gradient(circle at 0% 0%, rgba(79, 172, 254, 0.15) 0%, transparent 50%)'
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
                    <h4 style={{
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: '1.8rem',
                        fontWeight: 900,
                        color: 'var(--text-primary)'
                    }}>
                        <Search size={32} style={{ color: '#4facfe' }} />
                        Search Portal
                    </h4>

                    {/* Search Type Toggle */}
                    <div style={{ 
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '2rem'
                    }}>
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSearchType('student')}
                            style={{
                                flex: 1,
                                padding: '1.25rem',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                borderRadius: '16px',
                                border: `2px solid ${searchType === 'student' ? '#4facfe' : 'rgba(255, 255, 255, 0.1)'}`,
                                background: searchType === 'student'
                                    ? 'linear-gradient(135deg, #4facfe, #00f2fe)'
                                    : 'rgba(255, 255, 255, 0.03)',
                                color: searchType === 'student' ? 'white' : 'var(--text-primary)',
                                cursor: 'pointer',
                                fontWeight: 700,
                                transition: 'all 0.3s ease',
                                boxShadow: searchType === 'student'
                                    ? '0 8px 32px rgba(79, 172, 254, 0.4)'
                                    : 'none'
                            }}
                        >
                            <User size={22} />
                            Search by Student
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.03, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSearchType('scholarship')}
                            style={{
                                flex: 1,
                                padding: '1.25rem',
                                fontSize: '1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.75rem',
                                borderRadius: '16px',
                                border: `2px solid ${searchType === 'scholarship' ? '#4facfe' : 'rgba(255, 255, 255, 0.1)'}`,
                                background: searchType === 'scholarship'
                                    ? 'linear-gradient(135deg, #4facfe, #00f2fe)'
                                    : 'rgba(255, 255, 255, 0.03)',
                                color: searchType === 'scholarship' ? 'white' : 'var(--text-primary)',
                                cursor: 'pointer',
                                fontWeight: 700,
                                transition: 'all 0.3s ease',
                                boxShadow: searchType === 'scholarship'
                                    ? '0 8px 32px rgba(79, 172, 254, 0.4)'
                                    : 'none'
                            }}
                        >
                            <Hash size={22} />
                            Search by Scholarship ID
                        </motion.button>
                    </div>

                    {/* Search Input */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder={searchType === 'student' ? 'Enter student name...' : 'Enter scholarship ID...'}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            style={{
                                flex: 1,
                                fontSize: '1.1rem',
                                padding: '1.25rem 1.5rem',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '2px solid rgba(79, 172, 254, 0.2)',
                                borderRadius: '16px',
                                color: 'var(--text-primary)',
                                fontWeight: 500,
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#4facfe'
                                e.target.style.background = 'rgba(79, 172, 254, 0.08)'
                                e.target.style.boxShadow = '0 0 0 4px rgba(79, 172, 254, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(79, 172, 254, 0.2)'
                                e.target.style.background = 'rgba(0, 0, 0, 0.3)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSearch}
                            disabled={loading || !searchQuery.trim()}
                            style={{
                                padding: '1.25rem 3rem',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                borderRadius: '16px',
                                border: 'none',
                                background: (loading || !searchQuery.trim())
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'linear-gradient(135deg, #4facfe, #00f2fe)',
                                color: (loading || !searchQuery.trim())
                                    ? 'rgba(255, 255, 255, 0.3)'
                                    : 'white',
                                cursor: (loading || !searchQuery.trim()) ? 'not-allowed' : 'pointer',
                                boxShadow: (!loading && searchQuery.trim())
                                    ? '0 8px 32px rgba(79, 172, 254, 0.4)'
                                    : 'none',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </motion.button>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                marginTop: '1.5rem',
                                padding: '1.25rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                borderRadius: '14px',
                                color: '#ef4444',
                                border: '2px solid rgba(239, 68, 68, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '1rem',
                                fontWeight: 600
                            }}
                        >
                            <AlertCircle size={20} />
                            {error}
                        </motion.div>
                    )}
                </div>
            </motion.div>

            {/* Results Display */}
            <AnimatePresence>
                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* Summary Cards */}
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(4, 1fr)',
                            gap: '1.5rem',
                            marginBottom: '3rem'
                        }}>
                            <SummaryCard
                                icon={searchType === 'student' ? User : Hash}
                                label={searchType === 'student' ? 'Student Name' : 'Scholarship ID'}
                                value={results.student_name || results.scholarship_id}
                                color="#4facfe"
                                delay={0}
                            />
                            <SummaryCard
                                icon={DollarSign}
                                label="Total Cost"
                                value={`$${results.total_cost_usd?.toFixed(6) || '0.000000'}`}
                                color="#00d25b"
                                delay={0.1}
                            />
                            <SummaryCard
                                icon={Activity}
                                label="Total Requests"
                                value={results.total_requests || 0}
                                color="#667eea"
                                delay={0.2}
                            />
                            <SummaryCard
                                icon={TrendingUp}
                                label="Avg Cost/Request"
                                value={`$${(results.total_requests > 0 ? results.total_cost_usd / results.total_requests : 0).toFixed(6)}`}
                                color="#f093fb"
                                delay={0.3}
                            />
                        </div>

                        {/* Processing History */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            style={{
                                background: 'rgba(255, 255, 255, 0.03)',
                                backdropFilter: 'blur(20px)',
                                borderRadius: '24px',
                                padding: '2.5rem',
                                border: '2px solid rgba(255, 255, 255, 0.1)'
                            }}
                        >
                            <h4 style={{
                                marginBottom: '2rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                fontSize: '1.8rem',
                                fontWeight: 900,
                                color: 'var(--text-primary)'
                            }}>
                                <FileText size={28} style={{ color: '#667eea' }} />
                                Processing History
                                <span style={{
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    color: 'var(--text-muted)',
                                    marginLeft: '0.5rem'
                                }}>
                                    ({results.logs?.length || 0} records)
                                </span>
                            </h4>

                            {results.logs && results.logs.length > 0 ? (
                                <div style={{ 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '1rem'
                                }}>
                                    {results.logs.map((log, idx) => (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + idx * 0.05 }}
                                            whileHover={{ x: 5, boxShadow: '0 8px 24px rgba(79, 172, 254, 0.15)' }}
                                            style={{
                                                padding: '1.75rem',
                                                background: idx % 2 === 0 
                                                    ? 'rgba(255, 255, 255, 0.02)' 
                                                    : 'rgba(0, 0, 0, 0.2)',
                                                borderRadius: '16px',
                                                border: '2px solid rgba(255, 255, 255, 0.05)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1.5rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            {/* Filename */}
                                            <div style={{ flex: '1 1 30%', minWidth: 0 }}>
                                                <div style={{ 
                                                    fontWeight: 700,
                                                    marginBottom: '0.5rem',
                                                    fontSize: '1rem',
                                                    color: 'white',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap'
                                                }}>
                                                    {log.filename}
                                                </div>
                                                <div style={{ 
                                                    fontSize: '0.8rem',
                                                    color: 'var(--text-muted)',
                                                    fontWeight: 500
                                                }}>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </div>

                                            {/* Type */}
                                            <div style={{ flex: '0 0 100px' }}>
                                                <div style={{ 
                                                    fontSize: '0.7rem',
                                                    color: 'var(--text-muted)',
                                                    marginBottom: '0.35rem',
                                                    fontWeight: 600,
                                                    letterSpacing: '1px'
                                                }}>
                                                    TYPE
                                                </div>
                                                <span style={{
                                                    padding: '0.4rem 0.85rem',
                                                    background: log.doc_type === 'bank'
                                                        ? 'rgba(0, 102, 255, 0.15)'
                                                        : 'rgba(0, 163, 255, 0.15)',
                                                    color: log.doc_type === 'bank' ? '#0066FF' : '#00A3FF',
                                                    borderRadius: '8px',
                                                    fontSize: '0.8rem',
                                                    fontWeight: 700,
                                                    textTransform: 'uppercase',
                                                    border: `1px solid ${log.doc_type === 'bank' ? 'rgba(0, 102, 255, 0.3)' : 'rgba(0, 163, 255, 0.3)'}`
                                                }}>
                                                    {log.doc_type}
                                                </span>
                                            </div>

                                            {/* Method */}
                                            <div style={{ flex: '0 0 100px' }}>
                                                <div style={{ 
                                                    fontSize: '0.7rem',
                                                    color: 'var(--text-muted)',
                                                    marginBottom: '0.35rem',
                                                    fontWeight: 600,
                                                    letterSpacing: '1px'
                                                }}>
                                                    METHOD
                                                </div>
                                                <div style={{ 
                                                    fontWeight: 700,
                                                    fontSize: '0.9rem',
                                                    color: 'white'
                                                }}>
                                                    {log.method === 'gemini_vision' ? '🤖 Gemini' : '📝 OCR'}
                                                </div>
                                            </div>

                                            {/* Tokens */}
                                            <div style={{ flex: '0 0 100px' }}>
                                                <div style={{ 
                                                    fontSize: '0.7rem',
                                                    color: 'var(--text-muted)',
                                                    marginBottom: '0.35rem',
                                                    fontWeight: 600,
                                                    letterSpacing: '1px'
                                                }}>
                                                    TOKENS
                                                </div>
                                                <div style={{ 
                                                    fontWeight: 700,
                                                    fontSize: '0.95rem',
                                                    color: '#667eea'
                                                }}>
                                                    {log.total_tokens || 0}
                                                </div>
                                            </div>

                                            {/* Cost */}
                                            <div style={{ flex: '0 0 120px', textAlign: 'right' }}>
                                                <div style={{ 
                                                    fontSize: '0.7rem',
                                                    color: 'var(--text-muted)',
                                                    marginBottom: '0.35rem',
                                                    fontWeight: 600,
                                                    letterSpacing: '1px'
                                                }}>
                                                    COST
                                                </div>
                                                <div style={{ 
                                                    fontWeight: 900,
                                                    fontSize: '1.1rem',
                                                    color: '#00d25b',
                                                    fontFamily: 'monospace'
                                                }}>
                                                    ${(log.cost_usd || 0).toFixed(6)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
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
                                        <FileText size={60} style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
                                    </motion.div>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 600 }}>
                                        No processing history found
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}

function SummaryCard({ icon: Icon, label, value, color, delay = 0 }) {
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay, type: "spring", damping: 20 }}
            whileHover={{ scale: 1.05, y: -8 }}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                borderRadius: '20px',
                padding: '2rem',
                border: '2px solid rgba(255, 255, 255, 0.1)',
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
                    width: '55px',
                    height: '55px',
                    borderRadius: '16px',
                    background: `linear-gradient(135deg, ${color}, ${color}dd)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1.5rem',
                    boxShadow: `0 8px 24px ${color}33`
                }}
            >
                <Icon size={28} color="white" />
            </motion.div>
            <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                marginBottom: '0.75rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                textTransform: 'uppercase'
            }}>
                {label}
            </div>
            <p style={{
                fontSize: '1.8rem',
                fontWeight: 900,
                color: 'var(--text-primary)',
                wordBreak: 'break-word',
                lineHeight: 1.2
            }}>
                {value}
            </p>

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
                    background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none'
                }}
            />
        </motion.div>
    )
}