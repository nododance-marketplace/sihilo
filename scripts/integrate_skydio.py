"""One-time homepage integration from the curated manifest."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
assets={a['id']:a for a in json.loads((ROOT/'public/images/skydio/image-manifest.json').read_text())['assets']}
def picture(id_, alt, sizes, cls='', eager=False):
    a=assets[id_]
    derivatives=a['derivatives']
    def url(d): return '/'+d['filename'].removeprefix('public/')
    def srcset(fmt): return ', '.join(f"{url(d)} {d['width']}w" for d in derivatives if d['format']==fmt)
    fallback=next(d for d in reversed(derivatives) if d['format']=='webp')
    loading='loading="eager" fetchpriority="high"' if eager else 'loading="lazy"'
    return f'''<picture class="{cls}"><source type="image/avif" srcset="{srcset('avif')}" sizes="{sizes}" /><source type="image/webp" srcset="{srcset('webp')}" sizes="{sizes}" /><img src="{url(fallback)}" alt="{alt}" width="{fallback['width']}" height="{fallback['height']}" sizes="{sizes}" {loading} decoding="async" /></picture>'''
path=ROOT/'index.html'
text=path.read_text(encoding='utf-8')
if 'id="air"' in text: raise SystemExit('Integration already applied')
start=text.index('        <video')
end=text.index('        <div class="hero__overlay"',start)
text=text[:start]+'        '+picture('005','','100vw','hero__photo',True)+'\n'+text[end:]
text=text.replace('      <button class="motion-toggle"','      <p class="hero__image-note">Illustrative commercial property &middot; not a Sihilo deployment</p>\n      <button class="motion-toggle"',1)
how='''        <div class="sensor-story reveal">
          <figure class="photo-panel">'''+picture('003','Drone flying beside electrical substation equipment','(max-width: 700px) 90vw, 62vw')+'''<figcaption>Mobile perspective <span>Aerial hardware shown for illustration</span></figcaption></figure>
          <figure class="photo-panel">'''+picture('009','Cluster of fixed security cameras mounted on an outdoor pole','(max-width: 700px) 90vw, 30vw')+'''<figcaption>Fixed observation <span>Start with the site’s existing sensors</span></figcaption></figure>
        </div>
'''
text=text.replace('        <p class="process-line"',how+'        <p class="process-line"',1)
security='''        <figure class="intelligence-photo photo-panel reveal">'''+picture('014','Drone using a downward spotlight beside trees at night','(max-width: 700px) 90vw, 1180px')+'''<figcaption>Another angle when context matters.<span>Illustrative aerial flight. Aerial verification is a Sihilo roadmap capability.</span></figcaption></figure>
'''
text=text.replace('        <div class="architecture reveal"',security+'        <div class="architecture reveal"',1)
air='''    <section class="section section--air" id="air" aria-labelledby="air-title">
      <div class="container feature-split">
        <div class="reveal">
          <p class="kicker">Sihilo Air / roadmap</p>
          <h2 class="section__title" id="air-title">A new perspective.<br /><span class="accent">A clearer decision.</span></h2>
          <p class="section__intro">Some blind spots need a mobile viewpoint. Sihilo Air is our planned approach to bringing aerial verification into the same workflow as cameras and site sensors.</p>
          <p class="air__detail">Hardware selection, operator responsibilities and flight authorization are defined for each site. Aerial operations are not currently offered as a deployed Sihilo service.</p>
          <a class="btn btn--ghost" href="#contact">Discuss Your Site’s Coverage</a>
        </div>
        <figure class="photo-panel air__photo reveal">'''+picture('018','Close-up of a drone in flight against a cloudy sky','(max-width: 700px) 90vw, 560px')+'''<figcaption>Aerial perspective <span>Third-party hardware shown for illustration.</span></figcaption></figure>
      </div>
      <p class="container section__footnote">Sihilo develops the intelligence layer, not the aircraft. Imagery does not indicate hardware ownership, a confirmed integration or a hardware partnership.</p>
    </section>

'''
text=text.replace('    <section class="section section--edge"',air+'    <section class="section section--edge"',1)
for num,id_,alt in [('01','051','Rows of vehicles in an outdoor inventory lot'),('02','052','Commercial building under construction with an elevated work platform'),('03','045','Shipping containers lining an outdoor storage yard'),('04','050','Aerial view of a large industrial property and surrounding parking areas')]:
    marker=f'<li class="coverage__card reveal"><span class="coverage__idx">{num}</span>'
    text=text.replace(marker,f'<li class="coverage__card reveal">'+picture(id_,alt,'(max-width: 520px) 90vw, (max-width: 1020px) 42vw, 280px','coverage__photo')+f'<span class="coverage__idx">{num}</span>',1)
text=text.replace('    <section class="section section--privacy"','    <p class="container section__footnote photo-disclosure">Property photographs illustrate site types; they are not Sihilo customer locations.</p>\n\n    <section class="section section--privacy"',1)
cta='''    <section class="section section--closing" aria-labelledby="closing-title">
      <div class="container closing__grid">
        <figure class="photo-panel closing__photo reveal">'''+picture('076','Commercial property and surrounding landscape at dusk','(max-width: 700px) 90vw, 650px')+'''<figcaption>When the day ends, the questions don’t.<span>Illustrative property at dusk.</span></figcaption></figure>
        <div class="reveal"><p class="kicker">Start with the blind spots</p><h2 class="section__title" id="closing-title">What happens<br /><span class="accent">after hours?</span></h2><p class="section__intro">Let’s map the gaps in your property’s coverage and define a practical first step.</p><a class="btn btn--neon" href="#contact">Request a Site Assessment</a></div>
      </div>
    </section>

'''
text=text.replace('    <section class="section section--contact"',cta+'    <section class="section section--contact"',1)
text=text.replace('<a href="#coverage">Coverage</a>\n        <a href="#pilot">','<a href="#coverage">Coverage</a>\n        <a href="#air">Sihilo Air</a>\n        <a href="#pilot">')
path.write_text(text,encoding='utf-8')
print('Integrated 10 photographs across six placements')
