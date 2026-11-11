import os
HERE=os.path.dirname(os.path.abspath(__file__))
SRC=os.path.join(HERE,'fragments')+'/'
DIST=os.path.join(HERE,'dist')+'/'
import re
cur=open(SRC+'index_v2.7.html').read()
sa=open(SRC+'sa/sa.html').read()
v20=open(SRC+'index_v2.0.html').read()
def sect(s,sid):
    a=s.index(f'<section class="sec" id="{sid}"'); b=s.index('</section>',a)+len('</section>'); return s[a:b]
sa_html='\n'.join(sect(sa,x) for x in ['works','api','workflow','others'])
for n in '123': sa_html=sa_html.replace(f'<article class="case" aria-labelledby="c{n}">',f'<article class="case" id="sa-c{n}" aria-labelledby="c{n}">').replace(f'href="#c{n}"',f'href="#sa-c{n}"')
sa_html=sa_html.replace('href="#course"','href="#latest"')
a=sa_html.index('<div class="oc">'); b=sa_html.index('<div class="oc">',a+5); sa_html=sa_html[:a]+sa_html[b:]
c1=sect(v20,'case1'); c2=sect(v20,'case2')
def drop_step(sec,sid):
    a=sec.index(f'<article class="step" id="{sid}">'); b=sec.index('</article>',a)+len('</article>')
    sec=sec[:a]+sec[b:]
    return re.sub(r'<a href="#'+sid+r'"><b>\d+</b>[^<]*</a>','',sec)
c1=drop_step(c1,'c1-s4');
_tm=c1.index('<article class="step" id="c1-s3">'); c1=c1[:_tm]+open(SRC+'tm_step.html').read()+c1[_tm:]
c1=re.sub(r'(<a href="#c1-s3">)',r'<a href="#c1-tm"><b>00</b> 測試機預約表</a>\1',c1,count=1)
_a=c1.index('<h4 class="eh">進度長這樣'); _b=c1.index('</details>',_a)+len('</details>'); c1=c1[:_a]+'<p class="note">實際的排程與進度畫面，請看上一項的專案管理工具。</p>'+c1[_b:]
tool_step='''<article class="step" id="c1-tool">
      <div class="step-h"><span class="sn">00</span><h3>自製專案管理工具：Excel → 網頁版</h3><span class="tagl p">專案管理</span></div>
      <p class="how">兩條產品線同時開發，原本用自己設計的 Excel 管專案，但很難看出每個人目前的工作量，開會時也要花時間逐一查任務進度。我在這份工作中，運用 AI 協作（Codex）把它做成網頁版工具。</p>
      <div class="toolrow"><a class="shot tshot" href="https://rsg-project-plan.lazyer1016.chatgpt.site/" aria-label="開啟專案管理工具"><img src="img/project-plan.webp" alt="專案管理工具的甘特時程畫面" loading="lazy"></a>
      <div class="toolb"><ul><li>用 Epic 與任務拆解專案</li><li>排程直接在甘特圖上編輯</li><li>人力負荷與進度一眼看清</li></ul><a class="btn" href="https://rsg-project-plan.lazyer1016.chatgpt.site/">開啟專案管理工具</a></div></div>
    </article>
    '''
_i=c1.index('<article class="step"'); c1=c1[:_i]+tool_step+open(SRC+'wf_step.html').read()+c1[_i:]
c1=re.sub(r'(<nav class="steps-toc".*?<span>[^<]*</span>)',r'\1<a href="#c1-tool"><b>00</b> 自製專案管理工具</a><a href="#c1-flow"><b>00</b> 釐清工作流程</a>',c1,count=1,flags=re.S)
c2=drop_step(drop_step(c2,'case2-s1'),'case2-s2')
def renum(sec):
    n=[0]
    def r(m): n[0]+=1; return f'<span class="sn">{n[0]:02d}</span>'
    sec=re.sub(r'<span class="sn">\d+</span>',r,sec)
    k=[0]
    def r2(m): k[0]+=1; return f'<b>{k[0]:02d}</b>'
    nav=re.search(r'<nav class="steps-toc".*?</nav>',sec,re.S)
    if nav:
        nn=re.sub(r'<b>\d+</b>',r2,nav.group(0)); nn=re.sub(r'分 ?[\d一二三四五六] ?件事',f'分 {k[0]} 件事',nn)
        sec=sec.replace(nav.group(0),nn)
    return sec
