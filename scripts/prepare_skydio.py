"""Preserve selected originals, hash-deduplicate, optimize and document provenance."""
import concurrent.futures, hashlib, html, json
from pathlib import Path
from io import BytesIO
import requests
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/images/skydio'
DOCS = ROOT / 'docs/skydio'
for category in ('hero','drones','thermal','industrial','security','aerial','unassigned'):
    (OUT/category).mkdir(parents=True, exist_ok=True)
    (OUT/category/'.gitkeep').touch()
# id, category, descriptive name, suggested placement, eligibility
SELECTION = [
('002','drones','skydio-x10-rooftop-dock','Sihilo Air alternative',True),
('003','industrial','skydio-x10-substation-flight','How Sihilo Works',True),
('005','hero','commercial-campus-aerial','Hero',True),
('007','thermal','thermal-person-at-woodland-edge','Security Intelligence alternative',False),
('009','security','outdoor-security-camera-cluster','How Sihilo Works',True),
('014','security','drone-spotlight-night-patrol','Security Intelligence',True),
('018','drones','skydio-x10-in-flight-closeup','Sihilo Air',True),
('019','unassigned','drone-dock-substation-blue-hour','Sihilo Air alternative',False),
('020','drones','indoor-drone-industrial-building','Sihilo Air alternative',True),
('021','aerial','aircraft-over-green-landscape','Unassigned',False),
('024','drones','skydio-drone-against-clouds','Sihilo Air alternative',True),
('026','drones','rooftop-drone-docks-at-dusk','Sihilo Air alternative',True),
('034','drones','skydio-x10-between-city-buildings','Sihilo Air alternative',True),
('043','industrial','logistics-loading-bays-aerial','Industries alternative',True),
('044','security','drone-above-secured-perimeter','Industries alternative',True),
('045','industrial','shipping-container-storage-yard','Industries / Equipment yards',True),
('046','aerial','commercial-campus-courtyard','Industries alternative',True),
('047','aerial','yellow-car-parking-structure','Industries alternative',True),
('048','aerial','airport-apron-aerial','Industries alternative',True),
('049','industrial','drone-over-power-infrastructure','Industries alternative',True),
('050','industrial','industrial-logistics-property-aerial','Industries / Industrial',True),
('051','industrial','vehicle-inventory-aerial','Industries / Dealerships',True),
('052','industrial','commercial-building-construction','Industries / Construction',True),
('053','aerial','stadium-interior-at-night','Unassigned',True),
('054','industrial','shipping-port-cranes-aerial','Industries alternative',True),
('060','unassigned','skydio-x10-studio-front-view','Sihilo Air pending verification',False),
('061','unassigned','skydio-x10-sensor-closeup','How Sihilo Works pending verification',False),
('062','unassigned','skydio-x10-sensor-module','How Sihilo Works pending verification',False),
('066','industrial','solar-array-aerial','Industries alternative',True),
('069','industrial','electrical-substation-detail','How Sihilo Works alternative',True),
('071','thermal','thermal-electrical-transformer','Security Intelligence alternative',False),
('072','thermal','thermal-people-on-rooftop','Security Intelligence alternative',False),
('076','aerial','commercial-property-aerial-at-dusk','Final CTA',True),
('079','drones','skydio-drone-night-flight','Sihilo Air alternative',True),
('103','unassigned','skydio-x10-propeller-closeup','Sihilo Air pending verification',False),
('104','unassigned','skydio-x10-body-detail','Sihilo Air pending verification',False),
('105','drones','skydio-drone-in-rain','Sihilo Air alternative',True),
]
inventory = json.loads((DOCS/'inventory.json').read_text())
by_id = {i['id']: i for i in inventory}

def download(spec):
    id_, category, name, section, eligible = spec
    item = by_id[id_]
    ext = item['url'].rsplit('.',1)[1]
    path = OUT/category/(name+'.'+ext)
    if path.exists():
        data = path.read_bytes()
    else:
        r = requests.get(item['url'], timeout=120)
        r.raise_for_status()
        data = r.content
    im = Image.open(BytesIO(data))
    im.load()
    path.write_bytes(data)
    return dict(id=id_, filename=str(path.relative_to(ROOT)).replace('\\','/'),
        original_source_url=item['url'], source_page=item['pages'][0], source_pages=item['pages'],
        resolution={'width':im.width,'height':im.height}, file_format=im.format,
        bytes=len(data), sha256=hashlib.sha256(data).hexdigest(),
        photographer_attribution='Not supplied; source page does not identify the photographer for this asset.',
        permission_status='user-reported-photographer-permission' if eligible else 'hold-scope-uncertain',
        permission_basis='User states photographer permission for photographs from both reference pages. No license document or asset-level attribution supplied.',
        permission_notes=('Photographic candidate; author identity and exact scope unverified. No independently verified license is claimed.' if eligible else ('Thermal sensor capture: unclear whether photographer permission covers this data product. Hold for asset-specific clearance.' if category=='thermal' else 'Possible product render or composite: photographer permission may not cover this asset. Do not integrate without asset-specific clearance.')),
        recommended_website_section=section, integrated=False, derivatives=[])

with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
    assets = list(pool.map(download, SELECTION))
# Hash-based original deduplication, preserving alternate provenance.
unique = {}
for item in assets:
    if item['sha256'] in unique:
        existing=unique[item['sha256']]
        existing.setdefault('duplicate_source_urls',[]).append(item['original_source_url'])
        existing['source_pages']=sorted(set(existing['source_pages']+item['source_pages']))
        (ROOT/item['filename']).unlink()
    else: unique[item['sha256']]=item
