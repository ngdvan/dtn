'use strict';
module.exports=async function(db){
 const sql=require('node:fs').readFileSync(require('node:path').resolve(__dirname,'../../database/workspace/rooms.sql'),'utf8');
 for(const statement of sql.split(';').filter(s=>s.trim()))await db.query(statement);
 for(const [code,name,scope,permissions]of require('./catalog').roleSeeds.filter(r=>['faculty','office_head'].includes(r[0])))await db.execute('INSERT IGNORE INTO roles(code,name,scope,permissions,is_system) VALUES(?,?,?,?,1)',[code,name,scope,JSON.stringify(permissions)]);
};
