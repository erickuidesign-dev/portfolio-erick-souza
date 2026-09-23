"""Static site generator. Reads content.py and writes every page into the site root.

Run from anywhere:  python _build/build.py
Pages: home, DMR case, privacy and 404, each in PT-BR (root) and EN (/en/).
All URLs are relative so the site also opens from file:// while developing.
"""
import re
from html import escape as esc
from pathlib import Path

from content import CASE_SLUG, DMR_URL, LANGS, LEADS_ENDPOINT, LEADS_FIELDS

SITE = Path(__file__).resolve().parent.parent

PAGES = {
    "home": {"pt": "index.html", "en": "en/index.html", "es": "es/index.html"},
    "case": {"pt": "projetos/dmr-info/index.html", "en": "en/projects/dmr-info/index.html", "es": "es/proyectos/dmr-info/index.html"},
    "privacy": {"pt": "privacidade/index.html", "en": "en/privacy/index.html", "es": "es/privacidad/index.html"},
    "notfound": {"pt": "404.html", "en": "en/404.html", "es": "es/404.html"},
}
LANG_LABELS = {"pt": ("PT", "pt-BR"), "en": ("EN", "en"), "es": ("ES", "es")}

FONTS = (
    "https://fonts.googleapis.com/css2?family=Anybody:wdth,wght@50..150,100..900"
    "&amp;family=Manrope:wght@300;400;500;700&amp;family=Space+Mono:wght@400;700&amp;display=swap"
)
BOOT_PLAIN = "<script>document.documentElement.classList.add('js');</script>"
BOOT_CINE = (
    "<script>(function(){var d=document.documentElement;d.classList.add('js');"
    "var m=matchMedia('(min-width:781px) and (prefers-reduced-motion:no-preference)');"
    "if(m.matches)d.classList.add('cine');"
    "m.addEventListener('change',function(){location.reload()});})();</script>"
)
# Fresh visits and reloads see the pre-loader; moving inside the site (language switch, back from a case) does not.
# The timer is a failsafe: if preloader.js never runs, the page still opens.
BOOT_LOADER = (
    "<script>(function(){var d=document.documentElement;try{"
    "var n=performance.getEntriesByType('navigation')[0];"
    "if(n&&n.type!=='reload'&&document.referrer&&new URL(document.referrer).origin===location.origin)return;"
    "}catch(e){}"
    "d.classList.add('is-loading');setTimeout(function(){d.classList.remove('is-loading')},6000);})();</script>"
)

def root_of(kind, code):
    return "../" * PAGES[kind][code].count("/")


def href(root, kind, code):
    return root + PAGES[kind][code]


def head(t, root, title, description, cine, loader=False):
    return f"""<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1" name="viewport"/>
<title>{esc(title)}</title>
<meta content="{esc(description)}" name="description"/>
<meta content="#121115" name="theme-color"/>
<link href="data:," rel="icon"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="{FONTS}" rel="stylesheet"/>
<link href="{root}assets/css/site.css" rel="stylesheet"/>
{BOOT_CINE if cine else BOOT_PLAIN}
{BOOT_LOADER if loader else ""}
</head>"""


def header(t, kind, root):
    code = t["code"]
    other = "en" if code == "pt" else "pt"
    is_home = kind == "home"
    home = href(root, "home", code)
    anchor = (lambda i: f"#{i}") if is_home else (lambda i: f"{home}#{i}")
    marker = " data-nav-link" if is_home else ""
    nav = "\n".join(f'<a{marker} href="{anchor(i)}">{esc(label)}</a>' for i, label in t["nav"])
    lang_html = '<span aria-hidden="true">/</span>'.join(
        f'<a aria-current="{"true" if code == c else "false"}" hreflang="{tag}" href="{href(root, kind, c)}" lang="{tag}">{label}</a>'
        for c, (label, tag) in LANG_LABELS.items()
    )
    return f"""<header class="site-head">
<a class="head-mark" href="{home}">{esc(t["brand"])}</a>
<span class="head-studio mono"><b>{esc(t["studio"][0])}</b><i>/</i><span>{esc(t["studio"][1])}</span></span>
<div class="head-actions">
<div aria-label="{esc(t["lang_group_label"])}" class="head-lang mono" role="group">{lang_html}</div>
<a class="btn btn-red btn-sm mono" href="{anchor("contato")}">{esc(t["cta_head"])}</a>
</div>
<nav aria-label="{esc(t["nav_label"])}" class="head-nav mono">
{nav}
</nav>
</header>"""


