'use strict';
const session=require('express-session');

// Uses the application's current mysql2 pool, without a second bundled driver.
class SessionStore extends session.Store {
  constructor(db){
    super();this.db=db;
    this.ready=db.query(`CREATE TABLE IF NOT EXISTS workspace_sessions (
      session_id VARCHAR(128) PRIMARY KEY, expires BIGINT UNSIGNED NOT NULL,
      data MEDIUMTEXT NOT NULL, INDEX session_expiry(expires)
    )`);
    this.timer=setInterval(()=>this.ready.then(()=>db.execute('DELETE FROM workspace_sessions WHERE expires<=?',[Date.now()])).catch(e=>console.error('Session cleanup failed:',e.message)),15*60*1000);
    this.timer.unref();
  }
  get(id,callback){this.ready.then(()=>this.db.execute('SELECT data FROM workspace_sessions WHERE session_id=? AND expires>?',[id,Date.now()])).then(([[row]])=>callback(null,row?JSON.parse(row.data):null)).catch(callback);}
  set(id,value,callback=()=>{}){const expires=value.cookie?.expires?new Date(value.cookie.expires).getTime():Date.now()+12*3600000;this.ready.then(()=>this.db.execute('INSERT INTO workspace_sessions(session_id,expires,data) VALUES(?,?,?) ON DUPLICATE KEY UPDATE expires=VALUES(expires),data=VALUES(data)',[id,expires,JSON.stringify(value)])).then(()=>callback()).catch(callback);}
  touch(id,value,callback){this.set(id,value,callback);}
  destroy(id,callback=()=>{}){this.ready.then(()=>this.db.execute('DELETE FROM workspace_sessions WHERE session_id=?',[id])).then(()=>callback()).catch(callback);}
  async close(){clearInterval(this.timer);await this.ready;}
}
module.exports=SessionStore;
