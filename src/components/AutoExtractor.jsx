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
  Zap
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
  
  // ✅ NEW: Image storage progress
  const [imageStorageProgress, setImageStorageProgress] = useState({
    total: 0,
    stored: 0,
    isStoring: false
  })

  useEffect(() => {
    let interval
    if (isPolling && activeJob) {
      interval = setInterval(() => {
        fetchJobStatus(activeJob)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isPolling, activeJob])

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
        toast.success(`✅ Loaded ${data.total_fields} fields successfully!`)
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
    setImageStorageProgress({ total: 0, stored: 0, isStoring: true })
    
    try {
      const formData = new FormData()
      formData.append('app_link_name', config.app_link_name)
      formData.append('report_link_name', config.report_link_name)
      
      if (config.bank_field_name) formData.append('bank_field_name', config.bank_field_name)
      if (config.bill_field_name) formData.append('bill_field_name', config.bill_field_name)
      
      const builtCriteria = buildFilterCriteria()
      if (builtCriteria) formData.append('filter_criteria', builtCriteria)
      
      // ✅ NEW: Request image pre-storage
      formData.append('store_images', 'true')

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
        
        setImageStorageProgress({
          total: data.total_records,
          stored: data.images_stored || 0,
          isStoring: false
        })
        
        if (data.images_stored > 0) {
          toast.success(`✅ Loaded ${fullRecords.length} records (${data.images_stored} images pre-stored in Supabase!)`, {
            duration: 5000
          })
        } else {
          toast.success(`✅ Loaded ${fullRecords.length} records`)
        }
      } else {
        toast.error(`Error: ${data.error}`)
        setImageStorageProgress({ total: 0, stored: 0, isStoring: false })
      }
    } catch (error) {
      toast.error(`Failed to load records: ${error.message}`)
      setImageStorageProgress({ total: 0, stored: 0, isStoring: false })
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
      if (data.success) {
        setActiveJob(data.job_id)
        setIsPolling(true)
        setLastProcessedCount(0)
        setLastUpdateTime(Date.now())
        setProcessingSpeed(0)
        toast.success(`✅ ${data.message}`, { duration: 5000 })
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
            toast.success('✅ Extraction completed successfully!')
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
    <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
      <Toaster position="top-right" />

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 16px;
          border: 1px solid rgba(253, 185, 19, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        }
        .input-modern, .select-modern {
          background: #F8F9FA;
          border: 2px solid #E0E0E0;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          transition: all 0.3s ease;
          width: 100%;
          color: #2C3E50;
        }
        .input-modern:focus, .select-modern:focus {
          outline: none;
          border-color: #FDB913;
          background: white;
          box-shadow: 0 0 0 4px rgba(253, 185, 19, 0.1);
        }
        .btn-primary {
          background: linear-gradient(135deg, #FDB913 0%, #F39C12 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(253, 185, 19, 0.3);
        }
        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(253, 185, 19, 0.4);
        }
        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-secondary {
          background: white;
          color: #2C3E50;
          border: 2px solid #E0E0E0;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          border-color: #FDB913;
          background: #FFFBF0;
        }
        .stat-card {
          background: linear-gradient(135deg, #FDB913 0%, #F39C12 100%);
          color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(253, 185, 19, 0.2);
        }
        .table-modern {
          width: 100%;
          border-collapse: collapse;
        }
        .table-modern th {
          background: linear-gradient(135deg, #2C3E50 0%, #34495E 100%);
          color: white;
          padding: 16px;
          text-align: left;
          font-weight: 600;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        .table-modern td {
          padding: 16px;
          border-bottom: 1px solid #F0F0F0;
          color: #2C3E50;
        }
        .table-modern tbody tr:hover {
          background: #FFFBF0;
        }
        .table-modern tbody tr.selected {
          background: #FFF9E6;
          border-left: 4px solid #FDB913;
        }
        .badge-modern {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-success {
          background: #D4EDDA;
          color: #155724;
        }
        .badge-warning {
          background: #FFF3CD;
          color: #856404;
        }
        .badge-info {
          background: #D1ECF1;
          color: #0C5460;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {!activeJob && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '32px', marginBottom: '24px' }}
        >
          <h2 style={{ 
            marginBottom: '24px', 
            color: '#2C3E50', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            fontSize: '24px',
            fontWeight: 700
          }}>
            <Settings size={28} color="#FDB913" />
            Extraction Configuration
          </h2>

          {/* Step 1: Source Config */}
          <div style={{ 
            background: '#F8F9FA', 
            padding: '20px', 
            borderRadius: '12px',
            marginBottom: '24px' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: '#FDB913',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}>1</div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                Source Configuration
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 200px', gap: '16px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '13px', 
                  fontWeight: 600
                }}>App Link Name</label>
                <input
                  type="text"
                  className="input-modern"
                  value={config.app_link_name}
                  onChange={(e) => setConfig({...config, app_link_name: e.target.value})}
                  placeholder="teameverest/beneficiary-app"
                />
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontSize: '13px', 
                  fontWeight: 600
                }}>Report Link Name</label>
                <input
                  type="text"
                  className="input-modern"
                  value={config.report_link_name}
                  onChange={(e) => setConfig({...config, report_link_name: e.target.value})}
                  placeholder="All_Student_Records"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  className="btn-primary"
                  onClick={fetchFields}
                  disabled={isLoadingFields}
                  style={{ width: '100%' }}
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
              <div style={{
                marginTop: '12px',
                padding: '12px',
                background: '#E8F5E9',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#27AE60',
                fontWeight: 600
              }}>
                ✅ Loaded {availableFields.all_fields.length} fields 
                ({availableFields.file_fields.length} file, {availableFields.text_fields.length} text)
              </div>
            )}
          </div>

          {/* Step 2: Field Selection */}
          {availableFields.all_fields.length > 0 && (
            <div style={{ 
              background: '#F8F9FA', 
              padding: '20px', 
              borderRadius: '12px',
              marginBottom: '24px' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#FDB913',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}>2</div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                  Select Fields to Extract
                </h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '13px', 
                    fontWeight: 600
                  }}>Bank Passbook Field</label>
                  <select
                    className="select-modern"
                    value={config.bank_field_name}
                    onChange={(e) => setConfig({...config, bank_field_name: e.target.value})}
                  >
                    <option value="">-- Select Bank Field --</option>
                    {availableFields.all_fields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    fontSize: '13px', 
                    fontWeight: 600
                  }}>Bill/Receipt Field</label>
                  <select
                    className="select-modern"
                    value={config.bill_field_name}
                    onChange={(e) => setConfig({...config, bill_field_name: e.target.value})}
                  >
                    <option value="">-- Select Bill Field --</option>
                    {availableFields.all_fields.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Load Records Button */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className="btn-primary"
              onClick={loadRecords}
              disabled={isLoadingRecords || (!config.bank_field_name && !config.bill_field_name)}
              style={{ fontSize: '16px' }}
            >
              {isLoadingRecords ? (
                <>
                  <Loader2 size={20} className="spinning" />
                  Loading & Storing Images...
                </>
              ) : (
                <>
                  <Database size={20} />
                  Load Records & Pre-store Images
                </>
              )}
            </button>

            {imageStorageProgress.isStoring && (
              <div style={{ 
                fontSize: '14px', 
                color: '#7F8C8D',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <Loader2 size={16} className="spinning" />
                Storing images in Supabase...
              </div>
            )}
          </div>

          {imageStorageProgress.stored > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              background: '#D1ECF1',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <Zap size={24} color="#0C5460" />
              <div>
                <div style={{ fontWeight: 600, color: '#0C5460', marginBottom: '4px' }}>
                  ⚡ Optimization Active
                </div>
                <div style={{ fontSize: '13px', color: '#0C5460' }}>
                  {imageStorageProgress.stored} images pre-stored in Supabase - extraction will be 3x faster!
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Records Table */}
      {records.length > 0 && !activeJob && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            <div className="stat-card">
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
                Total Records
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                {filteredRecords.length}
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
                Selected
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                {selectedRecords.size}
              </div>
            </div>
            <div className="stat-card">
              <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
                Est. Cost
              </div>
              <div style={{ fontSize: '32px', fontWeight: 700 }}>
                ${(selectedRecords.size * 0.003).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="glass-card" style={{ 
            padding: '16px', 
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <Search size={20} color="#7F8C8D" />
              <input
                type="text"
                className="input-modern"
                placeholder="Search by student name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ maxWidth: '400px' }}
              />
            </div>

            <button
              className="btn-primary"
              onClick={startExtraction}
              disabled={selectedRecords.size === 0}
            >
              <Play size={18} />
              Process {selectedRecords.size} Selected
            </button>
          </div>

          {/* Table */}
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
              <table className="table-modern">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedRecords.size === filteredRecords.length}
                        onChange={toggleSelectAll}
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </th>
                    <th>Student Name</th>
                    <th>Record ID</th>
                    <th style={{ textAlign: 'center' }}>Bank Image</th>
                    <th style={{ textAlign: 'center' }}>Bill Image</th>
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
                          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ fontWeight: 600 }}>{record.student_name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: '#7F8C8D' }}>
                        {record.record_id}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {record.has_bank_image ? (
                          <span className="badge-modern badge-success">
                            <CheckCircle2 size={14} />
                            {record.bank_stored ? 'Stored ⚡' : 'Available'}
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
                            {record.bill_stored ? 'Stored ⚡' : 'Available'}
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
              padding: '16px', 
              borderTop: '1px solid #E0E0E0',
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

              <span style={{ fontWeight: 600 }}>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{ padding: '32px' }}
        >
          <h2 style={{ 
            marginBottom: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            color: '#2C3E50'
          }}>
            <Activity size={28} color="#FDB913" />
            Processing: {activeJob}
            <span style={{
              marginLeft: 'auto',
              padding: '8px 16px',
              borderRadius: '8px',
              background: jobStatus.status === 'running' ? '#27AE60' : '#3498DB',
              color: 'white',
              fontSize: '14px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {jobStatus.status === 'running' && <Loader2 size={16} className="spinning" />}
              {jobStatus.status.toUpperCase()}
            </span>
          </h2>

          <div style={{
            background: '#F0F0F0',
            height: '32px',
            borderRadius: '16px',
            overflow: 'hidden',
            marginBottom: '24px'
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #FDB913, #F39C12)',
              height: '100%',
              width: `${jobStatus.progress?.progress_percent || 0}%`,
              transition: 'width 0.5s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 700
            }}>
              {(jobStatus.progress?.progress_percent || 0).toFixed(1)}%
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#FDB913' }}>
                {jobStatus.progress?.total_records || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#7F8C8D' }}>Total</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#3498DB' }}>
                {jobStatus.progress?.processed_records || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#7F8C8D' }}>Processed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#27AE60' }}>
                {jobStatus.progress?.successful_records || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#7F8C8D' }}>Success</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#E74C3C' }}>
                {jobStatus.progress?.failed_records || 0}
              </div>
              <div style={{ fontSize: '12px', color: '#7F8C8D' }}>Failed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#9B59B6' }}>
                {processingSpeed > 0 ? processingSpeed.toFixed(1) : '—'}
              </div>
              <div style={{ fontSize: '12px', color: '#7F8C8D' }}>Rec/min</div>
            </div>
          </div>

          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#F8F9FA',
            borderRadius: '12px',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span style={{ fontSize: '16px', fontWeight: 600 }}>Total Cost:</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#27AE60' }}>
              ${(jobStatus.cost?.total_cost_usd || 0).toFixed(4)}
            </span>
          </div>

          {jobStatus.status === 'completed' && (
            <button
              className="btn-primary"
              onClick={() => {
                setActiveJob(null)
                setJobStatus(null)
                setIsPolling(false)
                loadRecords()
              }}
              style={{ marginTop: '24px', width: '100%', justifyContent: 'center' }}
            >
              <RefreshCw size={18} />
              Start New Extraction
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}