def chrome(t, blinds=False):
    slats = ""
    if blinds:
        blinds_title = f'<h2 class="blinds-title display">{title_lines(t["services"]["title"])}</h2>'
        slats = '<div aria-hidden="true" class="scene-blinds">' + "<i></i>" * 12 + blinds_title + "</div>\n"
    return (
        f'<div aria-hidden="true" class="circuit-meter"><span class="mono">{esc(t["meter"])}</span>'
        '<span class="meter-track"><i class="meter-fill"></i></span><span class="meter-count mono">00</span></div>\n'
        f"{slats}"
        '<div aria-hidden="true" class="cursor-dot"></div><div aria-hidden="true" class="cursor-ring"></div>'
    )


def preloader(t, root):
    def word_html(word):
        letters = "".join(f'<span class="motel-ch">{esc(ch)}</span>' for ch in word)
        return f'<span class="pre-word">{letters}</span>'

    words = "".join(word_html(word) for word in t["brand"].split())
    lines = [
        f'<div aria-hidden="true" class="preloader" data-name="{esc(t["brand"])}" id="preloader">',
        '<div class="pre-glow"></div>',
        '<div class="pre-center">',
        f'<p class="pre-name display">{words}</p>',
        f'<p class="pre-role mono"><b>{esc(t["studio"][0])}</b><i>/</i><span>{esc(t["studio"][1])}</span></p>',
        "</div>",
        f'<div class="pre-foot mono"><span>{esc(t["loader"]["status"])}</span>'
        '<span class="pre-bar"><i></i></span><span class="pre-count">000</span></div>',
        "</div>",
        f'<script src="{root}assets/js/preloader.js"></script>',
    ]
    return "\n".join(lines) + "\n"


def scripts(root, home=False):
    base = (
        f'<script src="{root}assets/vendor/gsap.js"></script>\n'
        f'<script src="{root}assets/vendor/ScrollTrigger.js"></script>\n'
    )
    if home:
        base += f'<script src="{root}assets/vendor/SplitText.js"></script>\n'
    base += f'<script src="{root}assets/js/core.js"></script>\n'
    if home:
        base += f'<script src="{root}assets/js/hero-video.js"></script>\n'
        base += f'<script src="{root}assets/js/form.js"></script>\n'
        base += f'<script src="{root}assets/js/home.js"></script>\n'
    return base


def motel_text(text):
    """Text as motel-sign tubes: one .motel-ch per letter, each word kept whole so a line never breaks inside it."""
    parts = []
    for token in re.split(r"( )", text):
        if token == " ":
            parts.append(" ")
        elif token:
            letters = "".join(f'<span class="motel-ch">{esc(ch)}</span>' for ch in token)
            parts.append(f'<span class="motel-word">{letters}</span>')
    return "".join(parts)


def title_lines(lines, sign=False):
    """Heading lines; the last one is the highlight. With sign=True that highlight becomes a motel sign."""
    parts = []
    for index, line in enumerate(lines):
        is_last = index == len(lines) - 1
        lit = sign and is_last
        classes = "line-mask accent neon-accent" if lit else "line-mask accent" if is_last else "line-mask"
        text = motel_text(line) if lit else esc(line)
        parts.append(f'<span class="{classes}"><span>{text}</span></span>')
    return " ".join(parts)


def footer_row(t, root):
    f = t["footer"]
    return (
        f'<div class="footer-row mono"><span>{esc(f["where"])}</span>'
        f'<a href="{href(root, "privacy", t["code"])}">{esc(f["privacy"])}</a>'
        f'<span>{esc(f["jobs"])}</span><span>{esc(f["year"])}</span></div>'
    )


def channel_list(t):
    c = t["contact"]
    items = "\n".join(
        f'<li><a href="#!"><span class="mono">{esc(name)}</span><span class="mono todo">{esc(value)}</span></a></li>'
        for name, value in c["channels"]
    )
    return f'<ul aria-label="{esc(c["channels_label"])}" class="channels">\n{items}\n</ul>'


