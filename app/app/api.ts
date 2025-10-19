const BASE_URL = 'http://10.0.2.2:8000/api'; // use emulator host for localhost; adjust as needed

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
  console.log('API POST:', joinPath(path), 'headers=', headers, 'body=', body);
  const res = await fetch(joinPath(path), {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await parseResponse(res);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export async function get(path: string, token?: string) {
  const headers: any = { Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  console.log('API GET:', joinPath(path), 'headers=', headers);
  const res = await fetch(joinPath(path), { headers });
  const data = await parseResponse(res);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export async function put(path: string, body: any, token?: string) {
  const headers: any = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  console.log('API PUT:', joinPath(path), 'headers=', headers, 'body=', body);
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
  console.log('API DEL:', joinPath(path), 'headers=', headers);
  const res = await fetch(joinPath(path), { method: 'DELETE', headers });
  const data = await parseResponse(res);
  if (!res.ok) throw { status: res.status, data };
  return data;
}

export default { post, get };
