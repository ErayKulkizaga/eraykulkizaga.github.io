"""Check every static page's navigation, assets and essential publishing metadata."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re

ROOT = Path(__file__).resolve().parents[1]

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.path, self.ids, self.links, self.tags = path, [], [], []
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for key in ('href', 'src', 'poster', 'data-desktop', 'data-mobile'):
            if key in attrs:
                self.links.append(attrs[key])

def verify():
    pages = {p.name: Page(p) for p in ROOT.glob('*.html')}
    errors = []
    checks = 0
    for name, page in pages.items():
        if '{{' in page.path.read_text(encoding='utf-8'):
            errors.append(f'{name}: unresolved authoring slot')
        duplicates = [key for key, count in Counter(page.ids).items() if count > 1]
        if duplicates:
            errors.append(f'{name}: duplicate IDs {duplicates}')
        if sum(tag == 'h1' for tag, _ in page.tags) != 1:
            errors.append(f'{name}: expected one H1')
        for attribute, expected in [('name', 'description'), ('property', 'og:image')]:
            if not any(tag == 'meta' and attrs.get(attribute) == expected for tag, attrs in page.tags):
                errors.append(f'{name}: missing {expected}')
        for tag, attrs in page.tags:
            if tag == 'img' and ('alt' not in attrs or 'width' not in attrs or 'height' not in attrs):
                errors.append(f'{name}: image missing alt text or dimensions')
            if tag == 'a' and attrs.get('target') == '_blank' and 'noopener' not in attrs.get('rel', ''):
                errors.append(f'{name}: external tab without noopener')
        for link in page.links:
            parsed = urlsplit(link)
            if parsed.scheme or parsed.netloc:
                continue
            target = unquote(parsed.path) or name
            file = ROOT / target
            checks += 1
            if not file.is_file():
                errors.append(f'{name}: missing {target}')
            if parsed.fragment and file.suffix == '.html':
                target_page = pages.get(file.name)
                if target_page is None or unquote(parsed.fragment) not in target_page.ids:
                    errors.append(f'{name}: missing anchor {link}')
    for stylesheet in ROOT.glob('*.css'):
        for url in re.findall(r"url\(['\"]?([^)'\"]+)", stylesheet.read_text(encoding='utf-8')):
            if not (ROOT / url).is_file():
                errors.append(f'{stylesheet.name}: missing asset {url}')
    for variant in ('poster', 'desktop', 'mobile'):
        if not (ROOT / f'images/projects/signturk-sequence/{variant}.webp').is_file():
            errors.append(f'Missing SignTurk sequence: {variant}')
    home = pages['index.html']
    chapters = [attrs['id'] for tag, attrs in home.tags if tag == 'section' and 'chapter ' in attrs.get('class', '')]
    if chapters != ['supportflow', 'yazaris', 'signturk', 'querypilot', 'billing']:
        errors.append(f'Unexpected project selection: {chapters}')
    films = [attrs for tag, attrs in home.tags if tag == 'video' and attrs.get('id') == 'landscape-film']
    if len(films) != 1 or 'autoplay' in films[0] or 'loop' in films[0]:
        errors.append('Homepage must have one scroll-controlled, non-looping landscape film')
    for logo in ('microsoft.png', 'flyrank.svg', 'iskur.png'):
        if not any(tag == 'img' and attrs.get('src') == f'images/logos/{logo}' for tag, attrs in home.tags):
            errors.append(f'Missing experience logo: {logo}')
    json.loads((ROOT / 'manifest.webmanifest').read_text(encoding='utf-8'))
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'PASS: {len(pages)} pages, {checks} local references, five selected projects, metadata and image contracts.')

if __name__ == '__main__':
    verify()
