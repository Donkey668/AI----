import { test,expect,devices } from '@playwright/test';
import { writeFileSync,mkdirSync } from 'node:fs';
test('locked original component harness and migrated UI match',async({browser})=>{
 const source=await browser.newContext({...devices['Pixel 5']});const target=await browser.newContext({...devices['Pixel 5']});
 const a=await source.newPage(),b=await target.newPage();
 const timings:{source:number[];target:number[]}={source:[],target:[]};
 for(let i=0;i<3;i++){
  let t=Date.now();await a.goto('http://127.0.0.1:5175');await a.getByText('当前展示',{exact:false}).waitFor();timings.source.push(Date.now()-t);
  t=Date.now();await b.goto('/');await b.getByText('当前展示',{exact:false}).waitFor();timings.target.push(Date.now()-t);
 }
 for(const [name,button] of [['analysis',null],['identify','鸟类识别工具'],['records','个人观测记录']] as const){
  if(button){await a.getByRole('button',{name:button,exact:true}).click();await b.getByRole('button',{name:button,exact:true}).click();}
  await a.evaluate(()=>document.fonts.ready);await b.evaluate(()=>document.fonts.ready);
  // Wait for the baseline's fixed 280ms transition before capturing pixels.
  await a.waitForTimeout(350);await b.waitForTimeout(350);
  const before=await a.screenshot({path:`test-results/baseline-${name}.png`});
  const after=await b.screenshot({path:`test-results/migrated-${name}.png`});
  expect(await b.locator('body').innerText()).toBe(await a.locator('body').innerText());
  expect(after.equals(before),'pixel equality '+name).toBe(true);
 }
 mkdirSync('test-results',{recursive:true});writeFileSync('test-results/ui-comparison.json',JSON.stringify({harness:'Original React components/CSS; shared image/font/guest bootstrap adapters; same controlled local API',pixelEqual:['analysis','identify','records'],navigationMilliseconds:timings},null,2));
 await source.close();await target.close();
});
