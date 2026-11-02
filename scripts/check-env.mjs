import { config } from 'dotenv';
config({path:'apps/api/.env',quiet:true});
config({path:'apps/web/.env.local',quiet:true});
for(const aliases of [['VITE_AMAP_KEY'],['VITE_AMAP_SECURITY_JS_CODE','VITE_AMAP_SERVICE_HOST'],['AMAP_WEATHER_KEY'],['DASHSCOPE_API_KEY'],['SZ_WEATHER_APP_KEY'],['QWEATHER_API_HOST'],['X-QW-Api-Key','X_QW_API_KEY']]) {
 console.log(`${aliases.join(' or ')}: ${aliases.some(k=>process.env[k]?.trim())?'configured':'missing'}`);
}
