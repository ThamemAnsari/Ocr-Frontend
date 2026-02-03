import { useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { Upload, RefreshCw, Database, CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function BulkSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [syncProgress, setSyncProgress] = useState(null)

  const handleBulkSync = async () => {
    setIsSyncing(true)
    setSyncResult(null)
    
    try {
      toast.loading('Starting bulk sync to Zoho Creator...', { id: 'bulk-sync' })
      
      const response = await fetch('http://localhost:8000/sync/bulk-push-to-zoho?limit=1000', {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setSyncResult(result.details)
        toast.success(
          `Sync complete! ${result.details.successful}/${result.details.total_records} records synced`,
          { id: 'bulk-sync', duration: 5000 }
        )
      } else {
        toast.error('Sync failed: ' + result.error, { id: 'bulk-sync' })
      }
    } catch (error) {
      toast.error('Error: ' + error.message, { id: 'bulk-sync' })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div className="glass-card" style={{ padding: '32px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Database size={28} style={{ color: '#8B5CF6' }} />
        <h2 style={{ 
          margin: 0, 
          fontSize: '24px', 
          fontWeight: 800,
          background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Bulk Sync to Zoho Creator
        </h2>
      </div>

      <p style={{ color: '#64748B', marginBottom: '24px' }}>
        Sync all extraction results from Supabase to Zoho Creator in bulk (handles 1000+ records efficiently)
      </p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBulkSync}
        disabled={isSyncing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '16px 32px',
          borderRadius: '12px',
          border: 'none',
          background: isSyncing 
            ? 'linear-gradient(135deg, #94A3B8 0%, #64748B 100%)'
            : 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
          color: 'white',
          fontWeight: 700,
          fontSize: '16px',
          cursor: isSyncing ? 'not-allowed' : 'pointer',
          boxShadow: '0 8px 24px rgba(139, 92, 246, 0.4)',
          transition: 'all 0.3s'
        }}
      >
        {isSyncing ? (
          <>
            <Loader2 size={20} className="spin" />
            Syncing...
          </>
        ) : (
          <>
            <Upload size={20} />
            Start Bulk Sync
          </>
        )}
      </motion.button>

      {syncResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '24px',
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(255, 255, 255, 1) 100%)',
            borderRadius: '12px',
            border: '1px solid rgba(139, 92, 246, 0.2)'
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#1E293B' }}>
            Sync Results
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
            <div style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '2px solid #E5E7EB' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                Total Records
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#8B5CF6' }}>
                {syncResult.total_records}
              </div>
            </div>

            <div style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '2px solid #10B981' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Successful
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#10B981' }}>
                {syncResult.successful}
              </div>
            </div>

            <div style={{ padding: '16px', background: 'white', borderRadius: '12px', border: '2px solid #EF4444' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, marginBottom: '4px' }}>
                <XCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Failed
              </div>
              <div style={{ fontSize: '32px', fontWeight: 800, color: '#EF4444' }}>
                {syncResult.failed}
              </div>
            </div>
          </div>

          {syncResult.errors && syncResult.errors.length > 0 && (
            <div style={{
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#DC2626', marginBottom: '8px' }}>
                Errors:
              </div>
              {syncResult.errors.map((error, idx) => (
                <div key={idx} style={{ fontSize: '13px', color: '#64748B', marginBottom: '4px' }}>
                  Batch {error.batch}: {error.error}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}