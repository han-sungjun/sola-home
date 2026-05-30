from bs4 import BeautifulSoup
from pathlib import Path

ROOT = Path('/mnt/data/work_layer')

def add_classes(tag, classes):
    if not tag: return
    cur = tag.get('class', [])
    for c in classes:
        if c not in cur: cur.append(c)
    tag['class'] = cur

def set_attrs(tag, attrs):
    if not tag: return
    for k,v in attrs.items():
        tag[k] = v

def is_close(el):
    if not getattr(el, 'get', None): return False
    cls = el.get('class', [])
    idv = el.get('id','')
    return el.name == 'button' and (
        'close-btn' in cls or 'gnb-management-close' in cls or 'sheet-close' in cls or 'calendar-day-modal-close' in cls or 'ai-image-zoom-close' in cls or idv.lower().endswith('closebtn') or 'close' in idv.lower()
    )

def is_action(el):
    if not getattr(el, 'get', None): return False
    cls = el.get('class', [])
    return any(c in cls for c in ['detail-head-actions'])

def normalize_header(soup, header, mode='default'):
    if not header or header.get('data-du-header-normalized') == '1': return
    add_classes(header, ['du-layer__header'])
    set_attrs(header, {'data-du-layer-header':'', 'data-du-header-normalized':'1'})
    children = [c for c in list(header.contents) if not (getattr(c,'name',None) is None and str(c).strip()=='')]
    if not children: return
    main = soup.new_tag('div')
    main['class'] = ['du-layer__header-main']
    actions = soup.new_tag('div')
    actions['class'] = ['du-layer__header-actions']
    if mode == 'calendar':
        main['class'].append('du-layer__header-main--calendar')
    header.clear()
    for c in children:
        if getattr(c,'name',None) is None and not str(c).strip():
            continue
        target = actions if (is_close(c) or is_action(c)) else main
        target.append(c)
    # mark title/badge/subtitle inside main
    for badge in main.select('.pill,.gnb-management-kicker'):
        add_classes(badge, ['du-layer__badge'])
    for title in main.select('h2,h3,.sheet-title,#communityEditorTitle,.calendar-day-modal-date'):
        if 'pill' not in title.get('class',[]): add_classes(title, ['du-layer__title'])
    for sub in main.select('p,.sheet-desc'):
        add_classes(sub, ['du-layer__subtitle'])
    for close in actions.find_all('button'):
        if is_close(close):
            add_classes(close, ['du-layer__close'])
            set_attrs(close, {'data-du-layer-close':''})
            if not close.get('aria-label'):
                close['aria-label'] = '닫기'
    header.append(main)
    if actions.contents:
        header.append(actions)

def normalize_app():
    path = ROOT/'app.html'
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    configs = {
        'detailModal':'modal','calendarReservationModal':'modal','calendarDayModal':'modal','noticeModal':'modal',
        'communityEditorModal':'modal','communityDetailModal':'modal','communityReportModal':'modal','qrModal':'modal',
        'settingsSuiteModal':'modal','accountEditModal':'modal','passwordChangeModal':'modal'
    }
    for idv, typ in configs.items():
        layer = soup.find(id=idv)
        if not layer: continue
        add_classes(layer, ['du-layer', f'du-layer--{typ}'])
        set_attrs(layer, {'data-du-layer':typ, 'data-close-on-backdrop':'false','data-du-close-on-backdrop':'false','data-du-close-on-esc':'false'})
        panel = layer.select_one('.upick-div-modal-panel,.upick-div-dialog-panel,.gnb-management-shell') or layer.find(recursive=False)
        add_classes(panel, ['du-layer__panel']); set_attrs(panel, {'data-du-layer-panel':''})
        backdrop = layer.select_one('.upick-div-modal-backdrop')
        add_classes(backdrop, ['du-layer__backdrop']); set_attrs(backdrop, {'data-du-layer-backdrop':''})
        body = layer.select_one('.modal-body,.gnb-management-body,.calendar-day-modal-body')
        add_classes(body, ['du-layer__body']); set_attrs(body, {'data-du-layer-body':''})
        header = layer.select_one('.modal-head,.gnb-management-head,.calendar-day-modal-head')
        normalize_header(soup, header, 'calendar' if idv=='calendarDayModal' else 'default')
    path.write_text(str(soup), encoding='utf-8')

def normalize_index():
    path = ROOT/'index.html'
    soup = BeautifulSoup(path.read_text(encoding='utf-8'), 'html.parser')
    layer = soup.find(id='accountHelpModal')
    if layer:
        add_classes(layer, ['du-layer','du-layer--sheet'])
        set_attrs(layer, {'data-du-layer':'sheet','data-close-on-backdrop':'false','data-du-close-on-backdrop':'false','data-du-close-on-esc':'false'})
        panel = layer.select_one('.sheet-panel')
        add_classes(panel, ['du-layer__panel']); set_attrs(panel, {'data-du-layer-panel':''})
        head = layer.select_one('.sheet-head')
        normalize_header(soup, head, 'default')
        body = layer.select_one('.sheet-body')
        add_classes(body, ['du-layer__body']); set_attrs(body, {'data-du-layer-body':''})
    path.write_text(str(soup), encoding='utf-8')

normalize_app()
normalize_index()