# ---------------------------------------------------------------- home sections
def s_hero(t, root):
    h = t["hero"]
    lines = "\n".join(
        f'<span class="power-line power-line-{c}">{esc(text)}</span>' for c, text in zip("abc", h["lines"])
    )
    fault_letters = "".join(f'<span class="motel-ch">{esc(ch)}</span>' for ch in h["fault"])
    last = (
        f'<span class="power-line power-line-d">{esc(h["last_lead"])}'
        f'<span class="accent fault-word">{fault_letters}</span></span>'
    )
    readouts = "".join(f"<span>{esc(r)}</span>" for r in h["readouts"])
    return f"""<section class="power-on is-awaiting-power" data-call-on="{esc(h["call_on"])}" id="power">
<div aria-hidden="true" class="power-video">
<video class="power-video-el" data-src-desktop="{root}assets/video/hero-desktop.mp4" data-src-mobile="{root}assets/video/hero-mobile.mp4" disablepictureinpicture loop muted playsinline poster="{root}assets/video/hero-poster.webp" preload="none"></video>
</div>
<div aria-hidden="true" class="power-grid"></div>
<div class="power-copy">
<p class="section-label mono">{esc(h["label"])}</p>
<h1 aria-label="{esc(h["aria"])}" class="display">
{lines}
{last}
</h1>
<p class="power-sub">{esc(h["sub"])}</p>
<div class="power-actions"><a class="btn btn-red mono" href="#contato">{esc(h["cta1"])}</a><a class="btn btn-ghost mono" href="#projetos">{esc(h["cta2"])} <span aria-hidden="true">↓</span></a></div>
<div class="power-readouts mono">{readouts}</div>
</div>
<span class="scroll-call"><span data-scroll-copy="">{esc(h["call_off"])}</span> <span aria-hidden="true" class="scroll-mouse"><svg height="30" viewBox="0 0 24 40" width="18"><rect fill="none" height="37" rx="10.5" stroke="currentColor" stroke-width="2" width="21" x="1.5" y="1.5"></rect><circle class="scroll-mouse-dot" cx="12" cy="11" fill="currentColor" r="2.6"></circle></svg></span></span>
</section>"""


def s_projects(t, root):
    p = t["projects"]
    case_href = f"{root}{CASE_SLUG[t['code']]}/index.html"
    cards = []
    for card in p["cards"]:
        name = "<br/>".join(motel_text(part) for part in card["name"])
        if card["real"]:
            visual = (
                f'<a aria-label="{esc(p["banner_label"])}" class="sign-visual photo" href="{DMR_URL}" '
                f'rel="noopener noreferrer" target="_blank"><img alt="{esc(p["img_alt"])}" decoding="async" height="900" '
                f'loading="lazy" src="{root}assets/img/dmr-desktop.webp" width="1440"/>'
                f'<span aria-hidden="true" class="sign-visual-cap mono">{esc(p["banner_cap"])}</span></a>'
            )
            action = f'<a class="text-link mono" href="{case_href}">{esc(card["cta"])}</a>'
        else:
            visual = f'<span aria-hidden="true" class="sign-visual ph-slot mono todo">{esc(p["placeholder"])}</span>'
            action = f'<span class="sign-tag mono">{esc(p["conceptual"])}</span>'
        cards.append(
            f'<article class="sign-card">{visual}<div aria-hidden="true" class="sign-scrim"></div>'
            f'<div class="sign-content"><span class="card-no mono">{esc(card["no"])}</span>'
            f'<h3 class="display sign-name">{name}</h3><p>{esc(card["desc"])}</p>{action}</div></article>'
        )
    chapter = p["label"].split(" / ", 1)[1] if " / " in p["label"] else p["label"]
    return f"""<section class="scene night-index" id="projetos">
<div aria-hidden="true" class="light-field"><i></i><i></i><i></i><i></i><i></i><i></i></div>
<div class="scene-head"><p class="section-label mono">{esc(p["label"])}</p><p class="mono muted">{esc(p["aside"])}</p></div>
<h2 class="sr-only">{esc(p["heading"])}</h2>
<p aria-hidden="true" class="chapter-word display">{esc(chapter)}</p>
<div aria-hidden="true" class="chapter-leaf chapter-leaf-a"></div>
<div aria-hidden="true" class="chapter-leaf chapter-leaf-b"></div>
<svg aria-hidden="true" class="index-needle" viewBox="0 0 40 64"><path class="needle-glass" d="M15,0 L25,0 L25,34 L38,34 L20,62 L2,34 L15,34 Z"/><path class="needle-glow" d="M15,0 L25,0 L25,34 L38,34 L20,62 L2,34 L15,34 Z"/></svg>
<div class="index-track">
{chr(10).join(cards)}
</div>
</section>"""


