export interface Organization {
  id: string;
  name: string;
  slug: string;
}

export interface Niche {
  id: string;
  name: string;
  slug: string;
  organizationId?: string;
}

export interface Project {
  id: string;
  title: string;
  stage: string;
  organizationId: string;
  organization?: Organization;
}

export interface ScrapedJobData {
  title: string;
  jobUrl: string;
  jobDescription: string;
  pricingType: 'HOURLY' | 'FIXED';
  fixedPrice?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  skills: string[];
}

export interface ScrapedChatMessage {
  senderName: string;
  senderType: 'CLIENT' | 'AGENCY';
  content: string;
  sentAt: string;
}

export interface ImportFromUpworkPayload {
  title: string;
  jobUrl: string;
  jobDescription?: string;
  pricingType: 'HOURLY' | 'FIXED';
  fixedPrice?: number;
  hourlyRateMin?: number;
  hourlyRateMax?: number;
  skills?: string[];
  organizationId: string;
  nicheId?: string;
}

export interface SyncChatsPayload {
  upworkRoomId?: string;
  messages: {
    senderName: string;
    senderType: 'CLIENT' | 'AGENCY';
    content: string;
    sentAt: string;
  }[];
}

export interface SyncChatsResponse {
  synced: number;
  total: number;
}

export type MessageAction =
  | { type: 'GET_AUTH_STATUS' }
  | { type: 'LOGIN'; email: string; password: string }
  | { type: 'LOGOUT' }
  | { type: 'GET_ORGANIZATIONS' }
  | { type: 'GET_NICHES'; organizationId: string }
  | { type: 'GET_PROJECTS'; organizationId: string }
  | { type: 'IMPORT_JOB'; payload: ImportFromUpworkPayload }
  | { type: 'SYNC_CHATS'; projectId: string; payload: SyncChatsPayload }
  | { type: 'GET_LATEST_SYNC'; projectId: string };
