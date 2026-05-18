import SiteLayout from '../components/SiteLayout'

export default function AboutPage() {
  return (
    <SiteLayout>
      <section style={{maxWidth:'1100px',margin:'0 auto',padding:'60px 20px'}}>
        <span style={{color:'#f32334',fontWeight:900,letterSpacing:'1.5px',fontSize:'12px'}}>PAŞA OTO PARÇA</span>
        <h1 style={{fontSize:'56px',lineHeight:'1',margin:'16px 0'}}>Konya merkezli yeni nesil oto yedek parça tedarikçisi</h1>
        <p style={{fontSize:'18px',lineHeight:'1.8',color:'#5f6672',maxWidth:'850px'}}>Paşa Oto Parça, Konya Selçuklu Zafer Sanayi bölgesinde faaliyet gösteren; sıfır ve çıkma oto yedek parça satışı yapan bir firmadır. Özellikle Tesla, BYD, Togg, MG, Chery ve diğer yeni nesil elektrikli araç parçalarına ağırlık verir.</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'16px',marginTop:'40px'}}>
          <div style={{background:'#fff',padding:'24px',borderRadius:'24px',border:'1px solid #e8eaf0'}}><strong>Türkiye Geneli Kargo</strong><p>Ürünler güvenli paketleme ile Türkiye geneline gönderilir.</p></div>
          <div style={{background:'#fff',padding:'24px',borderRadius:'24px',border:'1px solid #e8eaf0'}}><strong>Kargo Takip Numarası</strong><p>Kargoya verilen siparişlerde takip numarası paylaşılır.</p></div>
          <div style={{background:'#fff',padding:'24px',borderRadius:'24px',border:'1px solid #e8eaf0'}}><strong>İade Desteği</strong><p>Uygun ürünlerde iade ve değişim desteği sağlanır.</p></div>
          <div style={{background:'#fff',padding:'24px',borderRadius:'24px',border:'1px solid #e8eaf0'}}><strong>WhatsApp Destek</strong><p>Parça uyumluluğu ve stok bilgisi hızlıca teyit edilir.</p></div>
        </div>
      </section>
    </SiteLayout>
  )
}
