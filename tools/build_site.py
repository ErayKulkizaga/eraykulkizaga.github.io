"""Generate the deployable HTML with Python's standard library. No runtime build."""
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://www.eraykulkizaga.com/'
PROJECTS = [
    dict(id='supportflow', name='SupportFlow AI', kind='Collaborative support platform',
         title='Trust starts below the interface.',
         summary='A support workspace built around tenant isolation, auditable tickets and retry-safe document ingestion.',
         role='Co-developer with Emir. Shared feature ownership across the backend and system foundations.',
         stack='Python / FastAPI / PostgreSQL / Redis / Celery',
         repo='https://github.com/kanfan/supportflow-ai', page='project-supportflow.html',
         steps=[('Separate the context', 'Every ticket and document belongs to a verified organization.'), ('Make work traceable', 'Ticket transitions and document ingestion leave an inspectable audit trail.'), ('Next: grounded answers', 'The foundation is implemented. AI classification and RAG are next milestones.')],
         decisions=[('Organization context is verified', 'Authentication and membership checks establish the tenant before ticket or document access. Cross-tenant records are not exposed.'), ('Ingestion survives a retry', 'PDF, TXT and Markdown uploads become versioned background work. Celery workers track status and make retries inspectable.'), ('Build on a working foundation', 'The authenticated agent workspace, ticket workflows, audit events and ingestion are implemented. RAG and AI classification remain planned; AWS staging verification is in progress.')],
         outcome='A working support-platform foundation that connects an authenticated workspace, background document processing and an inspectable audit trail. AI-assisted answers are the next development stage.'),
    dict(id='signturk', name='SignTurk', kind='Award-winning graduation project',
         title='A gesture becomes a sentence.',
         summary='Real-time Turkish Sign Language recognition, human-approved words and 3D sign visualization in one application.',
         role='Led model design, training and evaluation; implemented nearly all of the FastAPI backend. Interface and 3D work were shared.',
         stack='Python / TensorFlow / FastAPI / WebSocket / Three.js',
         repo='https://github.com/ErayKulkizaga/SignTurk', page='project-sign-language.html',
         steps=[('Capture the gesture', 'A webcam supplies hand landmarks to a temporal recognition model.'), ('Keep people in control', 'A prediction becomes a word only after the user approves it.'), ('Connect the experience', 'Approved words form sentences, with optional speech and 3D playback.')],
         decisions=[('The model must fit the interface', 'The bundled live path uses 16-frame sequences of MediaPipe hand features and a BiLSTM with attention. It recognizes 179 isolated-sign classes.'), ('Research and runtime are distinct', 'The separate 226-class, four-stream research ensemble achieved 94.17% Top-1 on the official held-out test split. This offline result is not live recognition accuracy.'), ('Approval is a product decision', 'WebSocket inference feeds pending predictions. Users approve or reject a candidate before it is added to a sentence or persisted.')],
         outcome='Selected for an Outstanding Graduation Project award at Eastern Mediterranean University, 2025–2026. A maintained academic prototype connecting isolated-sign recognition, user approval and 3D playback.'),
    dict(id='querypilot', name='QueryPilot', kind='PostgreSQL analysis · Microsoft Türkiye program',
         title='Evidence before explanation.',
         summary='An execution-plan assistant that finds the evidence first, then lets AI explain only what the evidence supports.',
         role='Built the local plan-analysis assistant during the Microsoft Türkiye mentorship program, then extended the evidence and demo workflows.',
         stack='Python / PostgreSQL / SQLGlot / Foundry Local / TypeScript',
         repo='https://github.com/ErayKulkizaga/QueryPilot', page='project-querypilot.html', demo='https://querypilot.eraykulkizaga.com/',
         steps=[('Read the plan', 'Normalize PostgreSQL EXPLAIN JSON into a traversable plan tree.'), ('Find the evidence', 'Deterministic rules identify supported performance signals.'), ('Explain within limits', 'Grounded AI explains accepted findings. Invalid output falls back to the evidence.')],
         decisions=[('Rules own the diagnosis', 'Recursive plan analysis detects selective sequential scans, expensive nested loops, disk sorts and cardinality misestimation. The model cannot invent or change a finding.'), ('Local and public have different boundaries', 'The local runtime validates SQL with an AST and uses a read-only database role. The public demo accepts plan JSON, has no database connection and never executes SQL.'), ('AI is optional', 'Foundry Local or the bounded public explanation path adds prose with allowed evidence and citation IDs. Provider failures or rejected output preserve the deterministic result.')],
         outcome='A runnable local analysis tool and a browser-first public demo, with workload ranking and baseline comparison. Educational portfolio software; optimizations still require workload testing and DBA review.'),
    dict(id='yazaris', name='YazarIS', kind='TÜBİTAK BiGG · First stage passed · In development',
         title='Messy language. Structured intent.',
         summary='Turning everyday Turkish order messages into catalog-validated drafts that a person can check.',
         role='Developing the order-resolution pipeline, catalog validation and evidence-based evaluation workflow.',
         stack='Python / Pydantic / FastAPI / SQLite',
         repo='https://github.com/ErayKulkizaga/yazaris', page='project-yazaris.html',
         steps=[('Start with the message', 'Real ordering language includes shorthand, changes and ambiguous quantities.'), ('Resolve against a catalog', 'Check intent, active products, allowed units and quantities together.'), ('Return a draft, not a promise', 'Unclear requests need clarification. A person stays in the approval loop.')],
         decisions=[('Intent precedes extraction', 'A cancellation or modification must not silently become a new order. Typed context and common line validation protect the interpretation path.'), ('Evaluate the failure modes', 'Catalog matching and extraction are measured separately. Synthetic datasets and small internal human baselines are clearly distinguished from operational evidence.'), ('Development status stays visible', 'The resolver and validation foundations exist. Concurrent approval, exact decimal support and the business interface are still open work.')],
         outcome='A developing Turkish order-resolution system with explicit catalog constraints and an evaluation workflow. The scene is an illustrative workflow, not a released product screenshot.'),
    dict(id='billing', name='Metering & Billing', full='Capstone Metering & Billing', kind='Backend capstone · Stripe test mode',
         title='A retry is not a second charge.',
         summary='A PostgreSQL-first usage engine with exact pricing, tenant quotas and idempotent requests.',
         role='Built the capstone service across metering rules, PostgreSQL persistence, Stripe test integration and verification.',
         stack='Python / FastAPI / PostgreSQL / SQLAlchemy / Stripe',
         repo='https://github.com/ErayKulkizaga/Capstone-Metering-Billing', page='project-billing.html',
         steps=[('Receive an event', 'Authenticate the tenant and identify the request by its idempotency key.'), ('Count it once', 'Identical retries return the original response. Changed payloads conflict.'), ('Make the ledger exact', 'Quota writes are serialized. Prices are stored as integer micro-USD.')],
         decisions=[('Deduplicate before metering', 'An identical retry returns its original status and body. Reusing a key with a different payload returns a conflict, instead of creating another usage event.'), ('Concurrency belongs in the database', 'Tenant-scoped PostgreSQL advisory locks serialize quota writes. Background workers claim alert jobs with SKIP LOCKED.'), ('Trust the signed event', 'Stripe subscription state changes only after signature verification, event deduplication and a stale-event check. Checkout redirects do not grant access.')],
         outcome='A bounded, test-mode capstone demonstrating retry, quota and payment-state contracts. It does not implement invoicing, taxes, proration or commercial billing operations.')
]
PROJECTS.sort(key=lambda p: ['supportflow', 'yazaris', 'signturk', 'querypilot', 'billing'].index(p['id']))

