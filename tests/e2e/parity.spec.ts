import { test,expect,devices } from '@playwright/test';
test.use({...devices['Pixel 5']});
test('three screens, four parks, species and register placeholder',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:'观鸟指数分析'})).toBeVisible();
 const select=page.locator('button[aria-haspopup=listbox]').first();
 await select.click();const parks=await page.getByRole('option').allTextContents();expect(parks).toHaveLength(4);
 await page.getByRole('option').first().click();
 for(const park of parks){await select.click();await page.getByRole('option',{name:park,exact:true}).click();await expect(page.getByText('当前展示',{exact:false}).first()).toBeVisible();}
 await page.getByRole('button',{name:'鸟类识别工具',exact:true}).click();
 await expect(page.getByText('点击上传图片',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'个人观测记录',exact:true}).click();
 await page.getByRole('button',{name:'新增记录',exact:true}).click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.getByRole('dialog').getByRole('button',{name:'取消',exact:true}).click();
 await page.getByRole('dialog').getByRole('button',{name:'关闭',exact:true}).click();
 await page.getByRole('button',{name:'注册',exact:true}).filter({visible:true}).click();
 await expect(page.getByRole('dialog')).toContainText('管理员');
 await page.screenshot({path:'test-results/mobile-register.png'});
 expect(errors).toEqual([]);
});
test('desktop tip, original narrow layout and font',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1280,height:900},isMobile:false,hasTouch:false});const page=await context.newPage();
 await page.goto('/');await expect(page.getByRole('dialog')).toContainText('移动端体验最佳');
 await page.getByRole('button',{name:'我知道了'}).click();
 await page.evaluate(()=>document.fonts.ready);
 expect(await page.evaluate(()=>document.fonts.check('14px "Geist Variable"'))).toBe(true);
 await page.screenshot({path:'test-results/desktop.png',fullPage:true});
 await context.close();
});
test('mobile landscape portrait restriction and reduced motion',async({page})=>{
 await page.setViewportSize({width:844,height:390});await page.goto('/');
 await expect(page.getByText(/竖屏/).first()).toBeVisible();
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.getByRole('button',{name:'鸟类识别工具',exact:true}).click();await expect(page.getByText('点击上传图片',{exact:true})).toBeVisible();
 await page.screenshot({path:'test-results/mobile-identify.png'});
});
test('recognition success, partial, unrecognized and failed UI',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'鸟类识别工具',exact:true}).click();
 for(const status of ['success','partial','unrecognized','failed']){
  await page.route('**/api/identify/bird-recognition',route=>route.fulfill({status:status==='failed'?502:200,json:{requestStatus:status,message:status==='failed'?'鸟类识别服务暂时不可用，请稍后重试。':status==='unrecognized'?'图片中未包含可识别的鸟类！':'鸟类识别结果已更新。',requestedAt:new Date().toISOString(),recognition:status==='failed'?null:{status:status==='unrecognized'?'unrecognized':'success',speciesNameZh:status==='unrecognized'?null:'白鹭',speciesNameEn:'Little Egret',speciesNameLa:'Egretta garzetta',message:'结果',modelName:'qwen3.8-flash'},encyclopedia:status==='success'?{status:'success',message:'百科已生成',modelName:'qwen3.8-flash',sections:[{key:'traits',label:'物种特征',content:'体羽白色。'}]}:null}}));
  await page.locator('input[type=file]').setInputFiles({name:status+'.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8vQAAAAASUVORK5CYII=','base64')});
  if(status==='success'||status==='partial')await expect(page.getByText('白鹭',{exact:true}).first()).toBeVisible();
  else await expect(page.getByText(status==='failed'?'鸟类识别服务暂时不可用，请稍后重试。':'图片中未包含可识别的鸟类！',{exact:true}).first()).toBeVisible();
  await page.unroute('**/api/identify/bird-recognition');
 }
});