c1=renum(c1).replace('<section class="sec" id="case1"','<section class="sec pmcase" id="case1"')
c2=renum(c2).replace('<section class="sec" id="case2"','<section class="sec pmcase" id="case2"')
c2=c2.replace('<p class="sub">','<p class="sub"><span class="xref">規格面請見「系統分析」分頁 <a href="#sa-c3">CASE 03 平台營運後台</a></span>',1)
c1=re.sub(r'CASE 0\d','PM 01',c1,count=1); c2=re.sub(r'CASE 0\d','PM 02',c2,count=1)
tool='''  <section class="sec pmcase" id="pm-tool" aria-labelledby="pm-tool-h">
    <div class="case-h"><div><span class="id">PM 03</span><h2 id="pm-tool-h">專案管理工具：Excel → 網頁版</h2><p class="sub">自建工具｜AI 協作（Codex）</p></div>
    <div class="mine"><small>為什麼做</small><b>看不到人力負荷</b><p>原本用自己設計的 Excel 管專案，但很難看出每個人目前的工作量，開會時也要花時間逐一查任務進度。</p></div></div>
    <div class="toolrow"><a class="shot tshot" href="https://rsg-project-plan.lazyer1016.chatgpt.site/" aria-label="開啟專案管理工具"><img src="img/project-plan.webp" alt="專案管理工具的甘特時程畫面" loading="lazy"></a>
    <div class="toolb"><ul><li>用 Epic 與任務拆解專案</li><li>排程直接在甘特圖上編輯</li><li>人力負荷與進度一眼看清</li></ul><a class="btn" href="https://rsg-project-plan.lazyer1016.chatgpt.site/">開啟專案管理工具</a></div></div>
  </section>'''
pm_intro='''  <div class="sec-h pm-intro"><span class="eyebrow">Project Management</span><h2>專案管理：兩個專案</h2><p>安特的機台＋線上 SLOT 開發（含我在這份工作中自製的專案管理工具），以及日本分公司營運後台的跨國分期交付。</p></div>'''
pm_html=c1+'\n'+c2
ca=cur.index('<div class="course-wrap" id="course">'); cb=cur.index('</section>',ca)
course=cur[ca:cb]
head=cur[:cur.index('<body>')+len('<body>')]
xp=[('l','01','頭｜把需求想清楚','訪談需求 → 功能架構 → 規格','#works','sa','head'),
    ('l','03','右手｜把規格做成系統','規格交給 AI 實作，我驗收','#workflow','ai','rarm'),
    ('r','02','左手｜把規則畫出來','泳道圖、介接規則、原型','#api','sa','larm'),
    ('r','04','嘴｜把團隊對齊','例會、三地週會、需求評審','#case2','pm','mouth'),
    ('r','05','雙腳｜把進度推到上線','WBS、發版關卡、評鑑送審','#case1','pm','feet')]
def xcard(no,t,d,h,l,k):
    return f'<a class="xp {l}" href="{h}" data-k="{k}"><span class="xp-p">{no}</span><span class="xp-t"><b>{t}</b></span><span class="xp-d">{d}</span></a>'
