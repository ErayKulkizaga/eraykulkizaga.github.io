"""One continuous landscape film, with accessible HTML editorial overlays."""
from pathlib import Path
from html import escape
import json
import re

ROOT = Path(__file__).resolve().parents[1]


def render(projects, head, header, footer, link):
    beats = []

    def beat(id, content, cls='', label=''):
        beats.append(f'<section id="{id}" class="film-beat {cls}" data-film-label="{escape(label or id)}"><div class="film-content">{content}</div></section>')

    beat('hero', '''<div class="film-opening"><p class="eyebrow">Software engineer / Backend & applied AI</p><h1>Eray<br><em>Kulkızaga.</em></h1><p>I build the APIs, data workflows and AI systems<br class="desktop-break"> that turn an idea into a working product.</p><a class="film-link" href="#projects">Explore the work <span aria-hidden="true">↓</span></a></div><p class="film-opening-note">A closer look at the work.<br>At your pace.</p>''', 'film-intro', 'Introduction')

    index = ''.join(f'<a href="#{p["id"]}"><span>0{i+1}</span><strong>{p["name"]}</strong><span aria-hidden="true">↗</span></a>' for i,p in enumerate(projects))
    beat('projects', f'<div class="film-index"><p class="eyebrow">Selected work / 2024—2026</p><h2>Ideas, made<br><em>tangible.</em></h2><nav aria-label="Project chapters">{index}</nav></div>', label='Selected work')

    for i,p in enumerate(projects):
        media = ''
        if p['id'] == 'signturk':
            media = '<figure class="film-product"><img src="images/projects/signturk-sequence/poster.webp" width="640" height="360" alt="Actual SignTurk interface recognizing çay and presenting the word for approval" loading="lazy"><figcaption>Actual product recording / çay</figcaption></figure>'
        elif p['id'] == 'querypilot':
            media = '<figure class="film-product"><img src="images/projects/querypilot-live-result.webp" width="1185" height="600" alt="QueryPilot public demo showing deterministic evidence for its prepared synthetic plan" loading="lazy"><figcaption>Public demo / prepared synthetic scenario</figcaption></figure>'
        else:
            media = '<ol class="film-principles">'+''.join(f'<li><span>0{j+1}</span><p>{escape(step[0])}</p></li>' for j,step in enumerate(p['steps']))+'</ol>'
        content = f'''<div class="film-project-copy"><p class="eyebrow">Selected work / 0{i+1} · {escape(p['kind'])}</p><h2>{escape(p['name'])}<span>.</span></h2><p class="film-thesis">{escape(p['title'])}</p><p class="film-summary">{escape(p['summary'])}</p><div class="film-role"><span>My contribution</span><p>{escape(p['role'])}</p></div><p class="film-stack">{escape(p['stack'])}</p><div class="film-links">{link(p['page'],'Explore the project','film-link')}{link(p.get('demo',p['repo']),'Live demo' if 'demo' in p else 'GitHub','film-link')}</div></div>{media}'''
        beat(p['id'],content,f'chapter film-project film-project-{p["id"]}',p['name'])

    experience = (ROOT/'tools/experience.html').read_text(encoding='utf-8')
    articles = re.findall(r'<article\b.*?</article>', experience, flags=re.S)
    for i,(article,company) in enumerate(zip(articles,['Microsoft Türkiye','FlyRank.ai','İSKUR Holding'])):
        beat('experience' if i == 0 else f'experience-{i+1}', f'<div class="film-experience"><div class="experience-heading"><p class="eyebrow">Professional journey / 0{i+1}</p><h2>Experience<span>.</span></h2></div>{article}</div>', 'film-experience-beat',company)

    beat('about', '''<div class="film-profile"><p class="eyebrow">The person behind the work</p><h2>Curious about models.<br><em>Serious about systems.</em></h2><p>I'm a software engineer focused on Python backend development and applied AI. I care about the API contract, the data path, the failure case and the person using the product.</p><div class="film-education"><img src="images/logos/emu.png" width="1000" height="1000" alt="" loading="lazy"><div><strong>B.Sc. Software Engineering</strong><p>Eastern Mediterranean University · 2021–2026<br>ABET-accredited · English-taught programme</p></div></div><p class="film-availability">Open to remote work, Türkiye-based roles and international relocation.</p><a class="film-link" href="documents/eray-kulkizaga-cv.pdf" target="_blank" rel="noopener noreferrer">Read my CV ↗</a></div>''', label='About Eray')

    beat('certificates', '''<div class="film-credentials"><p class="eyebrow">Continued learning & recognition</p><h2>Work. Learn.<br><em>Go further.</em></h2><nav aria-label="Credentials"><a href="images/certificates/signturk-outstanding-project.webp"><strong>Outstanding Graduation Project</strong><span>SignTurk · Eastern Mediterranean University ↗</span></a><a href="images/certificates/emu-high-honour-spring-2026.webp"><strong>High Honour</strong><span>EMU · Spring 2026 ↗</span></a><a href="https://cert.efset.org/iLonpz" target="_blank" rel="noopener noreferrer"><strong>C2 English proficiency</strong><span>EF SET · Verify certificate ↗</span></a><a href="images/certificates/stanford-supervised-machine-learning.webp"><strong>Supervised Machine Learning</strong><span>Stanford / DeepLearning.AI · Machine Learning Specialization ↗</span></a><a href="images/certificates/stanford-advanced-learning-algorithms.webp"><strong>Advanced Learning Algorithms</strong><span>Stanford / DeepLearning.AI · Machine Learning Specialization ↗</span></a><a href="images/certificates/stanford-unsupervised-learning.webp"><strong>Unsupervised Learning, Recommenders, Reinforcement Learning</strong><span>Stanford / DeepLearning.AI · Machine Learning Specialization ↗</span></a></nav></div>''', label='Recognition')

    beat('lab', '''<div class="film-lab"><p class="eyebrow">Outside the main work / Lab</p><h2>A different<br><em>surface.</em></h2><h3>Velora Live Pilot</h3><p>A personal exploration of mobile live commerce. A place to learn Expo, React Native, FastAPI and LiveKit — still a prototype, with device acceptance testing in progress.</p><a class="film-link" href="https://github.com/ErayKulkizaga/velora-live-pilot" target="_blank" rel="noopener noreferrer">Visit the experiment ↗</a></div>''', label='Lab / Velora')

    beat('contact', '''<div class="film-contact"><p class="eyebrow">Have a role or a problem in mind?</p><h2>Let's talk<br><em>about the work.</em></h2><a class="film-email" href="mailto:eraykulkizaga@hotmail.com">eraykulkizaga@hotmail.com ↗</a><nav aria-label="Contact links"><a href="https://github.com/ErayKulkizaga" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/eraykulkizaga/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="documents/eray-kulkizaga-cv.pdf" target="_blank" rel="noopener noreferrer">CV ↗</a></nav><div class="film-endnotes"><span>© 2026 Eray Kulkızaga</span><a href="privacy.html">Privacy</a><a href="https://mixkit.co/free-stock-video/aerial-view-of-magnificent-green-hills-100408/" target="_blank" rel="noopener noreferrer">Landscape film / Mixkit ↗</a></div></div>''',label='Get in touch')

    shell = head('Backend engineering & applied AI','Eray Kulkızaga — Software Engineer. Selected backend and AI projects, professional experience and engineering decisions.')
    shell = shell.replace('</head>','<link rel="stylesheet" href="film.css?v=20260910f1"><script src="film.js?v=20260910f1" defer></script></head>')
    stage = '''<div class="landscape-stage" aria-hidden="true"><picture><source media="(max-width:600px)" srcset="videos/landscape/mobile-poster.webp"><img class="landscape-poster" src="videos/landscape/desktop-poster.webp" width="1280" height="720" alt="" fetchpriority="high"></picture><video id="landscape-film" muted playsinline preload="none" tabindex="-1" data-desktop="videos/landscape/desktop.mp4" data-mobile="videos/landscape/mobile.mp4"></video><div class="landscape-shade"></div></div>'''
    transport = '''<div class="film-transport"><a class="film-position" href="#projects"><span data-film-current>Introduction</span></a><div class="film-track" aria-hidden="true"><i></i></div><span class="film-time" aria-hidden="true">Scroll to explore <span>↓</span></span></div>'''
    tail = footer().split('<script defer',1)[1]
    person = json.dumps({'@context':'https://schema.org','@type':'Person','name':'Eray Kulkızaga','url':'https://www.eraykulkizaga.com/','jobTitle':'Software Engineer','sameAs':['https://github.com/ErayKulkizaga','https://www.linkedin.com/in/eraykulkizaga/']},ensure_ascii=False)
    return shell+'<body class="home film-home">'+stage+header(True)+'<main id="main" class="film-story">'+''.join(beats)+'</main>'+transport+f'<script type="application/ld+json">{person}</script><script defer'+tail
