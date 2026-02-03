import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import {
  Database,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  Upload,
  CheckCircle,
  XCircle,
  Check,
  X,
  TrendingUp,
  FileText,
  Building,
  CreditCard,
  Sparkles
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ohfnriyabohbvgxebllt.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZm5yaXlhYm9oYnZneGVibGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODI2MTksImV4cCI6MjA1MDI1ODYxOX0.KI_E7vVgzDPpKj5Sh0fZvfaG7h5mq6c5NmqfvU7vU7c'
const supabase = createClient(supabaseUrl, supabaseKey)

// Confetti animation component
const Confetti = () => {
  const particles = Array.from({ length: 50 })
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            scale: 0,
            rotate: 0
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: [0, 1, 0],
            rotate: Math.random() * 360
          }}
          transition={{
            duration: 2,
            delay: Math.random() * 0.5,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            width: '10px',
            height: '10px',
            background: ['#8B5CF6', '#10B981', '#EC4899', '#F59E0B', '#3B82F6'][i % 5],
            borderRadius: '50%'
          }}
        />
      ))}
    </div>
  )
}

export default function ExtractedData() {
  const [extractedData, setExtractedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(20)
  const [expandedRow, setExpandedRow] = useState(null)
  const [totalRecords, setTotalRecords] = useState(0)
  const [hoveredRow, setHoveredRow] = useState(null)
  
  // Selection & Sync states
  const [selectedRecords, setSelectedRecords] = useState(new Set())
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(null)
  const [syncResult, setSyncResult] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    fetchExtractedData()
  }, [currentPage])

  const fetchExtractedData = async () => {
    setIsLoading(true)
    try {
      const from = (currentPage - 1) * recordsPerPage
      const to = from + recordsPerPage - 1

      const { data, error, count } = await supabase
        .from('auto_extraction_results')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .range(from, to)

      if (error) {
        throw error
      }

      setExtractedData(data || [])
      setTotalRecords(count || 0)
      toast.success(`✨ Loaded ${data?.length || 0} records`, {
        style: {
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          color: 'white',
          fontWeight: 600
        }
      })
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch extracted data: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const parseJsonField = (field) => {
    if (!field) return null
    if (typeof field === 'string') {
      try {
        return JSON.parse(field)
      } catch {
        return field
      }
    }
    return field
  }

  const formatBillDataText = (data) => {
    if (!data || Object.keys(data).length === 0) return 'N/A'
    return `Student: ${data.student_name || 'N/A'} | College: ${data.college_name || 'N/A'} | Receipt: ${data.receipt_number || 'N/A'} | Roll: ${data.roll_number || 'N/A'} | Class: ${data.class_course || 'N/A'} | Date: ${data.bill_date || 'N/A'} | Amount: ₹${data.amount || 0}`
  }

  const filteredData = extractedData.filter(record => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      record.record_id?.toLowerCase().includes(searchLower) ||
      record.job_id?.toLowerCase().includes(searchLower) ||
      JSON.stringify(record.bill_data || {}).toLowerCase().includes(searchLower) ||
      JSON.stringify(record.bank_data || {}).toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(totalRecords / recordsPerPage)

  const toggleSelectRecord = (recordId) => {
    setSelectedRecords(prev => {
      const newSet = new Set(prev)
      if (newSet.has(recordId)) {
        newSet.delete(recordId)
      } else {
        newSet.add(recordId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    if (selectedRecords.size === filteredData.length) {
      setSelectedRecords(new Set())
    } else {
      setSelectedRecords(new Set(filteredData.map(r => r.id)))
    }
  }

  const handleBulkPushToZoho = async () => {
    if (selectedRecords.size === 0) {
      toast.error('Please select at least one record to sync')
      return
    }

    setIsSyncing(true)
    setSyncResult(null)
    setSyncProgress({ current: 0, total: selectedRecords.size })

    try {
      const recordsToSync = filteredData.filter(r => selectedRecords.has(r.id))

      // Simulate progress
      const progressInterval = setInterval(() => {
        setSyncProgress(prev => ({
          ...prev,
          current: Math.min(prev.current + 1, prev.total)
        }))
      }, 200)

      const response = await fetch('http://localhost:8000/sync/bulk-push-to-zoho-selected', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          records: recordsToSync
        })
      })

      clearInterval(progressInterval)
      const result = await response.json()

      if (result.success) {
        setSyncResult(result.details)
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
        
        toast.success(
          `🎉 Sync complete! ${result.details.successful}/${result.details.total_records} records synced`,
          { 
            duration: 5000,
            style: {
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: 'white',
              fontWeight: 600
            }
          }
        )
        
        setSelectedRecords(new Set())
      } else {
        toast.error('Sync failed: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Sync error:', error)
      toast.error('Error: ' + error.message)
    } finally {
      setIsSyncing(false)
      setSyncProgress(null)
    }
  }

  const handleExport = () => {
    const headers = [
      'Record ID', 'Scholar Name', 'Scholar ID', 'Account No', 'Bank Name',
      'Holder Name', 'IFSC Code', 'Branch Name', 'Bill Data', 'Bill1_AMT',
      'Bill2_AMT', 'Bill3_AMT', 'Bill4_AMT', 'Bill5_AMT'
    ]

    const csvRows = [headers.join(',')]

    filteredData.forEach(record => {
      const billData = parseJsonField(record.bill_data) || {}
      const bankData = parseJsonField(record.bank_data) || {}

      const row = [
        record.record_id || '',
        (billData.student_name || '').replace(/,/g, ';'),
        billData.scholar_id || record.scholar_id || '',
        bankData.account_number || '',
        (bankData.bank_name || '').replace(/,/g, ';'),
        (bankData.account_holder_name || '').replace(/,/g, ';'),
        bankData.ifsc_code || '',
        (bankData.branch_name || '').replace(/,/g, ';'),
        formatBillDataText(billData).replace(/,/g, ';'),
        billData.amount || '', '', '', '', ''
      ]

      csvRows.push(row.map(field => `"${field}"`).join(','))
    })

    const csvStr = csvRows.join('\n')
    const dataBlob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `extracted-data-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('📥 Data exported successfully!', {
      style: {
        background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        color: 'white',
        fontWeight: 600
      }
    })
  }

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'linear-gradient(to bottom, #faf9fb 0%, #ffffff 100%)' }}>
      <Toaster position="top-right" />
      {showConfetti && <Confetti />}
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          padding: '48px 32px',
          marginBottom: '32px',
          borderRadius: '0 0 32px 32px',
          boxShadow: '0 20px 60px rgba(139, 92, 246, 0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background circles */}
        <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: '-30%', left: '-5%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Database size={40} style={{ color: 'white' }} />
            </motion.div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '36px', 
              fontWeight: 900,
              color: 'white',
              letterSpacing: '-0.5px'
            }}>
              Extracted Data Hub
            </h1>
          </motion.div>
          <p style={{ 
            margin: 0, 
            color: 'rgba(255,255,255,0.9)', 
            fontSize: '16px',
            fontWeight: 500,
            maxWidth: '600px'
          }}>
            Manage, search, and sync your extracted bill and bank data seamlessly
          </p>
        </div>
      </motion.div>

      <div style={{ padding: '0 32px', maxWidth: '1600px', margin: '0 auto' }}>
        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '24px',
            marginBottom: '32px'
          }}
        >
          {[
            { icon: FileText, label: 'Total Records', value: totalRecords, color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)' },
            { icon: CheckCircle, label: 'Selected', value: selectedRecords.size, color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
            { icon: Search, label: 'Filtered Results', value: filteredData.length, color: '#EC4899', bg: 'rgba(236, 72, 153, 0.1)' },
            { icon: TrendingUp, label: 'Success Rate', value: '98%', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' }
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
              whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '20px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                border: '1px solid rgba(0,0,0,0.05)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: stat.bg, borderRadius: '50%', opacity: 0.5 }} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <stat.icon size={28} style={{ color: stat.color, marginBottom: '12px' }} />
                <div style={{ fontSize: '13px', color: '#64748B', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {stat.label}
                </div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#1E293B' }}>
                  {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'white',
            padding: '24px',
            borderRadius: '20px',
            marginBottom: '24px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)'
          }}
        >
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {/* Search */}
            <div style={{ flex: '1 1 300px', position: 'relative' }}>
              <Search size={20} style={{ 
                position: 'absolute', 
                left: '16px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#8B5CF6'
              }} />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px 14px 48px',
                  borderRadius: '12px',
                  border: '2px solid #E5E7EB',
                  fontSize: '14px',
                  fontWeight: 500,
                  outline: 'none',
                  transition: 'all 0.3s',
                  background: '#F9FAFB'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#8B5CF6'
                  e.target.style.background = 'white'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E5E7EB'
                  e.target.style.background = '#F9FAFB'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchExtractedData}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  opacity: isLoading ? 0.6 : 1
                }}
              >
                <RefreshCw size={16} className={isLoading ? 'spin' : ''} />
                Refresh
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExport}
                disabled={filteredData.length === 0}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '2px solid #8B5CF6',
                  background: 'white',
                  color: '#8B5CF6',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: filteredData.length === 0 ? 0.5 : 1
                }}
              >
                <Download size={16} />
                Export CSV
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkPushToZoho}
                disabled={selectedRecords.size === 0 || isSyncing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  background: selectedRecords.size === 0 || isSyncing
                    ? '#E5E7EB'
                    : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: selectedRecords.size === 0 || isSyncing ? '#94A3B8' : 'white',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: selectedRecords.size === 0 || isSyncing ? 'not-allowed' : 'pointer',
                  boxShadow: selectedRecords.size === 0 ? 'none' : '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                {isSyncing ? (
                  <>
                    <Loader2 size={16} className="spin" />
                    Syncing {syncProgress?.current || 0}/{syncProgress?.total || 0}
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    Push to Zoho ({selectedRecords.size})
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Sync Progress Bar */}
        <AnimatePresence>
          {isSyncing && syncProgress && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: 'white',
                padding: '24px',
                borderRadius: '20px',
                marginBottom: '24px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.15)',
                border: '2px solid #10B981'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <Loader2 size={24} className="spin" style={{ color: '#10B981' }} />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1E293B' }}>
                    Syncing to Zoho Creator...
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748B' }}>
                    {syncProgress.current} of {syncProgress.total} records processed
                  </div>
                </div>
              </div>
              <div style={{ width: '100%', height: '8px', background: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #10B981 0%, #059669 100%)',
                    borderRadius: '999px'
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sync Result */}
        <AnimatePresence>
          {syncResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                padding: '32px',
                borderRadius: '20px',
                marginBottom: '24px',
                boxShadow: '0 20px 40px rgba(16, 185, 129, 0.2)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Sparkles size={32} style={{ color: 'white' }} />
                    <h3 style={{ fontSize: '24px', fontWeight: 800, color: 'white', margin: 0 }}>
                      Sync Complete!
                    </h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSyncResult(null)}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ 
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      padding: '20px',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <FileText size={24} style={{ color: 'white', marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: '4px' }}>
                      Total Records
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>
                      {syncResult.total_records}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ 
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      padding: '20px',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <CheckCircle size={24} style={{ color: 'white', marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: '4px' }}>
                      Successful
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>
                      {syncResult.successful}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    style={{ 
                      background: syncResult.failed > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)',
                      padding: '20px',
                      borderRadius: '16px',
                      border: syncResult.failed > 0 ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255,255,255,0.2)'
                    }}
                  >
                    <XCircle size={24} style={{ color: 'white', marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, marginBottom: '4px' }}>
                      Failed
                    </div>
                    <div style={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>
                      {syncResult.failed}
                    </div>
                  </motion.div>
                </div>

                {syncResult.errors && syncResult.errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                      marginTop: '20px',
                      padding: '20px',
                      background: 'rgba(239, 68, 68, 0.2)',
                      borderRadius: '12px',
                      border: '1px solid rgba(239, 68, 68, 0.3)'
                    }}
                  >
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
                      ⚠️ Errors ({syncResult.errors.length}):
                    </div>
                    <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                      {syncResult.errors.slice(0, 5).map((error, idx) => (
                        <div key={idx} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px', paddingLeft: '12px', borderLeft: '2px solid rgba(255,255,255,0.3)' }}>
                          {error.record}: {error.error}
                        </div>
                      ))}
                      {syncResult.errors.length > 5 && (
                        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', marginTop: '8px' }}>
                          ... and {syncResult.errors.length - 5} more errors
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selection Banner */}
        <AnimatePresence>
          {selectedRecords.size > 0 && !isSyncing && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                padding: '20px 24px',
                borderRadius: '16px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 8px 24px rgba(139, 92, 246, 0.3)',
                color: 'white'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CheckCircle size={24} />
                <span style={{ fontSize: '16px', fontWeight: 600 }}>
                  {selectedRecords.size} record{selectedRecords.size !== 1 ? 's' : ''} selected
                </span>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedRecords(new Set())}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Selection
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
            marginBottom: '24px'
          }}
        >
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              gap: '20px'
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={56} style={{ color: '#8B5CF6' }} />
              </motion.div>
              <p style={{ color: '#64748B', fontSize: '18px', fontWeight: 600 }}>
                Loading extracted data...
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              gap: '16px'
            }}>
              <AlertCircle size={56} style={{ color: '#94A3B8' }} />
              <p style={{ color: '#64748B', fontSize: '18px', fontWeight: 600 }}>
                No extracted data found
              </p>
              <p style={{ color: '#94A3B8', fontSize: '14px' }}>
                {searchQuery ? 'Try a different search query' : 'Process some documents to see data here'}
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate',
                borderSpacing: 0,
                fontSize: '13px'
              }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #1E293B 0%, #334155 100%)',
                    color: 'white'
                  }}>
                    <th style={{ padding: '18px 16px', textAlign: 'center', fontWeight: 700, width: '60px', position: 'sticky', left: 0, background: 'inherit', zIndex: 2 }}>
                      <input
                        type="checkbox"
                        checked={selectedRecords.size === filteredData.length && filteredData.length > 0}
                        onChange={toggleSelectAll}
                        style={{
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          accentColor: '#10B981'
                        }}
                      />
                    </th>
                    {['Record ID', 'Scholar Name', 'Scholar ID', 'Account No', 'Bank Name', 'Holder Name', 'IFSC Code', 'Amount', 'View'].map((header, idx) => (
                      <th key={header} style={{ 
                        padding: '18px 16px', 
                        textAlign: idx === 7 ? 'right' : idx === 8 ? 'center' : 'left',
                        fontWeight: 700,
                        fontSize: '12px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        whiteSpace: 'nowrap',
                        ...(idx === 8 ? { position: 'sticky', right: 0, background: 'inherit', zIndex: 2 } : {})
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((record, index) => {
                    const billData = parseJsonField(record.bill_data) || {}
                    const bankData = parseJsonField(record.bank_data) || {}
                    const isExpanded = expandedRow === record.id
                    const isHovered = hoveredRow === record.id
                    const isSelected = selectedRecords.has(record.id)
                    
                    return (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onMouseEnter={() => setHoveredRow(record.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: isSelected
                            ? 'linear-gradient(90deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.04) 100%)'
                            : isExpanded 
                            ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.12) 0%, rgba(139, 92, 246, 0.04) 100%)'
                            : isHovered
                            ? 'linear-gradient(90deg, rgba(139, 92, 246, 0.06) 0%, transparent 100%)'
                            : 'white',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ padding: '16px', textAlign: 'center', position: 'sticky', left: 0, background: 'inherit', zIndex: 1 }}>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectRecord(record.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                width: '18px',
                                height: '18px',
                                cursor: 'pointer',
                                accentColor: '#10B981'
                              }}
                            />
                          </motion.div>
                        </td>
                        <td style={{ padding: '16px', fontFamily: '"JetBrains Mono", monospace', fontSize: '11px', fontWeight: 700 }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-block'
                          }}>
                            {record.record_id}
                          </span>
                        </td>
                        <td style={{ padding: '16px', color: '#1E293B', fontWeight: 600, fontSize: '13px' }}>
                          {billData.student_name || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ padding: '16px', color: '#475569', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px' }}>
                          {billData.scholar_id || record.scholar_id || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ padding: '16px', color: '#475569', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px' }}>
                          {bankData.account_number || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ padding: '16px', color: '#10B981', fontSize: '13px', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building size={14} />
                            {bankData.bank_name || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                          </div>
                        </td>
                        <td style={{ padding: '16px', color: '#475569', fontSize: '13px' }}>
                          {bankData.account_holder_name || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ padding: '16px', color: '#475569', fontFamily: '"JetBrains Mono", monospace', fontSize: '12px', fontWeight: 600 }}>
                          {bankData.ifsc_code || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right', fontFamily: '"JetBrains Mono", monospace', fontSize: '13px', fontWeight: 700 }}>
                          {billData.amount ? (
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              style={{
                                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.15) 100%)',
                                color: '#8B5CF6',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                display: 'inline-block',
                                fontWeight: 800
                              }}
                            >
                              ₹{Number(billData.amount).toLocaleString('en-IN')}
                            </motion.span>
                          ) : <span style={{ color: '#CBD5E1' }}>₹0</span>}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'center', position: 'sticky', right: 0, background: 'inherit', zIndex: 1 }}>
                          <motion.button
                            whileHover={{ scale: 1.15, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '8px',
                              borderRadius: '10px',
                              border: 'none',
                              background: expandedRow === record.id 
                                ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' 
                                : 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
                              color: expandedRow === record.id ? 'white' : '#64748B',
                              cursor: 'pointer',
                              boxShadow: expandedRow === record.id 
                                ? '0 4px 12px rgba(139, 92, 246, 0.4)'
                                : '0 2px 4px rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <Eye size={16} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            style={{
              background: 'white',
              padding: '24px',
              borderRadius: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
              border: '1px solid rgba(0,0,0,0.05)',
              marginBottom: '32px'
            }}
          >
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: currentPage === 1 ? '#F1F5F9' : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: currentPage === 1 ? '#CBD5E1' : 'white',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ChevronLeft size={16} />
                Previous
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: currentPage === totalPages ? '#F1F5F9' : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: currentPage === totalPages ? '#CBD5E1' : 'white',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Next
                <ChevronRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap');
        
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        *::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        *::-webkit-scrollbar-track {
          background: #F1F5F9;
          border-radius: 10px;
        }

        *::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          border-radius: 10px;
        }

        *::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
        }

        input[type="checkbox"] {
          transition: all 0.2s ease;
        }

        input[type="checkbox"]:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  )
}