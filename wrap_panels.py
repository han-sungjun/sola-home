from bs4 import BeautifulSoup
from pathlib import Path
ROOT=Path('/mnt/data/work_layer')
path=ROOT/'app.html'
soup=BeautifulSoup(path.read_text(encoding='utf-8'),'html.parser')
ids=['calendarDayModal','qrModal','communityEditorModal','communityDetailModal','communityReportModal']
for idv in ids:
    layer=soup.find(id=idv)
    if not layer: continue
    if layer.find(class_='upick-div-dialog-panel', recursive=False):
        continue
    panel=soup.new_tag('div')
    panel['class']=['upick-div-dialog-panel','du-layer__panel']
    panel['data-du-layer-panel']=''
    panel['role']='document'
    # move all direct children into panel
    children=list(layer.contents)
    layer.clear()
    for c in children:
        if getattr(c,'name',None) is None and not str(c).strip():
            continue
        if getattr(c,'attrs',None):
            cls=c.get('class',[])
            # remove mistaken panel marker from header/body
            if 'du-layer__panel' in cls and ('modal-head' in cls or 'calendar-day-modal-head' in cls):
                cls=[x for x in cls if x!='du-layer__panel']
                c['class']=cls
                c.attrs.pop('data-du-layer-panel',None)
        panel.append(c)
    layer.append(panel)
path.write_text(str(soup),encoding='utf-8')