DOTS={'head':(22,9),'mouth':(79,31),'rarm':(13,66),'larm':(88,66),'feet':(50,102)}
dots=''.join(f'<a class="dot {x[5]}" data-k="{x[6]}" href="{x[4]}" aria-label="{x[2]}" style="left:{DOTS[x[6]][0]}%;top:{DOTS[x[6]][1]}%"></a>' for x in xp)
L=''.join(xcard(*x[1:]) for x in xp if x[0]=='l')
R=''.join(xcard(*x[1:]) for x in xp if x[0]=='r')
latest='<div class="latestgrp"><button class="xp latest" type="button" id="openLatest"><span class="newb">NEW</span><span class="xp-t"><b>最新經歷</b><i>2026/09 起</i></span><span class="xp-d">AI 人才培訓班專題：專題統籌・提報主講</span><span class="go">看專題內容 →</span></button>'+open(SRC+'cert_badge.html').read()+'</div>'
body=open(SRC+'body3.html').read()
for k,v in [('DOTS',dots),('L',L),('R',R),('LATEST',latest),('SA',sa_html),('PM',pm_html),('COURSE',course)]: body=body.replace('%%'+k+'%%',v)
extra=open(SRC+'extra3.css').read()
scoped=open(SRC+'sa/sa_scoped.css').read()
out=head.replace('</style>',extra+'\n'+scoped+'</style>',1)+body
_r1='十一、十三、十六合一三種機台版本均通過評鑑'; assert _r1 in out
out=out.replace(_r1,'三次機台評鑑申請均通過經濟部審查')
_r2='<span>十一合一 通過</span><span>十三合一 通過</span><span>十六合一 通過</span>'; assert _r2 in out
out=out.replace(_r2,'<span>三次評鑑申請 均通過經濟部審查</span>')
_r3='參與機台 V1–V17 版本進測與複驗'; assert out.count(_r3)==2
out=out.replace(_r3,'管理 17 次機台版本更新的進測與複驗')
_r4='用 WBS 把上、下半年開發項目拆成 Epic／Task 排進甘特圖；把發版固定成有關卡的輪次；主持進度同步例會，把議題追到結論；接手送審後查證要求、重建流程。'; assert _r4 in out
out=out.replace(_r4,'WBS 拆解排程、發版設關卡、主持進度例會、重建送審流程。')
# ---- V3.12 restructure ----
import re as _re
def _cut(src, sid):
    a=src.index(f'<article class="step" id="{sid}">'); b=src.index('</article>',a)+len('</article>')
    return src[:a]+src[b:], src[a:b]
# 1) drop separate test-machine step (merged into 版本穩定上線)
out,_tm=_cut(out,'c1-tm')
# 2) merge: replace 版本穩定上線 details with test-machine subsection
_a=out.index('<details class="more">',out.index('<article class="step" id="c1-s2">')); _b=out.index('</details>',_a)+len('</details>')
out=out[:_a]+out[_b:]
_e=out.index('</article>',out.index('<article class="step" id="c1-s2">'))+len('</article>')
out=out[:_e]+'\n    '+open(SRC+'tm_step2.html').read()+out[_e:]
out=out.replace('<a href="#c1-tm"><b>05</b> 測試機預約表</a>','')
out=out.replace('<a href="#c1-s3"><b>06</b> 機台合法出貨</a>','<a href="#c1-s3"><b>06</b> 機台合法出貨</a>')
# merge 進度看得見 into the tool step
out,_s1=_cut(out,'c1-s1')
_r3a=_s1.index('<div class="roles3">'); _r3b=_s1.index('</div>\n      </div>',_r3a)+len('</div>\n      </div>')
_roles=_s1[_r3a:_r3b].replace('13 次進度同步例會','13 次進度同步例會')
_te=out.index('</article>',out.index('<article class="step" id="c1-tool">'))
out=out[:_te]+'  '+_roles+'\n    '+out[_te:]
out=out.replace('<h3>自製專案管理工具：Excel → 網頁版</h3>','<h3>讓兩條產品線的進度看得見：自製專案管理工具</h3>')
out=_re.sub(r'<a href="#c1-s1"><b>\d+</b> 進度看得見</a>','',out)
out=out.replace('<a href="#c1-tool"><b>01</b> 自製專案管理工具</a>','<a href="#c1-tool"><b>01</b> 進度看得見＋專案管理工具</a>')
out=_re.sub(r'(<a href="#c1-s2"><b>\d+</b> 版本穩定上線</a>)',r'\1<a href="#c1-tm"><b>00</b> 測試機排程</a>',out,count=1)
# 3) move 機台合法出貨 to first
out,_s3=_cut(out,'c1-s3')
_s3=_s3.replace('<h3>讓機台合法出貨</h3>','<h3>讓機台合法出貨：向經濟部申請評鑑</h3>')
_s3=_s3.replace('接手時沒有交接資料，我逐項向主管機關查證要求，畫成四個階段的泳道流程，含補件與未通過重送的分支。',
 '機台要先通過<b>經濟部商業發展署</b>的電子遊戲機評鑑，再由<b>經濟部標準檢驗局</b>檢驗貼證，才能出貨到門市。接手時沒有交接資料，我逐項向主管機關查證要求，畫成四個階段的泳道流程，含補件與未通過重送的分支。')
