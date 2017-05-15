use Rack::Static,
  :urls => ["/img", "/js", "/css", "/fonts", "/audio", "/press.html", "/team.html", "/demo.html", "/intro.html", "/mobile.html", "/grz.min.js", "/index.html", "/faq.html", "/evg-wallet.html",  "/demo/evergreen-chrome.crx", "/favicon.ico" ]

run lambda { |env|
  [
    200,
    {
      'Content-Type'  => 'text/html',
      'Cache-Control' => 'public, max-age=86400'
    },
    File.open('/mobile.html', File::RDONLY)
  ]
}
