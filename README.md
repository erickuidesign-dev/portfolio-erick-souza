# Site do portfólio: Erick Souza

Site estático em HTML, CSS e GSAP, em PT-BR (raiz), EN (`/en/`) e ES (`/es/`).
Construído sobre o design system Afterglow (tokens de cor, tipografia e motion), com layout, texto e imagens próprios.

## Como visualizar

Abra `index.html` no navegador, ou sirva a pasta:

```
python -m http.server 8765
```

## Como editar

O texto de todas as páginas vive em [`_build/content.py`](_build/content.py), nos dois idiomas. As estruturas PT e EN saem do mesmo gerador, então nunca divergem.

Depois de editar o texto ou o gerador, regenere os HTML:

```
python _build/build.py
```

Não edite os `.html` na mão: o próximo build sobrescreve.

**Tom da copy:** profissional e direto, em primeira pessoa quando é o Erick falando. Sem gírias, sem promessas que ele não possa provar e sem metáforas de eletricidade ("corrente", "energia", "acendeu"), que ficaram só no visual. Nos textos que descrevem etapas ou serviços, prefira frases nominais ("Definição da proposta de valor...") a verbos no imperativo. O espanhol usa o tratamento formal ("usted"). Títulos em maiúsculas com acento (como "CÓDIGO") aparecem inteiros: não reduza o espaço acima de `.line-mask` no `site.css`.

Estilo e movimento ficam em `assets/css/site.css` e `assets/js/`:

- `core.js`: em todas as páginas (cursor, medidor de scroll).
- `home.js`: só na home (ignição do hero, cenas com scroll fixado, nav).
- `motel-sign.js`: só na home. Efeito de letreiro de motel com defeito, usado pelo pré-loader, pelo letreiro vermelho do hero (`CONVERSA.`), pelos nomes da seção Projetos e pelas palavras de destaque de Sobre e Contato. Veja "Letreiro de motel" abaixo.
- `preloader.js`: só na home. Tela de abertura com o nome (veja "Pré-loader" abaixo).
- `hero-video.js`: só na home. Escolhe o arquivo de vídeo do hero (desktop ou celular) e toca só enquanto o hero está na tela. Veja "Vídeo do hero" abaixo.

## Estrutura

| Página | PT-BR | EN | ES |
|--------|-------|----|----|
| Home | `index.html` | `en/index.html` | `es/index.html` |
| Case DMR Info | `projetos/dmr-info/index.html` | `en/projects/dmr-info/index.html` | `es/proyectos/dmr-info/index.html` |
| Privacidade | `privacidade/index.html` | `en/privacy/index.html` | `es/privacidad/index.html` |
| 404 | `404.html` | `en/404.html` | `es/404.html` |

O seletor PT / EN / ES do cabeçalho leva sempre à página equivalente no outro idioma. Para acrescentar um idioma: crie o bloco no `content.py`, registre em `LANGS`, `CASE_SLUG`, `PAGES` e `LANG_LABELS` (`build.py`) e rode o build.

Todos os links são relativos, então o site também abre direto do disco.

## Comportamento

- **Desktop com motion:** cenas cinematográficas com scroll fixado (classe `cine` no `<html>`).
- **Leque de persianas (hero para Projetos):** o hero fica fixo por ~1,6 tela de scroll enquanto 12 barras descem em escada sobre ele. Com a tela toda fechada, as seções trocam de lugar sem aparecer, e só depois as barras sobem revelando Projetos. A posição das barras é calculada a partir do scroll (`paintBlinds` no `home.js`), então rolar para frente e para trás sempre cai no estado certo. Os atalhos do menu para Projetos pousam depois da abertura. A abertura ocupa ~1,7 tela de scroll, e as barras "perseguem" o scroll com um atraso, então até uma rolagem brusca fecha e abre de forma gradual. Ajustes no `home.js`, para deixar mais lento ou mais rápido: `heroHold` (scroll do fechamento), `PROJECTS_OPEN_UNITS` (scroll da abertura), `BLINDS_SETTLE_MS` (atraso das barras, em ms), `SLAT_STAGGER` e `SLAT_DURATION` (defasagem e duração de cada barra).
- **Celular e `prefers-reduced-motion`:** layout empilhado normal, sem cenas fixadas.
- **Sem JavaScript:** todo o conteúdo aparece.
- O hero acende sozinho, sem depender de clique: ~0,7 s depois do carregamento quando não há pré-loader, ou logo que o pré-loader fecha.