def s_services(t):
    s = t["services"]
    parts = "\n".join(
        f'<article class="part part-{i}"><span class="mono">{esc(no)}</span><strong>{esc(name)}</strong><small>{esc(desc)}</small></article>'
        for i, (no, name, desc) in enumerate(s["items"], start=1)
    )
    return f"""<section class="scene anatomy" id="servicos">
<div class="scene-head-block">
<p class="section-label mono">{esc(s["label"])}</p>
<h2 class="display">{title_lines(s["title"])}</h2>
</div>
<div class="assembly">
{parts}
</div>
</section>"""


def s_process(t):
    p = t["process"]
    steps = p["steps"]
    readings = "\n".join(
        f'<article class="reading"><span class="display">{i:02d}</span><h3 class="mono">{esc(name)}</h3><p>{esc(desc)}</p></article>'
        for i, (name, desc) in enumerate(steps, start=1)
    )
    return f"""<section class="scene ledger" id="processo">
<div class="ledger-stage">
<div class="scene-head"><p class="section-label mono">{esc(p["label"])}</p><h2 class="display">{title_lines(p["title"])}</h2></div>
<p class="scene-lede">{esc(p["lede"])}</p>
<p class="ledger-note">{esc(p["ai_note"])}</p>
<div class="ledger-readings">
{readings}
</div>
<div aria-hidden="true" class="ledger-rail"><i class="ledger-rail-track"></i><i class="ledger-rail-fill"></i></div>
<p class="ledger-deadline mono todo">{esc(p["deadline"])}</p>
<div aria-hidden="true" class="ledger-status mono"><span>{esc(p["status_step"])} <span data-step-now="">01</span>/{len(steps):02d}</span><i><b></b></i><span>{esc(p["status_hint"])}</span></div>
</div>
</section>"""


def s_about(t):
    a = t["about"]
    paras = "\n".join(f'<p class="bender-bio">{esc(text)}</p>' for text in a["paras"])
    return f"""<section class="scene bender" id="sobre">
<div class="bender-copy">
<p class="section-label mono">{esc(a["label"])}</p>
<h2 class="display">{title_lines(a["title"], sign=True)}</h2>
{paras}
<p class="mono muted bender-meta">{esc(a["meta"])}</p>
</div>
<div class="bender-visual">
<figure class="portrait photo ph-slot"><span class="mono todo">{esc(a["portrait"])}</span></figure>
<figure class="flame-study photo ph-slot"><span class="mono todo">{esc(a["workshop"])}</span></figure>
</div>
</section>"""


def s_tools(t):
    k = t["tools"]
    groups = "\n".join(f'<p><span class="mono">{esc(name)}</span>{esc(items)}</p>' for name, items in k["groups"])
    return f"""<section class="tools-strip" id="ferramentas">
<div><p class="section-label mono">{esc(k["label"])}</p><h2 class="sr-only">{esc(k["heading"])}</h2></div>
<p class="bender-quote">{esc(k["quote"])}</p>
<div class="tool-groups">
{groups}
</div>
</section>"""


