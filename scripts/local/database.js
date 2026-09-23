'use strict';
const path=require('node:path');
const fs=require('node:fs');
const net=require('node:net');
const {spawn}=require('node:child_process');
const root=path.resolve(__dirname,'../..');
const local=path.join(root,'.local');
const data=path.join(local,'mysql-data');
const port=3307;
function listening(){return new Promise(resolve=>{const s=net.connect({host:'127.0.0.1',port});s.setTimeout(500);s.once('connect',()=>{s.destroy();resolve(true);});s.once('error',()=>resolve(false));s.once('timeout',()=>{s.destroy();resolve(false);});});}
async function start(){
  fs.mkdirSync(local,{recursive:true});
  if(await listening())return;
  const binary=process.env.MYSQLD_BIN||(process.platform==='win32'?'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysqld.exe':'mysqld');
  const common=['--no-defaults',`--datadir=${data}`];
  if(process.platform==='win32')common.push(`--basedir=${path.dirname(path.dirname(binary))}`);
  if(!fs.existsSync(path.join(data,'mysql'))){
    fs.mkdirSync(data,{recursive:true});console.log('Initializing an isolated MySQL data directory (.local/mysql-data)…');
    await new Promise((resolve,reject)=>{const p=spawn(binary,[...common,'--initialize-insecure','--console'],{windowsHide:true,stdio:['ignore','ignore','pipe']});let error='';p.stderr.on('data',d=>error+=d);p.on('error',reject);p.on('exit',c=>c===0?resolve():reject(new Error(`MySQL initialization failed: ${error}`)));});
  }
  const log=fs.openSync(path.join(local,'mysql-process.log'),'a');
  const child=spawn(binary,[...common,`--port=${port}`,'--bind-address=127.0.0.1','--mysqlx=OFF','--default-time-zone=+07:00',`--pid-file=${path.join(local,'mysql.pid')}`,`--log-error=${path.join(local,'mysql-error.log')}`],{windowsHide:true,detached:true,stdio:['ignore',log,log]});
  child.on('error',e=>console.error(e.message));child.unref();fs.closeSync(log);
  for(let i=0;i<60;i++){if(await listening()){console.log('Local MySQL ready at 127.0.0.1:3307.');return;}await new Promise(r=>setTimeout(r,500));}
  throw new Error('Local MySQL did not start. See .local/mysql-error.log.');
}
if(require.main===module)start().catch(e=>{console.error(e.message);process.exitCode=1;});
module.exports={start,data,local};
