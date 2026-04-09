// Vercel serverless function to receive dashboard messages
// POST /api/message { text: "...", type: "text" | "audio" }
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text, type } = req.body || {};
  if (!text) {
    return res.status(400).json({ error: 'No message text' });
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'Server not configured' });
  }

  try {
    const resp = await fetch('https://api.github.com/repos/sugarlift/dashboard/issues', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'sugarlift-dashboard'
      },
      body: JSON.stringify({
        title: '[Dashboard] ' + (type === 'audio' ? 'Voice memo' : text.substring(0, 60)),
        body: (type === 'audio' ? '🎤 Voice memo\n\n' : '💬 ') + text + '\n\nTimestamp: ' + new Date().toISOString(),
        labels: ['dashboard-message']
      })
    });

    if (resp.ok) {
      return res.status(200).json({ ok: true });
    } else {
      const err = await resp.text();
      return res.status(502).json({ error: 'GitHub API error', detail: err });
    }
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
