const BASE_URL = 'https://pseudohexagonal-minna-unobsolete.ngrok-free.dev/api'; // use emulator host for localhost; adjust as needed

async function parseResponse(res: Response) {
  // Try JSON first, else return text
  try {
    const json = await res.json();
    return json;
  } catch {
    try {
      const text = await res.text();
      return text;
    } catch {
      return null;
    }
  }
}

function joinPath(path: string) {
  if (!path) return BASE_URL;
  if (path.startsWith('/')) return `${BASE_URL}${path}`;
  return `${BASE_URL}/${path}`;
}

export async function post(path: string, body: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(joinPath(path), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await parseResponse(res);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export async function get(path: string, token?: string, timeout: number = 10000) {
  const headers: any = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  // Add timeout to prevent infinite hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const res = await fetch(joinPath(path), { 
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const data = await parseResponse(res);
    if (!res.ok) throw { status: res.status, data };
    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw { status: 408, data: { message: 'Request timeout' } };
    }
    throw error;
  }
}

export async function put(path: string, body: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(joinPath(path), {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  const data = await parseResponse(res);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export async function del(path: string, token?: string) {
  const headers: any = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(joinPath(path), { method: 'DELETE', headers });
  const data = await parseResponse(res);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export default { post, get, put, del };