def lead_form(t, root):
    """Lead form. It posts to LEADS_ENDPOINT (see content.py). Native validation attributes keep it
    usable without JavaScript; form.js adds inline messages and the fetch submission."""
    f = t["contact"]["form"]
    action = f' action="{esc(LEADS_ENDPOINT)}" method="post"' if LEADS_ENDPOINT else ""
    hidden = "".join(f'<input name="{esc(k)}" type="hidden" value="{esc(v)}"/>' for k, v in LEADS_FIELDS.items())
    options = "".join(f'<option value="{esc(o)}">{esc(o)}</option>' for o in f["types"])
    privacy = href(root, "privacy", t["code"])
    messages = (
        f' data-msg-required="{esc(f["required"])}" data-msg-email="{esc(f["invalid_email"])}"'
        f' data-msg-consent="{esc(f["consent_required"])}" data-msg-error="{esc(f["error"])}"'
        f' data-msg-unconfigured="{esc(f["not_configured"])}" data-msg-sending="{esc(f["sending"])}"'
        f' data-submit-label="{esc(f["submit"])}" data-success-title="{esc(f["success_title"])}"'
        f' data-success-text="{esc(f["success_text"])}"'
    )

    def error_box(field_id):
        return f'<p class="field-error" hidden id="{field_id}-error"></p>'

    return f"""<form class="lead-form" id="lead-form"{action}{messages}>
<h3 class="display lead-title">{esc(f["heading"])}</h3>
<p class="lead-lede">{esc(f["lede"])}</p>
<div class="lead-grid">
<div class="field"><label class="mono" for="lead-name">{esc(f["name"])}</label><input aria-describedby="lead-name-error" autocomplete="name" id="lead-name" maxlength="120" name="name" required type="text"/>{error_box("lead-name")}</div>
<div class="field"><label class="mono" for="lead-email">{esc(f["email"])}</label><input aria-describedby="lead-email-error" autocomplete="email" id="lead-email" inputmode="email" maxlength="254" name="email" required type="email"/>{error_box("lead-email")}</div>
<div class="field"><label class="mono" for="lead-phone">{esc(f["phone"])}</label><input autocomplete="tel" id="lead-phone" inputmode="tel" maxlength="30" name="phone" type="tel"/></div>
<div class="field"><label class="mono" for="lead-type">{esc(f["type"])}</label><select aria-describedby="lead-type-error" id="lead-type" name="project_type" required><option value="">{esc(f["type_placeholder"])}</option>{options}</select>{error_box("lead-type")}</div>
<div class="field field-wide"><label class="mono" for="lead-message">{esc(f["message"])}</label><textarea aria-describedby="lead-message-error" id="lead-message" maxlength="2000" name="message" placeholder="{esc(f["message_placeholder"])}" required rows="5"></textarea>{error_box("lead-message")}</div>
<div class="field field-wide"><label class="consent" for="lead-consent"><input aria-describedby="lead-consent-error" id="lead-consent" name="consent" required type="checkbox" value="yes"/><span>{esc(f["consent_before"])}<a href="{privacy}">{esc(f["consent_link"])}</a>{esc(f["consent_after"])}</span></label>{error_box("lead-consent")}</div>
</div>
<div class="hp"><label for="lead-website">{esc(f["honeypot"])}</label><input autocomplete="off" id="lead-website" name="website" tabindex="-1" type="text"/></div>
<input name="lang" type="hidden" value="{t["code"]}"/>{hidden}
<div class="lead-actions"><button class="btn btn-red mono" type="submit">{esc(f["submit"])}</button></div>
<p class="lead-status" hidden role="status"></p>
</form>"""


def s_contact(t, root):
    c = t["contact"]
    # The last word and the question mark stay on one line, so the mark never drops down alone.
    after_gap = " " if c["h2_after"].startswith(" ") else ""
    after_word = c["h2_after"].strip()
    return f"""<footer class="inquire" id="contato">
<div aria-hidden="true" class="cta-glow"></div>
<p class="section-label mono">{esc(c["label"])}</p>
<h2 class="display">{esc(c["h2_before"])}<span class="neon-accent">{motel_text(c["h2_word"])}</span>{after_gap}<span class="keep-together">{esc(after_word)}<span class="neon-accent">{motel_text("?")}</span></span></h2>
<p>{esc(c["text"])}</p>
<a class="btn btn-red mono" href="#!">{esc(c["button"])}</a>
{lead_form(t, root)}
{channel_list(t)}
{footer_row(t, root)}
</footer>"""


# ---------------------------------------------------------------- pages
def page(t, kind, root, body, title, description, cine=False, home_scripts=False, loader=False):
    motel = f'<script src="{root}assets/js/motel-sign.js"></script>\n' if home_scripts else ""
    return f"""<!DOCTYPE html>
<html lang="{t["html_lang"]}">
{head(t, root, title, description, cine, loader)}
<body class="site">
<a class="skip-link mono" href="#main">{esc(t["skip"])}</a>
{motel}{preloader(t, root) if loader else ""}{header(t, kind, root)}
{chrome(t, blinds=cine)}
{body}
{scripts(root, home=home_scripts)}</body>
</html>
"""


def home_page(t):
    root = root_of("home", t["code"])
    body = "\n".join(
        [
            '<main id="main">',
            s_hero(t, root),
            s_projects(t, root),
            s_services(t),
            s_process(t),
            s_about(t),
            s_tools(t),
            "</main>",
            s_contact(t, root),
        ]
    )
    return page(t, "home", root, body, t["title"], t["description"], cine=True, home_scripts=True, loader=True)


