export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ detail: 'Method not allowed' });
  }

  try {
    const authHeader = req.headers.authorization || '';
    const response = await fetch('https://distribucore-api-dev-core-s-projects.vercel.app/auth/me', {
      method: 'GET',
      headers: { Authorization: authHeader }
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
}
