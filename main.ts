import{readFileSync,readdirSync,mkdirSync,writeFileSync}from'node:fs';
import{join}from'node:path';
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output';
// [pops,pushes] per opcode; absent = unknown opcode (trap 5)
const OPS={0:[0,0],1:[0,1],2:[0,1],3:[1,0],4:[1,2],5:[2,2],6:[2,3],7:[3,3],16:[2,1],17:[2,1],18:[2,1],19:[2,1],20:[2,1],21:[2,1],22:[2,1],23:[1,1],24:[2,1],25:[2,1],26:[2,1],27:[1,1],28:[2,1],29:[2,1],30:[2,1],32:[2,1],33:[2,1],34:[2,1],48:[0,0],49:[1,0],50:[1,0],51:[0,0],52:[0,0],64:[1,1],65:[2,0],80:[1,0],81:[1,0],82:[0,1],83:[1,0]};
const IMM={1:1,2:4,48:2,49:2,50:2,51:2};
function run(p,q){
 const S=[],C=[],M=new Int32Array(256),out=[];let pc=0,n=0,ip=0;
 const end=c=>[Buffer.from(out),c],PL=p.length;
 for(;;){
  if(n>=1e6)return end(10);
  if(pc<0||pc>=PL)return end(9);
  const o=p[pc],t=OPS[o];
  if(!t)return end(5);
  const L=IMM[o]||0;
  if(pc+1+L>PL)return end(9);
  if(S.length<t[0])return end(2);
  if(S.length-t[0]+t[1]>256)return end(3);
  n++;
  const nx=pc+1+L;
  switch(o){
   case 0:return end(0);
   case 1:S.push(p[pc+1]<<24>>24);break;
   case 2:S.push(p.readInt32LE(pc+1));break;
   case 3:S.pop();break;
   case 4:S.push(S[S.length-1]);break;
   case 5:{const b=S.pop(),a=S.pop();S.push(b,a);break;}
   case 6:S.push(S[S.length-2]);break;
   case 7:{const c=S.pop(),b=S.pop(),a=S.pop();S.push(b,c,a);break;}
   case 16:{const b=S.pop(),a=S.pop();S.push((a+b)|0);break;}
   case 17:{const b=S.pop(),a=S.pop();S.push((a-b)|0);break;}
   case 18:{const b=S.pop(),a=S.pop();S.push(Math.imul(a,b));break;}
   case 19:{const b=S.pop(),a=S.pop();if(!b)return end(4);S.push((a/b)|0);break;}
   case 20:{const b=S.pop(),a=S.pop();if(!b)return end(4);S.push((a%b)|0);break;}
   case 21:{const b=S.pop(),a=S.pop();if(!b)return end(4);S.push(((a>>>0)/(b>>>0))|0);break;}
   case 22:{const b=S.pop(),a=S.pop();if(!b)return end(4);S.push(((a>>>0)%(b>>>0))|0);break;}
   case 23:S.push((-S.pop())|0);break;
   case 24:{const b=S.pop(),a=S.pop();S.push(a&b);break;}
   case 25:{const b=S.pop(),a=S.pop();S.push(a|b);break;}
   case 26:{const b=S.pop(),a=S.pop();S.push(a^b);break;}
   case 27:S.push(~S.pop());break;
   case 28:{const b=S.pop(),a=S.pop();S.push(a<<(b&31));break;}
   case 29:{const b=S.pop(),a=S.pop();S.push(a>>(b&31));break;}
   case 30:{const b=S.pop(),a=S.pop();S.push((a>>>(b&31))|0);break;}
   case 32:{const b=S.pop(),a=S.pop();S.push(a===b?1:0);break;}
   case 33:{const b=S.pop(),a=S.pop();S.push(a<b?1:0);break;}
   case 34:{const b=S.pop(),a=S.pop();S.push((a>>>0)<(b>>>0)?1:0);break;}
   case 48:pc=nx+p.readInt16LE(pc+1);continue;
   case 49:{const v=S.pop();pc=v===0?nx+p.readInt16LE(pc+1):nx;continue;}
   case 50:{const v=S.pop();pc=v!==0?nx+p.readInt16LE(pc+1):nx;continue;}
   case 51:{if(C.length>=64)return end(7);C.push(nx);pc=p.readUInt16LE(pc+1);continue;}
   case 52:{if(!C.length)return end(8);pc=C.pop();continue;}
   case 64:{const a=S.pop();if(a<0||a>255)return end(6);S.push(M[a]);break;}
   case 65:{const a=S.pop(),v=S.pop();if(a<0||a>255)return end(6);M[a]=v;break;}
   case 80:{const v=S.pop(),s=String(v);if(out.length+s.length>65536)return end(11);for(let i=0;i<s.length;i++)out.push(s.charCodeAt(i));break;}
   case 81:{const v=S.pop();if(out.length+1>65536)return end(11);out.push(v&255);break;}
   case 82:S.push(ip<q.length?q[ip++]:-1);break;
   case 83:return end(S.pop()&255);
  }
  pc=nx;
 }
}
for(const id of readdirSync(I).sort()){
 const r=run(readFileSync(join(I,id,'program.bin')),readFileSync(join(I,id,'input.bin')));
 mkdirSync(join(O,id),{recursive:true});
 writeFileSync(join(O,id,'stdout.bin'),r[0]);
 writeFileSync(join(O,id,'exit.txt'),r[1]+'\n');
}
