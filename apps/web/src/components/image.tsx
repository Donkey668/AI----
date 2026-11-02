import type { ImgHTMLAttributes } from 'react';
type ImageProps=ImgHTMLAttributes<HTMLImageElement>&{fill?:boolean;unoptimized?:boolean;priority?:boolean};
export default function Image({fill,unoptimized:_unoptimized,priority,style,...props}:ImageProps){
 return <img {...props} decoding="async" loading={priority?'eager':'lazy'} fetchPriority={priority?'high':undefined} style={{...(fill?{position:'absolute',height:'100%',width:'100%',inset:0,color:'transparent'}:{color:'transparent'}),...style}}/>;
}
