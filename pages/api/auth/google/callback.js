import jwt from 'jsonwebtoken'

export default async function handler(req, res) {
  const { code } = req.query

  if (!code) {
    return res.redirect('/account?error=no_code')
  }

  try {
    const params = new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: `${process.env.FRONTEND_URL || 'https://pasaotoparca.com'}/api/auth/google/callback`,
      grant_type: 'authorization_code'
    })

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    const tokenData = await tokenResponse.json()

    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    })

    const user = await userResponse.json()

    const appToken = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    )

    return res.redirect(`/account?token=${appToken}`)
  } catch (error) {
    console.error(error)
    return res.redirect('/account?error=google_auth_failed')
  }
}