## Letreiro de motel

O mesmo efeito acende o nome no pré-loader, a palavra vermelha do hero, os nomes dos projetos e as palavras de destaque de Sobre (a última linha do título, "Agora na web.") e de Contato ("marca" e o "?"). O resto de cada título continua texto normal: só o destaque vira letreiro. Cada letra é um tubo (`.motel-ch`) que começa apagado, só com o contorno, e o `motel-sign.js` as acende em ordem aleatória: cada uma pisca, apaga, fica fraca e volta do seu jeito antes de firmar (padrões `motel-strike-a/b/c` no `site.css`). Duas letras são teimosas (`motel-strike-hard`, mais longo, com uma pausa apagada no meio) e duas continuam caindo de vez em quando (`motel-fault`); nas palavras de destaque, que têm poucas letras, é uma de cada. No hero o brilho segue as variáveis `--fault-core/mid/far`, que o scroll muda de vermelho para verde. Nos projetos e nos destaques o efeito é mais rápido (`PROJECT_SIGN` no `home.js`): no desktop o letreiro do projeto acende quando a agulha o escolhe, depois que as persianas abriram, e apaga quando ela passa para outro; o destaque de Sobre acende quando a cena fixada começa; o de Contato, quando aparece na tela. No celular cada um acende ao entrar na tela e apaga ao sair.

- **Onde ajustar:** as constantes `DEFAULTS` no topo do `motel-sign.js` (velocidade, quantas letras teimosas e cansadas); no `home.js`, `HERO_SIGN_DELAY_S` e `HERO_SIGN_GAP_MS` (hero), `PROJECT_SIGN` (projetos e destaques) e `HIGHLIGHT_LETTERS_PER_ODD_ONE` (quantas letras teimosas e cansadas nos destaques de Sobre e Contato); os padrões de falha nos `@keyframes motel-*`; as cores de cada estado (`--c-on`, `--s-on`, `--c-dim`, `--s-dim`, `--c-off`, `--s-off`) no `.fault-word` e no `.preloader`.
- **Movimento reduzido:** as letras acendem de uma vez, sem animação.

## Pré-loader

Tela cheia com **ERICK SOUZA** no meio, em tamanho discreto, só na home (PT, EN e ES). O nome acende como um letreiro de motel velho: as letras entram aos poucos, em ordem aleatória, e cada uma falha do seu jeito antes de firmar (pisca, apaga, fica fraca, volta). Duas são teimosas e demoram mais, com uma pausa apagada no meio, e duas continuam caindo de vez em quando depois que o nome está aceso. Embaixo há o contador 000 a 100 e a barra. Quando o letreiro assenta e a página carregou, o nome dá um clarão, a cortina sobe e o hero acende por trás dela. Dura ~2 s no mínimo e nunca passa de 3,8 s, mesmo que algo demore.