def case_page(t):
    root = root_of("case", t["code"])
    c = t["case"]
    home = href(root, "home", t["code"])
    meta = "\n".join(f'<div><span class="mono">{esc(k)}</span><span>{esc(v)}</span></div>' for k, v in c["meta"])
    did = "\n".join(f"<li>{esc(item)}</li>" for item in c["did"])
    metrics = "\n".join(
        f'<article class="metric"><span class="mono">{esc(name)}</span><strong class="display">{esc(value)}</strong><h3 class="mono">{esc(note)}</h3></article>'
        for name, value, note in c["metrics"]
    )
    b_name, b_value, b_note = c["business"]
    body = f"""<main id="main">
<section class="case-hero">
<p class="section-label mono">{esc(c["label"])}</p>
<h1 class="display">{esc(c["h1"])}</h1>
<p class="scene-lede">{esc(c["summary"])}</p>
<div class="case-meta">
{meta}
</div>
<p class="case-visit"><a class="text-link mono" href="{DMR_URL}" rel="noopener noreferrer" target="_blank">{esc(c["visit"])}</a></p>
</section>
<section class="case-shots">
<figure class="case-shot-desktop photo"><img alt="{esc(c["shot_desktop_alt"])}" height="900" src="{root}assets/img/dmr-desktop.webp" width="1440"/></figure>
<figure class="case-shot-mobile photo"><img alt="{esc(c["shot_mobile_alt"])}" height="823" src="{root}assets/img/dmr-mobile.webp" width="412"/></figure>
</section>
<section class="case-cols">
<div class="case-col"><p class="section-label mono">{esc(c["challenge_label"])}</p><h2 class="display">{esc(c["challenge_title"])}</h2><p>{esc(c["challenge"])}</p></div>
<div class="case-col"><p class="section-label mono">{esc(c["did_label"])}</p><h2 class="display">{esc(c["did_title"])}</h2><ul>
{did}
</ul></div>
<div class="case-col"><p class="section-label mono">{esc(c["decisions_label"])}</p><h2 class="display">{esc(c["decisions_title"])}</h2><p>{esc(c["decisions"])}</p></div>
</section>
<section class="metrics">
<p class="section-label mono">{esc(c["metrics_label"])}</p>
<h2 class="display">{esc(c["metrics_title"])}</h2>
<div class="metric-grid">
{metrics}
<article class="metric todo-card"><span class="mono">{esc(b_name)}</span><strong class="display">{esc(b_value)}</strong><h3 class="mono">{esc(b_note)}</h3></article>
</div>
<p class="metric-note">{esc(c["metrics_note"])}</p>
</section>
<section class="case-cta">
<h2 class="display">{esc(c["cta_title"])}</h2>
<a class="btn btn-red mono" href="{home}#contato">{esc(c["cta_button"])}</a>
<div class="case-nav"><a class="btn btn-ghost mono" href="{home}#projetos">{esc(c["back"])}</a></div>
</section>
</main>
<footer class="site-foot">{footer_row(t, root)}</footer>"""
    return page(t, "case", root, body, c["title"], c["description"])


def doc_page(t, kind, key, sections_html):
    root = root_of(kind, t["code"])
    d = t[key]
    body = f"""<main class="doc-page" id="main">
<p class="section-label mono">{esc(d["label"])}</p>
<h1 class="display">{esc(d["h1"])}</h1>
{sections_html(d, root, t)}
</main>
<footer class="site-foot">{footer_row(t, root)}</footer>"""
    return page(t, kind, root, body, d["title"], d["description"])


def privacy_sections(d, root, t):
    blocks = "\n".join(f"<h2>{esc(h)}</h2><p>{esc(text)}</p>" for h, text in d["sections"])
    return f"<p>{esc(d['intro'])}</p>\n{blocks}"


def notfound_sections(d, root, t):
    home = href(root, "home", t["code"])
    return f'<p>{esc(d["text"])}</p>\n<p><a class="btn btn-red mono" href="{home}">{esc(d["button"])}</a></p>'


def write(code, kind, html):
    target = SITE / PAGES[kind][code]
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(html, encoding="utf-8", newline="\n")
    print("wrote", target.relative_to(SITE))


def main():
    for code, t in LANGS.items():
        write(code, "home", home_page(t))
        write(code, "case", case_page(t))
        write(code, "privacy", doc_page(t, "privacy", "privacy", privacy_sections))
        write(code, "notfound", doc_page(t, "notfound", "notfound", notfound_sections))


if __name__ == "__main__":
    main()
