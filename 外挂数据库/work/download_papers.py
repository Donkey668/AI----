import csv, html, json, re, time, urllib.request, xml.etree.ElementTree as ET
from pathlib import Path

root=Path(r'F:/AI观鸟助手/外挂数据库/鸟类研究文献')
root.mkdir(exist_ok=True)
candidates=[json.loads(x) for x in Path('work/candidates.jsonl').read_text(encoding='utf-8-sig').splitlines() if x.strip()]
chosen=[0,2,3,4,5,8,9,10,12,14,16,21,22,23,25,26,28,29,31,32,37,38,40]
topics={0:'越冬水鸟调查',2:'携带细菌与健康',3:'繁殖栖息地',4:'越冬地食性',5:'非繁殖季栖息地',8:'迁移行为',9:'迁徙网络关键节点',10:'气候变化与栖息地',12:'觅食行为',14:'觅食移动与栖息地',16:'飞行能力',21:'食物资源与觅食',22:'食物资源与觅食',23:'迁徙路线与存活率',25:'繁殖生态与气候',26:'巢址选择',28:'觅食移动与繁殖',29:'迁徙策略',31:'河口食性与空间生态',32:'全年移动轨迹',37:'食性与形态特征',38:'欧亚迁徙昼夜节律',40:'潜在分布与栖息地'}
extra=[('黑脸琵鹭','深圳湾食性', 'PMC8455529'),('黑脸琵鹭','深圳湾湿地与迁徙鸻鹬保护','PMC9912193'),('勺嘴鹬','东亚迁徙停歇地联系','PMC11350682'),('黑尾塍鹬','东亚澳大利西亚迁徙通道栖息地','PMC12723443'),('勺嘴鹬','东亚澳大利西亚迁徙通道重要湿地','PMC12804681')]
records=[]
items=[(candidates[i]['cn'],topics[i],candidates[i]['pmcid'],candidates[i]['title'],candidates[i].get('doi','')) for i in chosen]
items += [(cn,topic,pmcid,'','') for cn,topic,pmcid in extra]
for cn,topic,pmcid,title,doi in items:
    url=f'https://www.ncbi.nlm.nih.gov/research/bionlp/RESTful/pmcoa.cgi/BioC_xml/{pmcid}/unicode'
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'BirdResearchCollector/1.0'})
        raw=urllib.request.urlopen(req,timeout=30).read()
        tree=ET.fromstring(raw)
        passages=[]
        for p in tree.iter('passage'):
            txt=p.findtext('text')
            if txt: passages.append(txt.strip())
        body='\n\n'.join(passages)
        if len(body)<3000: raise ValueError(f'full text too short: {len(body)}')
        safe=re.sub(r'[<>:"/\\|?*]','',cn+'_'+topic)
        path=root/(safe+'.txt')
        header=f'中文鸟名：{cn}\n文献标题：{html.unescape(title)}\nDOI：{doi}\nPMCID：{pmcid}\n全文来源：https://pmc.ncbi.nlm.nih.gov/articles/{pmcid}/\n下载日期：2026-11-02\n说明：开放获取论文的全文文本，保留原文语言；论文研究地区不一定是深圳。\n\n'
        path.write_text(header+body,encoding='utf-8')
        records.append([cn,topic,title,doi,pmcid,url,str(path),len(body),'成功'])
        print('OK',pmcid,len(body),flush=True)
    except Exception as e:
        records.append([cn,topic,title,doi,pmcid,url,'',0,'失败: '+str(e)])
        print('FAIL',pmcid,str(e),flush=True)
    time.sleep(0.2)
with (root/'文献索引.csv').open('w',encoding='utf-8-sig',newline='') as f:
    w=csv.writer(f); w.writerow(['中文鸟名','内容主题','英文题名','DOI','PMCID','全文接口','本地文件','字数','状态']); w.writerows(records)
