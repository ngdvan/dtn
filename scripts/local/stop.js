'use strict';
const fs=require('node:fs');const path=require('node:path');const mysql=require('mysql2/promise');
const {local,data}=require('./database');
(async()=>{
 const credentials=JSON.parse(fs.readFileSync(path.join(local,'mysql-admin.json'),'utf8'));
 const db=await mysql.createConnection({host:'127.0.0.1',port:3307,user:'root',password:credentials.password});
 try{const [[r]]=await db.query('SELECT @@datadir directory');const norm=p=>path.resolve(p).replace(/\\/g,'/').replace(/\/$/,'').toLowerCase();if(norm(r.directory)!==norm(data))throw new Error('Refusing to stop an unrelated database.');await db.query('SHUTDOWN');console.log('Local workspace database stopped.');}finally{await db.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
