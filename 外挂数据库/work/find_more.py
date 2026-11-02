import json,urllib.parse,urllib.request
species={
'斑尾塍鹬':'Limosa lapponica','大滨鹬':'Calidris tenuirostris','红颈滨鹬':'Calidris ruficollis',
'弯嘴滨鹬':'Calidris ferruginea','黑腹滨鹬':'Calidris alpina','小青脚鹬':'Tringa guttifer',
'白额燕鸥':'Sternula albifrons','白琵鹭':'Platalea leucorodia','绿翅鸭':'Anas crecca',
'赤颈鸭':'Mareca penelope','白眉鸭':'Spatula querquedula','游隼':'Falco peregrinus',
'白腰杓鹬':'Numenius arquata','蒙古沙鸻':'Anarhynchus mongolus','灰斑鸻':'Pluvialis squatarola',
'金斑鸻':'Pluvialis fulva','青脚鹬':'Tringa nebularia','普通燕鸥':'Sterna hirundo',
'家燕':'Hirundo rustica','黑脸琵鹭':'Platalea minor','勺嘴鹬':'Calidris pygmaea',
}
for cn,latin in species.items():
    q=urllib.parse.quote(f'"{latin}" AND OPEN_ACCESS:y')
    url=f'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={q}&format=json&pageSize=15&resultType=core'
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'BirdResearchCollector/1.0'})
        a=json.load(urllib.request.urlopen(req,timeout=20))['resultList']['result']
        for x in a:
            if x.get('pmcid') and any(t in x.get('title','').lower() for t in ['migrat','habitat','forag','diet','winter','breeding','movement','ecolog','flyway','distribut','stopover']):
                print(json.dumps({'cn':cn,'latin':latin,'title':x['title'],'pmcid':x['pmcid'],'doi':x.get('doi'),'year':x.get('pubYear')},ensure_ascii=True),flush=True)
    except Exception as e: print(json.dumps({'cn':cn,'error':str(e)}),flush=True)
