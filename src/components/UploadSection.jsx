import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, X, Sparkles, Wand2, Check } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

const API_BASE_URL = 'https://ocr-owwb.onrender.com'
const MAX_FILES = 10

const PROMPT_TEMPLATES = {
    custom: '',
    bank: `Extract the following from this bank document:
- bank_name
- account_holder_name
- account_number
- ifsc_code
- branch_name`,
    bill: `Extract the following from this bill/receipt:
- student_name
- college_name
- receipt_number
- bill_date (format: YYYY-MM-DD)
- amount (number only)`,
    invoice: `Extract from this invoice:
- company_name
- invoice_number
- invoice_date
- total_amount
- customer_name`,
    id_card: `Extract from this ID card:
- full_name
- id_number
- date_of_birth
- issue_date
- expiry_date`,
    medical: `Extract from this medical document:
- patient_name
- doctor_name
- date
- diagnosis
- prescribed_medicines`
}

export default function UploadSection({ onProcessingStart }) {
    const [files, setFiles] = useState([])
    const [extractionPrompt, setExtractionPrompt] = useState('')
    const [selectedTemplate, setSelectedTemplate] = useState('custom')
    const [studentName, setStudentName] = useState('')
    const [scholarshipId, setScholarshipId] = useState('')

    const processFiles = async () => {
        if (files.length === 0) {
            alert('Please upload at least one file')
            return
        }

        if (!extractionPrompt.trim()) {
            alert('Please enter what you want to extract from the documents')
            return
        }

        let totalTokens = { input: 0, output: 0, total: 0 }
        let results = []

        onProcessingStart(() => ({
    status: 'processing',
    currentFile: files[0].name,
    totalFiles: files.length,
    processedFiles: 0,
    tokenUsage: { input: 0, output: 0, total: 0 }
}))


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
                formData.append('extraction_prompt', extractionPrompt)
                if (studentName) formData.append('student_name', studentName)
                if (scholarshipId) formData.append('scholarship_id', scholarshipId)

                const response = await fetch(`${API_BASE_URL}/ocr/generic`, {
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

            onProcessingStart(() => ({
    status: 'complete',
    totalFiles: files.length,
    processedFiles: files.length,
    tokenUsage: totalTokens,
    results: { success: true, totalFiles: files.length, results }
}))

            setFiles([])
            setStudentName('')
            setScholarshipId('')

        } catch (error) {
            onProcessingStart(() => ({
    status: 'error',
    error: error.message || 'Network error'
}))
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

    const handleTemplateChange = (template) => {
        setSelectedTemplate(template)
        setExtractionPrompt(PROMPT_TEMPLATES[template])
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
        >
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative' }}>
                {/* Floating particles */}
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -20, 0],
                            x: [0, Math.random() * 10 - 5, 0],
                            opacity: [0.2, 0.5, 0.2],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2
                        }}
                        style={{
                            position: 'absolute',
                            width: Math.random() * 8 + 4,
                            height: Math.random() * 8 + 4,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, #0066FF, #00A3FF)`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            pointerEvents: 'none',
                            filter: 'blur(1px)'
                        }}
                    />
                ))}

                <motion.h2
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, type: "spring", damping: 15 }}
                    style={{
                        fontSize: '3.5rem',
                        fontWeight: 900,
                        background: 'linear-gradient(135deg, #0066FF 0%, #00A3FF 50%, #4DA6FF 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        marginBottom: '1rem',
                        letterSpacing: '-2px',
                        position: 'relative'
                    }}
                >
                    Extract Anything with AI
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        color: 'var(--text-secondary)',
                        fontSize: '1.2rem',
                        fontWeight: 500,
                        position: 'relative'
                    }}
                >
                    Powered by Gemini Vision • Custom Prompts • Batch Processing
                </motion.p>
            </div>

            {/* Main Upload Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: "spring", damping: 20 }}
                whileHover={{ y: -5 }}
                style={{
                    maxWidth: '900px',
                    margin: '0 auto',
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '32px',
                    padding: '3rem',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                }}
            >
                {/* Animated background gradient */}
                <motion.div
                    animate={{
                        background: [
                            'radial-gradient(circle at 0% 0%, rgba(0, 102, 255, 0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 100% 100%, rgba(0, 163, 255, 0.1) 0%, transparent 50%)',
                            'radial-gradient(circle at 0% 0%, rgba(0, 102, 255, 0.1) 0%, transparent 50%)'
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
                    {/* Card Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <motion.div
                            animate={{ 
                                rotate: [0, 360],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ 
                                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                scale: { duration: 2, repeat: Infinity }
                            }}
                            style={{
                                width: '70px',
                                height: '70px',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                background: 'linear-gradient(135deg, #0066FF 0%, #00A3FF 100%)',
                                boxShadow: '0 8px 32px rgba(0, 102, 255, 0.4)'
                            }}
                        >
                            <Sparkles size={36} />
                        </motion.div>
                        <div>
                            <h3 style={{ 
                                fontSize: '2rem', 
                                fontWeight: 800, 
                                color: 'var(--text-primary)',
                                marginBottom: '0.25rem',
                                letterSpacing: '-0.5px'
                            }}>
                                Generic Document OCR
                            </h3>
                            <p style={{ 
                                fontSize: '1rem', 
                                color: 'var(--text-secondary)',
                                fontWeight: 500
                            }}>
                                Upload, extract, and process any document
                            </p>
                        </div>
                    </div>

                    {/* Template Selector */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        style={{ marginBottom: '2rem' }}
                    >
                        <label style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem', 
                            fontSize: '1rem', 
                            fontWeight: 700, 
                            color: 'var(--text-primary)'
                        }}>
                            <Wand2 size={18} style={{ color: '#0066FF' }} />
                            Quick Templates
                            <span style={{ 
                                fontSize: '0.75rem', 
                                fontWeight: 500, 
                                color: 'var(--text-secondary)',
                                marginLeft: '0.5rem'
                            }}>
                                (Optional)
                            </span>
                        </label>
                        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                            {Object.keys(PROMPT_TEMPLATES).map((template) => (
                                <motion.button
                                    key={template}
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleTemplateChange(template)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        fontSize: '0.9rem',
                                        textTransform: 'capitalize',
                                        fontWeight: 700,
                                        borderRadius: '14px',
                                        border: `2px solid ${selectedTemplate === template ? '#0066FF' : 'rgba(255, 255, 255, 0.1)'}`,
                                        background: selectedTemplate === template 
                                            ? 'linear-gradient(135deg, #0066FF, #00A3FF)'
                                            : 'rgba(255, 255, 255, 0.03)',
                                        color: selectedTemplate === template ? 'white' : 'var(--text-primary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: selectedTemplate === template 
                                            ? '0 8px 24px rgba(0, 102, 255, 0.3)'
                                            : 'none',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {selectedTemplate === template && <Check size={16} />}
                                    {template.replace('_', ' ')}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Custom Extraction Prompt */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{ marginBottom: '2rem' }}
                    >
                        <label style={{ 
                            display: 'block', 
                            marginBottom: '0.75rem', 
                            fontSize: '1rem', 
                            fontWeight: 700, 
                            color: 'var(--text-primary)'
                        }}>
                            What do you want to extract? 
                            <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
                        </label>
                        <textarea
                            placeholder="Example:&#10;Extract the following:&#10;- invoice_number&#10;- company_name&#10;- total_amount&#10;- invoice_date (format: YYYY-MM-DD)"
                            value={extractionPrompt}
                            onChange={(e) => {
                                setExtractionPrompt(e.target.value)
                                setSelectedTemplate('custom')
                            }}
                            rows={7}
                            style={{
                                width: '100%',
                                padding: '1.25rem',
                                fontSize: '0.95rem',
                                fontFamily: 'monospace',
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '16px',
                                resize: 'vertical',
                                background: 'rgba(0, 0, 0, 0.2)',
                                color: 'var(--text-primary)',
                                fontWeight: 500,
                                transition: 'all 0.3s ease',
                                lineHeight: 1.6
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#0066FF'
                                e.target.style.background = 'rgba(0, 102, 255, 0.05)'
                                e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                e.target.style.background = 'rgba(0, 0, 0, 0.2)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-secondary)',
                                marginTop: '0.75rem',
                                fontStyle: 'italic',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Sparkles size={14} style={{ color: '#0066FF' }} />
                            Tip: Be specific about field names and formats (e.g., dates as YYYY-MM-DD)
                        </motion.p>
                    </motion.div>

                    {/* Upload Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        {...getRootProps()}
                        style={{
                            border: `3px dashed ${isDragActive ? '#0066FF' : 'rgba(255, 255, 255, 0.2)'}`,
                            borderRadius: '20px',
                            padding: '3rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            background: isDragActive 
                                ? 'rgba(0, 102, 255, 0.1)' 
                                : files.length > 0 
                                    ? 'rgba(0, 102, 255, 0.03)'
                                    : 'rgba(255, 255, 255, 0.02)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onMouseEnter={(e) => {
                            if (files.length === 0) {
                                e.currentTarget.style.borderColor = '#0066FF'
                                e.currentTarget.style.background = 'rgba(0, 102, 255, 0.05)'
                                e.currentTarget.style.transform = 'scale(1.01)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (files.length === 0 && !isDragActive) {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'
                                e.currentTarget.style.transform = 'scale(1)'
                            }
                        }}
                    >
                        <input {...getInputProps()} />

                        {files.length === 0 ? (
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 15 }}
                            >
                                <motion.div
                                    animate={{ 
                                        y: [0, -10, 0],
                                        rotate: isDragActive ? 360 : 0
                                    }}
                                    transition={{ 
                                        y: { duration: 2, repeat: Infinity },
                                        rotate: { duration: 0.6 }
                                    }}
                                >
                                    <Upload 
                                        size={64} 
                                        style={{ 
                                            color: '#0066FF',
                                            marginBottom: '1.5rem',
                                            filter: 'drop-shadow(0 8px 16px rgba(0, 102, 255, 0.3))'
                                        }} 
                                    />
                                </motion.div>
                                <p style={{ 
                                    fontSize: '1.5rem', 
                                    fontWeight: 700, 
                                    color: 'var(--text-primary)',
                                    marginBottom: '0.75rem'
                                }}>
                                    {isDragActive ? 'Drop files here!' : 'Drop your documents here'}
                                </p>
                                <p style={{ 
                                    color: 'var(--text-secondary)',
                                    fontSize: '1rem',
                                    fontWeight: 500
                                }}>
                                    Supports: PNG, JPG, PDF • Max {MAX_FILES} files
                                </p>
                            </motion.div>
                        ) : (
                            <div style={{ width: '100%' }}>
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    marginBottom: '1.5rem',
                                    paddingBottom: '1rem',
                                    borderBottom: '2px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <span style={{ 
                                        fontWeight: 700, 
                                        color: '#0066FF', 
                                        fontSize: '1.1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}>
                                        <FileText size={20} />
                                        {files.length} file{files.length > 1 ? 's' : ''} selected
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            setFiles([]); 
                                        }}
                                        style={{
                                            background: 'rgba(239, 68, 68, 0.1)',
                                            border: '2px solid rgba(239, 68, 68, 0.3)',
                                            color: '#ef4444',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            fontWeight: 700,
                                            padding: '0.6rem 1.25rem',
                                            borderRadius: '12px',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        Clear All
                                    </motion.button>
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    gap: '0.75rem',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    paddingRight: '0.5rem'
                                }}>
                                    <AnimatePresence>
                                        {files.map((file, index) => (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20, scale: 0.9 }}
                                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                                transition={{ delay: index * 0.05 }}
                                                whileHover={{ 
                                                    x: 4,
                                                    boxShadow: '0 8px 24px rgba(0, 102, 255, 0.15)'
                                                }}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1rem',
                                                    padding: '1rem 1.25rem',
                                                    background: 'rgba(0, 102, 255, 0.05)',
                                                    border: '2px solid rgba(0, 102, 255, 0.2)',
                                                    borderRadius: '14px',
                                                    transition: 'all 0.3s ease'
                                                }}
                                            >
                                                <FileText size={20} style={{ color: '#0066FF', flexShrink: 0 }} />
                                                <span style={{ 
                                                    flex: 1,
                                                    color: 'var(--text-primary)',
                                                    fontSize: '0.95rem',
                                                    fontWeight: 600,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    textAlign: 'left'
                                                }}>
                                                    {file.name}
                                                </span>
                                                <span style={{ 
                                                    color: 'var(--text-secondary)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    flexShrink: 0
                                                }}>
                                                    {(file.size / 1024).toFixed(1)} KB
                                                </span>
                                                <motion.button
                                                    whileHover={{ scale: 1.2, rotate: 90 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => { 
                                                        e.stopPropagation(); 
                                                        removeFile(index); 
                                                    }}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.15)',
                                                        border: '2px solid rgba(239, 68, 68, 0.3)',
                                                        borderRadius: '10px',
                                                        padding: '0.5rem',
                                                        cursor: 'pointer',
                                                        color: '#ef4444',
                                                        transition: 'all 0.3s ease',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    <X size={16} />
                                                </motion.button>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* Optional Metadata */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        style={{ 
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginTop: '2rem' 
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Reference Name (optional)"
                            value={studentName}
                            onChange={(e) => setStudentName(e.target.value)}
                            style={{
                                padding: '1rem 1.25rem',
                                fontSize: '1rem',
                                fontWeight: 500,
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '14px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                color: 'var(--text-primary)',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#0066FF'
                                e.target.style.background = 'rgba(0, 102, 255, 0.05)'
                                e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                e.target.style.background = 'rgba(0, 0, 0, 0.2)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                        <input
                            type="text"
                            placeholder="Reference ID (optional)"
                            value={scholarshipId}
                            onChange={(e) => setScholarshipId(e.target.value)}
                            style={{
                                padding: '1rem 1.25rem',
                                fontSize: '1rem',
                                fontWeight: 500,
                                border: '2px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '14px',
                                background: 'rgba(0, 0, 0, 0.2)',
                                color: 'var(--text-primary)',
                                transition: 'all 0.3s ease'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#0066FF'
                                e.target.style.background = 'rgba(0, 102, 255, 0.05)'
                                e.target.style.boxShadow = '0 0 0 4px rgba(0, 102, 255, 0.1)'
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
                                e.target.style.background = 'rgba(0, 0, 0, 0.2)'
                                e.target.style.boxShadow = 'none'
                            }}
                        />
                    </motion.div>

                    {/* Process Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        whileHover={{ scale: files.length > 0 && extractionPrompt.trim() ? 1.02 : 1 }}
                        whileTap={{ scale: files.length > 0 && extractionPrompt.trim() ? 0.98 : 1 }}
                        disabled={files.length === 0 || !extractionPrompt.trim()}
                        onClick={processFiles}
                        style={{
                            marginTop: '2rem',
                            width: '100%',
                            padding: '1.25rem',
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            borderRadius: '16px',
                            border: 'none',
                            background: (files.length === 0 || !extractionPrompt.trim())
                                ? 'rgba(255, 255, 255, 0.05)'
                                : 'linear-gradient(135deg, #0066FF, #00A3FF)',
                            color: (files.length === 0 || !extractionPrompt.trim())
                                ? 'rgba(255, 255, 255, 0.3)'
                                : 'white',
                            cursor: (files.length === 0 || !extractionPrompt.trim()) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.3s ease',
                            boxShadow: (files.length > 0 && extractionPrompt.trim())
                                ? '0 8px 32px rgba(0, 102, 255, 0.4)'
                                : 'none',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        {(files.length > 0 && extractionPrompt.trim()) && (
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
                        )}
                        <span style={{ position: 'relative', zIndex: 1 }}>
                            {files.length === 0
                                ? 'Select Documents First'
                                : !extractionPrompt.trim()
                                    ? 'Enter Extraction Prompt'
                                    : `Extract from ${files.length} Document${files.length > 1 ? 's' : ''}`
                            }
                        </span>
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    )
}