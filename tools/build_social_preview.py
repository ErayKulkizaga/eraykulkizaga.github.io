"""Render source for the 1200 × 630 social image; capture it in a browser."""
from pathlib import Path
from build_site import hero

ROOT = Path(__file__).resolve().parents[1]
target = ROOT / 'tmp/social-preview.html'
target.parent.mkdir(exist_ok=True)
target.write_text('''<!doctype html><html lang="en"><head><meta charset="utf-8">
<base href="/"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Portfolio social preview</title><link rel="stylesheet" href="style.css">
<style>
html,body{width:1200px;height:630px;overflow:hidden;--header:0px;--s:56px}
.hero-pin{height:630px;min-height:630px;padding:70px 56px 80px;grid-template-columns:1fr 1fr}
.hero h1{font-size:93px;margin:24px 0}.hero-intro{font-size:15px;max-width:400px}
.hero-object{height:430px;transform:translateY(-14px)}.system-stack{width:370px;height:245px}
.hero .primary-link,.hero-bottom,.object-caption{display:none}
.social-name{position:absolute;top:32px;left:56px;font-size:21px;font-weight:600;letter-spacing:-.04em}
.social-domain{position:absolute;bottom:30px;left:56px;right:56px;border-top:1px solid var(--line);padding-top:18px;font-size:12px}
</style></head><body>''' + hero() + '''<p class="social-name">Eray Kulkızaga<span class="brand-period">.</span></p>
<p class="social-domain">eraykulkizaga.com · Selected engineering work</p></body></html>''', encoding='utf-8')
print('Preview /tmp/social-preview.html at 1200 × 630, then save a viewport screenshot to images/brand/portfolio-social-preview.png')
