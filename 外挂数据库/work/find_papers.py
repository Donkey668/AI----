import json, urllib.parse, urllib.request

species = {
 '黑脸琵鹭':'Platalea minor','勺嘴鹬':'Calidris pygmaea','黑嘴鸥':'Saundersilarus saundersi',
 '黑尾塍鹬':'Limosa limosa','斑尾塍鹬':'Limosa lapponica','大滨鹬':'Calidris tenuirostris',
 '红颈滨鹬':'Calidris ruficollis','弯嘴滨鹬':'Calidris ferruginea','黑腹滨鹬':'Calidris alpina',
 '反嘴鹬':'Recurvirostra avosetta','东方白鹳':'Ciconia boyciana','白琵鹭':'Platalea leucorodia',
 '普通鸬鹚':'Phalacrocorax carbo','红嘴鸥':'Chroicocephalus ridibundus','小青脚鹬':'Tringa guttifer',
 '中杓鹬':'Numenius phaeopus','大杓鹬':'Numenius madagascariensis','黄胸鹀':'Emberiza aureola',
 '家燕':'Hirundo rustica','普通燕鸥':'Sterna hirundo','白额燕鸥':'Sternula albifrons',
 '苍鹭':'Ardea cinerea','池鹭':'Ardeola bacchus','白鹭':'Egretta garzetta',
 '赤颈鸭':'Mareca penelope','绿翅鸭':'Anas crecca','白眉鸭':'Spatula querquedula',
 '针尾鸭':'Anas acuta','红头潜鸭':'Aythya ferina','游隼':'Falco peregrinus',
}
for cn, latin in species.items():
    q = urllib.parse.quote(f'"{latin}" AND OPEN_ACCESS:y AND (migration OR habitat OR ecology OR behavior OR foraging)')
    url = f'https://www.ebi.ac.uk/europepmc/webservices/rest/search?query={q}&format=json&pageSize=5&resultType=core'
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'BirdResearchCollector/1.0 (academic research)'})
        data=json.load(urllib.request.urlopen(req, timeout=20))
        for x in data['resultList']['result']:
            if x.get('pmcid') and latin.lower() in (x.get('title','')+' '+x.get('abstractText','')).lower():
                print(json.dumps({'cn':cn,'latin':latin,'title':x.get('title'),'pmcid':x.get('pmcid'),'doi':x.get('doi'),'year':x.get('pubYear')},ensure_ascii=True))
    except Exception as e: print(json.dumps({'cn':cn,'error':str(e)}))
