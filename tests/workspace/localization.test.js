'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

test('Vietnamese vocabulary covers every static server validation error',()=>{
 const root=path.resolve(__dirname,'../..');
 const context={vi:{}};vm.createContext(context);
 const source=fs.readFileSync(path.join(root,'public/workspace/interface.js'),'utf8');
 vm.runInContext(source.split('const requestTools=')[0],context);
 for(const file of fs.readdirSync(path.join(root,'src/workspace')).filter(f=>f.endsWith('.js'))){
  const code=fs.readFileSync(path.join(root,'src/workspace',file),'utf8');
  for(const match of code.matchAll(/\bfail\('([^']+)'/g)){
   const message=match[1];
   if(/^[\x00-\x7f]+$/.test(message))assert.ok(context.vi[message],`${file}: missing Vietnamese message: ${message}`);
  }
 }
});
