// Route validation utilities based on database schema
export const ID_VALIDATORS = {
  // UUID-based entities
  UUID_REGEX: /^[a-f0-9-]{36}$/i,
  
  // Text-based entities  
  TEXT_MIN_LENGTH: 1,
  
  // Valid export formats
  VALID_EXPORT_FORMATS: ['pdf', 'docx', 'html', 'markdown'],
  
  // Document status values
  DOCUMENT_STATUSES: ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED'],
  
  // User roles
  USER_ROLES: ['ADMIN', 'EDITOR', 'READER'],
  
  // Notification types
  NOTIFICATION_TYPES: ['INFO', 'WARNING', 'ERROR', 'SUCCESS'],
  
  // Comment reaction emojis (simplified)
  VALID_REACTIONS: ['👍', '👎', '❤️'],
};

export function isValidUUID(id: string): boolean {
  return ID_VALIDATORS.UUID_REGEX.test(id);
}

export function isValidTextId(id: string): boolean {
  return id && id.trim().length >= ID_VALIDATORS.TEXT_MIN_LENGTH;
}

export function isValidExportFormat(format: string): boolean {
  return ID_VALIDATORS.VALID_EXPORT_FORMATS.includes(format?.toLowerCase());
}

export function isValidDocumentStatus(status: string): boolean {
  return ID_VALIDATORS.DOCUMENT_STATUSES.includes(status?.toUpperCase());
}

export function isValidUserRole(role: string): boolean {
  return ID_VALIDATORS.USER_ROLES.includes(role?.toUpperCase());
}

// Schema-based ID validation by entity type
export const ENTITY_VALIDATORS = {
  // UUID-based entities
  department: isValidUUID,
  area: isValidUUID,
  profile: isValidUUID,
  document_comment: isValidUUID,
  document_export: isValidUUID,
  analytics_event: isValidUUID,
  notification: isValidUUID,
  
  // Text-based entities
  document: isValidTextId,
  category: isValidTextId,
  user: isValidTextId,
  template: isValidTextId,
  document_version: isValidTextId,
  document_favorite: isValidTextId,
  document_reaction: isValidTextId,
  document_translation: isValidUUID, // Actually UUID but complex
  comment_reaction: isValidUUID,
  email_log: isValidUUID,
  system_setting: (id: string) => id === '1', // Single row table
};

export function validateEntityId(entityType: keyof typeof ENTITY_VALIDATORS, id: string): boolean {
  const validator = ENTITY_VALIDATORS[entityType];
  if (!validator) {
    console.warn(`Unknown entity type: ${entityType}`);
    return false;
  }
  return validator(id);
}

// Navigation helper with validation
export function navigateWithValidation(
  navigate: any, 
  path: string, 
  entityType?: keyof typeof ENTITY_VALIDATORS, 
  entityId?: string
): void {
  if (entityType && entityId && !validateEntityId(entityType, entityId)) {
    console.error(`Invalid ${entityType} ID: ${entityId}`);
    navigate('/404');
    return;
  }
  
  navigate(path);
}