_i=out.index('</article>',out.index('<article class="step" id="c1-tool">'))+len('</article>'); out=out[:_i]+'\n    '+_s3+out[_i:]
out=out.replace('<a href="#c1-s3"><b>06</b> 機台合法出貨</a>','')
out=out.replace('<span>這個案例分 6 件事看：</span>','<span>這個案例分 5 件事看：</span>').replace('<a href="#c1-flow">','<a href="#c1-s3"><b>00</b> 機台合法出貨</a><a href="#c1-flow">',1)
_toc=_re.search(r'<nav class="steps-toc" aria-label="案例 01.*?</nav>',out,_re.S).group(0)
_k=[0]
def _rn(m): _k[0]+=1; return f'<b>{_k[0]:02d}</b>'
out=out.replace(_toc,_re.sub(r'<b>\d+</b>',_rn,_toc))
_c1a=out.index('<section class="sec pmcase" id="case1"'); _c1b=out.index('</section>',_c1a)
_n=[0]
def _rs(m): _n[0]+=1; return f'<span class="sn">{_n[0]:02d}</span>'
out=out[:_c1a]+_re.sub(r'<span class="sn">\d+</span>',_rs,out[_c1a:_c1b])+out[_c1b:]
out=out.replace('三次機台評鑑申請均通過經濟部審查','三次機台評鑑申請均通過經濟部商業發展署審查')
out=out.replace('<span>三次評鑑申請 均通過經濟部審查</span>','<span>三次評鑑申請 均通過經濟部商業發展署審查</span>')
out=out.replace('機台版本要過多輪測試和政府評鑑才能出貨','機台版本要過多輪測試和經濟部評鑑才能出貨')
# 4) PM 02: remove spec button, drop launch date
_btn='<a class="btn" href="https://drive.google.com/drive/folders/1MjLGHZaVC6dcilwjchDh2x1jsvvbufGU">看原始規格（資料夾）</a>'
assert _btn in out; out=out.replace(_btn,'')
_old='<b>2/26 正式上線</b><span class="note">四期合併成 1.6.0 避開春節上線；離職前把進測流程整理成 SOP 交接</span>'
assert _old in out
out=out.replace(_old,'<b>排程避開節慶假日</b><span class="note">四期合併成一版送測上線，時程避開節慶假日；離職前把進測流程整理成 SOP 交接</span>')
# ---- V3.13 ----
# PM 02 naming
out=_re.sub(r'(?<!平台)營運後台','平台營運後台',out)
# Works: drop stats; move 我的工作方式 above CASE 01; drop 其他作品
_a=out.index('<div class="stats">'); _b=out.index('</div>',out.index('100/100',_a)); _b=out.index('</div>',_b+6)+6
out=out[:_a]+out[_b:]
_wa=out.index('<section class="sec" id="workflow"'); _wb=out.index('</section>',_wa)+len('</section>')
_wf=out[_wa:_wb]; out=out[:_wa]+out[_wb:]
_wf=_wf.replace('<section class="sec" id="workflow"','<div class="wf-in" id="workflow" role="region"',1)
_wf=_wf[:-len('</section>')]+'</div>'
_ci=out.index('<!-- CASE 01 -->'); out=out[:_ci]+_wf+'\n    '+out[_ci:]
_oa=out.index('<section class="sec" id="others"'); _ob=out.index('</section>',_oa)+len('</section>'); out=out[:_oa]+out[_ob:]
# unified fold: SA api details -> fold
_da=out.index('<details',out.index('<section class="sec" id="api"')); _ds=out.index('</summary>',_da)+len('</summary>'); _de=out.index('</details>',_ds)
out=out[:_da]+'<div class="fold" data-open="展開完整規格：介接循序圖與介接規格表" data-close="收起完整規格"><div class="foldc">'+out[_ds:_de]+'</div></div>'+out[_de+len('</details>'):]
# tool: key points next to half-width screenshot
out=out.replace('<li>用 Epic 與任務拆解專案</li><li>排程直接在甘特圖上編輯</li><li>人力負荷與進度一眼看清</li>',
 '<li><b>Epic／Task 拆解</b>：兩條產品線、66 個開發項目分機台與線上管理</li><li><b>甘特圖直接排程</b>：日期在圖上調整，自動扣除假日算工作天</li><li><b>人力負荷一眼看清</b>：「專案人力」「人員時程」看每個人同時負責幾個專案</li><li><b>Excel 匯入匯出</b>：沿用原本的試算表格式，不必重打</li>')