assets=list(unique.values())
integrated = {'005','003','009','014','018','045','050','051','052','076'}
for item in assets:
    im = Image.open(ROOT/item['filename']).convert('RGB')
    selected = item['id'] in integrated
    item['integrated']=selected
    sizes = sorted(set(min(im.width,w) for w in ([480,768,1280,1920] if selected else [min(960,im.width)])))
    for width in sizes:
        resized=im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
        for fmt in (['webp','avif'] if selected else ['webp']):
            target=(ROOT/item['filename']).with_name(Path(item['filename']).stem+f'-{width}.{fmt}')
            resized.save(target,quality=78 if fmt=='webp' else 55)
            item['derivatives'].append({'filename':str(target.relative_to(ROOT)).replace('\\','/'),'width':resized.width,'height':resized.height,'format':fmt,'bytes':target.stat().st_size})
    item['limitations']=[]
    if im.width<600: item['limitations'].append('Small native image; use only in compact cards. No high-resolution source is exposed by these pages.')
    if item['id']=='076': item['limitations'].append('Dusk, not full night; native width is 1152 pixels. Use as a contained CTA photograph, not a full-screen background.')
manifest={'schema_version':1,'review_date':'2026-10-07','permission_policy':'User-reported permission is accepted for photographic candidates for this local integration. Attribution and asset-level scope remain unverified; renders/composites are held. No production deployment performed.', 'assets':assets}
(OUT/'image-manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
# Every discovered URL has an explicit disposition, including excluded non-photographic assets.
for item in inventory:
    match=next((a for a in assets if a['id']==item['id']),None)
    item['disposition']='downloaded-candidate' if match else 'excluded'
    id_=int(item['id'])
    if match: reason='See image-manifest.json'
    elif id_ in {6,27}: reason='Redundant portrait crop; landscape original retained.'
    elif id_ in {1,8,33,36,40,55,56,57,58,59,74,77,78,82}: reason='Logo, branded promotional graphic, document mockup or interface graphic; excluded.'
    elif id_ in {10,11,12,13,15,16,17,23,28,29,30,31,32,35,37,38,65,67,68,70,73,75,84,85,86,90,91}: reason='Interface screenshot, screen-dominant photo, diagram, inset composite or rendered graphic; excluded.'
    elif id_ in {4,25,39,41,42,80,83,87,88,89,106}: reason='Identifiable people, military context or event/training photography outside the property brief; likeness/third-party permission not established.'
    else: reason='Apparent studio product render or accessory graphic; photographer permission scope uncertain. Representative product candidates retained in unassigned; this variant excluded.'
    item['reason']=reason
(DOCS/'inventory.json').write_text(json.dumps(inventory,indent=2),encoding='utf-8')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
small=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',11)
for start in range(0,len(assets),12):
    group=assets[start:start+12]
    sheet=Image.new('RGB',(1600,((len(group)+3)//4)*320),'#111518')
    draw=ImageDraw.Draw(sheet)
    for j,item in enumerate(group):
        x,y=(j%4)*400,(j//4)*320
        im=ImageOps.contain(Image.open(ROOT/item['filename']).convert('RGB'),(380,210))
        sheet.paste(im,(x+(400-im.width)//2,y))
        name=Path(item['filename']).name
        draw.text((x+10,y+215),name[:46],font=font,fill='white')
        draw.text((x+10,y+237),f"{item['resolution']['width']} x {item['resolution']['height']} | {item['permission_status']}",font=small,fill='#b5d5bf')
        url=item['original_source_url']
        for k in range(0,len(url),60): draw.text((x+10,y+257+(k//60)*14),url[k:k+60],font=small,fill='#a0a9ad')
    sheet.save(DOCS/f'contact-sheet-{start//12+1}.jpg',quality=90)
cards=[]
for item in assets:
    preview=next(d for d in item['derivatives'] if d['format']=='webp')
    cards.append(f'''<article><a href="../../{item['filename']}"><img src="../../{preview['filename']}" alt="{html.escape(Path(item['filename']).stem)}" loading="lazy"></a><h2>{Path(item['filename']).name}</h2><p>{item['resolution']['width']} × {item['resolution']['height']} · {item['file_format']}<br>{item['permission_status']}<br>{item['recommended_website_section']}</p><a href="{item['original_source_url']}">Original source URL</a><p class="url">{item['original_source_url']}</p><a href="{item['source_page']}">Source page</a><p>{item['permission_notes']}</p></article>''')
(DOCS/'contact-sheet.html').write_text('''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sihilo — image contact sheet</title><style>body{background:#101416;color:#eef3f0;font:15px system-ui;padding:32px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px}article{padding:16px;background:#1c2427}img{width:100%;height:220px;object-fit:contain}h2{font-size:17px;overflow-wrap:anywhere}a{color:#c7ff00}.url{overflow-wrap:anywhere;font-size:11px}p{line-height:1.5}</style><h1>Sihilo / Skydio photographic candidates</h1><p>User-reported photographer permission; photographer identity and exact asset scope unverified. Held product renders are excluded from the homepage. Click a photograph for the original file.</p><main>'''+''.join(cards)+'</main></html>',encoding='utf-8')
print(f'Preserved {len(assets)} hash-unique originals; integrated selection: {len(integrated)}')
