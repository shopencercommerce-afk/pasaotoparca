import brands from '../data/brands'

export default function Home() {
  return (
    <main style={{
      fontFamily: 'Arial',
      background: '#0b0b0b',
      color: '#fff',
      minHeight: '100vh'
    }}>

      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 40px',
        borderBottom: '1px solid #222'
      }}>
        <h1 style={{ margin: 0 }}>Paşa Oto Parça</h1>

        <nav style={{ display: 'flex', gap: '20px' }}>
          <span>Tesla</span>
          <span>BYD</span>
          <span>Togg</span>
          <span>MG</span>
          <span>Chery</span>
        </nav>
      </header>

      <section style={{
        padding: '100px 40px',
        textAlign: 'center',
        background: 'linear-gradient(to bottom,#111,#000)'
      }}>

        <h2 style={{
          fontSize: '64px',
          marginBottom: '20px'
        }}>
          Elektrikli Araç
          <br />
          Yedek Parça Platformu
        </h2>

        <p style={{
          maxWidth: '900px',
          margin: '0 auto',
          color: '#aaa',
          fontSize: '20px',
          lineHeight: 1.6
        }}>
          Tesla, BYD, Togg, MG, Chery ve Skywell araçları için profesyonel OEM ve yan sanayi yedek parça altyapısı.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginTop: '40px'
        }}>
          <button style={{
            background: '#fff',
            color: '#000',
            border: 0,
            padding: '16px 32px',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Ürünleri İncele
          </button>

          <button style={{
            background: '#1f1f1f',
            color: '#fff',
            border: '1px solid #333',
            padding: '16px 32px',
            borderRadius: '12px',
            cursor: 'pointer'
          }}>
            WhatsApp Sipariş
          </button>
        </div>
      </section>

      <section style={{ padding: '60px 40px' }}>
        <h2 style={{ fontSize: '38px', marginBottom: '30px' }}>
          Markalar
        </h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))',
          gap: '24px'
        }}>

          {brands.map((brand) => (
            <div
              key={brand.slug}
              style={{
                background: '#151515',
                border: '1px solid #222',
                borderRadius: '20px',
                padding: '28px'
              }}
            >
              <h3 style={{ fontSize: '30px', marginBottom: '20px' }}>
                {brand.name}
              </h3>

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                {brand.models.map((model) => (
                  <span
                    key={model}
                    style={{
                      background: '#202020',
                      padding: '10px 14px',
                      borderRadius: '999px',
                      fontSize: '14px'
                    }}
                  >
                    {model}
                  </span>
                ))}
              </div>
            </div>
          ))}

        </div>
      </section>

      <section style={{
        padding: '80px 40px',
        borderTop: '1px solid #222'
      }}>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
          gap: '24px'
        }}>

          <div style={{ background:'#151515',padding:'24px',borderRadius:'20px' }}>
            <h3>OEM Arama</h3>
            <p style={{color:'#aaa'}}>OEM numarasına göre hızlı ürün bulma sistemi.</p>
          </div>

          <div style={{ background:'#151515',padding:'24px',borderRadius:'20px' }}>
            <h3>JSON Import</h3>
            <p style={{color:'#aaa'}}>Tedarikçilerden toplu ürün aktarımı altyapısı.</p>
          </div>

          <div style={{ background:'#151515',padding:'24px',borderRadius:'20px' }}>
            <h3>WhatsApp Sipariş</h3>
            <p style={{color:'#aaa'}}>Sepetten direkt WhatsApp sipariş yönlendirmesi.</p>
          </div>

        </div>
      </section>

    </main>
  )
}
