import csv,html,re,time,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
root=Path(r'F:/AI观鸟助手/外挂数据库/鸟类研究文献')
index=root/'文献索引.csv'
with index.open(encoding='utf-8-sig',newline='') as f: rows=list(csv.DictReader(f))
for row in rows:
    if row['状态']=='成功': continue
    pmcid=row['PMCID']
    url=f'https://www.ebi.ac.uk/europepmc/webservices/rest/{pmcid}/fullTextXML'
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'BirdResearchCollector/1.0'})
        raw=urllib.request.urlopen(req,timeout=35).read()
        tree=ET.fromstring(raw)
        bodynode=tree.find('.//body')
        if bodynode is None: raise ValueError('no full-text body')
        body='\n\n'.join(' '.join(''.join(p.itertext()).split()) for p in bodynode.iter('p'))
        if len(body)<3000: raise ValueError(f'too short: {len(body)}')
        safe=re.sub(r'[<>:"/\\|?*]','',row['中文鸟名']+'_'+row['内容主题'])
        path=root/(safe+'.txt')
        header=f"中文鸟名：{row['中文鸟名']}\n文献标题：{html.unescape(row['英文题名'])}\nDOI：{row['DOI']}\nPMCID：{pmcid}\n全文来源：https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/\n下载日期：2026-11-02\n说明：开放获取论文的全文文本，保留原文语言；论文研究地区不一定是深圳。\n\n"
        path.write_text(header+body,encoding='utf-8')
        row['本地文件']=str(path);row['字数']=str(len(body));row['状态']='成功'
        row['全文接口']=url
        print('OK',pmcid,len(body),flush=True)
    except Exception as e: print('FAIL',pmcid,e,flush=True)
    time.sleep(0.5)
with index.open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.DictWriter(f,fieldnames=rows[0].keys());w.writeheader();w.writerows(rows)
