'use strict';
const db=require('../../src/workspace/database').createPool();
require('../../src/workspace/room-migration')(db).then(()=>console.log('Room booking schema ready. Existing records preserved.')).catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>db.end());