def link(url, label, cls='text-link'):
    external = ' target="_blank" rel="noopener noreferrer"' if url.startswith('https://') else ''
    return f'<a class="{cls}" href="{url}"{external}>{label}<span aria-hidden="true">↗</span></a>'

def head(title, description, path=''):
    case_css = '<link rel="stylesheet" href="case-studies.css?v=20260910r3">' if path.startswith('project-') else ''
    return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{escape(title)} — Eray Kulkızaga</title><meta name="description" content="{escape(description, quote=True)}">
<link rel="canonical" href="{BASE}{path}"><meta name="theme-color" content="#ecebe5"><meta name="referrer" content="strict-origin-when-cross-origin">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; object-src 'none'; frame-src 'none'; img-src 'self' data:; media-src 'self'; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; form-action 'self' mailto:; upgrade-insecure-requests">
<meta property="og:type" content="website"><meta property="og:title" content="{escape(title, quote=True)} — Eray Kulkızaga"><meta property="og:description" content="{escape(description, quote=True)}"><meta property="og:url" content="{BASE}{path}"><meta property="og:image" content="{BASE}images/brand/portfolio-social-preview.png"><meta property="og:image:alt" content="Eray Kulkızaga — Backend engineering and applied AI"><meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="images/brand/favicon.png" type="image/png"><link rel="apple-touch-icon" href="images/brand/app-icon-192.png"><link rel="manifest" href="manifest.webmanifest">
<link rel="preload" href="fonts/manrope.woff2" as="font" type="font/woff2" crossorigin><link rel="preload" href="fonts/instrument-serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css?v=20260910r3">{case_css}<script>document.documentElement.classList.add('fonts-pending');setTimeout(()=>document.documentElement.classList.remove('fonts-pending'),2200);</script><script src="script.js?v=20260910r3" defer></script></head>'''

def header(home=False):
    prefix = '' if home else 'index.html'
    return f'''<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><a class="wordmark" href="{prefix}#hero">Eray Kulkızaga<span class="brand-period">.</span></a>
