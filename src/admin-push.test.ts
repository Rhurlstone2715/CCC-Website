import "./test-env.js";
import assert from 'node:assert/strict';import{test}from'node:test';
import{validPushEndpoint}from'./admin-push.js';
test('admin push only accepts known HTTPS push-service endpoints',()=>{
 for(const url of ['https://web.push.apple.com/abc','https://fcm.googleapis.com/wp/test','https://updates.push.services.mozilla.com/wpush/v2/test'])assert.equal(validPushEndpoint(url),true);
 for(const url of ['http://web.push.apple.com/abc','https://web.push.apple.com.evil.example/abc','https://127.0.0.1/test','https://localhost/','https://user:password@web.push.apple.com/a','https://web.push.apple.com:8443/a'])assert.equal(validPushEndpoint(url),false);
});
