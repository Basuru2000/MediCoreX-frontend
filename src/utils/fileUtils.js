export const formatFileSize = (bytes) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export const getFileIcon = (documentType) => {
  const type = documentType?.toLowerCase()
  switch(type) {
    case 'pdf': return '📄'
    case 'contract': return '📝'
    case 'license': return '📜'
    case 'certificate': return '🏆'
    case 'insurance': return '🛡️'
    default: return '📎'
  }
}

export const isDocumentExpiring = (expiryDate, daysThreshold = 30) => {
  if (!expiryDate) return false
  const expiry = new Date(expiryDate)
  const today = new Date()
  const diffTime = expiry - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= daysThreshold && diffDays >= 0
}

export const isDocumentExpired = (expiryDate) => {
  if (!expiryDate) return false
  return new Date(expiryDate) < new Date()
}

export const validateFile = (file) => {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png'
  ]
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Use PDF, DOC, DOCX, JPG, or PNG' }
  }
  
  return { valid: true }
}