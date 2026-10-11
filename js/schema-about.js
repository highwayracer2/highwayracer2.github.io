(function () {
  const schemaData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://highwayracer2.github.io/#organization",
        "name": "Highway Racer 2 Portal",
        "url": "https://highwayracer2.github.io",
        "logo": "https://highwayracer2.github.io/images/highway-racer-2.png",
        "description": "Premier browser gaming platform specializing in instant-play, high-performance 60 FPS HTML5 racing and arcade games.",
        "foundingDate": "2024",
        "contactPoint": {
          "@type": "ContactPoint",
          "contactType": "customer support",
          "email": "contact@highwayracer2.github.io",
          "url": "https://highwayracer2.github.io/contact.html"
        },
        "publishingPrinciples": "https://highwayracer2.github.io/about.html#editorial-standards"
      },
      {
        "@type": "AboutPage",
        "@id": "https://highwayracer2.github.io/about.html#webpage",
        "url": "https://highwayracer2.github.io/about.html",
        "name": "About Us & Editorial Standards - Highway Racer 2",
        "description": "Editorial standards, game curation criteria, security protocols, and team background of Highway Racer 2.",
        "isPartOf": {
          "@type": "WebSite",
          "@id": "https://highwayracer2.github.io/#website",
          "url": "https://highwayracer2.github.io",
          "name": "Highway Racer 2"
        }
      }
    ]
  };

  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.text = JSON.stringify(schemaData);
  document.head.appendChild(script);
})();
