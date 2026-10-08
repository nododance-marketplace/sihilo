"""Optimize user-supplied website media without modifying the source folder."""
from pathlib import Path
import hashlib, json, subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r'D:\Downloads\SIHILO\New Images')
OUT = ROOT / 'assets/security'
OUT.mkdir(parents=True, exist_ok=True)
assets=[]
for original, name, section in [
    ('Neon Night Security Operations Dashboard.png','sihilo-operations-dashboard','Dashboard concept'),
    ('speaker activation.png','speaker-activation','Sihilo Air'),
    ('Thermal.jpg','thermal-perimeter','Security Intelligence'),
]:
    source=SOURCE/original
    im=Image.open(source).convert('RGB')
    derivatives=[]
    for width in sorted(set(min(im.width,w) for w in [480,768,1280,1600])):
        resized=im.resize((width,round(im.height*width/im.width)),Image.Resampling.LANCZOS)
        for fmt in ['avif','webp']:
            target=OUT/f'{name}-{width}.{fmt}'
            resized.save(target,quality=60 if fmt=='avif' else 82)
            derivatives.append({'file':str(target.relative_to(ROOT)).replace('\\','/'),'width':width,'height':resized.height,'bytes':target.stat().st_size})
    assets.append({'source':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'name':name,'section':section,'width':im.width,'height':im.height,'permission':'User supplied and requested publication; ownership not independently verified.','derivatives':derivatives})
source=SOURCE/'Computer Vision detection.mp4'
target=OUT/'computer-vision-detection.mp4'
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(source),'-an','-vf','scale=1280:-2','-c:v','libx264','-preset','slow','-crf','25','-pix_fmt','yuv420p','-movflags','+faststart',str(target)],check=True)
poster=OUT/'computer-vision-poster.jpg'
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-ss','2','-i',str(target),'-frames:v','1','-q:v','3',str(poster)],check=True)
assets.append({'source':str(source),'sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'name':'computer-vision-detection','section':'Security Intelligence','duration_seconds':7.151,'width':1280,'height':720,'audio':'Removed from web loop; source preserved unchanged.','permission':'User supplied and requested publication; ownership not independently verified.','derivatives':[{'file':str(target.relative_to(ROOT)).replace('\\','/'),'bytes':target.stat().st_size},{'file':str(poster.relative_to(ROOT)).replace('\\','/'),'bytes':poster.stat().st_size}]})
(ROOT/'docs/new-media/manifest.json').write_text(json.dumps({'date':'2026-10-08','assets':assets},indent=2),encoding='utf-8')
print(f'Prepared {len(assets)} assets; video {target.stat().st_size/1024:.0f} KiB (source {source.stat().st_size/1024:.0f} KiB).')
