# Auditoria de Segurança — 2026-08-25

Landing estática GranShow[AP] (apresentação iGreen para evento), sem
backend, deploy automático via Netlify a cada push na `main`. Autor: Dario
C Oliveira.

## Corrigido nesta auditoria

### Alto — provável exposição de `/.git/*` no site publicado

`netlify.toml` publica a raiz do repositório inteira (`publish = "."`) e
já bloqueia `/.claude/*`, `/.github/*`, `/.githooks/*` com o comentário
explícito "o repositório é privado, mas o SITE é público" — mas não havia
regra equivalente para `/.git/*`. Como o clone que o Netlify publica
inclui `.git/` na raiz, isso deixava o histórico completo do repositório
(64 commits, mensagens internas, arquivos já deletados mas presentes nos
objetos git) potencialmente acessível via `/.git/HEAD`, `/.git/config`,
`/.git/objects/...`.

**Não foi possível confirmar ao vivo** (sem domínio customizado
configurado no `netlify.toml` — o site roda em subdomínio gerado pelo
Netlify, não documentado neste repo). Corrigido de forma defensiva mesmo
assim — é puramente aditivo, sem risco de quebrar nada: adicionado o mesmo
redirect 404 já usado para os outros três diretórios-ponto, cobrindo
`/.git/*`.

### Médio — headers HSTS e Permissions-Policy ausentes

`netlify.toml` já definia `X-Content-Type-Options`, `Referrer-Policy`,
`X-Frame-Options`, mas não `Strict-Transport-Security` nem
`Permissions-Policy`. Adicionados os dois (o site não usa nenhuma API de
câmera/microfone/geolocalização, então a política restritiva não custa
funcionalidade nenhuma).

## Pendências antes de fechar (não corrigidas, decisão de arquitetura/infra)

- 🟠 **Alto — deploy automático via SSH root+senha em todo push na `main`**
  (`.github/workflows/deploy-prod.yml:24-36`): a Action já está pinada por
  SHA (correto), mas a autenticação é `root`+senha (`secrets.SSH_FRONTENDS_PASSWORD`)
  contra `162.141.111.97`, sem gate manual. O próprio comentário do
  arquivo já reconhece isso e adia pra uma "migração de SSH da frota" —
  decisão de infra compartilhada, fora do escopo deste repo isolado.
- 🟠 **Alto — README desatualizado**: `README.md:5` afirma que o
  `deploy-prod.yml` "foi removido" porque deployaria a apresentação por
  cima do site institucional, mas o arquivo existe no `HEAD` atual e foi
  **adicionado depois** da afirmação (workflow de 14/08, README de 10/08).
  Recomendo confirmar com o dono se o path `ui-apn-royal/prod/deploy.sh`
  é de fato isolado do site institucional (parece ser, porta dedicada
  6219) e atualizar o README pra refletir a realidade — não é código, é
  decisão/comunicação.

## O que foi verificado e está correto (sem achado)

- Ausência de CSP é decisão documentada e correta (CSS/JS inline
  extensivo em ~6000 linhas — uma CSP com `unsafe-inline` não protegeria
  de nada).
- Nenhum segredo/credencial real versionado, em nenhum dos 64 commits.
- Nenhum `innerHTML` com dado externo — todas as ~20 ocorrências usam HTML
  estático/template local, nunca dado de URL/query/fetch não controlado.
- `sessionStorage` usado só para estado de UI (posição de scroll/slide),
  nunca token.
- Sem fluxo de auth/backend — item prioritário desta auditoria
  (idconsultor/id/ref cru) não se aplica.
