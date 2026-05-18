export default async function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = `${process.env.FRONTEND_URL || 'https://pasaotoparca.com'}/api/auth/google/callback`

  const scope = encodeURIComponent('openid email profile')

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&prompt=select_account`

  res.redirect(url)
}
