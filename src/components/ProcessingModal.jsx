import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { CheckCircle2, XCircle, Loader2, Cpu, Eye, DollarSign, TrendingDown, Zap } from 'lucide-react'

export default function ProcessingModal({ state, onClose }) {
    const [liveTokens, setLiveTokens] = useState({
        input: 0,
        output: 0,
        total: 0
    })
    const [liveCost, setLiveCost] = useState(0)

    const simulationInterval = useRef(null)

    // Live token counting & cost calculation
    useEffect(() => {
        if (state.status === 'processing') {
            simulationInterval.current = setInterval(() => {
                setLiveTokens(prev => {
                    const newInput = prev.input + Math.floor(Math.random() * 5)
                    const newOutput = prev.output + Math.floor(Math.random() * 2)
                    const newTotal = newInput + newOutput
                    
                    // Calculate live cost: $0.075/1M input + $0.30/1M output
                    const newCost = (newInput / 1000000 * 0.075) + (newOutput / 1000000 * 0.30)
                    setLiveCost(newCost)
                    
                    return {
                        input: newInput,
                        output: newOutput,
                        total: newTotal
                    }
                })
            }, 100)
        } else if (state.status === 'complete' || state.status === 'error') {
            if (simulationInterval.current) clearInterval(simulationInterval.current)

            if (state.tokenUsage) {
                const input = state.tokenUsage.input || state.tokenUsage.input_tokens || 0
                const output = state.tokenUsage.output || state.tokenUsage.output_tokens || 0
                const total = state.tokenUsage.total || state.tokenUsage.total_tokens || 0
                
                setLiveTokens({ input, output, total })
                
                // Calculate final cost
                const cost = (input / 1000000 * 0.075) + (output / 1000000 * 0.30)
                setLiveCost(cost)
            }
        }

        return () => {
            if (simulationInterval.current) clearInterval(simulationInterval.current)
        }
    }, [state.status, state.tokenUsage])

    if (!state) return null

    const { status, currentFile, totalFiles, processedFiles, results } = state

    const lastResult = results?.results ? results.results[results.results.length - 1] : results
    
    // Calculate batch savings (20% when using batch mode)
    const singleCost = liveCost * 1.2
    const batchSavings = singleCost - liveCost

    return (
        <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status === 'complete' || status === 'error' ? onClose : undefined}
        >
            <motion.div
                className={`modal-content ${status === 'complete' ? 'modal-wide' : ''}`}
                initial={{ scale: 0.8, y: 50, rotateX: 20 }}
                animate={{ scale: 1, y: 0, rotateX: 0 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: status === 'complete' ? '1100px' : '600px', width: '95%' }}
            >
                {status !== 'complete' ? (
                    <>
                        {/* Processing View */}
                        <div className="modal-icon">
                            {status === 'processing' && (
                                <div style={{ position: 'relative' }}>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="text-purple"
                                        style={{ opacity: 0.2 }}
                                    >
                                        <Cpu size={120} />
                                    </motion.div>
                                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                        >
                                            <Loader2 size={48} className="text-purple animate-spin" />
                                        </motion.div>
                                    </div>
                                </div>
                            )}
                            {status === 'error' && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                    <XCircle size={80} className="text-red" />
                                </motion.div>
                            )}
                        </div>

                        {/* Token & Cost Counter */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2rem' }}>
                            <div className="token-counter">
                                <div className="stat-label" style={{ marginBottom: '0.8rem', fontSize: '0.7rem' }}>TOKENS</div>
                                <motion.div className="token-value" key={liveTokens.total} initial={{ scale: 1.1 }} animate={{ scale: 1 }} style={{ fontSize: '2.5rem' }}>
                                    {liveTokens.total.toLocaleString()}
                                </motion.div>
                                <div className="token-row" style={{ marginTop: '1rem', opacity: 0.7 }}>
                                    <div className="token-small">
                                        <span className="stat-label" style={{ fontSize: '0.65rem' }}>IN</span>
                                        <span style={{ color: 'white', fontWeight: 700 }}>{liveTokens.input.toLocaleString()}</span>
                                    </div>
                                    <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', height: '12px' }}></div>
                                    <div className="token-small">
                                        <span className="stat-label" style={{ fontSize: '0.65rem' }}>OUT</span>
                                        <span style={{ color: 'white', fontWeight: 700 }}>{liveTokens.output.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="token-counter" style={{ background: 'linear-gradient(135deg, rgba(0, 210, 91, 0.05), rgba(102, 126, 234, 0.05))' }}>
                                <div className="stat-label" style={{ marginBottom: '0.8rem', fontSize: '0.7rem' }}>PROCESSING COST</div>
                                <motion.div className="token-value" key={liveCost} initial={{ scale: 1.1 }} animate={{ scale: 1 }} style={{ fontSize: '2.5rem', color: '#00d25b' }}>
                                    ${liveCost.toFixed(6)}
                                </motion.div>
                                {totalFiles > 1 && (
                                    <div style={{ marginTop: '1rem', opacity: 0.7, fontSize: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
                                            <TrendingDown size={12} className="text-green" />
                                            <span>Saved ${batchSavings.toFixed(6)} (batch)</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div style={{ marginTop: '2.5rem' }}>
                            <h2 className="modal-title" style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>
                                {status === 'processing' ? 'Processing Matrix' : 'Process Halted'}
                            </h2>
                            {status === 'processing' && (
                                <>
                                    <p className="hero-subtitle" style={{ fontSize: '1rem', opacity: 0.8 }}>
                                        Optimizing: <span style={{ color: 'white', fontWeight: 600 }}>{currentFile}</span>
                                    </p>
                                    <div className="progress-bar">
                                        <motion.div
                                            className="progress-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${((processedFiles) / totalFiles) * 100}%` }}
                                        />
                                    </div>
                                    <p className="stat-label" style={{ marginTop: '1.2rem', fontSize: '0.8rem' }}>
                                        BATCH QUEUE: {processedFiles} / {totalFiles} UNITS
                                    </p>
                                </>
                            )}
                            {status === 'error' && (
                                <p className="text-red" style={{ fontSize: '0.95rem' }}>{state.error || 'Unknown protocol failure'}</p>
                            )}
                        </div>
                    </>
                ) : (
                    /* COMPLETE VIEW */
                    <div className="results-view">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <CheckCircle2 size={32} className="text-green" />
                                    <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Space Grotesk' }}>Analysis Complete</h2>
                                </div>
                                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                                    Extracted {totalFiles} document(s) • Cost: ${liveCost.toFixed(6)}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="token-badge" style={{ background: 'rgba(102, 126, 234, 0.1)', padding: '0.8rem 1.5rem', borderRadius: '15px', border: '1px solid var(--purple-glow)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Zap size={16} className="text-purple" />
                                        <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{liveTokens.total.toLocaleString()}</span>
                                        <span className="stat-label" style={{ fontSize: '0.7rem' }}>TOKENS</span>
                                    </div>
                                </div>
                                <div className="token-badge" style={{ background: 'rgba(0, 210, 91, 0.1)', padding: '0.8rem 1.5rem', borderRadius: '15px', border: '1px solid rgba(0, 210, 91, 0.3)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <DollarSign size={16} className="text-green" />
                                        <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#00d25b' }}>${liveCost.toFixed(6)}</span>
                                        <span className="stat-label" style={{ fontSize: '0.7rem' }}>USD</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {totalFiles > 1 && (
                            <div style={{ background: 'rgba(0, 210, 91, 0.05)', padding: '1rem 1.5rem', borderRadius: '15px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid rgba(0, 210, 91, 0.1)' }}>
                                <TrendingDown size={20} className="text-green" />
                                <div>
                                    <div style={{ fontWeight: 700, color: '#00d25b' }}>Batch Savings: ${batchSavings.toFixed(6)} (20%)</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                                        Single processing would have cost ${singleCost.toFixed(6)}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="results-split" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', textAlign: 'left' }}>
                            <div className="result-preview" style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '25px', padding: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Eye size={16} className="text-purple" />
                                    <span className="stat-label" style={{ color: 'white' }}>Neural Vision Output</span>
                                </div>
                                <div style={{ borderRadius: '15px', overflow: 'hidden', height: '400px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {lastResult?.image_url ? (
                                        <img src={lastResult.image_url} alt="Processed" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Image preview unavailable</div>
                                    )}
                                </div>
                            </div>

                            <div className="result-data" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                                    <h4 style={{ marginBottom: '1rem', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--purple)', fontWeight: 800 }}>Extracted Fields</h4>
                                    <div style={{ display: 'grid', gap: '1rem' }}>
                                        {Object.entries(lastResult || {}).map(([key, value]) => {
                                            if (['success', 'method', 'token_usage', 'processing_time_ms', 'image_url', 'filename'].includes(key)) return null;
                                            return (
                                                <div key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                                                    <div className="stat-label" style={{ fontSize: '0.65rem' }}>{key.replace(/_/g, ' ').toUpperCase()}</div>
                                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>{value || 'Not Found'}</div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.2rem', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="stat-label" style={{ marginBottom: '0.8rem' }}>Processing Metrics</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)' }}>Method</div>
                                            <div style={{ color: 'white', fontWeight: 700 }}>{lastResult?.method === 'gemini_vision' ? 'Gemini Vision' : 'macOCR + AI'}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'var(--text-muted)' }}>Processing Time</div>
                                            <div style={{ color: 'white', fontWeight: 700 }}>{lastResult?.processing_time_ms || 0}ms</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <motion.button
                            className="btn btn-primary"
                            style={{ marginTop: '3rem', width: '100%' }}
                            onClick={onClose}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            Close Results Terminal
                        </motion.button>
                    </div>
                )}

                {status === 'error' && (
                    <motion.button
                        className="btn btn-primary"
                        style={{ marginTop: '2.5rem', width: '100%' }}
                        onClick={onClose}
                        whileHover={{ scale: 1.02 }}
                    >
                        Back to Terminal
                    </motion.button>
                )}
            </motion.div>
        </motion.div>
    )
}