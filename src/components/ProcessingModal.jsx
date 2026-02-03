import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { CheckCircle2, XCircle, Loader2, Cpu, Eye, DollarSign, TrendingDown, Zap, Sparkles } from 'lucide-react'

export default function ProcessingModal({ state, onClose }) {
    const [liveTokens, setLiveTokens] = useState({
        input: 0,
        output: 0,
        total: 0
    })
    const [liveCost, setLiveCost] = useState(0)

    const simulationInterval = useRef(null)

    useEffect(() => {
        if (state.status === 'processing') {
            simulationInterval.current = setInterval(() => {
                setLiveTokens(prev => {
                    const newInput = prev.input + Math.floor(Math.random() * 5)
                    const newOutput = prev.output + Math.floor(Math.random() * 2)
                    const newTotal = newInput + newOutput
                    
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
    
    const singleCost = liveCost * 1.2
    const batchSavings = singleCost - liveCost

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={status === 'complete' || status === 'error' ? onClose : undefined}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: '2rem'
            }}
        >
            <motion.div
                initial={{ scale: 0.8, y: 50, rotateX: 20 }}
                animate={{ scale: 1, y: 0, rotateX: 0 }}
                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxWidth: status === 'complete' ? '1200px' : '650px',
                    width: '95%',
                    background: 'rgba(20, 20, 30, 0.98)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '32px',
                    padding: '3rem',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 30px 90px rgba(0, 0, 0, 0.5)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated background */}
                <motion.div
                    animate={{
                        background: [
                            'radial-gradient(circle at 20% 20%, rgba(0, 102, 255, 0.15) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 80%, rgba(0, 163, 255, 0.15) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 20%, rgba(0, 102, 255, 0.15) 0%, transparent 50%)'
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
                    {status !== 'complete' ? (
                        <>
                            {/* Processing/Error View */}
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                                {status === 'processing' && (
                                    <div style={{ position: 'relative', display: 'inline-block' }}>
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            style={{ 
                                                opacity: 0.2,
                                                color: '#0066FF'
                                            }}
                                        >
                                            <Cpu size={140} />
                                        </motion.div>
                                        <div style={{ 
                                            position: 'absolute', 
                                            inset: 0, 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center' 
                                        }}>
                                            <motion.div
                                                animate={{ 
                                                    scale: [1, 1.3, 1],
                                                    rotate: 360
                                                }}
                                                transition={{ 
                                                    scale: { duration: 1.5, repeat: Infinity },
                                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" }
                                                }}
                                            >
                                                <Loader2 size={56} style={{ color: '#0066FF' }} />
                                            </motion.div>
                                        </div>
                                    </div>
                                )}
                                {status === 'error' && (
                                    <motion.div 
                                        initial={{ scale: 0, rotate: -180 }} 
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", damping: 15 }}
                                    >
                                        <XCircle size={100} style={{ color: '#ef4444' }} />
                                    </motion.div>
                                )}
                            </div>

                            {/* Token & Cost Counter */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: '1.5rem', 
                                marginBottom: '2.5rem' 
                            }}>
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                    style={{
                                        padding: '1.75rem',
                                        background: 'rgba(0, 102, 255, 0.08)',
                                        borderRadius: '20px',
                                        border: '2px solid rgba(0, 102, 255, 0.2)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div style={{ 
                                        fontSize: '0.7rem', 
                                        marginBottom: '1rem', 
                                        fontWeight: 700,
                                        letterSpacing: '2px',
                                        color: 'rgba(255, 255, 255, 0.6)'
                                    }}>
                                        TOKENS PROCESSED
                                    </div>
                                    <motion.div 
                                        key={liveTokens.total} 
                                        initial={{ scale: 1.2, opacity: 0 }} 
                                        animate={{ scale: 1, opacity: 1 }}
                                        style={{ 
                                            fontSize: '3rem',
                                            fontWeight: 900,
                                            color: '#0066FF',
                                            marginBottom: '1rem',
                                            fontFamily: 'monospace',
                                            lineHeight: 1
                                        }}
                                    >
                                        {liveTokens.total.toLocaleString()}
                                    </motion.div>
                                    <div style={{ 
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '1.5rem',
                                        fontSize: '0.85rem',
                                        opacity: 0.7
                                    }}>
                                        <div>
                                            <div style={{ 
                                                fontSize: '0.65rem', 
                                                color: 'rgba(255, 255, 255, 0.5)',
                                                marginBottom: '0.25rem'
                                            }}>
                                                IN
                                            </div>
                                            <div style={{ color: 'white', fontWeight: 700 }}>
                                                {liveTokens.input.toLocaleString()}
                                            </div>
                                        </div>
                                        <div style={{ 
                                            width: '1px', 
                                            background: 'rgba(255,255,255,0.1)' 
                                        }} />
                                        <div>
                                            <div style={{ 
                                                fontSize: '0.65rem', 
                                                color: 'rgba(255, 255, 255, 0.5)',
                                                marginBottom: '0.25rem'
                                            }}>
                                                OUT
                                            </div>
                                            <div style={{ color: 'white', fontWeight: 700 }}>
                                                {liveTokens.output.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    style={{
                                        padding: '1.75rem',
                                        background: 'linear-gradient(135deg, rgba(0, 210, 91, 0.08), rgba(102, 126, 234, 0.08))',
                                        borderRadius: '20px',
                                        border: '2px solid rgba(0, 210, 91, 0.2)',
                                        textAlign: 'center',
                                        position: 'relative',
                                        overflow: 'hidden'
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
                                            background: 'linear-gradient(90deg, transparent, rgba(0, 210, 91, 0.1), transparent)',
                                            pointerEvents: 'none'
                                        }}
                                    />
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <div style={{ 
                                            fontSize: '0.7rem', 
                                            marginBottom: '1rem', 
                                            fontWeight: 700,
                                            letterSpacing: '2px',
                                            color: 'rgba(255, 255, 255, 0.6)'
                                        }}>
                                            PROCESSING COST
                                        </div>
                                        <motion.div 
                                            key={liveCost} 
                                            initial={{ scale: 1.2, opacity: 0 }} 
                                            animate={{ scale: 1, opacity: 1 }}
                                            style={{ 
                                                fontSize: '3rem', 
                                                color: '#00d25b',
                                                fontWeight: 900,
                                                fontFamily: 'monospace',
                                                lineHeight: 1
                                            }}
                                        >
                                            ${liveCost.toFixed(6)}
                                        </motion.div>
                                        {totalFiles > 1 && (
                                            <motion.div 
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.5 }}
                                                style={{ 
                                                    marginTop: '1rem', 
                                                    fontSize: '0.8rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    justifyContent: 'center',
                                                    color: '#00d25b'
                                                }}
                                            >
                                                <TrendingDown size={14} />
                                                Saved ${batchSavings.toFixed(6)} (batch)
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            </div>

                            <div style={{ textAlign: 'center' }}>
                                <motion.h2
                                    animate={{ opacity: [0.7, 1, 0.7] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    style={{ 
                                        fontSize: '2rem', 
                                        marginBottom: '1rem',
                                        fontWeight: 900,
                                        color: 'white'
                                    }}
                                >
                                    {status === 'processing' ? 'Processing Matrix' : 'Process Halted'}
                                </motion.h2>
                                {status === 'processing' && (
                                    <>
                                        <p style={{ 
                                            fontSize: '1.1rem', 
                                            color: 'rgba(255, 255, 255, 0.7)',
                                            marginBottom: '1.5rem'
                                        }}>
                                            Optimizing: <span style={{ color: 'white', fontWeight: 700 }}>{currentFile}</span>
                                        </p>
                                        <div style={{
                                            width: '100%',
                                            height: '12px',
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            marginBottom: '1rem'
                                        }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${((processedFiles) / totalFiles) * 100}%` }}
                                                transition={{ duration: 0.5, ease: "easeOut" }}
                                                style={{
                                                    height: '100%',
                                                    background: 'linear-gradient(90deg, #0066FF, #00A3FF)',
                                                    borderRadius: '8px',
                                                    position: 'relative'
                                                }}
                                            >
                                                <motion.div
                                                    animate={{
                                                        x: ['-100%', '200%']
                                                    }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                    style={{
                                                        position: 'absolute',
                                                        top: 0,
                                                        left: 0,
                                                        right: 0,
                                                        bottom: 0,
                                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
                                                    }}
                                                />
                                            </motion.div>
                                        </div>
                                        <p style={{ 
                                            fontSize: '0.85rem',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            fontWeight: 700,
                                            letterSpacing: '1.5px'
                                        }}>
                                            BATCH QUEUE: {processedFiles} / {totalFiles} UNITS
                                        </p>
                                    </>
                                )}
                                {status === 'error' && (
                                    <p style={{ 
                                        fontSize: '1rem', 
                                        color: '#ef4444',
                                        marginTop: '1rem'
                                    }}>
                                        {state.error || 'Unknown protocol failure'}
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        /* COMPLETE VIEW */
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                marginBottom: '2.5rem' 
                            }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", damping: 15 }}
                                        >
                                            <CheckCircle2 size={40} style={{ color: '#00d25b' }} />
                                        </motion.div>
                                        <h2 style={{ 
                                            fontSize: '2.5rem', 
                                            fontWeight: 900,
                                            color: 'white',
                                            margin: 0
                                        }}>
                                            Analysis Complete
                                        </h2>
                                    </div>
                                    <p style={{ 
                                        color: 'rgba(255, 255, 255, 0.7)', 
                                        marginLeft: '3.5rem',
                                        fontSize: '1rem'
                                    }}>
                                        Extracted {totalFiles} document(s) • Cost: ${liveCost.toFixed(6)}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3, type: "spring" }}
                                        style={{
                                            background: 'rgba(102, 126, 234, 0.15)',
                                            padding: '1rem 1.5rem',
                                            borderRadius: '16px',
                                            border: '2px solid rgba(102, 126, 234, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <Zap size={20} style={{ color: '#667eea' }} />
                                        <div>
                                            <div style={{ 
                                                fontWeight: 900, 
                                                fontSize: '1.3rem',
                                                color: '#667eea',
                                                lineHeight: 1
                                            }}>
                                                {liveTokens.total.toLocaleString()}
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.7rem',
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                marginTop: '0.25rem'
                                            }}>
                                                TOKENS
                                            </div>
                                        </div>
                                    </motion.div>
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.4, type: "spring" }}
                                        style={{
                                            background: 'rgba(0, 210, 91, 0.15)',
                                            padding: '1rem 1.5rem',
                                            borderRadius: '16px',
                                            border: '2px solid rgba(0, 210, 91, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <DollarSign size={20} style={{ color: '#00d25b' }} />
                                        <div>
                                            <div style={{ 
                                                fontWeight: 900, 
                                                fontSize: '1.3rem', 
                                                color: '#00d25b',
                                                lineHeight: 1
                                            }}>
                                                ${liveCost.toFixed(6)}
                                            </div>
                                            <div style={{ 
                                                fontSize: '0.7rem',
                                                color: 'rgba(255, 255, 255, 0.6)',
                                                marginTop: '0.25rem'
                                            }}>
                                                USD
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </div>

                            {totalFiles > 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    style={{ 
                                        background: 'rgba(0, 210, 91, 0.08)', 
                                        padding: '1.25rem 1.75rem', 
                                        borderRadius: '16px', 
                                        marginBottom: '2rem', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '1rem', 
                                        border: '2px solid rgba(0, 210, 91, 0.2)' 
                                    }}
                                >
                                    <TrendingDown size={24} style={{ color: '#00d25b' }} />
                                    <div>
                                        <div style={{ fontWeight: 800, color: '#00d25b', fontSize: '1.1rem' }}>
                                            Batch Savings: ${batchSavings.toFixed(6)} (20%)
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.85rem', 
                                            color: 'rgba(255, 255, 255, 0.6)', 
                                            marginTop: '0.25rem' 
                                        }}>
                                            Single processing would have cost ${singleCost.toFixed(6)}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: '1fr 1fr', 
                                gap: '2rem'
                            }}>
                                {/* Image Preview */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 }}
                                    style={{
                                        background: 'rgba(0, 0, 0, 0.4)',
                                        borderRadius: '20px',
                                        padding: '1.25rem',
                                        border: '2px solid rgba(255, 255, 255, 0.05)'
                                    }}
                                >
                                    <div style={{ 
                                        marginBottom: '1rem', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '0.75rem' 
                                    }}>
                                        <Eye size={18} style={{ color: '#667eea' }} />
                                        <span style={{ 
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            color: 'white',
                                            letterSpacing: '1px'
                                        }}>
                                            NEURAL VISION OUTPUT
                                        </span>
                                    </div>
                                    <div style={{ 
                                        borderRadius: '16px', 
                                        overflow: 'hidden', 
                                        height: '450px', 
                                        background: '#000', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center' 
                                    }}>
                                        {lastResult?.image_url ? (
                                            <img 
                                                src={lastResult.image_url} 
                                                alt="Processed" 
                                                style={{ 
                                                    maxWidth: '100%', 
                                                    maxHeight: '100%', 
                                                    objectFit: 'contain' 
                                                }} 
                                            />
                                        ) : (
                                            <div style={{ 
                                                color: 'rgba(255, 255, 255, 0.4)', 
                                                fontSize: '0.95rem',
                                                textAlign: 'center'
                                            }}>
                                                Image preview unavailable
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* Extracted Data */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                    style={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        gap: '1.5rem' 
                                    }}
                                >
                                    <div style={{ 
                                        background: 'rgba(255, 255, 255, 0.03)', 
                                        padding: '1.75rem', 
                                        borderRadius: '20px', 
                                        border: '2px solid rgba(255, 255, 255, 0.1)',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <h4 style={{ 
                                            marginBottom: '1.5rem', 
                                            fontSize: '0.8rem', 
                                            textTransform: 'uppercase', 
                                            letterSpacing: '2px', 
                                            color: '#667eea', 
                                            fontWeight: 800,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}>
                                            <Sparkles size={16} />
                                            EXTRACTED FIELDS
                                        </h4>
                                        <div style={{ 
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '1rem',
                                            flex: 1,
                                            overflowY: 'auto',
                                            paddingRight: '0.5rem'
                                        }}>
                                            {Object.entries(lastResult || {}).map(([key, value], idx) => {
    // Filter out metadata fields
    if ([
        'success', 
        'method', 
        'token_usage', 
        'tokenUsage',
        'processing_time_ms', 
        'processingTimeMs',
        'image_url', 
        'imageUrl',
        'filename'
    ].includes(key)) return null;
    
    // Skip complex objects/arrays - only show simple string/number values
    if (typeof value === 'object' && value !== null) {
        return null;
    }
    
    // Skip empty values
    if (!value) return null;
    
    return (
        <motion.div
            key={key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + idx * 0.05 }}
            style={{ 
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                paddingBottom: '0.75rem' 
            }}
        >
            <div style={{ 
                fontSize: '0.7rem', 
                color: 'rgba(255, 255, 255, 0.5)',
                textTransform: 'uppercase',
                marginBottom: '0.35rem',
                letterSpacing: '1px'
            }}>
                {key.replace(/_/g, ' ')}
            </div>
            <div style={{ 
                fontSize: '1rem', 
                fontWeight: 600, 
                color: 'white',
                wordBreak: 'break-word',
                overflowWrap: 'break-word',
                whiteSpace: 'pre-wrap'
            }}>
                {String(value)}
            </div>
        </motion.div>
    )
})}
                                        </div>
                                    </div>

                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 }}
                                        style={{ 
                                            background: 'rgba(0, 0, 0, 0.3)', 
                                            padding: '1.5rem', 
                                            borderRadius: '20px', 
                                            border: '2px solid rgba(255, 255, 255, 0.05)' 
                                        }}
                                    >
                                        <div style={{ 
                                            fontSize: '0.75rem',
                                            color: 'rgba(255, 255, 255, 0.6)',
                                            marginBottom: '1rem',
                                            fontWeight: 700,
                                            letterSpacing: '1.5px'
                                        }}>
                                            PROCESSING METRICS
                                        </div>
                                        <div style={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: '1fr 1fr', 
                                            gap: '1rem', 
                                            fontSize: '0.85rem' 
                                        }}>
                                            <div>
                                                <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.25rem' }}>
                                                    Method
                                                </div>
                                                <div style={{ color: 'white', fontWeight: 700 }}>
                                                    {lastResult?.method === 'gemini_vision' ? 'Gemini Vision' : 'macOCR + AI'}
                                                </div>
                                            </div>
                                            <div>
                                                <div style={{ color: 'rgba(255, 255, 255, 0.5)', marginBottom: '0.25rem' }}>
                                                    Processing Time
                                                </div>
                                                <div style={{ color: 'white', fontWeight: 700 }}>
                                                    {lastResult?.processing_time_ms || 0}ms
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            </div>

                            <motion.button
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                style={{
                                    marginTop: '2.5rem',
                                    width: '100%',
                                    padding: '1.25rem',
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    borderRadius: '16px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #0066FF, #00A3FF)',
                                    color: 'white',
                                    cursor: 'pointer',
                                    boxShadow: '0 8px 32px rgba(0, 102, 255, 0.4)',
                                    position: 'relative',
                                    overflow: 'hidden'
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
                                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                        pointerEvents: 'none'
                                    }}
                                />
                                <span style={{ position: 'relative', zIndex: 1 }}>
                                    Close Results Terminal
                                </span>
                            </motion.button>
                        </motion.div>
                    )}

                    {status === 'error' && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onClose}
                            style={{
                                marginTop: '2rem',
                                width: '100%',
                                padding: '1.25rem',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                borderRadius: '16px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #ef4444, #f87171)',
                                color: 'white',
                                cursor: 'pointer',
                                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.4)'
                            }}
                        >
                            Back to Terminal
                        </motion.button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}