# ---- V3.15 SA edits ----
out=out.replace('日本平台營運後台','平台營運後台')
_wh=out.index('<div class="works-h">'); _we=out.index('<div class="wf-in"',_wh)
out=out[:_wh]+out[_we:]
_o='規格完整到 AI 能直接照著開發：完整版系統 API 70/70、端對端 30/30 測試通過；開發中發現的規格問題全部回寫 SRS。'; assert _o in out
out=out.replace(_o,'規格完整到 AI 能直接照著開發。')
_o='向主管訪談業務需求，整理成 5 大模組的功能架構；整合外部廠商手冊與既有產品，寫出各頁規格。之後用 AI 逐條審查其中 3 頁規格並改版。'; assert _o in out
out=out.replace(_o,'向主管訪談業務需求，整理成 5 大模組的功能架構；整合外部廠商手冊與既有產品，寫出各頁規格。')
_da=out.index('<div class="dec"><small>規格取捨</small>'); _da=out.rindex('<div class="wide">',0,_da); _db=out.index('</div>',out.index('</p>',_da))+6; _db=out.index('</div>',_db)+6
out=out[:_da]+out[_db:]
_o='<div class="change"><b>AI 帶來的改變</b><span>・62 項問題全部有結論，才寫成正式規格</span><span>・統一用語，避免同一個代號指兩件事</span></div>'; assert _o in out
out=out.replace(_o,'<div class="change"><b>AI 帶來的改變</b><span>・用舊作品做的 AI 協作練習：規格是我當時在工作中寫完的，事後才交給 AI 逐條討論邏輯</span><span>・討論出的 62 項問題逐一定案後，改版成 V6</span><span>・統一用語，避免同一個代號指兩件事</span></div>')
# API: compact rules -> one line visible, details into the fold
_ra=out.index('<h4>會議中確認的規則與例外情境</h4>'); _ra=out.rindex('<div class="wide">',0,_ra)
_rb=out.index('<div class="fold"',_ra)
_rules=out[_ra:_rb]
out=out[:_ra]+out[_rb:]
_fc=out.index('<div class="foldc">',out.index('<section class="sec" id="api"'))+len('<div class="foldc">')
out=out[:_fc]+_rules+out[_fc:]
out=out.replace('data-open="展開完整規格：介接循序圖與介接規格表"','data-open="展開完整規格：例外規則、資料流向與介接規格表"')
# ---- V3.16: drop detailed integration content (rules, sequence, spec table) ----
_aa=out.index('<section class="sec" id="api"'); _ab=out.index('</section>',_aa)
_af=out.index('<div class="fold"',_aa); assert _af<_ab
out=out[:_af]+out[_ab:]
# ---- V3.17: integration role flow ----
_ca=out.index('<div class="caps">',out.index('<section class="sec" id="api"'))
_cb=out.index('<div class="mf-n">外部遊戲平台</div>',_ca); _cb=out.index('</div>',_cb+30)+6
out=out[:_ca]+open(SRC+'api_flow.html').read()+out[_cb:]
out=out.replace('我負責釐清三方的資料流向、團隊分工與例外規則，召集會議逐條確認待釐清問題，整理成開發與測試的依據；實際串接由後端工程師實作。','我的角色是把三方要怎麼接講清楚，實際串接由後端工程師實作。')
# ---- V3.18: move integration to PM 01 ----
_ei=out.index('</article>',out.index('<article class="step" id="c1-flow">'))+len('</article>')
out=out[:_ei]+'\n    '+open(SRC+'api_step.html').read()+out[_ei:]
out=_re.sub(r'(<a href="#c1-flow"><b>\d+</b> 釐清工作流程</a>)',r'\1<a href="#c1-api"><b>00</b> 三方系統介接</a>',out,count=1)
out=out.replace('這個案例分 5 件事看：','這個案例分 6 件事看：')
_toc=_re.search(r'<nav class="steps-toc" aria-label="案例 01.*?</nav>',out,_re.S).group(0)
_k=[0]
def _rn2(m): _k[0]+=1; return f'<b>{_k[0]:02d}</b>'
out=out.replace(_toc,_re.sub(r'<b>\d+</b>',_rn2,_toc))
_c1a=out.index('<section class="sec pmcase" id="case1"'); _c1b=out.index('</section>',_c1a)
_n=[0]
def _rs2(m): _n[0]+=1; return f'<span class="sn">{_n[0]:02d}</span>'
out=out[:_c1a]+_re.sub(r'<span class="sn">\d+</span>',_rs2,out[_c1a:_c1b])+out[_c1b:]
# ---- V3.19: PM 02 phased delivery story ----
_rep=[
 ('從 0 到 1 開發平台營運後台，沒有舊系統可參考；代理與玩家之間的點數流向複雜，開發、QA 分散在三個地區。',
  '從 0 到 1 開發平台營運後台，老闆要求的上線時間很短，所有頁面一次做完，工程團隊來不及；開發、QA 又分散在三個地區。'),
 ('把主管口述的業務需求整理成功能架構，再寫成各頁規格；把後台拆成多期交付，非核心功能延後；用工序表與週會追蹤三地進測。',
  '和主管折衷改為分期上線：依每期目標規劃範疇、寫成規格，先讓廠商用得到，再逐期補齊；用工序表與週會追蹤三地進測。'),
 ('規格成為開發與驗收依據；各期需求經需求評審後交付研發，1.3–1.6 期合併為一版送測上線；離職前把進測流程整理成 SOP 完成交接。',
  '各期分開開發、分開送測、分開上線，在時限內先交付可用的版本，並依回饋調整後續範疇；離職前把進測流程整理成 SOP 完成交接。'),
 ('依優先序把後台拆成三個階段：先上線能營運的核心，再逐期補齊，非必要功能往後排或不做。',
  '主管折衷決定分期上線，我依每期的目標規劃範疇，各期分開開發、送測、上線：'),
 ('<h3>拆成多期交付，首期只做核心功能</h3>','<h3>拆成多期交付，先讓廠商用得到</h3>'),
 ('<span class="note">四期合併成一版送測上線，時程避開節慶假日；離職前把進測流程整理成 SOP 交接</span>',
  '<span class="note">各期分開送測、分開上線，時程避開節慶假日；離職前把進測流程整理成 SOP 交接</span>'),
]
for _o,_n in _rep:
    assert _o in out, _o[:20]
    out=out.replace(_o,_n)
