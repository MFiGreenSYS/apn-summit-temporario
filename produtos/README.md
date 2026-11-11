# Telas internas de produto

Pasta reservada para as **5 telas internas** que abrem ao clicar nos botões de
categoria da landing (Energia, Telecom, Seguros, Pay, Expansão).

## Convenção sugerida

- Um arquivo por produto: `energia.html`, `telecom.html`, `seguros.html`, `pay.html`, `expansao.html`
- Cada página começa reusando a fundação compartilhada:

```html
<link rel="stylesheet" href="../css/tokens.css">
```

- Assets a partir daqui usam o prefixo `../assets/...`
  (ex.: `<img src="../assets/img/eco-energia.jpg">`)
- Classes utilitárias já disponíveis em `tokens.css`: `.t-kicker`, `.t-title`, `.t-sub`
  (mantêm a tipografia idêntica à da landing).

## Ligação com a landing

Na landing (`../index.html`), os botões de categoria devem apontar para estas
páginas, por ex.: `href="produtos/energia.html"`.
