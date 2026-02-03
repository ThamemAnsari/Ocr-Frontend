import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, Package, Copy, Check, Download, Search, AlertCircle, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

const API_BASE_URL = 'https://ocr-owwb.onrender.com'

export default function BarcodeExtractor() {
    const [file, setFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [results, setResults] = useState(null)
    const [copiedIndex, setCopiedIndex] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [error, setError] = useState(null)

    const extractionPrompt = `Extract ALL barcode tracking numbers from this image.
Each barcode follows the format: CT + 9 digits + IN (example: CT270166930IN)

IMPORTANT: Look for barcodes that have:
- Letter "C" at the top
- A barcode pattern (vertical lines)
- Tracking number like CT270166930IN below the barcode
- Multiple barcodes arranged in a grid

Return a JSON object with:
- total_barcodes: number of barcodes found
- barcodes: array of tracking numbers (just the tracking numbers, nothing else)

If NO barcodes are found, return:
{
    "total_barcodes": 0,
    "barcodes": [],
    "note": "No India Post barcodes detected in this image"
}

Format:
{
    "total_barcodes": 39,
    "barcodes": ["CT270166930IN", "CT270167056IN", ...]
}`

    const onDrop = useCallback((acceptedFiles) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0]
            setFile(selectedFile)
            setResults(null)
            setError(null)
            
            // Create image preview
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (e) => {
                    setImagePreview(e.target.result)
                }
                reader.readAsDataURL(selectedFile)
            } else {
                setImagePreview(null)
            }
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf']
        },
        multiple: false
    })

    const processBarcode = async () => {
        if (!file) return

        setProcessing(true)
        setResults(null)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('extraction_prompt', extractionPrompt)

            const response = await fetch(`${API_BASE_URL}/ocr/generic`, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()
            
            if (result.success !== false) {
                // Check if barcodes were actually found
                const barcodes = result.barcodes || []
                const totalBarcodes = result.total_barcodes || barcodes.length || 0
                
                if (totalBarcodes === 0) {
                    setError({
                        title: 'No Barcodes Found',
                        message: 'This file does not appear to contain India Post barcode tracking numbers.',
                        suggestion: 'Please upload an image of a barcode sheet with format: CT + 9 digits + IN (e.g., CT270166930IN)',
                        extractedData: result
                    })
                } else {
                    setResults({
                        ...result,
                        total_barcodes: totalBarcodes,
                        barcodes: barcodes
                    })
                }
            } else {
                setError({
                    title: 'Extraction Failed',
                    message: result.error || 'Unknown error occurred',
                    suggestion: 'Please try again with a different image'
                })
            }
        } catch (error) {
            setError({
                title: 'Network Error',
                message: error.message,
                suggestion: 'Please check your internet connection and try again'
            })
        } finally {
            setProcessing(false)
        }
    }

    const copyToClipboard = (text, index) => {
        navigator.clipboard.writeText(text)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    const copyAllBarcodes = () => {
        if (results?.barcodes) {
            const allBarcodes = results.barcodes.join('\n')
            navigator.clipboard.writeText(allBarcodes)
            setCopiedIndex('all')
            setTimeout(() => setCopiedIndex(null), 2000)
        }
    }

    const downloadCSV = () => {
        if (results?.barcodes) {
            const csv = 'Barcode Number\n' + results.barcodes.join('\n')
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'barcodes.csv'
            a.click()
        }
    }

    const filteredBarcodes = results?.barcodes?.filter(barcode => 
        barcode.toLowerCase().includes(searchTerm.toLowerCase())
    ) || []

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)',
            padding: '2rem',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '3rem' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <Package size={48} style={{ color: '#0066FF' }} />
                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: 900,
                            background: 'linear-gradient(135deg, #0066FF, #00A3FF)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            margin: 0
                        }}>
                            Barcode Extractor
                        </h1>
                    </div>
                    <p style={{ color: '#888', fontSize: '1.1rem' }}>
                        Extract India Post tracking numbers from barcode sheets
                    </p>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: results ? '1fr 1.5fr' : '1fr',
                    gap: '2rem'
                }}>
                    {/* Upload Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(20px)',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '24px',
                            padding: '2rem'
                        }}
                    >
                        <h2 style={{ 
                            color: 'white', 
                            marginBottom: '1.5rem',
                            fontSize: '1.5rem',
                            fontWeight: 700
                        }}>
                            Upload Barcode Sheet
                        </h2>

                        <div
                            {...getRootProps()}
                            style={{
                                border: `3px dashed ${isDragActive ? '#0066FF' : 'rgba(255, 255, 255, 0.2)'}`,
                                borderRadius: '16px',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: isDragActive ? 'rgba(0, 102, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                                transition: 'all 0.3s ease',
                                marginBottom: '1.5rem'
                            }}
                        >
                            <input {...getInputProps()} />
                            
                            {!file ? (
                                <>
                                    <Upload size={48} style={{ color: '#0066FF', marginBottom: '1rem' }} />
                                    <p style={{ color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                                        {isDragActive ? 'Drop here!' : 'Drop barcode image here'}
                                    </p>
                                    <p style={{ color: '#888', fontSize: '0.9rem' }}>
                                        PNG, JPG, or PDF
                                    </p>
                                </>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
                                        <FileText size={24} style={{ color: '#0066FF' }} />
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ color: 'white', fontWeight: 600, margin: 0 }}>{file.name}</p>
                                            <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                                                {(file.size / 1024).toFixed(1)} KB
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                setFile(null); 
                                                setImagePreview(null);
                                                setResults(null); 
                                                setError(null);
                                            }}
                                            style={{
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '2px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '8px',
                                                padding: '0.5rem',
                                                cursor: 'pointer',
                                                color: '#ef4444'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                    
                                    {/* Image Preview */}
                                    {imagePreview && (
                                        <div style={{
                                            marginTop: '1rem',
                                            borderRadius: '12px',
                                            overflow: 'hidden',
                                            border: '2px solid rgba(255, 255, 255, 0.1)'
                                        }}>
                                            <img 
                                                src={imagePreview} 
                                                alt="Preview" 
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    maxHeight: '300px',
                                                    objectFit: 'contain',
                                                    background: 'rgba(0, 0, 0, 0.3)'
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Expected Format Info */}
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(0, 102, 255, 0.05)',
                            border: '2px solid rgba(0, 102, 255, 0.2)',
                            borderRadius: '12px',
                            marginBottom: '1.5rem'
                        }}>
                            <h4 style={{ 
                                color: '#0066FF', 
                                fontSize: '0.9rem', 
                                fontWeight: 700, 
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <ImageIcon size={16} />
                                Expected Format
                            </h4>
                            <ul style={{ 
                                color: '#888', 
                                fontSize: '0.85rem', 
                                margin: 0, 
                                paddingLeft: '1.5rem',
                                lineHeight: 1.6
                            }}>
                                <li>Multiple barcodes arranged in a grid</li>
                                <li>Letter "C" above each barcode</li>
                                <li>Format: <code style={{ color: '#0066FF' }}>CT270166930IN</code></li>
                                <li>India Post tracking labels</li>
                            </ul>
                        </div>

                        <motion.button
                            whileHover={{ scale: file && !processing ? 1.02 : 1 }}
                            whileTap={{ scale: file && !processing ? 0.98 : 1 }}
                            disabled={!file || processing}
                            onClick={processBarcode}
                            style={{
                                width: '100%',
                                padding: '1rem',
                                fontSize: '1.1rem',
                                fontWeight: 700,
                                borderRadius: '12px',
                                border: 'none',
                                background: (!file || processing)
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'linear-gradient(135deg, #0066FF, #00A3FF)',
                                color: (!file || processing) ? 'rgba(255, 255, 255, 0.3)' : 'white',
                                cursor: (!file || processing) ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {processing ? 'Extracting...' : file ? 'Extract Barcodes' : 'Select File First'}
                        </motion.button>

                        {/* Summary */}
                        {(results || error) && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    marginTop: '2rem',
                                    padding: '1.5rem',
                                    background: error 
                                        ? 'rgba(239, 68, 68, 0.1)'
                                        : 'rgba(0, 102, 255, 0.1)',
                                    border: `2px solid ${error ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 102, 255, 0.3)'}`,
                                    borderRadius: '16px'
                                }}
                            >
                                <h3 style={{ 
                                    color: 'white', 
                                    marginBottom: '1rem', 
                                    fontSize: '1.2rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}>
                                    {error && <AlertCircle size={20} style={{ color: '#ef4444' }} />}
                                    {error ? 'Error' : 'Summary'}
                                </h3>
                                
                                {error ? (
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        <div>
                                            <p style={{ color: '#ef4444', fontWeight: 700, margin: '0 0 0.5rem 0' }}>
                                                {error.title}
                                            </p>
                                            <p style={{ color: '#888', fontSize: '0.9rem', margin: 0 }}>
                                                {error.message}
                                            </p>
                                        </div>
                                        <div style={{
                                            padding: '0.75rem',
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            borderRadius: '8px'
                                        }}>
                                            <p style={{ color: '#10b981', fontSize: '0.85rem', margin: 0 }}>
                                                💡 {error.suggestion}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Total Barcodes:</span>
                                            <span style={{ color: '#0066FF', fontWeight: 700 }}>
                                                {results?.total_barcodes || 0}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Processing Time:</span>
                                            <span style={{ color: 'white', fontWeight: 600 }}>
                                                {results?.processing_time_ms}ms
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ color: '#888' }}>Method:</span>
                                            <span style={{ color: 'white', fontWeight: 600 }}>
                                                {results?.method}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Results Section */}
                    <AnimatePresence>
                        {results && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    backdropFilter: 'blur(20px)',
                                    border: '2px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '24px',
                                    padding: '2rem'
                                }}
                            >
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '1.5rem'
                                }}>
                                    <h2 style={{ 
                                        color: 'white', 
                                        fontSize: '1.5rem',
                                        fontWeight: 700,
                                        margin: 0
                                    }}>
                                        Extracted Barcodes ({filteredBarcodes.length})
                                    </h2>
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={downloadCSV}
                                            style={{
                                                padding: '0.75rem 1.25rem',
                                                borderRadius: '10px',
                                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                color: 'white',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Download size={16} />
                                            CSV
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={copyAllBarcodes}
                                            style={{
                                                padding: '0.75rem 1.25rem',
                                                borderRadius: '10px',
                                                border: '2px solid rgba(0, 102, 255, 0.3)',
                                                background: 'rgba(0, 102, 255, 0.1)',
                                                color: '#0066FF',
                                                cursor: 'pointer',
                                                fontWeight: 600,
                                                fontSize: '0.9rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            {copiedIndex === 'all' ? <Check size={16} /> : <Copy size={16} />}
                                            Copy All
                                        </motion.button>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div style={{
                                    position: 'relative',
                                    marginBottom: '1.5rem'
                                }}>
                                    <Search 
                                        size={18} 
                                        style={{
                                            position: 'absolute',
                                            left: '1rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#888'
                                        }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Search barcodes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem 0.75rem 3rem',
                                            background: 'rgba(0, 0, 0, 0.3)',
                                            border: '2px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            color: 'white',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                {/* Barcode List */}
                                <div style={{
                                    maxHeight: '600px',
                                    overflowY: 'auto',
                                    display: 'grid',
                                    gap: '0.75rem'
                                }}>
                                    {filteredBarcodes.map((barcode, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            whileHover={{ x: 4 }}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '1rem 1.25rem',
                                                background: 'rgba(255, 255, 255, 0.03)',
                                                border: '2px solid rgba(255, 255, 255, 0.08)',
                                                borderRadius: '12px',
                                                transition: 'all 0.3s ease'
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '8px',
                                                    background: 'rgba(0, 102, 255, 0.2)',
                                                    color: '#0066FF',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 700
                                                }}>
                                                    {index + 1}
                                                </span>
                                                <code style={{
                                                    color: 'white',
                                                    fontSize: '1.05rem',
                                                    fontWeight: 600,
                                                    fontFamily: 'monospace'
                                                }}>
                                                    {barcode}
                                                </code>
                                            </div>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => copyToClipboard(barcode, index)}
                                                style={{
                                                    padding: '0.5rem',
                                                    borderRadius: '8px',
                                                    border: '2px solid rgba(0, 102, 255, 0.3)',
                                                    background: copiedIndex === index 
                                                        ? 'rgba(16, 185, 129, 0.2)'
                                                        : 'rgba(0, 102, 255, 0.1)',
                                                    color: copiedIndex === index ? '#10b981' : '#0066FF',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                {copiedIndex === index ? <Check size={16} /> : <Copy size={16} />}
                                            </motion.button>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}