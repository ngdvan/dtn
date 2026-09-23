'use strict';
const path=require('node:path');const fs=require('node:fs');const mysql=require('mysql2/promise');
const {start,data,local}=require('./database');const {seed}=require('./seed');
(async()=>{
 if(!process.argv.includes('--confirm=seee_workspace_local'))throw new Error('Stop the app, then use npm run reset:local -- --confirm=seee_workspace_local to erase only demo workspace data.');
 await start();const credentials=JSON.parse(fs.readFileSync(path.join(local,'mysql-admin.json'),'utf8'));
 const db=await mysql.createConnection({host:'127.0.0.1',port:3307,user:'root',password:credentials.password,multipleStatements:true});
 try{
  const [[r]]=await db.query('SELECT @@datadir directory');const norm=p=>path.resolve(p).replace(/\\/g,'/').replace(/\/$/,'').toLowerCase();
  if(norm(r.directory)!==norm(data))throw new Error('Refusing to reset an unrelated database.');
  await db.query('DROP DATABASE IF EXISTS seee_workspace_local');await db.query('CREATE DATABASE seee_workspace_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');await db.query('USE seee_workspace_local');await seed(db);
  console.log('Demo database reset. Restart the app. Old uploaded files are retained in .local/workspace-uploads for manual review.');
 }finally{await db.end();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