<nav aria-label="Main navigation"><a href="{prefix}#projects">Work <span class="nav-count">05</span></a><a href="{prefix}#experience">Experience</a><a href="{prefix}#about">About</a><a href="{prefix}#contact">Contact</a><a class="cv-link" href="documents/eray-kulkizaga-cv.pdf" target="_blank" rel="noopener noreferrer">CV <span aria-hidden="true">↗</span></a></nav>
<div class="reading-progress" aria-hidden="true"></div></header>'''

def footer():
    return '''<footer class="footer"><p>© 2026 Eray Kulkızaga</p><p>Software, with the details considered.</p><nav aria-label="Footer"><a href="privacy.html">Privacy</a><a href="index.html#hero">Back to top ↑</a></nav></footer>
<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token":"d46780bf523547b7b603a3b28e38f1fe"}'></script></body></html>'''

def circuit():
    return '''<svg viewBox="0 0 500 300" fill="none" aria-hidden="true"><g stroke="currentColor" stroke-width="1.2"><path d="M0 90H115L155 130H215M0 150H215M0 210H125L165 170H215M285 130H345L385 90H500M285 150H500M285 170H350L390 210H500M230 0V100M250 0V100M270 0V100M230 200V300M250 200V300M270 200V300"/><rect x="215" y="100" width="70" height="100" rx="4"/><circle cx="70" cy="90" r="5"/><circle cx="430" cy="210" r="5"/></g><rect x="232" y="118" width="36" height="64" fill="currentColor" opacity=".25"/></svg>'''

def hero():
    return f'''<section class="hero" id="hero" data-scroll-scene><div class="hero-pin">
<div class="hero-copy"><p class="eyebrow">Software engineer · Backend & applied AI</p><h1>Behind the<br><em>interface.</em></h1><p class="hero-intro">I'm Eray. I build the APIs, data workflows and AI systems that turn an interface into a working product.</p><a class="primary-link" href="#projects">Explore my work <span aria-hidden="true">↓</span></a></div>
<div class="hero-next-act"><p class="eyebrow">From the surface to the decisions</p><h2>Look a little<br><em>closer.</em></h2><p>Where a model meets a product.<br>Where a retry meets a database.<br>This is the work underneath.</p><a class="primary-link" href="#projects">Enter the selected work <span aria-hidden="true">↓</span></a></div>
<div class="hero-object" role="img" aria-label="An exploded software system: interface above inference, API and data layers. The layers assemble as you scroll.">
<div class="system-stack"><div class="system-plane plane-data"><span class="plane-label">03 / Persistence</span>{circuit()}<span class="plane-footer">PostgreSQL · queues · state</span></div>
<div class="system-plane plane-logic"><span class="plane-label">02 / Intelligence</span>{circuit()}<span class="plane-footer">Models · rules · evidence</span></div>
<div class="system-plane plane-ui"><div class="mini-bar"><b>System / overview</b><span>Interface</span></div><div class="mini-dashboard"><div class="mini-side"><i></i><i></i><i></i><i></i></div><div class="mini-content"><p>From input to outcome.</p><div class="mini-chart"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="mini-lines"><i></i><i></i><i></i></div></div></div></div></div>
<span class="object-caption">The visible part is only the beginning.</span><div class="hero-layer-key" aria-hidden="true"><span>01 / Interface</span><span>02 / Intelligence</span><span>03 / Persistence</span></div></div>
<div class="hero-bottom"><a href="#supportflow">First chapter / SupportFlow AI ↘</a><span class="scroll-cue">Scroll to look underneath <span aria-hidden="true">↓</span></span></div>
</div></section>'''

