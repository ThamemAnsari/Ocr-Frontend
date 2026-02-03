import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import {
  Play,
  CheckCircle2,
  XCircle,
  Eye,
  Activity,
  RefreshCw,
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Settings,
  List,
  Plus,
  Trash2,
  Database,
  Zap,
  AlertCircle,
  TrendingUp,
  Clock,
  DollarSign,
  Sparkles,
  Filter,
  Download
} from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function AutoExtractor() {
  const [config, setConfig] = useState({
    app_link_name: 'teameverest/iatc-scholarship',
    report_link_name: 'Active_Scholar_Fee_Request_Signup_Report',
    bank_field_name: '',
    bill_field_name: '',
    filter_criteria: ''
  })

  const [isLoadingFields, setIsLoadingFields] = useState(false)
  const [availableFields, setAvailableFields] = useState({
    file_fields: [],
    text_fields: [],
    all_fields: []
  })

  const [filters, setFilters] = useState([])
  const [records, setRecords] = useState([])
  const [isLoadingRecords, setIsLoadingRecords] = useState(false)
  const [selectedRecords, setSelectedRecords] = useState(new Set())

  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(50)
  const [searchQuery, setSearchQuery] = useState('')

  const [activeJob, setActiveJob] = useState(null)
  const [jobStatus, setJobStatus] = useState(null)
  const [isPolling, setIsPolling] = useState(false)

  const [processingSpeed, setProcessingSpeed] = useState(0)
  const [lastProcessedCount, setLastProcessedCount] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now())
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(null)

  useEffect(() => {
    let interval
    if (isPolling && activeJob) {
      interval = setInterval(() => {
        fetchJobStatus(activeJob)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPolling, activeJob])

  // Calculate estimated time remaining
  useEffect(() => {
    if (jobStatus && processingSpeed > 0) {
      const remaining = jobStatus.progress?.total_records - jobStatus.progress?.processed_records
      const minutesRemaining = remaining / processingSpeed
      setEstimatedTimeRemaining(minutesRemaining)
    }
  }, [jobStatus, processingSpeed])

  const fetchFields = async () => {
    if (!config.app_link_name || !config.report_link_name) {
      toast.error('Please enter App Link Name and Report Link Name first')
      return
    }

    setIsLoadingFields(true)
    try {
      const formData = new FormData()
      formData.append('app_link_name', config.app_link_name)
      formData.append('report_link_name', config.report_link_name)

      const response = await fetch(`${API_BASE_URL}/ocr/auto-extract/fetch-fields`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (data.success) {
        setAvailableFields({
          file_fields: data.file_fields || [],
          text_fields: data.text_fields || [],
          all_fields: data.all_fields || []
        })
        toast.success(`✅ Loaded ${data.total_fields} fields`, {
          icon: '🎯',
          style: { borderRadius: '12px', background: '#10B981', color: 'white' }
        })
      } else {
        toast.error(`Error: ${data.error}`)
      }
    } catch (error) {
      toast.error(`Failed to fetch fields: ${error.message}`)
    } finally {
      setIsLoadingFields(false)
    }
  }

  const buildFilterCriteria = () => {
    if (filters.length === 0) return ''

    const criteria = filters.map(f => {
      const { field, operator, value } = f

      if (operator === 'contains') {
        return `${field}.contains("${value}")`
      } else if (operator === '==') {
        return `${field} == "${value}"`
      } else if (operator === '!=') {
        return `${field} != "${value}"`
      } else if (operator === '>') {
        return `${field} > ${value}`
      } else if (operator === '<') {
        return `${field} < ${value}`
      } else if (operator === 'is_null') {
        return `${field} == null`
      } else if (operator === 'is_not_null') {
        return `${field} != null`
      }
      return ''
    }).filter(Boolean).join(' && ')

    return criteria
  }

  const loadRecords = async () => {
    setIsLoadingRecords(true)

    try {
      const formData = new FormData()
      formData.append('app_link_name', config.app_link_name)
      formData.append('report_link_name', config.report_link_name)

      if (config.bank_field_name) formData.append('bank_field_name', config.bank_field_name)
      if (config.bill_field_name) formData.append('bill_field_name', config.bill_field_name)

      const builtCriteria = buildFilterCriteria()
      if (builtCriteria) formData.append('filter_criteria', builtCriteria)

      // ✅ DON'T pre-store images - just load metadata
      formData.append('store_images', 'false')

      const response = await fetch(`${API_BASE_URL}/ocr/auto-extract/preview`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      if (data.success) {
        const fullRecords = data.sample_records || []
        setRecords(fullRecords)
        setSelectedRecords(new Set())
        setCurrentPage(1)

        // Show info about filtered records
        if (data.already_extracted_count > 0) {
          toast.success(
            `✅ Loaded ${fullRecords.length} new records\n(Excluded ${data.already_extracted_count} already extracted)`,
            {
              icon: '🔍',
              style: {
                borderRadius: '12px',
                background: '#8B5CF6',
                color: 'white'
              },
              duration: 4000
            }
          )
        } else {
          toast.success(`✅ Loaded ${fullRecords.length} records (ready to process)`, {
            icon: '⚡',
            style: {
              borderRadius: '12px',
              background: '#8B5CF6',
              color: 'white'
            },
            duration: 3000
          })
        }
      } else {
        toast.error(`Error: ${data.error}`)
      }
    } catch (error) {
      toast.error(`Failed to load records: ${error.message}`)
    } finally {
      setIsLoadingRecords(false)
    }
  }

  const startExtraction = async () => {
    if (selectedRecords.size === 0) {
      toast.error('Please select at least one record to process')
      return
    }

    try {
      const formData = new FormData()
      formData.append('app_link_name', config.app_link_name)
      formData.append('report_link_name', config.report_link_name)

      if (config.bank_field_name) formData.append('bank_field_name', config.bank_field_name)
      if (config.bill_field_name) formData.append('bill_field_name', config.bill_field_name)

      const builtCriteria = buildFilterCriteria()
      if (builtCriteria) formData.append('filter_criteria', builtCriteria)

      formData.append('selected_record_ids', JSON.stringify([...selectedRecords]))

      const response = await fetch(`${API_BASE_URL}/ocr/auto-extract/start`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      // ✅ Handle duplicate job error
      if (response.status === 409) {
        toast.error(`⚠️ ${data.message}`, {
          duration: 6000,
          style: { borderRadius: '12px', background: '#EF4444', color: 'white' }
        })

        // Auto-load the active job
        if (data.active_job_id) {
          setActiveJob(data.active_job_id)
          setIsPolling(true)
          toast.success(`📊 Showing active job: ${data.active_job_id}`, {
            duration: 4000,
            style: { borderRadius: '12px', background: '#3B82F6', color: 'white' }
          })
        }
        return
      }

      if (data.success) {
        setActiveJob(data.job_id)
        setIsPolling(true)
        setLastProcessedCount(0)
        setLastUpdateTime(Date.now())
        setProcessingSpeed(0)
        toast.success(`🚀 Processing started!`, {
          duration: 5000,
          style: { borderRadius: '12px', background: '#8B5CF6', color: 'white' }
        })
      } else {
        toast.error(`Error: ${data.error}`)
      }
    } catch (error) {
      toast.error(`Failed to start: ${error.message}`)
    }
  }

  const fetchJobStatus = async (jobId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ocr/auto-extract/status/${jobId}`)
      const data = await response.json()

      if (data.success) {
        setJobStatus(data)

        const now = Date.now()
        const processed = data.progress?.processed_records || 0

        if (processed > lastProcessedCount) {
          const timeDiff = (now - lastUpdateTime) / 1000 / 60
          const recordsDiff = processed - lastProcessedCount
          const speed = recordsDiff / timeDiff
          setProcessingSpeed(speed)
          setLastProcessedCount(processed)
          setLastUpdateTime(now)
        }

        if (data.status === 'completed' || data.status === 'failed') {
          setIsPolling(false)
          if (data.status === 'completed') {
            toast.success('✅ Extraction completed!', {
              icon: '🎉',
              style: { borderRadius: '12px', background: '#10B981', color: 'white' }
            })
          } else {
            toast.error('❌ Extraction failed')
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch status:', error)
    }
  }

  const toggleSelectAll = () => {
    if (selectedRecords.size === filteredRecords.length) {
      setSelectedRecords(new Set())
    } else {
      setSelectedRecords(new Set(filteredRecords.map(r => r.record_id)))
    }
  }

  const toggleSelectRecord = (recordId) => {
    const newSelected = new Set(selectedRecords)
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId)
    } else {
      newSelected.add(recordId)
    }
    setSelectedRecords(newSelected)
  }

  const addFilter = () => {
    setFilters([...filters, {
      id: Date.now(),
      field: availableFields.text_fields[0] || '',
      operator: '==',
      value: ''
    }])
  }

  const removeFilter = (id) => {
    setFilters(filters.filter(f => f.id !== id))
  }

  const updateFilter = (id, key, value) => {
    setFilters(filters.map(f =>
      f.id === id ? { ...f, [key]: value } : f
    ))
  }

  const filteredRecords = records.filter(record =>
    record.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage)
  const startIndex = (currentPage - 1) * recordsPerPage
  const endIndex = startIndex + recordsPerPage
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex)

  return (
    <div style={{ maxWidth: '1800px', margin: '0 auto', padding: '24px' }}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <style>{`
        * {
          box-sizing: border-box;
        }
        
        .glass-card {
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(40px);
          border-radius: 24px;
          border: 1px solid rgba(139, 92, 246, 0.1);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .glass-card:hover {
          box-shadow: 0 30px 90px rgba(139, 92, 246, 0.12);
          transform: translateY(-2px);
        }
        
        .input-modern, .select-modern {
          background: #F8FAFC;
          border: 2px solid #E2E8F0;
          border-radius: 12px;
          padding: 14px 18px;
          font-size: 15px;
          font-weight: 500;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          color: #1E293B;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .input-modern:focus, .select-modern:focus {
          outline: none;
          border-color: #8B5CF6;
          background: white;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.1), 0 8px 16px rgba(139, 92, 246, 0.08);
          transform: translateY(-1px);
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3), 0 4px 8px rgba(0, 0, 0, 0.1);
          position: relative;
          overflow: hidden;
        }
        
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }
        
        .btn-primary:hover::before {
          left: 100%;
        }
        
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(139, 92, 246, 0.4), 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        
        .btn-primary:active:not(:disabled) {
          transform: translateY(-1px);
        }
        
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-secondary {
          background: white;
          color: #475569;
          border: 2px solid #E2E8F0;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .btn-secondary:hover {
          border-color: #8B5CF6;
          background: #F5F3FF;
          color: #7C3AED;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(139, 92, 246, 0.15);
        }
        
        .stat-card {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 12px 32px rgba(139, 92, 246, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .stat-card::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
          animation: pulse 4s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        
        .table-modern {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .table-modern th {
          background: linear-gradient(135deg, #1E293B 0%, #334155 100%);
          color: white;
          padding: 18px 20px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 1px;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .table-modern th:first-child {
          border-top-left-radius: 12px;
        }
        
        .table-modern th:last-child {
          border-top-right-radius: 12px;
        }
        
        .table-modern td {
          padding: 18px 20px;
          border-bottom: 1px solid #F1F5F9;
          color: #1E293B;
          font-size: 14px;
          font-weight: 500;
        }
        
        .table-modern tbody tr {
          transition: all 0.2s ease;
        }
        
        .table-modern tbody tr:hover {
          background: linear-gradient(90deg, #F8F9FF 0%, #F5F3FF 100%);
          transform: scale(1.01);
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.08);
        }
        
        .table-modern tbody tr.selected {
          background: linear-gradient(90deg, #EDE9FE 0%, #DDD6FE 100%);
          border-left: 4px solid #8B5CF6;
        }
        
        .badge-modern {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }
        
        .badge-success {
          background: linear-gradient(135deg, #10B981 0%, #059669 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        
        .badge-warning {
          background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
        
        .progress-ring {
          transform: rotate(-90deg);
        }
        
        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 18px;
          box-shadow: 0 6px 16px rgba(139, 92, 246, 0.4);
        }
      `}</style>

      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          borderRadius: '24px',
          padding: '48px',
          marginBottom: '32px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '-50%',
          right: '-20%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)',
          animation: 'pulse 6s ease-in-out infinite'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <Sparkles size={32} color="white" />
            <h1 style={{
              margin: 0,
              fontSize: '36px',
              fontWeight: 800,
              color: 'white',
              letterSpacing: '-1px'
            }}>
              Intelligent Auto Extractor
            </h1>
          </div>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            margin: 0,
            maxWidth: '700px',
            lineHeight: 1.6
          }}>
            Process thousands of documents with AI-powered precision.
            Real-time extraction with zero wait time.
          </p>
        </div>
      </motion.div>

      {!activeJob && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '40px', marginBottom: '32px' }}
        >
          {/* Step 1: Source Config */}
          <div style={{ marginBottom: '40px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginBottom: '24px'
            }}>
              <div className="step-number">1</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1E293B' }}>
                  Configure Source
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>
                  Connect to your Zoho Creator report
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 240px', gap: '20px' }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#475569'
                }}>App Link Name</label>
                <input
                  type="text"
                  className="input-modern"
                  value={config.app_link_name}
                  onChange={(e) => setConfig({ ...config, app_link_name: e.target.value })}
                  placeholder="teameverest/app-name"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '10px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#475569'
                }}>Report Link Name</label>
                <input
                  type="text"
                  className="input-modern"
                  value={config.report_link_name}
                  onChange={(e) => setConfig({ ...config, report_link_name: e.target.value })}
                  placeholder="Report_Name"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  className="btn-primary"
                  onClick={fetchFields}
                  disabled={isLoadingFields}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {isLoadingFields ? (
                    <>
                      <Loader2 size={18} className="spinning" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <List size={18} />
                      Fetch Fields
                    </>
                  )}
                </button>
              </div>
            </div>

            {availableFields.all_fields.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '20px',
                  padding: '16px 20px',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: 'white',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)'
                }}
              >
                <CheckCircle2 size={20} />
                Loaded {availableFields.all_fields.length} fields
                ({availableFields.file_fields.length} images, {availableFields.text_fields.length} text)
              </motion.div>
            )}
          </div>

          {/* Step 2: Field Selection */}
          {availableFields.all_fields.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
              }}>
                <div className="step-number">2</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1E293B' }}>
                    Select Extract Fields
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>
                    Choose which image fields to process
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#475569'
                  }}>Bank Passbook Field (Optional)</label>
                  <select
                    className="select-modern"
                    value={config.bank_field_name}
                    onChange={(e) => setConfig({ ...config, bank_field_name: e.target.value })}
                  >
                    <option value="">-- None --</option>
                    {availableFields.all_fields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: '10px',
                    fontSize: '14px',
                    fontWeight: 600,
                    color: '#475569'
                  }}>Bill/Receipt Field (Optional)</label>
                  <select
                    className="select-modern"
                    value={config.bill_field_name}
                    onChange={(e) => setConfig({ ...config, bill_field_name: e.target.value })}
                  >
                    <option value="">-- None --</option>
                    {availableFields.all_fields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Filters */}
          {availableFields.text_fields.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div className="step-number">3</div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1E293B' }}>
                      Add Filters (Optional)
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B' }}>
                      Filter records before processing
                    </p>
                  </div>
                </div>

                <button
                  className="btn-secondary"
                  onClick={addFilter}
                >
                  <Plus size={16} />
                  Add Filter
                </button>
              </div>

              {filters.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {filters.map((filter) => (
                    <motion.div
                      key={filter.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      style={{
                        background: '#F8FAFC',
                        borderRadius: '16px',
                        padding: '20px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 180px 1fr 50px',
                        gap: '16px',
                        alignItems: 'center',
                        border: '2px solid #E2E8F0',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#8B5CF6'
                        e.currentTarget.style.background = 'white'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#E2E8F0'
                        e.currentTarget.style.background = '#F8FAFC'
                      }}
                    >
                      <select
                        className="select-modern"
                        value={filter.field}
                        onChange={(e) => updateFilter(filter.id, 'field', e.target.value)}
                      >
                        {availableFields.text_fields.map(field => (
                          <option key={field} value={field}>{field}</option>
                        ))}
                      </select>

                      <select
                        className="select-modern"
                        value={filter.operator}
                        onChange={(e) => updateFilter(filter.id, 'operator', e.target.value)}
                      >
                        <option value="==">equals</option>
                        <option value="!=">not equals</option>
                        <option value="contains">contains</option>
                        <option value=">">greater than</option>
                        <option value="<">less than</option>
                        <option value="is_null">is empty</option>
                        <option value="is_not_null">is not empty</option>
                      </select>

                      {!['is_null', 'is_not_null'].includes(filter.operator) && (
                        <input
                          type="text"
                          className="input-modern"
                          value={filter.value}
                          onChange={(e) => updateFilter(filter.id, 'value', e.target.value)}
                          placeholder="Enter value..."
                        />
                      )}

                      <button
                        onClick={() => removeFilter(filter.id)}
                        style={{
                          background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '10px',
                          width: '44px',
                          height: '44px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)'
                          e.currentTarget.style.boxShadow = '0 8px 20px rgba(239, 68, 68, 0.4)'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.transform = 'none'
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)'
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Load Records */}
          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'center',
            padding: '24px',
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            borderRadius: '16px',
            border: '2px dashed #CBD5E1'
          }}>
            <Database size={32} color="#8B5CF6" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B', marginBottom: '4px' }}>
                Ready to load records
              </div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Click to fetch metadata only - processing happens in real-time
              </div>
            </div>
            <button
              className="btn-primary"
              onClick={loadRecords}
              disabled={isLoadingRecords || (!config.bank_field_name && !config.bill_field_name)}
              style={{ fontSize: '16px', padding: '16px 32px' }}
            >
              {isLoadingRecords ? (
                <>
                  <Loader2 size={20} className="spinning" />
                  Loading...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  Load Records (Instant)
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Records Table */}
      {records.length > 0 && !activeJob && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <div className="stat-card">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px', letterSpacing: '0.5px' }}>
                  TOTAL RECORDS
                </div>
                <div style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1 }}>
                  {filteredRecords.length}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px', letterSpacing: '0.5px' }}>
                  SELECTED
                </div>
                <div style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1 }}>
                  {selectedRecords.size}
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px', letterSpacing: '0.5px' }}>
                  EST. TIME
                </div>
                <div style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1 }}>
                  {Math.ceil(selectedRecords.size * 3 / 60)}m
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ fontSize: '13px', opacity: 0.9, marginBottom: '8px', letterSpacing: '0.5px' }}>
                  EST. COST
                </div>
                <div style={{ fontSize: '40px', fontWeight: 800, lineHeight: 1 }}>
                  ${(selectedRecords.size * 0.003).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="glass-card" style={{
            padding: '20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '20px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, maxWidth: '400px' }}>
                <Search size={20} color="#8B5CF6" />
                <input
                  type="text"
                  className="input-modern"
                  placeholder="Search by student name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Quick Selection Buttons */}
              <div style={{
                display: 'flex',
                gap: '8px',
                borderLeft: '2px solid #E2E8F0',
                paddingLeft: '16px',
                marginLeft: '8px'
              }}>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedRecords(new Set(filteredRecords.slice(0, 50).map(r => r.record_id)))}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                  title="Select first 50 records"
                >
                  First 50
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedRecords(new Set(filteredRecords.slice(0, 100).map(r => r.record_id)))}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                  title="Select first 100 records"
                >
                  First 100
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedRecords(new Set(filteredRecords.slice(0, 200).map(r => r.record_id)))}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                  title="Select first 200 records"
                >
                  First 200
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedRecords(new Set())}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderColor: '#EF4444',
                    color: '#EF4444'
                  }}
                  title="Clear selection"
                >
                  <XCircle size={14} />
                  Clear
                </button>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={startExtraction}
              disabled={selectedRecords.size === 0}
              style={{ fontSize: '16px', padding: '14px 32px' }}
            >
              <Play size={20} />
              Process {selectedRecords.size} Selected
            </button>
          </div>

          {/* Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th style={{ width: '80px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRecords.size === filteredRecords.length}
                        onChange={toggleSelectAll}
                        style={{
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          accentColor: '#8B5CF6'
                        }}
                      />
                    </th>
                    <th>Student Name</th>
                    <th style={{ width: '200px' }}>Record ID</th>
                    <th style={{ textAlign: 'center', width: '150px' }}>Bank Image</th>
                    <th style={{ textAlign: 'center', width: '150px' }}>Bill Image</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRecords.map(record => (
                    <tr
                      key={record.record_id}
                      className={selectedRecords.has(record.record_id) ? 'selected' : ''}
                      onClick={() => toggleSelectRecord(record.record_id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedRecords.has(record.record_id)}
                          onChange={() => toggleSelectRecord(record.record_id)}
                          style={{
                            width: '20px',
                            height: '20px',
                            cursor: 'pointer',
                            accentColor: '#8B5CF6'
                          }}
                        />
                      </td>
                      <td style={{ fontWeight: 600, fontSize: '15px' }}>{record.student_name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '13px', color: '#64748B' }}>
                        {record.record_id}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {record.has_bank_image ? (
                          <span className="badge-modern badge-success">
                            <CheckCircle2 size={14} />
                            Available
                          </span>
                        ) : (
                          <span className="badge-modern badge-warning">
                            <XCircle size={14} />
                            Missing
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {record.has_bill_image ? (
                          <span className="badge-modern badge-success">
                            <CheckCircle2 size={14} />
                            Available
                          </span>
                        ) : (
                          <span className="badge-modern badge-warning">
                            <XCircle size={14} />
                            Missing
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{
              padding: '20px',
              borderTop: '2px solid #F1F5F9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                className="btn-secondary"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <span style={{ fontWeight: 700, fontSize: '15px', color: '#475569' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="btn-secondary"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Processing Monitor */}
      {activeJob && jobStatus && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card"
          style={{ padding: '48px' }}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Activity size={32} color="#8B5CF6" />
              <div>
                <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 800, color: '#1E293B' }}>
                  Processing Job
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748B', fontFamily: 'monospace' }}>
                  {activeJob}
                </p>
              </div>
            </div>

            <span style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: jobStatus.status === 'running'
                ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                : 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
              color: 'white',
              fontSize: '14px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              boxShadow: jobStatus.status === 'running'
                ? '0 8px 20px rgba(16, 185, 129, 0.4)'
                : '0 8px 20px rgba(59, 130, 246, 0.4)'
            }}>
              {jobStatus.status === 'running' && <Loader2 size={16} className="spinning" />}
              {jobStatus.status}
            </span>
          </div>

          {/* Progress Bar */}
          <div style={{
            background: '#F1F5F9',
            height: '48px',
            borderRadius: '24px',
            overflow: 'hidden',
            marginBottom: '32px',
            position: 'relative',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${jobStatus.progress?.progress_percent || 0}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              style={{
                background: 'linear-gradient(90deg, #8B5CF6, #EC4899, #8B5CF6)',
                backgroundSize: '200% 100%',
                animation: 'gradient 3s ease infinite',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 800,
                fontSize: '18px',
                letterSpacing: '1px'
              }}
            >
              {(jobStatus.progress?.progress_percent || 0).toFixed(1)}%
            </motion.div>
          </div>

          <style>{`
            @keyframes gradient {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '20px', marginBottom: '32px' }}>
            {[
              { label: 'Total', value: jobStatus.progress?.total_records || 0, color: '#8B5CF6' },
              { label: 'Processed', value: jobStatus.progress?.processed_records || 0, color: '#3B82F6' },
              { label: 'Success', value: jobStatus.progress?.successful_records || 0, color: '#10B981' },
              { label: 'Failed', value: jobStatus.progress?.failed_records || 0, color: '#EF4444' },
              { label: 'Speed', value: processingSpeed > 0 ? `${processingSpeed.toFixed(1)}/min` : '—', color: '#F59E0B' },
              { label: 'ETA', value: estimatedTimeRemaining ? `${Math.ceil(estimatedTimeRemaining)}m` : '—', color: '#EC4899' }
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: 'white',
                  padding: '24px',
                  borderRadius: '16px',
                  textAlign: 'center',
                  border: '2px solid #F1F5F9',
                  transition: 'all 0.3s ease'
                }}
                whileHover={{
                  borderColor: stat.color,
                  transform: 'translateY(-4px)',
                  boxShadow: `0 12px 24px ${stat.color}20`
                }}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  color: stat.color,
                  lineHeight: 1,
                  marginBottom: '8px'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Cost Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            padding: '24px 32px',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 12px 32px rgba(16, 185, 129, 0.3)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <DollarSign size={28} color="white" />
              <span style={{ fontSize: '18px', fontWeight: 600, color: 'white' }}>
                Total Processing Cost
              </span>
            </div>
            <span style={{ fontSize: '36px', fontWeight: 800, color: 'white' }}>
              ${(jobStatus.cost?.total_cost_usd || 0).toFixed(4)}
            </span>
          </div>

          {/* Completion Actions */}
          {jobStatus.status === 'completed' && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="btn-primary"
              onClick={() => {
                setActiveJob(null)
                setJobStatus(null)
                setIsPolling(false)
                loadRecords()
              }}
              style={{ marginTop: '32px', width: '100%', justifyContent: 'center', fontSize: '16px', padding: '18px' }}
            >
              <RefreshCw size={20} />
              Start New Extraction
            </motion.button>
          )}
        </motion.div>
      )}
    </div>
  )
  }