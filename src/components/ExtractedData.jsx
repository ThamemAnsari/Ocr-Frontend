import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  AlertCircle
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ohfnriyabohbvgxebllt.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9oZm5yaXlhYm9oYnZneGVibGx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODI2MTksImV4cCI6MjA1MDI1ODYxOX0.KI_E7vVgzDPpKj5Sh0fZvfaG7h5mq6c5NmqfvU7vU7c'
const supabase = createClient(supabaseUrl, supabaseKey)

export default function ExtractedData() {
  const [extractedData, setExtractedData] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [recordsPerPage] = useState(20)
  const [expandedRow, setExpandedRow] = useState(null)
  const [totalRecords, setTotalRecords] = useState(0)
  const [selectedView, setSelectedView] = useState({})
  const [hoveredRow, setHoveredRow] = useState(null)

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
      toast.success(`Loaded ${data?.length || 0} records`)
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

  const formatJsonForDisplay = (data) => {
    if (!data) return 'N/A'
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2)
    }
    return String(data)
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

  const handleExport = () => {
    // Convert data to CSV format - only visible columns
    const headers = [
      'Record ID',
      'Scholar Name',
      'Scholar ID',
      'Account No',
      'Bank Name',
      'Holder Name',
      'IFSC Code',
      'Branch Name',
      'Bill Data',
      'Bill1_AMT',
      'Bill2_AMT',
      'Bill3_AMT',
      'Bill4_AMT',
      'Bill5_AMT'
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
        billData.amount || '',
        '',
        '',
        '',
        ''
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
    toast.success('Data exported as CSV successfully!')
  }

  return (
    <div style={{ position: 'relative' }}>
      <Toaster position="top-right" />
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{
          padding: '32px',
          marginBottom: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Database size={28} style={{ color: '#8B5CF6' }} />
              <h2 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Extracted Data
              </h2>
            </div>
            <p style={{ 
              margin: 0, 
              color: '#64748B', 
              fontSize: '14px',
              fontWeight: 500
            }}>
              View all extracted bill and bank data from Supabase
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchExtractedData}
              disabled={isLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
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
                padding: '12px 20px',
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
          </div>
        </div>

        {/* Stats */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginTop: '24px'
        }}>
          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.08) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
              Total Records
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#8B5CF6' }}>
              {totalRecords.toLocaleString()}
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(5, 150, 105, 0.08) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
              Current Page
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981' }}>
              {currentPage} / {totalPages || 1}
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(219, 39, 119, 0.08) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(236, 72, 153, 0.2)'
          }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
              Filtered Results
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#EC4899' }}>
              {filteredData.length}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
        style={{
          padding: '20px',
          marginBottom: '24px'
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search size={20} style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#8B5CF6'
          }} />
          <input
            type="text"
            placeholder="Search by Record ID, Job ID, or data content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 16px 14px 48px',
              borderRadius: '12px',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              fontSize: '14px',
              fontWeight: 500,
              outline: 'none',
              transition: 'all 0.3s',
              background: 'white'
            }}
            onFocus={(e) => e.target.style.borderColor = '#8B5CF6'}
            onBlur={(e) => e.target.style.borderColor = 'rgba(139, 92, 246, 0.2)'}
          />
        </div>
      </motion.div>

      {/* Enhanced Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{
          padding: '24px',
          marginBottom: '24px',
          background: 'linear-gradient(to bottom, #ffffff 0%, #faf9fb 100%)',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.12)',
          border: '1px solid rgba(139, 92, 246, 0.1)'
        }}
      >
        {isLoading ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            gap: '16px'
          }}>
            <Loader2 size={48} style={{ color: '#8B5CF6' }} className="spin" />
            <p style={{ color: '#64748B', fontSize: '16px', fontWeight: 600 }}>
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
            <AlertCircle size={48} style={{ color: '#64748B' }} />
            <p style={{ color: '#64748B', fontSize: '16px', fontWeight: 600 }}>
              No extracted data found
            </p>
            <p style={{ color: '#94A3B8', fontSize: '14px' }}>
              {searchQuery ? 'Try a different search query' : 'Process some documents to see data here'}
            </p>
          </div>
        ) : (
          <div style={{ 
            overflowX: 'auto',
            borderRadius: '16px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'separate',
              borderSpacing: 0,
              fontSize: '12px',
              tableLayout: 'fixed',
              background: 'white'
            }}>
              <thead>
                <tr style={{ 
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                  color: 'white'
                }}>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '90px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                    position: 'sticky',
                    top: 0,
                    zIndex: 10
                  }}>
                    Record ID
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '130px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Scholar Name
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '110px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Scholar ID
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '120px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Account No
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '130px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Bank Name
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '140px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Holder Name
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '100px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    IFSC Code
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '130px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Branch Name
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'left', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '280px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Bill Data
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'right', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '85px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Bill1 Amt
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'right', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '85px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Bill2 Amt
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'right', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '85px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Bill3 Amt
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'right', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '85px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Bill4 Amt
                  </th>
                  <th style={{ 
                    padding: '16px 12px', 
                    textAlign: 'right', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase',
                    width: '85px',
                    borderRight: '1px solid rgba(255, 255, 255, 0.1)'
                  }}>
                    Bill5 Amt
                  </th>
                  <th style={{ 
                    padding: '16px 8px', 
                    textAlign: 'center', 
                    fontWeight: 700, 
                    fontSize: '11px',
                    width: '50px'
                  }}>
                    View
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((record, index) => {
                  const billData = parseJsonField(record.bill_data) || {}
                  const bankData = parseJsonField(record.bank_data) || {}
                  
                  const isExpanded = expandedRow === record.id
                  const isHovered = hoveredRow === record.id
                  
                  return (
                    <>
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        onMouseEnter={() => setHoveredRow(record.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{
                          borderBottom: '1px solid #F1F5F9',
                          background: isExpanded 
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(124, 58, 237, 0.05) 100%)'
                            : isHovered
                            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.04) 0%, rgba(255, 255, 255, 0) 100%)'
                            : index % 2 === 0 
                            ? 'white'
                            : '#FAFBFC',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        }}
                      >
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#64748B', 
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 600,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          <span style={{
                            background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 700
                          }}>
                            {record.record_id}
                          </span>
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#1E293B', 
                          fontWeight: 600, 
                          fontSize: '12px', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          {billData.student_name || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#475569', 
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 500,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          {billData.scholar_id || record.scholar_id || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#475569', 
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 500,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          {bankData.account_number || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#10B981', 
                          fontSize: '12px',
                          fontWeight: 600,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          {bankData.bank_name || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#475569', 
                          fontSize: '12px',
                          fontWeight: 500,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          {bankData.account_holder_name || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#475569', 
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '11px',
                          fontWeight: 600,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          {bankData.ifsc_code || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#475569', 
                          fontSize: '12px',
                          fontWeight: 500,
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          {bankData.branch_name || <span style={{ color: '#CBD5E1' }}>N/A</span>}
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#334155', 
                          fontSize: '11px',
                          lineHeight: '1.5',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          borderRight: '1px solid #F1F5F9',
                          fontWeight: 500
                        }}>
                          {formatBillDataText(billData)}
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: billData.amount ? '#8B5CF6' : '#CBD5E1', 
                          fontWeight: 700, 
                          textAlign: 'right', 
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '12px',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          {billData.amount ? (
                            <span style={{
                              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              display: 'inline-block'
                            }}>
                              {Number(billData.amount).toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                            </span>
                          ) : '0'}
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#CBD5E1', 
                          fontWeight: 600, 
                          textAlign: 'right', 
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '11px',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          0
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#CBD5E1', 
                          fontWeight: 600, 
                          textAlign: 'right', 
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '11px',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          0
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#CBD5E1', 
                          fontWeight: 600, 
                          textAlign: 'right', 
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '11px',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          0
                        </td>
                        <td style={{ 
                          padding: '14px 12px', 
                          color: '#CBD5E1', 
                          fontWeight: 600, 
                          textAlign: 'right', 
                          fontFamily: '"JetBrains Mono", monospace',
                          fontSize: '11px',
                          borderRight: '1px solid #F1F5F9'
                        }}>
                          0
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                          <motion.button
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setExpandedRow(expandedRow === record.id ? null : record.id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '6px',
                              borderRadius: '8px',
                              border: 'none',
                              background: expandedRow === record.id 
                                ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)' 
                                : isHovered
                                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)'
                                : '#F8FAFC',
                              color: expandedRow === record.id ? 'white' : '#64748B',
                              cursor: 'pointer',
                              transition: 'all 0.3s',
                              boxShadow: expandedRow === record.id 
                                ? '0 4px 12px rgba(139, 92, 246, 0.3)'
                                : '0 2px 4px rgba(0, 0, 0, 0.05)'
                            }}
                          >
                            <Eye size={14} />
                          </motion.button>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded Row */}
                      {expandedRow === record.id && (
                        <tr>
                          <td colSpan="15" style={{ padding: '0', background: 'linear-gradient(to bottom, #faf9fb 0%, #f8f7fa 100%)' }}>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              style={{ padding: '32px' }}
                            >
                              {/* Toggle Buttons */}
                              <div style={{ 
                                display: 'flex', 
                                gap: '16px', 
                                marginBottom: '32px',
                                justifyContent: 'center'
                              }}>
                                <motion.button
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setSelectedView({ ...selectedView, [record.id]: 'bill' })}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '14px 36px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: (!selectedView[record.id] || selectedView[record.id] === 'bill') 
                                      ? 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)'
                                      : 'white',
                                    color: (!selectedView[record.id] || selectedView[record.id] === 'bill') ? 'white' : '#64748B',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    boxShadow: (!selectedView[record.id] || selectedView[record.id] === 'bill')
                                      ? '0 8px 24px rgba(139, 92, 246, 0.4)'
                                      : '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    transition: 'all 0.3s',
                                    letterSpacing: '0.3px'
                                  }}
                                >
                                  <Database size={20} />
                                  View Bill Data
                                </motion.button>

                                <motion.button
                                  whileHover={{ scale: 1.05, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setSelectedView({ ...selectedView, [record.id]: 'bank' })}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '14px 36px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: (selectedView[record.id] === 'bank')
                                      ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                                      : 'white',
                                    color: (selectedView[record.id] === 'bank') ? 'white' : '#64748B',
                                    fontWeight: 700,
                                    fontSize: '15px',
                                    cursor: 'pointer',
                                    boxShadow: (selectedView[record.id] === 'bank')
                                      ? '0 8px 24px rgba(16, 185, 129, 0.4)'
                                      : '0 4px 12px rgba(0, 0, 0, 0.08)',
                                    transition: 'all 0.3s',
                                    letterSpacing: '0.3px'
                                  }}
                                >
                                  <Database size={20} />
                                  View Bank Data
                                </motion.button>
                              </div>

                              {/* Content Area */}
                              <motion.div
                                key={selectedView[record.id] || 'bill'}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                                style={{ 
                                  display: 'grid',
                                  gridTemplateColumns: '450px 550px',
                                  gap: '24px',
                                  alignItems: 'start',
                                  justifyContent: 'center'
                                }}
                              >
                                {/* Left Side - Document Image */}
                                <div style={{
                                  background: 'white',
                                  borderRadius: '16px',
                                  padding: '20px',
                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                                  border: '1px solid #E5E7EB',
                                  maxWidth: '450px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '16px',
                                    paddingBottom: '12px',
                                    borderBottom: '2px solid #F3F4F6'
                                  }}>
                                    <Eye size={20} style={{ 
                                      color: (!selectedView[record.id] || selectedView[record.id] === 'bill') ? '#8B5CF6' : '#10B981' 
                                    }} />
                                    <h4 style={{ 
                                      margin: 0, 
                                      fontSize: '15px', 
                                      fontWeight: 700,
                                      color: '#1E293B',
                                      letterSpacing: '0.3px'
                                    }}>
                                      {(!selectedView[record.id] || selectedView[record.id] === 'bill') 
                                        ? 'Bill Image' 
                                        : 'Bank Passbook Image'}
                                    </h4>
                                  </div>

                                  {(!selectedView[record.id] || selectedView[record.id] === 'bill') ? (
                                    record.bill_image_supabase ? (
                                      <div style={{ position: 'relative', width: '100%', maxWidth: '418px' }}>
                                        <img 
                                          src={record.bill_image_supabase}
                                          alt="Bill"
                                          style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '500px',
                                            objectFit: 'contain',
                                            borderRadius: '12px',
                                            border: '2px solid #E5E7EB',
                                            display: 'block',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                          }}
                                          onError={(e) => {
                                            e.target.style.display = 'none'
                                            e.target.nextSibling.style.display = 'flex'
                                          }}
                                        />
                                        <div style={{
                                          display: 'none',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          padding: '60px 20px',
                                          background: '#F8FAFC',
                                          borderRadius: '12px',
                                          border: '2px dashed #CBD5E1',
                                          gap: '12px'
                                        }}>
                                          <AlertCircle size={48} style={{ color: '#94A3B8' }} />
                                          <p style={{ color: '#64748B', fontSize: '14px', margin: 0, fontWeight: 600 }}>
                                            Image not available
                                          </p>
                                          <a 
                                            href={record.bill_image_supabase}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              color: '#8B5CF6',
                                              textDecoration: 'underline',
                                              fontSize: '13px'
                                            }}
                                          >
                                            Try opening in new tab
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '60px 20px',
                                        background: '#F8FAFC',
                                        borderRadius: '12px',
                                        border: '2px dashed #CBD5E1',
                                        gap: '12px'
                                      }}>
                                        <AlertCircle size={48} style={{ color: '#94A3B8' }} />
                                        <p style={{ color: '#64748B', fontSize: '14px', margin: 0, fontWeight: 600 }}>
                                          No bill image available
                                        </p>
                                      </div>
                                    )
                                  ) : (
                                    record.bank_image_supabase ? (
                                      <div style={{ position: 'relative', width: '100%', maxWidth: '418px' }}>
                                        <img 
                                          src={record.bank_image_supabase}
                                          alt="Bank Passbook"
                                          style={{
                                            width: '100%',
                                            height: 'auto',
                                            maxHeight: '500px',
                                            objectFit: 'contain',
                                            borderRadius: '12px',
                                            border: '2px solid #E5E7EB',
                                            display: 'block',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)'
                                          }}
                                          onError={(e) => {
                                            e.target.style.display = 'none'
                                            e.target.nextSibling.style.display = 'flex'
                                          }}
                                        />
                                        <div style={{
                                          display: 'none',
                                          flexDirection: 'column',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          padding: '60px 20px',
                                          background: '#F8FAFC',
                                          borderRadius: '12px',
                                          border: '2px dashed #CBD5E1',
                                          gap: '12px'
                                        }}>
                                          <AlertCircle size={48} style={{ color: '#94A3B8' }} />
                                          <p style={{ color: '#64748B', fontSize: '14px', margin: 0, fontWeight: 600 }}>
                                            Image not available
                                          </p>
                                          <a 
                                            href={record.bank_image_supabase}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                              color: '#10B981',
                                              textDecoration: 'underline',
                                              fontSize: '13px'
                                            }}
                                          >
                                            Try opening in new tab
                                          </a>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '60px 20px',
                                        background: '#F8FAFC',
                                        borderRadius: '12px',
                                        border: '2px dashed #CBD5E1',
                                        gap: '12px'
                                      }}>
                                        <AlertCircle size={48} style={{ color: '#94A3B8' }} />
                                        <p style={{ color: '#64748B', fontSize: '14px', margin: 0, fontWeight: 600 }}>
                                          No bank passbook image available
                                        </p>
                                      </div>
                                    )
                                  )}
                                </div>

                                {/* Right Side - JSON Data */}
                                <div style={{
                                  background: 'white',
                                  borderRadius: '16px',
                                  padding: '20px',
                                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                                  border: '1px solid #E5E7EB',
                                  overflow: 'hidden',
                                  maxWidth: '550px'
                                }}>
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    marginBottom: '16px',
                                    paddingBottom: '12px',
                                    borderBottom: '2px solid #F3F4F6'
                                  }}>
                                    <Database size={20} style={{ 
                                      color: (!selectedView[record.id] || selectedView[record.id] === 'bill') ? '#8B5CF6' : '#10B981' 
                                    }} />
                                    <h4 style={{ 
                                      margin: 0, 
                                      fontSize: '15px', 
                                      fontWeight: 700,
                                      color: '#1E293B',
                                      letterSpacing: '0.3px'
                                    }}>
                                      {(!selectedView[record.id] || selectedView[record.id] === 'bill') 
                                        ? 'Bill Data (JSON)' 
                                        : 'Bank Data (JSON)'}
                                    </h4>
                                  </div>

                                  <pre style={{
                                    background: 'linear-gradient(135deg, #fafbfc 0%, #f5f7fa 100%)',
                                    padding: '18px',
                                    borderRadius: '12px',
                                    border: '2px solid #E5E7EB',
                                    fontSize: '12px',
                                    fontFamily: '"JetBrains Mono", "Courier New", Courier, monospace',
                                    overflowX: 'auto',
                                    maxHeight: '500px',
                                    overflowY: 'auto',
                                    color: '#1E293B',
                                    margin: 0,
                                    whiteSpace: 'pre',
                                    wordWrap: 'normal',
                                    lineHeight: '1.7',
                                    tabSize: 2,
                                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)'
                                  }}>
                                    {(!selectedView[record.id] || selectedView[record.id] === 'bill')
                                      ? JSON.stringify(billData, null, 2)
                                      : JSON.stringify(bankData, null, 2)}
                                  </pre>
                                </div>
                              </motion.div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </>
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
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.1)'
          }}
        >
          <div style={{ 
            color: '#64748B', 
            fontSize: '15px', 
            fontWeight: 600,
            letterSpacing: '0.3px'
          }}>
            Showing <span style={{ color: '#8B5CF6', fontWeight: 700 }}>{((currentPage - 1) * recordsPerPage) + 1}</span> to <span style={{ color: '#8B5CF6', fontWeight: 700 }}>{Math.min(currentPage * recordsPerPage, totalRecords)}</span> of <span style={{ color: '#8B5CF6', fontWeight: 700 }}>{totalRecords}</span> records
          </div>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: currentPage === 1 ? '#E2E8F0' : '#8B5CF6',
                background: currentPage === 1 ? '#F8FAFC' : 'white',
                color: currentPage === 1 ? '#CBD5E1' : '#8B5CF6',
                fontWeight: 700,
                fontSize: '14px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: currentPage === 1 ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.2)'
              }}
            >
              <ChevronLeft size={18} />
              Previous
            </motion.button>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              padding: '12px 24px',
              fontWeight: 700,
              fontSize: '15px',
              color: '#1E293B',
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(124, 58, 237, 0.1) 100%)',
              borderRadius: '12px',
              border: '2px solid rgba(139, 92, 246, 0.2)',
              letterSpacing: '0.3px'
            }}>
              Page <span style={{ color: '#8B5CF6', margin: '0 6px' }}>{currentPage}</span> of <span style={{ color: '#8B5CF6', margin: '0 6px' }}>{totalPages}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                borderRadius: '12px',
                border: '2px solid',
                borderColor: currentPage === totalPages ? '#E2E8F0' : '#8B5CF6',
                background: currentPage === totalPages ? '#F8FAFC' : 'white',
                color: currentPage === totalPages ? '#CBD5E1' : '#8B5CF6',
                fontWeight: 700,
                fontSize: '14px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: currentPage === totalPages ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.2)'
              }}
            >
              Next
              <ChevronRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        
        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Custom Scrollbar for Table */
        div::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        div::-webkit-scrollbar-track {
          background: #F1F5F9;
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
          border-radius: 10px;
        }

        div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
        }

        /* Smooth transitions */
        * {
          transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
        }
      `}</style>
    </div>
  )
}