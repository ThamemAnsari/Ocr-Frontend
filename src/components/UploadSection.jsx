import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, X, Sparkles } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

const API_BASE_URL = 'https://ocr-8tbh.onrender.com'
const MAX_FILES = 10

export default function UploadSection({ onProcessingStart }) {
    const [files, setFiles] = useState([])
    const [documentType, setDocumentType] = useState('bank') // bank or bill
    const [studentName, setStudentName] = useState('')
    const [scholarshipId, setScholarshipId] = useState('')

    const processFiles = async () => {
        if (files.length === 0) return

        let totalTokens = { input: 0, output: 0, total: 0 }
        let results = []

        onProcessingStart({
            status: 'processing',
            currentFile: files[0].name,
            totalFiles: files.length,
            processedFiles: 0,
            tokenUsage: { input: 0, output: 0, total: 0 }
        })

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]

                onProcessingStart(prev => ({
                    ...prev,
                    currentFile: file.name,
                    processedFiles: i
                }))

                const formData = new FormData()
                formData.append('file', file)
                if (studentName) formData.append('student_name', studentName)
                if (scholarshipId) formData.append('scholarship_id', scholarshipId)

                const endpoint = documentType === 'bank' ? '/ocr/bank' : '/ocr/bill'

                const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: 'POST',
                    body: formData
                })

                const result = await response.json()

                if (result.success !== false) {
                    const usage = result.token_usage || { input_tokens: 0, output_tokens: 0, total_tokens: 0 }

                    totalTokens.input += (usage.input_tokens || 0)
                    totalTokens.output += (usage.output_tokens || 0)
                    totalTokens.total += (usage.total_tokens || 0)

                    results.push(result)

                    onProcessingStart(prev => ({
                        ...prev,
                        tokenUsage: { ...totalTokens }
                    }))
                }
            }

            onProcessingStart({
                status: 'complete',
                totalFiles: files.length,
                processedFiles: files.length,
                tokenUsage: totalTokens,
                results: { success: true, totalFiles: files.length, results }
            })

            // Clear
            setFiles([])
            setStudentName('')
            setScholarshipId('')

        } catch (error) {
            onProcessingStart({
                status: 'error',
                error: error.message || 'Network error'
            })
        }
    }

    const onDrop = useCallback((acceptedFiles) => {
        const newFiles = [...files, ...acceptedFiles].slice(0, MAX_FILES)
        setFiles(newFiles)
    }, [files])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/pdf': ['.pdf']
        },
        multiple: true,
        maxFiles: MAX_FILES
    })

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="hero-section">
                <motion.h2
                    className="hero-title"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    Extract Data with AI Precision
                </motion.h2>
                <motion.p
                    className="hero-subtitle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    Powered by Vision AI • Batch Processing • Real-time Tracking
                </motion.p>
            </div>

            <motion.div
                className="upload-card"
                style={{ maxWidth: 700, margin: '0 auto' }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
            >
                <div className="card-header">
                    <div className="card-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        <Sparkles size={32} />
                    </div>
                    <h3>Document Processing</h3>
                </div>

                <div className="card-body">
                    {/* Document Type Selector */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            Document Type
                        </label>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className={`btn ${documentType === 'bank' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setDocumentType('bank')}
                                style={{ flex: 1 }}
                            >
                                Bank Document
                            </button>
                            <button
                                className={`btn ${documentType === 'bill' ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setDocumentType('bill')}
                                style={{ flex: 1 }}
                            >
                                Receipt/Bill
                            </button>
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div
                        {...getRootProps()}
                        className={`drop-zone ${isDragActive ? 'drag-active' : ''}`}
                    >
                        <input {...getInputProps()} />

                        {files.length === 0 ? (
                            <>
                                <Upload size={56} className="upload-icon" />
                                <p className="drop-text">Drop your documents here</p>
                                <p className="drop-subtext">Supports: PNG, JPG, PDF • Max {MAX_FILES} files</p>
                            </>
                        ) : (
                            <div className="file-list">
                                <div className="file-list-header">
                                    <span className="file-count">{files.length} file{files.length > 1 ? 's' : ''} selected</span>
                                    <button className="btn-clear-all" onClick={(e) => { e.stopPropagation(); setFiles([]); }}>Clear All</button>
                                </div>
                                {files.map((file, index) => (
                                    <div key={index} className="file-item">
                                        <FileText size={18} />
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
                                        <button className="btn-remove" onClick={(e) => { e.stopPropagation(); removeFile(index); }}>
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Optional Metadata */}
                    <div className="form-fields" style={{ marginTop: '1.5rem' }}>
                        <input
                            type="text"
                            placeholder="Student Name (optional)"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            className="input-field"
                        />
                        <input
                            type="text"
                            placeholder="Reference ID (optional)"
                            value={scholarshipId}
                            onChange={(e) => setScholarshipId(e.target.value)}
                            className="input-field"
                        />
                    </div>

                    {/* Process Button */}
                    <button
                        className="btn btn-primary"
                        disabled={files.length === 0}
                        onClick={processFiles}
                        style={{ 
                            marginTop: '1.5rem', 
                            width: '100%',
                            padding: '1rem',
                            fontSize: '1rem',
                            fontWeight: 600
                        }}
                    >
                        {files.length === 0 ? 'Select Documents' : `Process ${files.length} Document${files.length > 1 ? 's' : ''}`}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}