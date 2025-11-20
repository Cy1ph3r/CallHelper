// ============================================
// API Request Types
// ============================================

export interface ResolveRequest {
  name: string;
  user_type: 'umrah' | 'external' | string;
  issue: string;
  get_alternatives?: boolean;  // Optional: request all alternatives
}

export interface ChatRequest {
  message: string;
  user_type?: string;
  session_id?: string;
  is_first?: boolean;
}

export interface SearchRequest {
  caller_name: string;
  caller_type: string;
  issue_description: string;
  activation?: string;
  registration?: string;
  request_status?: string;
}

// ============================================
// API Response Types
// ============================================

export interface MatchResult {
  case_id: string | null;
  category: string | null;
  subcategory: string | null;
  priority: string | null;
  score: number | null;
  response_text: string | null;
  fallback: string | null;
  why: string | null;
  last_updated: string | null;
}

export interface ResolveResponse {
  success: boolean;
  message: string;
  customer?: string;
  user_type?: string;
  match?: MatchResult;
  alternatives?: MatchResult[];  // Optional: all matching alternatives
}

export interface ChatResponse {
  success: boolean;
  response: string;
  quick_replies: string[];
  session_id: string;
}

export interface SearchResponse {
  error?: string;
  result?: string;
}

// ============================================
// API Error Type
// ============================================

export interface ApiError {
  status: number;
  message: string;
  data?: any;
}

// ============================================
// Chat Session Type
// ============================================

export interface ChatMessage {
  role: 'user' | 'bot';
  content: string;
  timestamp?: Date;
}

export interface ChatSession {
  session_id: string;
  messages: ChatMessage[];
  user_type: string;
}
