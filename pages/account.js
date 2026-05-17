const whatsappNumber = '905077302703'
const wpUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Merhaba, hesabım ve siparişlerim hakkında bilgi almak istiyorum.')}`

export default function AccountPage() {
  return (
    <main className="page">
      <header className="header">
        <a href="/" className="logo"><img src="/logo.svg" alt="Paşa Oto Parça" /></a>
        <nav>
          <a href="/">Ana Sayfa</a>
          <a href="/products/">Katalog</a>
          <a href="/cart/">Sepetim</a>
          <a href={wpUrl}>Destek</a>
        </nav>
      </header>

      <section className="hero">
        <div>
          <span>MÜŞTERİ PANELİ</span>
          <h1>Hesabım</h1>
          <p>Siparişlerinizi, teklif taleplerinizi, kayıtlı araç bilgilerinizi ve teslimat adreslerinizi buradan takip edebilirsiniz.</p>
        </div>
      </section>

      <section className="layout">
        <aside className="sidebar">
          <strong>Hesap Menüsü</strong>
          <a href="#login">Giriş / Kayıt</a>
          <a href="#orders">Siparişlerim</a>
          <a href="#vehicles">Araç Bilgilerim</a>
          <a href="#quotes">Teklif Taleplerim</a>
          <a href="#addresses">Adreslerim</a>
          <a href={wpUrl}>WhatsApp Destek</a>
        </aside>

        <div className="content">
          <section id="login" className="card loginCard">
            <div>
              <span className="label">GİRİŞ</span>
              <h2>Müşteri girişi</h2>
              <p>Şu an üyelik sistemi aktif değil. Sipariş ve teklif talepleriniz WhatsApp üzerinden takip edilir. İleride bu alana e-posta/şifre ile giriş modülü bağlanabilir.</p>
            </div>
            <a href={wpUrl} className="primaryBtn">WhatsApp ile Devam Et</a>
          </section>

          <section id="orders" className="card">
            <div className="cardHead">
              <div>
                <span className="label">SİPARİŞLER</span>
                <h2>Siparişlerim</h2>
              </div>
              <a href={wpUrl}>Sipariş Sorgula</a>
            </div>
            <div className="emptyBox">
              <strong>Henüz görüntülenecek sipariş yok.</strong>
              <p>Sipariş verdiğiniz ürünlerin kodunu WhatsApp üzerinden ileterek durumunu sorgulayabilirsiniz.</p>
            </div>
          </section>

          <section id="vehicles" className="card">
            <div className="cardHead">
              <div>
                <span className="label">ARAÇ BİLGİLERİ</span>
                <h2>Araç Bilgilerim</h2>
              </div>
            </div>
            <div className="vehicleGrid">
              <div><span>Marka</span><strong>Seçilmedi</strong></div>
              <div><span>Model</span><strong>Seçilmedi</strong></div>
              <div><span>Yıl</span><strong>Seçilmedi</strong></div>
              <div><span>Şase No</span><strong>Eklenmedi</strong></div>
            </div>
            <a href={wpUrl} className="secondaryBtn">Araç Bilgimi WhatsApp’tan Gönder</a>
          </section>

          <section id="quotes" className="card">
            <div className="cardHead">
              <div>
                <span className="label">TEKLİFLER</span>
                <h2>Teklif Taleplerim</h2>
              </div>
              <a href="/products/">Ürün Seç</a>
            </div>
            <div className="steps">
              <div><b>1</b><span>Ürünü seç</span></div>
              <div><b>2</b><span>Parça kodunu gönder</span></div>
              <div><b>3</b><span>Uyumluluk teyidi al</span></div>
            </div>
          </section>

          <section id="addresses" className="card">
            <div className="cardHead">
              <div>
                <span className="label">ADRES</span>
                <h2>Teslimat Adreslerim</h2>
              </div>
            </div>
            <div className="emptyBox">
              <strong>Kayıtlı adres yok.</strong>
              <p>Sipariş aşamasında teslimat adresinizi WhatsApp üzerinden paylaşabilirsiniz.</p>
            </div>
          </section>
        </div>
      </section>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; background: #f4f2ee; color: #111; font-family: Arial, sans-serif; }
        a { color: inherit; text-decoration: none; }
        .header { display: flex; justify-content: space-between; align-items: center; gap: 24px; padding: 18px 54px; background: rgba(255,255,255,.9); border-bottom: 1px solid rgba(0,0,0,.08); position: sticky; top: 0; z-index: 10; backdrop-filter: blur(18px); }
        .logo img { width: 150px; height: 70px; object-fit: contain; display: block; }
        nav { display: flex; gap: 10px; flex-wrap: wrap; justify-content: flex-end; }
        nav a { background: #fff; border: 1px solid rgba(0,0,0,.08); border-radius: 999px; padding: 10px 14px; font-weight: 800; font-size: 14px; }
        .hero { padding: 70px 54px 38px; max-width: 1240px; margin: 0 auto; }
        .hero span, .label { color: #b3141b; font-size: 12px; font-weight: 900; letter-spacing: 1.4px; }
        .hero h1 { font-size: clamp(44px, 7vw, 82px); line-height: .95; letter-spacing: -3px; margin: 14px 0; }
        .hero p { max-width: 680px; color: #5d5d5d; font-size: 18px; line-height: 1.7; margin: 0; }
        .layout { max-width: 1240px; margin: 0 auto; padding: 20px 54px 90px; display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start; }
        .sidebar { background: #111; color: #fff; border-radius: 28px; padding: 22px; display: grid; gap: 10px; position: sticky; top: 110px; }
        .sidebar strong { font-size: 20px; margin-bottom: 8px; }
        .sidebar a { padding: 13px 14px; border-radius: 16px; background: rgba(255,255,255,.08); color: #eee; font-weight: 700; }
        .content { display: grid; gap: 18px; }
        .card { background: #fff; border: 1px solid rgba(0,0,0,.07); border-radius: 30px; padding: 28px; box-shadow: 0 28px 80px rgba(0,0,0,.055); }
        .loginCard { display: flex; justify-content: space-between; align-items: center; gap: 24px; }
        .card h2 { font-size: 30px; margin: 8px 0 10px; letter-spacing: -1px; }
        .card p { color: #666; line-height: 1.65; margin: 0; }
        .primaryBtn, .secondaryBtn, .cardHead a { display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; padding: 14px 20px; font-weight: 900; white-space: nowrap; }
        .primaryBtn { background: #25D366; color: #071b0d; }
        .secondaryBtn { background: #111; color: #fff; margin-top: 20px; }
        .cardHead { display: flex; justify-content: space-between; align-items: center; gap: 18px; margin-bottom: 18px; }
        .cardHead a { background: #111; color: #fff; font-size: 14px; }
        .emptyBox { background: #f6f6f6; border-radius: 22px; padding: 22px; }
        .emptyBox strong { display: block; margin-bottom: 8px; }
        .vehicleGrid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
        .vehicleGrid div { background: #f7f7f7; border-radius: 20px; padding: 18px; }
        .vehicleGrid span { color: #777; display: block; font-size: 13px; margin-bottom: 8px; }
        .vehicleGrid strong { overflow-wrap: anywhere; }
        .steps { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .steps div { background: #f7f7f7; border-radius: 20px; padding: 18px; display: flex; align-items: center; gap: 12px; }
        .steps b { width: 34px; height: 34px; border-radius: 50%; background: #b3141b; color: #fff; display: grid; place-items: center; flex: 0 0 auto; }
        @media (max-width: 860px) {
          .header { padding: 14px 16px; flex-direction: column; align-items: stretch; }
          .logo img { width: 130px; height: 58px; margin: 0 auto; }
          nav { justify-content: flex-start; overflow-x: auto; flex-wrap: nowrap; padding-bottom: 4px; }
          nav a { white-space: nowrap; }
          .hero { padding: 42px 16px 20px; }
          .hero h1 { font-size: 44px; letter-spacing: -2px; }
          .hero p { font-size: 16px; }
          .layout { grid-template-columns: 1fr; padding: 16px 16px 78px; }
          .sidebar { position: relative; top: auto; border-radius: 24px; }
          .loginCard, .cardHead { flex-direction: column; align-items: flex-start; }
          .primaryBtn, .secondaryBtn, .cardHead a { width: 100%; }
          .card { border-radius: 24px; padding: 22px; }
          .vehicleGrid, .steps { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  )
}
