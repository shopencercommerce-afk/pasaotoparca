import { useState } from 'react'
import brands from '../data/brands'
import products from '../data/products.json'

const wpUrl = 'https://wa.me/905077302703?text=Merhaba%2C%20urun%20siparisi%20vermek%20istiyorum.'

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9-]+/g, '')
}

function productsUrl(brand, model) {
  const query = model ? `?brand=${brand}&model=${slugify(model)}` : `?brand=${brand}`
  return `/products/${query}`
}

function productCode(product) {
  return product.sku || product.refNo || product.internalCode || `urun-${product.id || product.no}`
}

function productSlug(product) {
  return `${slugify(productCode(product))}-${product.id || product.no || slugify(product.title)}`
}

function cleanImagePath(image) {
  if (!image) return '/logo-new.svg'
  const normalized = String(image).replace(/\\/g, '/')
  if (normalized.startsWith('/')) return normalized
  return '/' + normalized.replace(/^images\//, 'images/')
}

function parsePrice(priceText) {
  if (!priceText) return 0
  return Number(String(priceText).replace(/₺/g, '').replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0
}

function formatPrice(value) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(value)
}

function salePrice(product) {
  if (product.price) return formatPrice(Number(product.price))
  const cost = parsePrice(product.price3 || product.price2 || product.price1)
  if (!cost) return 'Fiyat sorunuz'
  if (cost <= 1000) return formatPrice(cost * 2)
  if (cost <= 10000) return formatPrice(cost * 1.5)
  return formatPrice(cost * 1.25)
}

const featuredProducts = products.filter(p => p.image && p.title).slice(0, 8)
const popularBrands = brands.slice(0, 6)

const trustItems = [
  ['Parça Kodu ile Teyit', 'Yanlış ürün riskini azaltmak için ürün kodu ile kontrol.'],
  ['WhatsApp Destek', 'Sipariş öncesi hızlı uyumluluk ve stok bilgisi.'],
  ['Yeni Nesil Araçlar', 'Tesla, BYD, Togg, MG, Chery ve Skywell odaklı katalog.'],
  ['Kargo Bilgilendirme', 'Sipariş sonrası teslimat süreci WhatsApp üzerinden takip.']
]

export default function Home() {
  const [search, setSearch] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    const value = search.trim()
    if (!value) return
    window.location.href = `/products/?q=${encodeURIComponent(value)}`
  }

  return (
    <main className="page">
      <div className="topNotice">
        <span>Elektrikli ve yeni nesil araç yedek parçalarında hızlı teklif</span>
        <a href={wpUrl}>WhatsApp destek: 0507 730 27 03</a>
      </div>

      <header className="header">
        <a href="/" className="logoWrap"><img src="/logo-new.svg" alt="Paşa Oto Parça" /></a>

        <form className="searchBox" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Ürün adı, parça kodu veya araç modeli ara"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">⌕</button>
        </form>

        <div className="userLinks">
          <a href="/account">Hesabım</a>
          <a href="/cart/">Sepetim</a>
        </div>
      </header>

      <nav className="navBar">
        <a href="/products/" className="allCat">☰ Tüm Kategoriler</a>
        <a href="/products/">Katalog</a>
        {popularBrands.map(brand => <a key={brand.slug} href={productsUrl(brand.slug)}>{brand.name}</a>)}
        <a href={wpUrl}>İletişim</a>
      </nav>
    </main>
  )
}