- **Quando aparece:** primeira visita e recarregar a página. **Não aparece** ao navegar dentro do site (trocar de idioma, voltar de um case), porque o navegador informa que a origem é o próprio site.
- **Movimento reduzido:** vira uma tela estática de ~0,7 s, sem animação.
- **Sem JavaScript, ou se o script falhar:** nunca prende o site. A tela só existe quando o script do `<head>` liga a classe `is-loading` no `<html>`, e esse mesmo script tem um cronômetro de segurança de 6 s que desliga tudo.
- **Onde ajustar:** `preloader.js` (no topo: `MIN_MS` tempo mínimo, `MAX_MS` limite, e o bloco do letreiro com `FIRST_LETTER_MS`, `LETTER_GAP_MS`, `STRIKE_MS`, `STUBBORN_STRIKE_MS`, `STUBBORN_COUNT` e `TIRED_COUNT`), o bloco "Pre-loader" do `site.css` (tamanho do nome em `.pre-name`, cores do neon em `--pre-neon` e `--c-on`/`--c-dim`/`--c-off`, e os padrões de falha nos `@keyframes pre-strike-a/b/c/hard` e `pre-fault`) e, no `home.js`, `LOADER_DONE_IGNITE_DELAY` (intervalo entre o pré-loader fechar e o hero acender). O texto "CARREGANDO" / "LOADING" / "CARGANDO" está em `loader` no `content.py`; o nome e a linha de disciplinas reaproveitam `brand` e `studio`.
- **Custo de desempenho:** o pré-loader empurra o hero para depois dele. Medido localmente, sem limitação de rede, o LCP ficou em ~4,4 s com o loader de ~2 s (era ~3,7 s com a versão de 1,3 s; o hero já passava de 2,5 s por causa do brilho neon animado). Quanto mais tempo o letreiro leva para assentar, mais o hero demora: para ganhar tempo, reduza `STRIKE_MS`, `STUBBORN_STRIKE_MS` e `LETTER_GAP_MS`. Para desligar, tire `loader=True` da chamada de `page()` na `home_page` do `build.py` e rode o build.

## Botões

Todos com cantos de 6 px. Dois tipos, definidos no bloco "Buttons" do `site.css`:

- **Vermelho (`btn btn-red`):** botão principal, em vermelho Ferrari com acabamento de lataria: reflexo claro em cima, corpo mais escuro embaixo com uma linha de horizonte no meio, borda de verniz e brilho vermelho em volta. No hover (e no foco por teclado) passa um raio de luz por cima, o brilho cresce e o botão escurece ao ser pressionado. Usado em: "Agendar conversa" do cabeçalho e do hero, botão do contato, enviar do formulário, CTA do case e botões das páginas de privacidade e 404. O do cabeçalho tem a variante pequena `btn-sm`.
- **Ghost (`btn btn-ghost`):** botão secundário, só a linha (borda clara, fundo transparente). No hover a linha fica vermelha com um brilho suave. Usado em "Ver projetos" no hero e "Voltar aos projetos" no case.
- Todos os botões fazem a mesma coisa no hover, igual ao "Agendar conversa" do cabeçalho: ficam parados, um raio de luz atravessa, o brilho cresce e escurece ao clicar. Não há mais efeito magnético (botão seguindo o mouse). Os links de texto ("Ver case", "Visitar o site") continuam como `text-link`, e o menu de navegação do cabeçalho continua arredondado (é um contêiner, não um botão).
- Para trocar o raio, mude o `6px` da regra `.btn`.

## Vídeo do hero

O fundo do hero é um vídeo em loop, mudo, atrás do texto. O original (`assets/video/video_hero.mp4`, 1080p, 2 min, 51,7 MB) é pesado demais para a web, então o site usa duas versões geradas dele:

| Arquivo | Uso | Tamanho |
|---------|-----|---------|
| `assets/video/hero-desktop.mp4` | telas acima de 780 px, 1920x1080 | ~9 MB |
| `assets/video/hero-mobile.mp4` | celular, recorte vertical central 540x960 | ~4,4 MB |
| `assets/video/hero-poster.webp` | primeiro quadro; aparece antes do vídeo e quando ele não toca | 46 KB |

- **Quando não toca:** com `prefers-reduced-motion`, com o modo de economia de dados do navegador e sem JavaScript, fica só o pôster (imagem estática) e nenhum byte de vídeo é baixado.
- **Pausa sozinho** quando o hero sai da tela ou a aba fica em segundo plano.
- **Legibilidade:** um degradê escuro por cima (`.power-video::after` no `site.css`) segura o texto sobre as passagens mais claras. Ajuste ali a força.
- **Trocar o vídeo:** gere de novo as duas versões e o pôster (H.264, sem áudio, `+faststart`; o pôster deve ser o primeiro quadro para não haver salto) e mantenha os nomes. As versões atuais foram feitas com ffmpeg: desktop `-vf scale=1920:1080 -crf 35`, celular `-vf crop=608:1080:656:0,scale=540:960 -crf 33`, ambos com `-preset slow -x264-params aq-mode=3`.
- **Não publique a pasta `assets/video` inteira:** além dos arquivos acima ela guarda o original e outros três vídeos de origem (~110 MB no total). Publique só os três arquivos do hero.

