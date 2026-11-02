import { afterEach,beforeEach,expect,it,vi } from 'vitest';
import { completeCurrentUploadJson } from '../../apps/api/src/lib/ai/current-upload-json';
import { recognizeBirdFromImage } from '../../apps/api/src/lib/identify/bird-recognition';
import { generateBirdEncyclopedia } from '../../apps/api/src/lib/identify/bird-encyclopedia';

const endpoint='https://cn-beijing.maas.qianwenaiapi.com/compatible-mode/v1/chat/completions';
let requests:{url:string;body:any}[]=[];
let empty=false;
const transport=vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>{
 const url=input instanceof Request?input.url:String(input);
 const body=JSON.parse(input instanceof Request?await input.text():String(init?.body));
 requests.push({url,body});
 const image=Array.isArray(body.messages[1].content);
 const answer=image?{status:'success',speciesNameZh:'白鹭',speciesNameEn:'Little Egret',speciesNameLa:'Egretta garzetta'}:{traits:'体羽白色。',habits:'在湿地觅食。',distribution:'分布于深圳。',protection:'遵循保护规定。'};
 const content=JSON.stringify(answer),middle=Math.floor(content.length/2);
 const deltas=[{choices:[]},{choices:[{delta:{reasoning_content:'PRIVATE_REASONING_DO_NOT_REPLAY'}}]},...(empty?[]:[{choices:[{delta:{content:content.slice(0,middle)}}]},{choices:[{delta:{content:content.slice(middle)}}]}])];
 const sse=deltas.map(delta=>'data: '+JSON.stringify(delta)+'\n\n').join('')+'data: [DONE]\n\n';
 return new Response(sse,{headers:{'Content-Type':'text/event-stream'}});
});
beforeEach(()=>{requests=[];empty=false;vi.stubEnv('DASHSCOPE_API_KEY','local-sdk-test-key');vi.stubGlobal('fetch',transport);});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
const image=(name:string)=>({fileName:name+'.png',mimeType:'image/png',byteSize:name.length,imageUrl:'data:image/png;base64,'+Buffer.from(name).toString('base64')});
function checkRequest(request:typeof requests[number]){
 expect(request.url).toBe(endpoint);
 expect(request.body).toMatchObject({model:'qwen3.8-flash',stream:true,enable_thinking:true,preserve_thinking:false,response_format:{type:'json_object'}});
 expect(request.body.messages.map((m:any)=>m.role)).toEqual(['system','user']);
 expect(request.body).not.toHaveProperty('previous_response_id');
 expect(request.body).not.toHaveProperty('conversation');
 expect(JSON.stringify(request.body)).not.toContain('PRIVATE_REASONING_DO_NOT_REPLAY');
}
it('sequential uploads send exactly the current image through the real SDK serializer',async()=>{
 const a=image('first-image'),b=image('second-image');
 expect((await recognizeBirdFromImage(a)).status).toBe('success');
 expect((await recognizeBirdFromImage(b)).status).toBe('success');
 expect(requests).toHaveLength(2);requests.forEach(checkRequest);
 expect(requests[0].body.messages[1].content.filter((p:any)=>p.type==='image_url')).toEqual([{type:'image_url',image_url:{url:a.imageUrl}}]);
 expect(requests[1].body.messages[1].content.filter((p:any)=>p.type==='image_url')).toEqual([{type:'image_url',image_url:{url:b.imageUrl}}]);
 expect(JSON.stringify(requests[1].body)).not.toContain(a.imageUrl);
});
it('concurrent uploads keep their inputs and streamed answers isolated',async()=>{
 const images=[image('parallel-one'),image('parallel-two')];
 const results=await Promise.all(images.map(recognizeBirdFromImage));
 expect(results.map(r=>r.status)).toEqual(['success','success']);
 expect(requests).toHaveLength(2);requests.forEach(checkRequest);
 for(const request of requests){expect(request.body.messages[1].content.filter((p:any)=>p.type==='image_url')).toHaveLength(1);}
 expect(new Set(requests.map(r=>r.body.messages[1].content.find((p:any)=>p.type==='image_url').image_url.url))).toEqual(new Set(images.map(i=>i.imageUrl)));
});
it('encyclopedia sends only this recognition names, without previous images or answers',async()=>{
 const uploaded=image('not-for-encyclopedia');const recognition=await recognizeBirdFromImage(uploaded);
 if(recognition.status!=='success')throw new Error('fixture recognition');
 const summary=await generateBirdEncyclopedia(recognition);
 expect(summary.status).toBe('success');expect(summary.modelName).toBe('qwen3.8-flash');expect(summary.sections).toHaveLength(4);
 const request=requests[1];checkRequest(request);
 expect(request.body.messages[1].content).toContain('白鹭');
 expect(request.body.messages[1].content).toContain('Little Egret');
 expect(request.body.messages[1].content).toContain('Egretta garzetta');
 expect(JSON.stringify(request.body)).not.toContain(uploaded.imageUrl);
 expect(JSON.stringify(request.body)).not.toContain('data:image/');
});
it('a reasoning-only stream fails instead of exposing reasoning or returning false success',async()=>{
 empty=true;
 await expect(completeCurrentUploadJson('固定 JSON 指令','当前输入')).rejects.toThrow('Model returned an empty response.');
 expect(requests).toHaveLength(1);checkRequest(requests[0]);
});