_pa=out.index('<div class="phases p3">'); _pb=out.index('</div>\n      </div>',_pa)+len('</div>\n      </div>')
out=out[:_pa]+"""<ol class="pflow" aria-label="分期上線的三個階段">
        <li><span class="pf-no">第一期</span><span class="pf-verb">先把資料建起來</span><b>用戶資料與營運數據頁面</b><span>營運需要的資料與數據先能查</span></li>
        <li><span class="pf-no">第二期</span><span class="pf-verb">先讓廠商用得到</span><b>串入遊戲＋遊戲入口</b><span>前端同步做遊戲入口，讓廠商先給用戶使用、收集回饋</span></li>
        <li class="pf-out"><span class="pf-no">後續各期</span><span class="pf-verb">補齊管理功能</span><b>用戶管理、上下分等</b><span>依回饋調整範疇，逐期上線</span></li>
      </ol>
      <div class="pf-loop"><span>↺ 每期分開開發、送測、上線；廠商回饋帶進下一期的規劃</span></div>"""+out[_pb:]
_c2=out.index('<article class="step" id="case2-s4">'); _ra=out.index('<div class="roles3">',_c2); _rb=out.index('</div>\n      </div>',_ra)+len('</div>\n      </div>')
out=out[:_ra]+"""<ol class="pflow" aria-label="三地進測的推進方式">
        <li><span class="pf-no">01</span><span class="pf-verb">需求評審</span><b><em>9</em> 場評審後才交研發</b><span>各期需求逐場確認，再進開發</span></li>
        <li><span class="pf-no">02</span><span class="pf-verb">進度追蹤</span><b>工序表＋產品週會</b><span>每個功能逐格更新狀態，週會追三地的進測與修正</span></li>
        <li class="pf-out"><span class="pf-no">03</span><span class="pf-verb">上線與交接</span><b>分期上線，留下 SOP</b><span>各期分開送測、上線，時程避開節慶假日；離職前把進測流程整理成 SOP 交接</span></li>
      </ol>"""+out[_rb:]
