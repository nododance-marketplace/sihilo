"""Inventory public page images and download small previews for visual selection."""
import concurrent.futures, html, json, re
from pathlib import Path
from urllib.parse import urljoin
import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageDraw, ImageOps
from io import BytesIO

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/skydio'
PREVIEWS = OUT / 'previews'
PREVIEWS.mkdir(exist_ok=True)
pattern = r'https://cdn\.sanity\.io/images/[^\s"<>?&\\)]+\.(?:jpg|jpeg|png|webp)'
inventory = {}
for slug in ('physical-security', 'x10'):
    page = 'https://www.skydio.com/' + ('solutions/' if slug == 'physical-security' else '') + slug
    raw = (OUT / (slug + '.html')).read_text(encoding='utf-8')
    soup = BeautifulSoup(raw, 'html.parser')
    # Includes src/srcset, picture, inline CSS, posters and serialized page data.
    sources = [('html, inline styles and page data', html.unescape(raw))]
    for link in soup.select('link[rel="stylesheet"]'):
        url = urljoin(page, link['href'])
        response = requests.get(url, timeout=60)
        response.raise_for_status()
        sources.append((url, response.text))
    for origin, content in sources:
        for url in re.findall(pattern, content):
            item = inventory.setdefault(url, {'url': url, 'pages': [], 'alt': [], 'discovered_in': []})
            if page not in item['pages']: item['pages'].append(page)
            if origin not in item['discovered_in']: item['discovered_in'].append(origin)
    for image in soup.find_all('img'):
        urls = re.findall(pattern, str(image))
        for url in urls:
            if url in inventory and image.get('alt') and image['alt'] not in inventory[url]['alt']:
                inventory[url]['alt'].append(image['alt'])
items = list(inventory.values())
for i, item in enumerate(items): item['id'] = f'{i+1:03}'

def preview(item):
    try:
        r = requests.get(item['url'] + '?w=480&fit=max&fm=jpg', timeout=60)
        r.raise_for_status()
        im = Image.open(BytesIO(r.content)).convert('RGB')
        im.save(PREVIEWS / (item['id'] + '.jpg'))
    except Exception as e: item['error'] = str(e)
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    list(pool.map(preview, items))
(OUT / 'inventory.json').write_text(json.dumps(items, indent=2), encoding='utf-8')
for start in range(0, len(items), 30):
    group = items[start:start+30]
    sheet = Image.new('RGB', (1500, ((len(group)+4)//5)*210), '#171a1c')
    draw = ImageDraw.Draw(sheet)
    for j, item in enumerate(group):
        x, y = (j%5)*300, (j//5)*210
        path = PREVIEWS / (item['id']+'.jpg')
        if path.exists():
            im = ImageOps.contain(Image.open(path), (292,165))
            sheet.paste(im, (x+(292-im.width)//2,y))
        draw.text((x+5,y+167), item['id']+' '+(' / '.join(item['alt']) or 'Uncaptioned')[:43], fill='white')
        draw.text((x+5,y+184), item['url'].split('/')[-1][-30:], fill='#aaaaaa')
    sheet.save(OUT / f'review-{start//30+1}.jpg')
print(f'Inventoried {len(items)} unique public image URLs')