## Cards de vidro

Todos os cards são painéis de vidro fosco (glassmorphism) com o mesmo canto dos botões: 6 px, guardado em `--radius` no topo do `site.css`. Se mudar o `--radius`, botões e cards mudam juntos.

- **Onde:** cards de projeto (Projetos), cards de Serviços, formulário e tiles de canais (Contato), grupos de Ferramentas e, na página do case, as fichas (segmento, entrega, serviços, no ar) e os cards de métricas. As molduras das capturas de tela também têm o canto de 6 px.
- **Receita escura** (`--glass-dark`, na regra "Glass cards"): película branca bem leve, borda clara, brilho na aresta de cima e desfoque de 18 px (`--glass-blur`). **Receita clara** (`--glass-light`): usada só nos cards de Serviços, que ficam sobre fundo claro; o fio vermelho passa desfocado por trás deles.
- **Por que há discos vermelhos no fundo:** desfoque sobre fundo liso não aparece. Cada seção escura com cards tem 1 a 3 discos vermelhos de borda nítida desenhados no próprio `background` (camadas `radial-gradient(circle …px at x% y%, …)`): fora do card o disco aparece definido, atrás do vidro aparece desfocado. Para tirar, apague essas camadas; para mudar posição, tamanho ou força, edite os números. Cuidado com rótulos vermelhos: não deixe um disco passar atrás deles.
- **Projetos:** cada letreiro ganhou um painel. No desktop o painel acompanha o trilho; no celular os cards empilham com espaço entre eles. O nome do projeto usa palavras inteiras (não quebra no meio) e a fonte mínima no celular é menor para caber.
- **Sem desfoque:** navegadores sem `backdrop-filter`, ou quem pede menos transparência no sistema (`prefers-reduced-transparency`), veem os painéis quase sólidos (as variáveis `--glass-*` mudam no topo do arquivo). Isso não foi testado em um sistema com essa opção ligada.

## Cor e letreiros

- **Vermelho de destaque:** vermelho Ferrari `#ff2800`, na variável `--red` do `site.css`. Sobre fundo claro usa-se `--red-ink` (`#c80000`), um vermelho mais escuro que passa no contraste. O site inteiro usa só vermelho como cor de destaque (detalhes, rótulos, medidor, cursor e brilhos); não há mais ciano nem violeta, exceto nas cores próprias dos letreiros de projeto (veja abaixo). O vídeo do hero traz o próprio vermelho.
- **Seção Projetos:** os nomes ficam na fonte principal do site (Anybody). O que muda é a luz: cada nome é um letreiro de tubos de neon, com núcleo quase branco, halo vermelho e uma névoa de luz na parede atrás. Todos os letreiros são vermelhos, com a mesma paleta (`--sign-core`, `--sign-halo`, `--sign-tint` e `--sign-wash` no `.sign-card`); cada um só tem um tempo próprio de "queda de tensão" (`--bz`). O fundo da seção é um preto quente (`#0a0708`). O brilho fica em `--lit`, na regra `.sign-name`.
- **Piscar:** ao acender, cada letra falha do seu jeito antes de firmar (padrões `motel-strike-*`), duas ficam cansadas e continuam caindo (`motel-fault`), e o letreiro inteiro ainda dá quedas de tensão de vez em quando (`sign-buzz`). Ajuste os padrões no `site.css` e o tempo em `PROJECT_SIGN` no `home.js`.
- **Pontos de luz (Projetos):** o fundo da seção tem seis pontos de luz vermelhos, bem desfocados, que flutuam devagar atrás dos letreiros (`.light-field` no `site.css`, criados no `s_projects` do `build.py`). O desfoque vem do próprio degradê, então quase não pesam. Cada ponto tem posição, tamanho, brilho, trajeto e ritmo próprios nas variáveis `--x`, `--y`, `--size`, `--peak`, `--dx`, `--dy`, `--dur` e `--delay` (uma linha `nth-child` por ponto). Com movimento reduzido ficam parados.
- **Cabeçalho:** o conteúdo que rola por baixo dele some com um degradê (`.site-head::before`), em escuro ou em claro conforme a seção.
- **Banner do case DMR:** clicar nele abre `www.dmrinfo.com.br` em outra aba. O link "VER CASE" continua levando à página do case.