# ---- V3.23: SA CASE 03 feature architecture as Mermaid ----
_fa=out.index('<div class="fa">'); _fb=out.index('<p class="note">由主管口述業務需求',_fa)
out=out[:_fa]+'<div class="fold" data-open="展開完整功能架構" data-close="收起功能架構"><div class="foldc fawrap">'+open(SRC+'fa_svg.html').read()+'</div></div>\n        '+out[_fb:]
out=out.replace('（原為 XMind，此處只列到第二層）；橘框為下方展示的 3 頁規格。','（原為 XMind，此處以 Mermaid 重繪、只列到第二層）；橘框為上方展示的 3 頁規格。')
# ---- V3.27: certificate lightbox ----
_certdlg="""<dialog class="certdlg" id="certdlg" aria-label="國際 AI 證照證書"><button class="dclose" type="button" id="certclose" aria-label="關閉">×</button><img src="img/cert-genai.webp" alt="Pearson Generative AI Foundations 證書，2026 年 10 月 30 日頒發給許丹合" width="1210" height="935"></dialog>
<script>(function(){var d=document.getElementById('certdlg'),o=document.getElementById('openCert');if(!d||!o)return;o.addEventListener('click',function(e){e.stopPropagation();try{d.showModal()}catch(err){d.setAttribute('open','')}});document.getElementById('certclose').addEventListener('click',function(){d.close()});d.addEventListener('click',function(e){if(e.target===d)d.close()});})();</script>"""
out=out.replace('</body>',_certdlg+'\n</body>',1)
_foldjs="""<script>(function(){var ic='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6l5 5 5-5"/></svg>';[].forEach.call(document.querySelectorAll('.fold'),function(f,i){var c=f.querySelector('.foldc');if(!c.id)c.id='foldc'+i;var b=document.createElement('button');b.type='button';b.className='foldbtn';b.setAttribute('aria-expanded','false');b.setAttribute('aria-controls',c.id);b.innerHTML=ic+'<span></span>';var t=b.querySelector('span');t.textContent=f.getAttribute('data-open');f.appendChild(b);b.addEventListener('click',function(){var o=f.classList.toggle('open');b.setAttribute('aria-expanded',o);t.textContent=f.getAttribute(o?'data-close':'data-open');if(!o)f.scrollIntoView({block:'nearest'});});});})();</script>"""
out=out.replace('</body>',_foldjs+'\n</body>',1)

