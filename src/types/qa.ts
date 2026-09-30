export type PriorityLevel = 'emergency' | 'high' | 'normal' | 'low';
export type IssueStatus = 'pending' | 'in_progress' | 'fixed' | 'delayed' | 'discarded';
export type UserRole = 'admin' | 'fixer' | 'debugger';

export interface ImageAttachment {
  id: string;
  dataUrl: string;
  description: string;
  fileName: string;
  timestamp: string;
  cropBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ForwardHistoryEntry {
  id: string;
  fromFixerId: string;
  fromFixerName: string;
  toFixerId: string;
  toFixerName: string;
  note: string;
  timestamp: string;
}

export interface ConsoleEntry {
  type: 'error' | 'warn' | 'info';
  message: string;
  timestamp: string;
  source?: string;
}

export interface IssueChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  imageUrl?: string;
  timestamp: string;
  mentionedUsers?: string[];
}

export interface Issue {
  id: string;
  websiteId: string;
  title: string;
  generalDesc: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  priority: PriorityLevel;
  status: IssueStatus;
  
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  
  assignedFixerId: string;
  assignedFixerName: string;
  mentionedFixers: string[]; // Fixers tagged with @
  
  images: ImageAttachment[];
  url: string;
  viewport: string;
  browser: string;
  os: string;
  consoleLogs: ConsoleEntry[];
  
  forwardHistory: ForwardHistoryEntry[];
  chatMessages?: IssueChatMessage[];
  
  createdAt: string;
  updatedAt: string;
}

export interface Website {
  id: string;
  name: string;
  url: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  status: 'active' | 'archived';
  issueCount: number;
  allowedDebuggerIds?: string[]; // Admin controls which debuggers can join
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isRestricted: boolean;
  avatar?: string;
  createdAt: string;
}

export interface BackupRecord {
  id: string;
  websiteId: string;
  websiteName: string;
  creatorId: string;
  creatorName: string;
  createdAt: string;
  issuesCount: number;
  dataJson: string;
}
