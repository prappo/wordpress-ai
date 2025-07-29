export type Project = {
  id: string;
  customer_id: string;
  name: string;
  content_url?: string;
  code?: Array<{ path: string; code: string }>;
  messages?: Array<{ role: string; content: string }>;
  created_at: string;
  updated_at: string;
  type: 'General' | 'Page Content' | 'Plugin' | 'Theme';
};
