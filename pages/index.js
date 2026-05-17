export default function Home() {
  return (
    <main style={{fontFamily:'Arial',padding:'40px',background:'#111',minHeight:'100vh',color:'#fff'}}>
      <h1 style={{fontSize:'48px',marginBottom:'20px'}}>Paşa Oto Parça</h1>
      <p style={{fontSize:'20px',maxWidth:'700px'}}>
        Tesla ve elektrikli araç yedek parçaları için profesyonel e-ticaret altyapısı hazırlanıyor.
      </p>

      <div style={{marginTop:'40px',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'20px'}}>
        <div style={{background:'#1d1d1d',padding:'20px',borderRadius:'14px'}}>
          <h2>OEM Parça</h2>
          <p>OEM numarasına göre hızlı arama sistemi.</p>
        </div>

        <div style={{background:'#1d1d1d',padding:'20px',borderRadius:'14px'}}>
          <h2>Tesla Uyumlu</h2>
          <p>Model Y, Model 3, Model S ve Model X parçaları.</p>
        </div>

        <div style={{background:'#1d1d1d',padding:'20px',borderRadius:'14px'}}>
          <h2>Bot Entegrasyonu</h2>
          <p>Himpeks ve diğer tedarikçilerden otomatik ürün aktarımı.</p>
        </div>
      </div>
    </main>
  )
}
