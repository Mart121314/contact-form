const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    return res.status(200).json({ hasApiKey: Boolean(process.env.RESEND_API_KEY) });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Server er ikke konfigurert riktig (mangler API-nøkkel).' });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Navn, e-post og melding er påkrevd.' });
  }

  try {
    const { error } = await resend.emails.send({
      from: 'Kontaktskjema <it_utvikling@martineikefet.dev>',
      to: 'it_utvikling@martineikefet.dev',
      replyTo: email,
      subject: `Henvendelse fra ${name}`,
      text: `Navn: ${name}\nE-post: ${email}\n\n${message}`,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(502).json({ error: 'Kunne ikke sende e-post.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Noe gikk galt på serveren.' });
  }
};
