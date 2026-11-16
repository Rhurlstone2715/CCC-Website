export type SessionFields={sessionStart?:string;sessionEnd?:string};
export function caymanDateTime(value:unknown):number|null{
 if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))return null;
 const n=Date.parse(value+':00-05:00');return Number.isFinite(n)&&new Date(n-18000000).toISOString().slice(0,16)===value?n:null;
}
export function sessionWindow(item:SessionFields){const start=caymanDateTime(item.sessionStart),end=caymanDateTime(item.sessionEnd);return start!==null&&end!==null&&end>start&&end-start<=8784*3600000?{start,end}:null;}
export function sessionLabel(item:SessionFields){return sessionWindow(item)?`${item.sessionStart!.replace('T',' ')} to ${item.sessionEnd!.replace('T',' ')} (Cayman time)`:'';}