## Formulário de leads

Fica na seção de contato da home (PT, EN e ES). Campos: nome, e-mail, WhatsApp (opcional), tipo de projeto, mensagem e consentimento LGPD, mais um campo anti-spam invisível (honeypot). Validação com mensagens ao lado de cada campo, estado de envio, sucesso e erro. Sem JavaScript ele ainda funciona como formulário comum.

**O site é estático e não tem servidor.** O formulário envia os dados para um serviço de formulários, que guarda os leads e avisa você por e-mail. Até você conectar um, ele avisa que não está conectado, em vez de fingir que enviou.

**Como conectar** (2 minutos):

1. Crie uma conta em um serviço de formulários e crie um formulário novo. Os que aceitam esse tipo de envio: Formspree, Getform, Basin e Web3Forms.
2. Copie o endereço de envio que ele dá (algo como `https://formspree.io/f/xxxxxxxx`).
3. No `_build/content.py`, coloque esse endereço em `LEADS_ENDPOINT`. Se o serviço pedir uma chave (o Web3Forms pede), coloque em `LEADS_FIELDS`, por exemplo `{"access_key": "SUA_CHAVE"}`.
4. Rode `python _build/build.py` e publique.

Cada lead chega com: `name`, `email`, `phone`, `project_type`, `message`, `consent`, `lang` (idioma da página) e `page` (endereço de onde veio). Os textos do formulário, nos 3 idiomas, estão em `contact.form` no `content.py`.

**Proteção:** o honeypot descarta a maioria dos robôs sem enviar nada. Limite de envios, validação no servidor e o e-mail de aviso ficam a cargo do serviço escolhido; ative o anti-spam dele. Não há sessão nem cookie, então não há CSRF a proteger.

**LGPD:** o formulário só envia com o consentimento marcado e liga à página de privacidade. O texto dessa página ainda é um rascunho e precisa de revisão jurídica antes de publicar (veja abaixo). O serviço de formulários passa a ser um operador dos dados; confira a política dele.

## O que falta preencher

Tudo que ainda não existe está marcado no site com `[PREENCHER]` (PT) ou `[FILL IN]` (EN), e nada foi inventado:

- Contatos: e-mail, WhatsApp, link de agendamento, LinkedIn, GitHub, Behance, Dribbble e Instagram (hoje `href="#!"`).
- Destino do formulário de leads: `LEADS_ENDPOINT` no `content.py` (passo a passo na seção acima).
- Retrato e foto de processo na seção Sobre.
- Cases 2, 3 e 4 (conceituais), com prints.
- Prazo típico de uma landing page.
- Resultado comercial do case DMR.
- Texto da política de privacidade, revisado por profissional jurídico.
- Domínio: sem ele, faltam `canonical`, `hreflang`, `sitemap.xml` e `robots.txt`.

Depoimentos ficam fora do site até existir pelo menos um real.

## Antes de publicar

- Confirme com a DMR que você pode publicar o case e usar o nome.
- Corrija o link do Facebook do site da DMR (aponta para `#`).
- As fontes vêm do Google Fonts. Para produção, considere hospedá-las junto ao site.
- As medições do case (SEO 100, acessibilidade 98, boas práticas 96, LCP 1,33 s, CLS 0,00) são de laboratório, de 2026-09-20. Meça de novo se o site da DMR mudar.