# ---- V3.29: copy contact on click (mailto/tel blocked in artifact frame) ----
_cpjs="""<script>(function(){function cp(t){if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(t).catch(function(){fb(t)})}fb(t);return Promise.resolve()}function fb(t){var a=document.createElement('textarea');a.value=t;a.style.position='fixed';a.style.opacity='0';document.body.appendChild(a);a.select();try{document.execCommand('copy')}catch(e){}document.body.removeChild(a)}[].forEach.call(document.querySelectorAll('.ct .cp'),function(b){b.addEventListener('click',function(){cp(b.getAttribute('data-v'));b.classList.add('done');clearTimeout(b._t);b._t=setTimeout(function(){b.classList.remove('done')},1600)})})})();</script>"""
out=out.replace('</body>',_cpjs+'\n</body>',1)

# ---- V3.30: PM workflow at top of PM tab ----
_pmw=open(SRC+'pm_wf.html',encoding='utf-8').read()
_k='<div id="tab-pm">'
assert out.count(_k)==1
out=out.replace(_k,_k+'\n'+_pmw,1)
out=out.replace('</style>',open(SRC+'pmwf.css',encoding='utf-8').read()+'\n</style>',1)

# ---- V3.32: course dialog cert naming ----
out=out.replace('<span>Generative AI Foundations（Taiwan）</span><span class="note">Critical Career Skills｜2026/10/30</span>','<span>Generative AI Foundations 國際認證</span><span class="note">Pearson／Certiport｜2026/10/30</span>')
out=out.replace('</style>',open(SRC+'pitch.css',encoding='utf-8').read()+'\n</style>',1)

# ---- V3.40: PM02 四期＋產能滿載 ----
for _o,_n in [('老闆要求的上線時間很短，所有頁面一次做完，工程團隊來不及；','老闆要求的上線時間很短，工程師產能又已滿載，所有頁面一次做完來不及；'),('和主管折衷改為分期上線：','和主管折衷改為四期分批上線：'),('主管折衷決定分期上線，我依每期的目標規劃範疇','主管折衷決定分四期上線，我依每期的目標規劃範疇'),('<span class="pf-no">後續各期</span>','<span class="pf-no">第三、四期</span>'),('aria-label="分期上線的三個階段"','aria-label="分四期上線"')]:
    assert _o in out, _o
    out=out.replace(_o,_n)

# ---- V3.40b: tool links -> Claude artifact (kept from live edit) ----
out=out.replace('href="https://rsg-project-plan.lazyer1016.chatgpt.site/"','href="https://claude.ai/artifact/KWjMXi4oL8NetBDyGARKTY" target="_blank" rel="noopener"')

# ---- V3.41: resume viewer (104 PDFs) ----
_cvsep='<span aria-hidden="true">｜</span><button type="button" class="opencv" data-cv="sa">看履歷</button>'
_heroct='<button type="button" class="cp" data-v="0970081208" title="點一下複製電話">0970-081-208</button></span></div>'
assert out.count(_heroct)==1
out=out.replace(_heroct,'<button type="button" class="cp" data-v="0970081208" title="點一下複製電話">0970-081-208</button>'+_cvsep+'</span></div>')
_hk='<small>點一下複製</small></p>'
assert out.count(_hk)==1
out=out.replace(_hk,_hk+'\n    <p class="hire-cv"><button type="button" class="btn opencv" data-cv="sa">看履歷（系統分析版／專案管理版）</button></p>')
out=out.replace('</body>',open(SRC+'cv_dlg.html',encoding='utf-8').read()+'\n</body>',1)
out=out.replace('</style>',open(SRC+'cv.css',encoding='utf-8').read()+'\n</style>',1)
open(DIST+'index.html','w').write(out)
print(len(out))