def graphic(pid):
    if pid == 'supportflow':
        return '''<div class="flow-scene"><div class="flow-context"><span>Organization / workspace</span><b>SupportFlow</b></div><div class="flow-wire"></div><div class="flow-sheet flow-ticket"><span class="sheet-kicker">01 / Incoming ticket</span><h3 class="diagram-title">Access request</h3><p>Review account permissions<br>for this organization.</p><div class="sheet-row"><span>Agent review</span><b>Open</b></div></div><div class="flow-sheet flow-doc"><span class="sheet-kicker">02 / Document pipeline</span><h3 class="diagram-title">Source material</h3><p>Upload → scan → extract</p><div class="pipeline-dots"><i></i><i></i><i></i><i></i></div><div class="sheet-row"><span>Versioned ingestion</span><b>Tracked</b></div></div><div class="flow-audit"><span class="audit-dot"></span>03 / Audit event <b>Recorded with the transition</b></div></div>'''
    if pid == 'signturk':
        return '''<div class="sign-scene"><div class="sign-outline" aria-hidden="true"><svg viewBox="0 0 180 220" fill="none"><g stroke="currentColor" stroke-width="1.5"><path d="M70 195L35 135L20 100L33 92L58 119L53 45L66 40L77 105L80 22L94 22L96 103L110 38L123 43L115 112L140 68L153 75L130 145L113 194Z"/><path d="M70 195L77 105L96 103L115 112L130 145M58 119L113 194M77 105L113 194M96 103L113 194"/></g><g fill="currentColor"><circle cx="70" cy="195" r="4"/><circle cx="77" cy="105" r="4"/><circle cx="96" cy="103" r="4"/><circle cx="115" cy="112" r="4"/><circle cx="58" cy="119" r="4"/><circle cx="113" cy="194" r="4"/></g></svg></div><div class="product-window"><div class="window-bar"><span>SignTurk</span><span>Live recognition</span></div><div class="sign-capture" data-sign-sequence><img src="images/projects/signturk-sequence/poster.webp" alt="Actual SignTurk recording recognizing the Turkish sign for çay, with a camera view, prediction and approval controls" width="640" height="360" loading="lazy" decoding="async"><canvas width="640" height="360" aria-hidden="true"></canvas></div></div></div>'''
    if pid == 'querypilot':
        return '''<div class="query-scene"><div class="query-plan"><div class="terminal-title"><span>EXPLAIN / plan tree</span><span>JSON</span></div><div class="plan-node root-node"><span>Aggregate</span><small>result</small></div><div class="plan-connector"></div><div class="plan-node"><span>Nested Loop</span><small>join</small></div><div class="plan-branches"><div class="plan-node problem-node"><span>Seq Scan</span><small>evidence found</small></div><div class="plan-node"><span>Index Scan</span><small>lookup</small></div></div></div><div class="query-evidence"><span class="sheet-kicker">Deterministic finding</span><h3 class="diagram-title">Read the work<br>behind the query.</h3><p>Plan signal → source retrieval<br>→ validated explanation</p><div class="evidence-line"><span>Evidence</span><b>Preserved</b></div><div class="evidence-line"><span>Suggested SQL</span><b>Display only</b></div></div></div>'''
    if pid == 'yazaris':
        return '''<div class="order-scene"><div class="order-message"><span>Incoming message / illustrative</span><p lang="tr">“10 koli bardak,<br>bir de 5 paket peçete.”</p></div><div class="order-path" aria-hidden="true"><span>Intent</span><i></i><span>Catalog</span><i></i><span>Validation</span></div><div class="order-receipt"><div class="receipt-head"><strong>YazarIS<span>.</span></strong><span>Order draft</span></div><div class="receipt-row receipt-label"><span>Product</span><span>Quantity</span></div><div class="receipt-row"><span lang="tr">Bardak</span><b>10 koli</b></div><div class="receipt-row"><span lang="tr">Peçete</span><b>5 paket</b></div><div class="receipt-total">Awaiting human review <span>↗</span></div></div></div>'''
    return '''<div class="billing-scene"><div class="event-stack"><div class="usage-event event-original"><span>POST /v1/meter</span><b>event_001</b><small>Original request</small></div><div class="usage-event event-retry"><span>POST /v1/meter</span><b>event_001</b><small>Identical retry</small></div></div><div class="ledger"><div class="ledger-heading"><span>Usage ledger</span><span>Test-mode illustration</span></div><div class="ledger-count"><strong>1</strong><span>event recorded</span></div><div class="ledger-rule"></div><p>Same key. Same payload.<br><b>Same response.</b></p><div class="ledger-bottom"><span>Integer pricing</span><span>Tenant-scoped</span></div></div></div>'''

