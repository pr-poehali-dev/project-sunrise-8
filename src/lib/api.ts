import funcUrls from '../../backend/func2url.json';

const API_URL = funcUrls.api;

const getSessionId = (): string => {
  let sid = localStorage.getItem('vf_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('vf_session_id', sid);
  }
  return sid;
};

const request = async (method: string, params: Record<string, string> = {}, body?: unknown) => {
  const url = new URL(API_URL);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': getSessionId(),
    },
  };

  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  const resp = await fetch(url.toString(), options);
  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.error || `HTTP ${resp.status}`);
  }

  return data;
};

export type VideoProject = {
  id: string;
  session_id: string;
  title: string;
  status: string;
  topic: string;
  script: string;
  avatar_id: string;
  avatar_name: string;
  platform: string;
  duration_sec: number;
  style: string;
  branding: Record<string, unknown>;
  result_url: string | null;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
};

export type ScriptScene = {
  time: string;
  text: string;
  visual: string;
  emotion: string;
};

export type GeneratedScript = {
  title: string;
  hook: string;
  scenes: ScriptScene[];
  cta: string;
  hashtags: string[];
  estimated_duration: number;
};

export const api = {
  generateScript: (data: {
    topic: string;
    platform: string;
    style: string;
    avatar_name: string;
    duration: number;
  }): Promise<GeneratedScript> =>
    request('POST', { action: 'generate' }, { ...data, action: 'generate' }),

  getProjects: (): Promise<VideoProject[]> =>
    request('GET', { action: 'projects' }),

  getProject: (id: string): Promise<VideoProject> =>
    request('GET', { action: 'projects', id }),

  createProject: (data: Partial<VideoProject>): Promise<VideoProject> =>
    request('POST', { action: 'projects' }, data),

  updateProject: (id: string, data: Partial<VideoProject>): Promise<VideoProject> =>
    request('PUT', { action: 'projects' }, { ...data, id }),

  deleteProject: (id: string): Promise<{ deleted: boolean }> =>
    request('DELETE', { action: 'projects', id }),
};

export default api;
