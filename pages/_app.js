export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <style jsx global>{`
        @media(max-width:980px){
          body .topActions{
            display:grid !important;
            grid-template-columns:repeat(3,1fr) !important;
            gap:8px !important;
            width:100% !important;
          }
          body .topActions button{
            width:100% !important;
            height:46px !important;
            min-height:46px !important;
            padding:0 6px !important;
            border-radius:16px !important;
            font-size:14px !important;
            line-height:1 !important;
            white-space:nowrap !important;
          }
          body .topbar{
            gap:10px !important;
            margin-bottom:10px !important;
          }
          body .topbar h1{
            font-size:34px !important;
          }
          body .topbar p{
            margin:6px 0 0 !important;
          }
        }
        @media(max-width:430px){
          body .topActions button{
            font-size:13px !important;
            border-radius:15px !important;
          }
        }
      `}</style>
    </>
  )
}
