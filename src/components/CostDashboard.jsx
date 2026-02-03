import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast, { Toaster } from 'react-hot-toast'
import {
  DollarSign,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Loader2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
  Sparkles,
  BarChart3,
  FileText
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ohfnriyabohbvgxebllt.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZm5yaXlhYm9oYnZneGVibGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODI2MTksImV4cCI6MjA1MDI1ODYxOX0.KI_E7vVgzDPpKj5Sh0fZvfaG7h5mq6c5NmqfvU7vU7c'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function EnhancedCostDashboard() {
  const [costData, setCostData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(20)
  const [expandedRow, setExpandedRow] = useState(null)
  const [totalRecords, setTotalRecords] = useState(0)
  const [hoveredRow, setHoveredRow] = useState(null)
  
  // Stats
  const [stats, setStats] = useState({
    totalCost: 0,
    totalTokens: 0,
    successRate: 0,
    avgProcessingTime: 0,
    totalProcessed: 0
  })

  useEffect(() => {
    fetchCostData()
    fetchStats()
  }, [currentPage])

  const fetchCostData = async () => {
    setIsLoading(true)
    try {
      const from = (currentPage - 1) * recordsPerPage
      const to = from + recordsPerPage - 1

      const { data, error, count } = await supabase
        .from('processing_logs')
        .select('*', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range(from, to)

      if (error) {
        throw error
      }

      setCostData(data || [])
      setTotalRecords(count || 0)
      toast.success(`✨ Loaded ${data?.length || 0} records`, {
        style: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          fontWeight: '600'
        }
      })
    } catch (error) {
      console.error('Error fetching cost data:', error)
      toast.error('Failed to fetch data: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('processing_logs')
        .select('cost_usd, total_tokens, success, processing_time_ms')

      if (error) throw error

      if (data && data.length > 0) {
        const totalCost = data.reduce((sum, record) => sum + (parseFloat(record.cost_usd) || 0), 0)
        const totalTokens = data.reduce((sum, record) => sum + (record.total_tokens || 0), 0)
        const successCount = data.filter(record => record.success).length
        const successRate = (successCount / data.length) * 100
        const avgTime = data.reduce((sum, record) => sum + (record.processing_time_ms || 0), 0) / data.length

        setStats({
          totalCost: totalCost,
          totalTokens: totalTokens,
          successRate: successRate,
          avgProcessingTime: avgTime,
          totalProcessed: data.length
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const filteredData = costData.filter(record => {
    if (!searchQuery) return true
    const searchLower = searchQuery.toLowerCase()
    return (
      record.filename?.toLowerCase().includes(searchLower) ||
      record.student_name?.toLowerCase().includes(searchLower) ||
      record.scholarship_id?.toLowerCase().includes(searchLower) ||
      record.doc_type?.toLowerCase().includes(searchLower) ||
      record.method?.toLowerCase().includes(searchLower)
    )
  })

  const totalPages = Math.ceil(totalRecords / recordsPerPage)

  const handleExport = () => {
    const headers = [
      'Timestamp',
      'Doc Type',
      'Filename',
      'Method',
      'Student Name',
      'Scholarship ID',
      'Input Tokens',
      'Output Tokens',
      'Total Tokens',
      'Cost (USD)',
      'Processing Time (ms)',
      'Success',
      'Error Message'
    ]

    const csvRows = [headers.join(',')]

    filteredData.forEach(record => {
      const row = [
        formatDate(record.timestamp),
        record.doc_type || '',
        (record.filename || '').replace(/,/g, ';'),
        record.method || '',
        (record.student_name || '').replace(/,/g, ';'),
        record.scholarship_id || '',
        record.input_tokens || 0,
        record.output_tokens || 0,
        record.total_tokens || 0,
        record.cost_usd || 0,
        record.processing_time_ms || 0,
        record.success ? 'Yes' : 'No',
        (record.error_message || '').replace(/,/g, ';')
      ]

      csvRows.push(row.map(field => `"${field}"`).join(','))
    })

    const csvStr = csvRows.join('\n')
    const dataBlob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cost-data-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('📊 Data exported successfully!', {
      style: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontWeight: '600'
      }
    })
  }

  const StatCard = ({ icon: Icon, label, value, color, gradient, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.03, y: -5 }}
      style={{
        position: 'relative',
        padding: '24px',
        background: `linear-gradient(135deg, ${gradient[0]} 0%, ${gradient[1]} 100%)`,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Animated background orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 150,
          height: 150,
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent)',
          borderRadius: '50%',
          pointerEvents: 'none'
        }}
      />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '14px',
            backdropFilter: 'blur(10px)'
          }}>
            <Icon size={24} style={{ color: '#fff' }} />
          </div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            style={{ opacity: 0.3 }}
          >
            <Sparkles size={20} style={{ color: '#fff' }} />
          </motion.div>
        </div>
        
        <div style={{ 
          fontSize: '11px', 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '1px',
          marginBottom: '8px'
        }}>
          {label}
        </div>
        
        <motion.div 
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.2 }}
          style={{ 
            fontSize: '32px', 
            fontWeight: '800', 
            color: '#fff',
            lineHeight: 1,
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
          }}
        >
          {value}
        </motion.div>
      </div>

      {/* Shimmer effect */}
      <motion.div
        animate={{
          x: [-200, 200]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100px',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent)',
          transform: 'skewX(-20deg)',
          pointerEvents: 'none'
        }}
      />
    </motion.div>
  )

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Animated background */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <motion.div
          animate={{
            y: [0, -100, 0],
            x: [0, 50, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent)',
            borderRadius: '50%',
            filter: 'blur(40px)'
          }}
        />
        <motion.div
          animate={{
            y: [0, 100, 0],
            x: [0, -50, 0]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '10%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.08), transparent)',
            borderRadius: '50%',
            filter: 'blur(60px)'
          }}
        />
      </div>

      <Toaster position="top-right" />
      
      <div style={{ maxWidth: '1600px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
            <div>
              <motion.div 
                initial={{ x: -20 }}
                animate={{ x: 0 }}
                style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}
              >
                <motion.div
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '56px',
                    height: '56px',
                    background: 'linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.9) 100%)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <BarChart3 size={32} style={{ color: '#667eea' }} />
                </motion.div>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '36px', 
                  fontWeight: '900',
                  color: '#fff',
                  textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
                  letterSpacing: '-0.5px'
                }}>
                  Cost Analytics Dashboard
                </h2>
              </motion.div>
              <p style={{ 
                margin: 0, 
                color: 'rgba(255, 255, 255, 0.9)', 
                fontSize: '16px',
                fontWeight: '500'
              }}>
                Real-time processing metrics and performance insights
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  fetchCostData()
                  fetchStats()
                }}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'rgba(255, 255, 255, 0.95)',
                  color: '#667eea',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.3s'
                }}
              >
                <RefreshCw size={18} className={isLoading ? 'spin' : ''} />
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
                  gap: '10px',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: filteredData.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: filteredData.length === 0 ? 0.5 : 1,
                  transition: 'all 0.3s'
                }}
              >
                <Download size={18} />
                Export CSV
              </motion.button>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '32px'
          }}>
            <StatCard 
              icon={DollarSign}
              label="Total Cost"
              value={`$${stats.totalCost.toFixed(4)}`}
              gradient={['rgba(16, 185, 129, 0.9)', 'rgba(5, 150, 105, 0.9)']}
              delay={0}
            />
            <StatCard 
              icon={Zap}
              label="Total Tokens"
              value={stats.totalTokens.toLocaleString()}
              gradient={['rgba(139, 92, 246, 0.9)', 'rgba(124, 58, 237, 0.9)']}
              delay={0.1}
            />
            <StatCard 
              icon={TrendingUp}
              label="Success Rate"
              value={`${stats.successRate.toFixed(1)}%`}
              gradient={['rgba(59, 130, 246, 0.9)', 'rgba(37, 99, 235, 0.9)']}
              delay={0.2}
            />
            <StatCard 
              icon={Clock}
              label="Avg Time"
              value={`${(stats.avgProcessingTime / 1000).toFixed(2)}s`}
              gradient={['rgba(236, 72, 153, 0.9)', 'rgba(219, 39, 119, 0.9)']}
              delay={0.3}
            />
            <StatCard 
              icon={Activity}
              label="Processed"
              value={stats.totalProcessed.toLocaleString()}
              gradient={['rgba(245, 158, 11, 0.9)', 'rgba(217, 119, 6, 0.9)']}
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '24px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
          }}
        >
          <div style={{ position: 'relative' }}>
            <Search size={22} style={{ 
              position: 'absolute', 
              left: '20px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#667eea'
            }} />
            <input
              type="text"
              placeholder="Search by filename, student name, scholarship ID, doc type, or method..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '18px 20px 18px 56px',
                borderRadius: '14px',
                border: '2px solid transparent',
                fontSize: '15px',
                fontWeight: '500',
                outline: 'none',
                transition: 'all 0.3s',
                background: 'rgba(102, 126, 234, 0.05)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea'
                e.target.style.background = '#fff'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'transparent'
                e.target.style.background = 'rgba(102, 126, 234, 0.05)'
              }}
            />
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '32px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)'
          }}
        >
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '100px 20px',
              gap: '20px'
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={56} style={{ color: '#667eea' }} />
              </motion.div>
              <p style={{ color: '#667eea', fontSize: '18px', fontWeight: '700' }}>
                Loading analytics...
              </p>
            </div>
          ) : filteredData.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '100px 20px',
              gap: '20px'
            }}>
              <AlertCircle size={56} style={{ color: '#94A3B8' }} />
              <p style={{ color: '#64748B', fontSize: '18px', fontWeight: '700' }}>
                No data found
              </p>
              <p style={{ color: '#94A3B8', fontSize: '15px' }}>
                {searchQuery ? 'Try a different search query' : 'Process documents to see analytics'}
              </p>
            </div>
          ) : (
            <div style={{ 
              overflowX: 'auto',
              borderRadius: '20px',
              border: '1px solid rgba(102, 126, 234, 0.1)'
            }}>
              <table style={{ 
                width: '100%', 
                borderCollapse: 'separate',
                borderSpacing: 0,
                fontSize: '13px',
                background: 'white'
              }}>
                <thead>
                  <tr style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    {['Timestamp', 'Doc Type', 'Filename', 'Method', 'Student Name', 'Input', 'Output', 'Total', 'Cost', 'Time', 'Status', 'View'].map((header, i) => (
                      <th key={i} style={{ 
                        padding: '18px 14px', 
                        textAlign: ['Input', 'Output', 'Total', 'Cost', 'Time'].includes(header) ? 'right' : header === 'Status' || header === 'View' ? 'center' : 'left',
                        fontWeight: '800', 
                        fontSize: '11px',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        borderRight: i < 11 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                        whiteSpace: 'nowrap'
                      }}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredData.map((record, index) => {
                      const isExpanded = expandedRow === record.id
                      const isHovered = hoveredRow === record.id
                      const extractedData = parseJsonField(record.extracted_data) || {}
                      
                      return (
                        <>
                          <motion.tr
                            key={record.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.02 }}
                            onMouseEnter={() => setHoveredRow(record.id)}
                            onMouseLeave={() => setHoveredRow(null)}
                            style={{
                              borderBottom: '1px solid rgba(102, 126, 234, 0.08)',
                              background: isExpanded 
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.08) 100%)'
                                : isHovered
                                ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.06) 0%, rgba(255, 255, 255, 0) 100%)'
                                : index % 2 === 0 
                                ? 'white'
                                : 'rgba(102, 126, 234, 0.02)',
                              transition: 'all 0.3s ease',
                              cursor: 'pointer'
                            }}
                          >
                            <td style={{ 
                              padding: '16px 14px', 
                              color: '#64748B', 
                              fontSize: '11px',
                              fontWeight: '600',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)',
                              whiteSpace: 'nowrap'
                            }}>
                              {formatDate(record.timestamp)}
                            </td>
                            <td style={{ 
                              padding: '16px 14px',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)',
                              whiteSpace: 'nowrap'
                            }}>
                              <span style={{
                                background: record.doc_type === 'bank' 
                                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                  : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                                padding: '6px 12px',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: '800',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                              }}>
                                {record.doc_type || 'N/A'}
                              </span>
                            </td>
                            <td style={{ 
                              padding: '16px 14px', 
                              color: '#475569', 
                              fontSize: '12px',
                              fontWeight: '600',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)',
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }} title={record.filename}>
                              {record.filename || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                            </td>
                            <td style={{ 
                              padding: '16px 14px', 
                              color: '#667eea', 
                              fontSize: '11px',
                              fontWeight: '800',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              whiteSpace: 'nowrap'
                            }}>
                              {record.method || 'N/A'}
                            </td>
                            <td style={{ 
                              padding: '16px 14px', 
                              color: '#1E293B', 
                              fontSize: '13px',
                              fontWeight: '700',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }} title={record.student_name}>
                              {record.student_name || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                            </td>
                            <td style={{ 
                              padding: '16px 14px', 
                              color: '#8B5CF6', 
                              fontWeight: '800', 
                              textAlign: 'right', 
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '12px',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)'
                            }}>
                              {(record.input_tokens || 0).toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '16px 14px', 
                              color: '#EC4899', 
                              fontWeight: '800', 
                              textAlign: 'right', 
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '12px',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)'
                            }}>
                              {(record.output_tokens || 0).toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '16px 14px', 
                              color: '#3B82F6', 
                              fontWeight: '800', 
                              textAlign: 'right', 
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '12px',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)'
                            }}>
                              {(record.total_tokens || 0).toLocaleString()}
                            </td>
                            <td style={{ 
                              padding: '16px 14px', 
                              textAlign: 'right',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)'
                            }}>
                              <span style={{
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)',
                                padding: '8px 14px',
                                borderRadius: '10px',
                                color: '#10B981',
                                fontWeight: '900',
                                fontSize: '13px',
                                fontFamily: '"JetBrains Mono", monospace',
                                display: 'inline-block',
                                border: '1px solid rgba(16, 185, 129, 0.2)'
                              }}>
                                ${(record.cost_usd || 0).toFixed(6)}
                              </span>
                            </td>
                            <td style={{ 
                              padding: '16px 14px', 
                              color: '#F59E0B', 
                              fontWeight: '800', 
                              textAlign: 'right', 
                              fontFamily: '"JetBrains Mono", monospace',
                              fontSize: '12px',
                              borderRight: '1px solid rgba(102, 126, 234, 0.06)'
                            }}>
                              {(record.processing_time_ms || 0).toLocaleString()}
                            </td>
                            <td style={{ padding: '16px 14px', textAlign: 'center', borderRight: '1px solid rgba(102, 126, 234, 0.06)' }}>
                              {record.success ? (
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                                    color: '#10B981',
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    border: '1px solid rgba(16, 185, 129, 0.3)',
                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
                                  }}
                                >
                                  <CheckCircle size={14} />
                                  Success
                                </motion.div>
                              ) : (
                                <motion.div
                                  whileHover={{ scale: 1.1 }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.15) 100%)',
                                    color: '#EF4444',
                                    padding: '8px 16px',
                                    borderRadius: '10px',
                                    fontSize: '11px',
                                    fontWeight: '800',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
                                  }}
                                >
                                  <XCircle size={14} />
                                  Failed
                                </motion.div>
                              )}
                            </td>
                            <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                              <motion.button
                                whileHover={{ scale: 1.15 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: '36px',
                                  height: '36px',
                                  borderRadius: '10px',
                                  border: 'none',
                                  background: expandedRow === record.id 
                                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                                    : 'rgba(102, 126, 234, 0.1)',
                                  color: expandedRow === record.id ? 'white' : '#667eea',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s',
                                  boxShadow: expandedRow === record.id 
                                    ? '0 6px 20px rgba(102, 126, 234, 0.4)'
                                    : 'none'
                                }}
                              >
                                <Eye size={16} />
                              </motion.button>
                            </td>
                          </motion.tr>
                          
                          {/* Expanded Row */}
                          <AnimatePresence>
                            {expandedRow === record.id && (
                              <motion.tr
                                key={`expanded-${record.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                              >
                                <td colSpan="12" style={{ padding: '0', background: 'linear-gradient(to bottom, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.02) 100%)' }}>
                                  <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    style={{ padding: '40px', overflow: 'hidden' }}
                                  >
                                    <div style={{
                                      display: 'grid',
                                      gridTemplateColumns: record.image_url ? '450px 1fr' : '1fr',
                                      gap: '32px',
                                      alignItems: 'start'
                                    }}>
                                      {/* Image Preview */}
                                      {record.image_url && (
                                        <motion.div 
                                          initial={{ opacity: 0, x: -20 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          style={{
                                            background: 'white',
                                            borderRadius: '20px',
                                            padding: '24px',
                                            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                                            border: '1px solid rgba(102, 126, 234, 0.1)'
                                          }}
                                        >
                                          <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '20px',
                                            paddingBottom: '16px',
                                            borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                                          }}>
                                            <FileText size={22} style={{ color: '#667eea' }} />
                                            <h4 style={{ 
                                              margin: 0, 
                                              fontSize: '16px', 
                                              fontWeight: '800',
                                              color: '#1E293B'
                                            }}>
                                              Processed Image
                                            </h4>
                                          </div>
                                          <img 
                                            src={record.image_url}
                                            alt="Processed document"
                                            style={{
                                              width: '100%',
                                              height: 'auto',
                                              maxHeight: '500px',
                                              objectFit: 'contain',
                                              borderRadius: '16px',
                                              border: '2px solid rgba(102, 126, 234, 0.1)',
                                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)'
                                            }}
                                            onError={(e) => {
                                              e.target.style.display = 'none'
                                            }}
                                          />
                                        </motion.div>
                                      )}

                                      {/* Details Panel */}
                                      <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        style={{
                                          background: 'white',
                                          borderRadius: '20px',
                                          padding: '24px',
                                          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
                                          border: '1px solid rgba(102, 126, 234, 0.1)'
                                        }}
                                      >
                                        <div style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '12px',
                                          marginBottom: '24px',
                                          paddingBottom: '16px',
                                          borderBottom: '2px solid rgba(102, 126, 234, 0.1)'
                                        }}>
                                          <Activity size={22} style={{ color: '#667eea' }} />
                                          <h4 style={{ 
                                            margin: 0, 
                                            fontSize: '16px', 
                                            fontWeight: '800',
                                            color: '#1E293B'
                                          }}>
                                            Processing Details
                                          </h4>
                                        </div>

                                        <div style={{
                                          display: 'grid',
                                          gridTemplateColumns: 'repeat(2, 1fr)',
                                          gap: '20px',
                                          marginBottom: '24px'
                                        }}>
                                          <div style={{
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.04) 100%)',
                                            padding: '18px',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(102, 126, 234, 0.1)'
                                          }}>
                                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                              Scholarship ID
                                            </div>
                                            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E293B', fontFamily: '"JetBrains Mono", monospace' }}>
                                              {record.scholarship_id || 'N/A'}
                                            </div>
                                          </div>

                                          <div style={{
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.04) 100%)',
                                            padding: '18px',
                                            borderRadius: '16px',
                                            border: '1px solid rgba(102, 126, 234, 0.1)'
                                          }}>
                                            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                              Created At
                                            </div>
                                            <div style={{ fontSize: '13px', fontWeight: '700', color: '#475569' }}>
                                              {formatDate(record.created_at)}
                                            </div>
                                          </div>
                                        </div>

                                        {/* Error Message */}
                                        {!record.success && record.error_message && (
                                          <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            style={{
                                              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.08) 100%)',
                                              padding: '20px',
                                              borderRadius: '16px',
                                              border: '2px solid rgba(239, 68, 68, 0.2)',
                                              marginBottom: '24px'
                                            }}
                                          >
                                            <div style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '10px',
                                              marginBottom: '10px'
                                            }}>
                                              <AlertCircle size={18} style={{ color: '#EF4444' }} />
                                              <div style={{ fontSize: '12px', color: '#EF4444', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                Error Message
                                              </div>
                                            </div>
                                            <div style={{ fontSize: '13px', color: '#991B1B', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.6 }}>
                                              {record.error_message}
                                            </div>
                                          </motion.div>
                                        )}

                                        {/* Extracted Data */}
                                        <div>
                                          <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            marginBottom: '16px'
                                          }}>
                                            <Activity size={18} style={{ color: '#667eea' }} />
                                            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                              Extracted Data (JSON)
                                            </div>
                                          </div>
                                          <pre style={{
                                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.02) 100%)',
                                            padding: '20px',
                                            borderRadius: '16px',
                                            border: '2px solid rgba(102, 126, 234, 0.1)',
                                            fontSize: '12px',
                                            fontFamily: '"JetBrains Mono", "Courier New", Courier, monospace',
                                            overflowX: 'auto',
                                            maxHeight: '400px',
                                            overflowY: 'auto',
                                            color: '#1E293B',
                                            margin: 0,
                                            whiteSpace: 'pre',
                                            lineHeight: '1.8',
                                            boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)'
                                          }}>
                                            {JSON.stringify(extractedData, null, 2)}
                                          </pre>
                                        </div>
                                      </motion.div>
                                    </div>
                                  </motion.div>
                                </td>
                              </motion.tr>
                            )}
                          </AnimatePresence>
                        </>
                      )
                    })}
                  </AnimatePresence>
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
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
            }}
          >
            <div style={{ 
              color: '#64748B', 
              fontSize: '15px', 
              fontWeight: '700'
            }}>
              Showing <span style={{ color: '#667eea', fontWeight: '900' }}>{((currentPage - 1) * recordsPerPage) + 1}</span> to <span style={{ color: '#667eea', fontWeight: '900' }}>{Math.min(currentPage * recordsPerPage, totalRecords)}</span> of <span style={{ color: '#667eea', fontWeight: '900' }}>{totalRecords}</span> records
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <motion.button
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05, x: currentPage === 1 ? 0 : -3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: currentPage === 1 ? 'rgba(226, 232, 240, 0.5)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: currentPage === 1 ? '#CBD5E1' : 'white',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: currentPage === 1 ? 'none' : '0 6px 20px rgba(102, 126, 234, 0.3)'
                }}
              >
                <ChevronLeft size={18} />
                Previous
              </motion.button>

              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                padding: '14px 28px',
                fontWeight: '800',
                fontSize: '15px',
                color: '#1E293B',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.1) 100%)',
                borderRadius: '14px',
                border: '2px solid rgba(102, 126, 234, 0.2)'
              }}>
                Page <span style={{ color: '#667eea', margin: '0 8px', fontSize: '18px' }}>{currentPage}</span> of <span style={{ color: '#667eea', margin: '0 8px', fontSize: '18px' }}>{totalPages}</span>
              </div>

              <motion.button
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05, x: currentPage === totalPages ? 0 : 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 24px',
                  borderRadius: '14px',
                  border: 'none',
                  background: currentPage === totalPages ? 'rgba(226, 232, 240, 0.5)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: currentPage === totalPages ? '#CBD5E1' : 'white',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  boxShadow: currentPage === totalPages ? 'none' : '0 6px 20px rgba(102, 126, 234, 0.3)'
                }}
              >
                Next
                <ChevronRight size={18} />
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

        * {
          box-sizing: border-box;
        }

        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(102, 126, 234, 0.05);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #151414ff 0%, #764ba2 100%);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2 0%, #cacaceff 100%);
        }
      `}</style>
    </div>
  )
}