def chapter(p, i):
    steps = ''.join(f'<div class="story-step"><span>0{j+1}</span><div><h3>{s[0]}</h3><p>{s[1]}</p></div></div>' for j,s in enumerate(p['steps']))
    return f'''<section class="chapter chapter-{p['id']}" id="{p['id']}" aria-labelledby="title-{p['id']}" data-scroll-scene><div class="chapter-pin"><div class="chapter-top"><span>0{i+1} / 05</span><p>{p['kind']}</p><a href="#projects" aria-label="Back to work index">Index ↑</a></div><div class="chapter-layout"><div class="chapter-copy"><h2 id="title-{p['id']}">{p['name']}</h2><p class="chapter-thesis">{p['title']}</p><p class="chapter-summary">{p['summary']}</p><div class="contribution"><span>My contribution</span><p>{p['role']}</p></div><p class="tech-stack">{p['stack']}</p><div class="chapter-links">{link(p['page'],'Inside the project')}{link(p.get('demo',p['repo']),'Live demo' if 'demo' in p else 'Source code')}</div></div><figure class="chapter-figure">{graphic(p['id'])}<figcaption>{'Actual SignTurk recording / çay (tea)' if p['id']=='signturk' else 'Workflow illustration · based on the repository'}</figcaption></figure></div><div class="story-rail">{steps}<div class="scene-meter" aria-hidden="true"><i></i></div></div></div></section>'''

def home_page():
    from home_film import render
    return render(PROJECTS, head, header, footer, link)


def case_page(p,i):
    template = ROOT / 'tools/cases' / (p['id'] + '.html')
    nextp = PROJECTS[(i+1) % len(PROJECTS)]
    content = template.read_text(encoding='utf-8')
    slots = {
        '{{GRAPHIC}}': graphic(p['id']),
        '{{ROLE}}': p['role'], '{{STACK}}': p['stack'], '{{REPO}}': p['repo'],
        '{{SOURCE_LINK}}': link(p['repo'], 'Explore the repository'),
        '{{NEXT}}': f'<a class="next-project section-shell" href="{nextp["page"]}"><span>Next project</span><strong>{nextp["name"]}</strong><span aria-hidden="true">↗</span></a>',
    }
    for key, value in slots.items():
        content = content.replace(key, value)
    return head(p.get('full',p['name']),p['summary'],p['page']) + f'<body class="case-page case-{p["id"]}">' + header() + content + footer()

def simple_page(title,copy,path):
    return head(title,title,path)+'<body>'+header()+f'<main id="main" class="simple-page section-shell"><p class="eyebrow">Eray Kulkızaga / Portfolio</p><h1>{title}</h1>{copy}</main>'+footer()

def build():
    (ROOT/'index.html').write_text(home_page(),encoding='utf-8')
    for i,p in enumerate(PROJECTS):
        (ROOT/p['page']).write_text(case_page(p,i),encoding='utf-8')
    (ROOT/'privacy.html').write_text(simple_page('Privacy', '<p>This static portfolio has no visitor accounts, advertising trackers or server-side contact form. It uses Cloudflare Web Analytics for aggregate site usage and page-performance measurements.</p><p>The email link opens your email application. Fonts, images and the CV are served from this website. External links open services with their own privacy policies.</p><p>There is no persistent motion-preference storage. The reduced-motion setting follows your device, with a temporary on-page override.</p><p>For questions, email <a href="mailto:eraykulkizaga@hotmail.com">eraykulkizaga@hotmail.com</a>.</p><p>Updated 10 September 2026.</p>', 'privacy.html'),encoding='utf-8')
    (ROOT/'404.html').write_text(simple_page('Page not found.', '<p>This address does not point to a page in the portfolio.</p><a class="primary-link" href="index.html">Return to the work ↗</a>', '404.html').replace('<meta name="theme-color"','<meta name="robots" content="noindex"><meta name="theme-color"'),encoding='utf-8')
    # Preserve an old inbound URL, but remove the portfolio itself as a project.
    (ROOT/'project-eraykulkizaga.html').write_text(simple_page('The portfolio has moved on.', '<p>The selected work now focuses on five backend and AI projects.</p><a class="primary-link" href="index.html#projects">Explore selected work ↗</a>', 'project-eraykulkizaga.html').replace('<meta name="theme-color"','<meta name="robots" content="noindex"><meta name="theme-color"'),encoding='utf-8')
    urls=['']+[p['page'] for p in PROJECTS]+['privacy.html']
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'  <url><loc>{BASE}{u}</loc></url>\n' for u in urls)+'</urlset>\n',encoding='utf-8')
    # Keep generated markup reviewable without requiring a Node build on Pages.
    for name in ['index.html', 'privacy.html', '404.html', 'project-eraykulkizaga.html'] + [p['page'] for p in PROJECTS]:
        page = ROOT / name
        page.write_text(re.sub(r'(?<=>)(?=<)', '\n', page.read_text(encoding='utf-8')).strip() + '\n', encoding='utf-8')

if __name__=='__main__':
    build()
