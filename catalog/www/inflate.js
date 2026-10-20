/* Kichik gzip ochuvchi (DecompressionStream yo‘q eski WebView uchun). tiny-inflate algoritmi asosida. */
(function(){
function Tree(){this.table=new Uint16Array(16);this.trans=new Uint16Array(288)}
const sltree=new Tree(),sdtree=new Tree(),lbits=new Uint8Array(30),lbase=new Uint16Array(30),dbits=new Uint8Array(30),dbase=new Uint16Array(30);
const clcidx=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),offs=new Uint16Array(16);
function bits(b,base,delta,first){let i,sum;for(i=0;i<delta;++i)b[i]=0;for(i=0;i<30-delta;++i)b[i+delta]=i/delta|0;for(sum=first,i=0;i<30;++i){base[i]=sum;sum+=1<<b[i]}}
function fixed(lt,dt){let i;for(i=0;i<7;++i)lt.table[i]=0;lt.table[7]=24;lt.table[8]=152;lt.table[9]=112;for(i=0;i<24;++i)lt.trans[i]=256+i;for(i=0;i<144;++i)lt.trans[24+i]=i;for(i=0;i<8;++i)lt.trans[168+i]=280+i;for(i=0;i<112;++i)lt.trans[176+i]=144+i;
  for(i=0;i<5;++i)dt.table[i]=0;dt.table[5]=32;for(i=0;i<32;++i)dt.trans[i]=i}
function build(t,lengths,off,num){let i,sum;for(i=0;i<16;++i)t.table[i]=0;for(i=0;i<num;++i)t.table[lengths[off+i]]++;t.table[0]=0;for(sum=0,i=0;i<16;++i){offs[i]=sum;sum+=t.table[i]}for(i=0;i<num;++i)if(lengths[off+i])t.trans[offs[lengths[off+i]]++]=i}
function D(src){this.s=src;this.i=0;this.tag=0;this.bc=0;this.out=new Uint8Array(Math.max(1024,src.length*4));this.n=0}
D.prototype.grow=function(k){if(this.n+k<=this.out.length)return;let m=this.out.length*2;while(m<this.n+k)m*=2;const o=new Uint8Array(m);o.set(this.out.subarray(0,this.n));this.out=o};
function bit(d){if(!d.bc--){d.tag=d.s[d.i++];d.bc=7}const b=d.tag&1;d.tag>>>=1;return b}
function rb(d,num,base){if(!num)return base;while(d.bc<24){d.tag|=(d.s[d.i++]||0)<<d.bc;d.bc+=8}const v=d.tag&(0xffff>>>(16-num));d.tag>>>=num;d.bc-=num;return v+base}
function sym(d,t){while(d.bc<24){d.tag|=(d.s[d.i++]||0)<<d.bc;d.bc+=8}let sum=0,cur=0,len=0,tag=d.tag;do{cur=2*cur+(tag&1);tag>>>=1;++len;sum+=t.table[len];cur-=t.table[len]}while(cur>=0);d.tag=tag;d.bc-=len;return t.trans[sum+cur]}
const lengths=new Uint8Array(320),code=new Tree();
function dyn(d,lt,dt){let i,num,length;const hlit=rb(d,5,257),hdist=rb(d,5,1),hclen=rb(d,4,4);for(i=0;i<19;++i)lengths[i]=0;for(i=0;i<hclen;++i)lengths[clcidx[i]]=rb(d,3,0);build(code,lengths,0,19);
  for(num=0;num<hlit+hdist;){const s=sym(d,code);switch(s){case 16:{const prev=lengths[num-1];for(length=rb(d,2,3);length;--length)lengths[num++]=prev;break}case 17:for(length=rb(d,3,3);length;--length)lengths[num++]=0;break;case 18:for(length=rb(d,7,11);length;--length)lengths[num++]=0;break;default:lengths[num++]=s}}
  build(lt,lengths,0,hlit);build(dt,lengths,hlit,hdist)}
function block(d,lt,dt){for(;;){let s=sym(d,lt);if(s===256)return;if(s<256){d.grow(1);d.out[d.n++]=s}else{s-=257;const len=rb(d,lbits[s],lbase[s]),ds=sym(d,dt),off=d.n-rb(d,dbits[ds],dbase[ds]);d.grow(len);for(let i=off;i<off+len;++i)d.out[d.n++]=d.out[i]}}}
function stored(d){while(d.bc>8){d.i--;d.bc-=8}let len=d.s[d.i+1];len=256*len+d.s[d.i];d.i+=4;d.grow(len);for(let i=len;i;--i)d.out[d.n++]=d.s[d.i++];d.bc=0}
bits(lbits,lbase,4,3);bits(dbits,dbase,2,1);lbits[28]=0;lbase[28]=258;fixed(sltree,sdtree);
function inflateRaw(src){const d=new D(src);let fin,type;do{fin=bit(d);type=rb(d,2,0);if(type===0)stored(d);else if(type===1)block(d,sltree,sdtree);else if(type===2){const lt=new Tree(),dt=new Tree();dyn(d,lt,dt);block(d,lt,dt)}else throw new Error("buzuq fayl")}while(!fin);return d.out.subarray(0,d.n)}
window.gunzipJS=function(b){if(b[0]!==0x1f||b[1]!==0x8b)return b;const fl=b[3];let i=10;if(fl&4){i+=2+(b[i]|b[i+1]<<8)}if(fl&8){while(b[i++]);}if(fl&16){while(b[i++]);}if(fl&2)i+=2;return inflateRaw(b.subarray(i))};
})();
