/* Binance Gold API bridge v3 - same-origin, role-separated sessions */
/** Binance Gold production API bridge. No localStorage fallback for business data. */
(function () {
  'use strict';
  var OriginalDB = window.DB || {};
  var memoryUser = null;
  function enc(v){ return encodeURIComponent(String(v)); }
  function apiFetch(path, options){
    options=options||{};
    var init={method:options.method||'GET',credentials:'include',headers:{'Content-Type':'application/json'}};
    if(options.idempotencyKey) init.headers['Idempotency-Key']=options.idempotencyKey;
    if(options.body!==undefined) init.body=JSON.stringify(options.body);
    return fetch(path,init).then(function(r){return r.json().catch(function(){return {};}).then(function(data){if(!r.ok){var e=new Error(data.error||('API '+r.status));e.status=r.status;e.data=data;throw e;}return data;});});
  }
  function idKey(prefix){return prefix+'-'+(crypto.randomUUID?crypto.randomUUID():(Date.now()+'-'+Math.random().toString(36).slice(2)));}
  function setCurrent(u){
    memoryUser=u||null;
    try { if(typeof currentUser!=='undefined') currentUser=u||null; } catch(e){}
    return Promise.resolve();
  }
  var DB={
    getUsers:function(q){var u='/api/users'; if(q)u+='?q='+enc(q); return apiFetch(u);},
    getUserById:function(id){return apiFetch('/api/users/'+enc(id));},
    createUser:function(u){return apiFetch('/api/auth/register',{method:'POST',body:{name:u.name||u.phone,phone:u.phone,password:u.password}}).then(function(r){return r.user;});},
    updateUser:function(id,up){return apiFetch('/api/users/'+enc(id),{method:'PUT',body:up});},
    setCurrentUser:setCurrent,
    getCurrentUser:function(){return apiFetch('/api/auth/me').then(function(r){memoryUser=r.user;try{if(typeof currentUser!=='undefined')currentUser=r.user;}catch(e){}return r.user;}).catch(function(e){if(e.status===401){memoryUser=null;try{if(typeof currentUser!=='undefined')currentUser=null;}catch(x){}return null;}throw e;});},
    getDeposits:function(){return apiFetch('/api/deposits');},
    getDepositsByUser:function(){return apiFetch('/api/deposits');},
    createDeposit:function(d){return apiFetch('/api/deposits',{method:'POST',body:d, idempotencyKey:idKey('deposit')});},
    updateDeposit:function(id,up){return apiFetch('/api/deposits/'+enc(id),{method:'PUT',body:up});},
    setDeposits:function(){return Promise.resolve();},
    setUsers:function(){return Promise.resolve();},
    getWithdraws:function(){return apiFetch('/api/withdraws');},
    getWithdrawsByUser:function(){return apiFetch('/api/withdraws');},
    createWithdraw:function(w){var fee=1;return apiFetch('/api/settings').then(function(s){fee=Number(s.withdrawFee||s.withdraw_fee||1);return apiFetch('/api/wallet/withdraw',{method:'POST',body:Object.assign({},w,{fee:fee}),idempotencyKey:idKey('withdraw')});}).then(function(r){if(r.user){memoryUser=r.user;try{if(typeof currentUser!=='undefined')currentUser=r.user;}catch(e){}}return r.withdraw;});},
    updateWithdraw:function(id,up){return apiFetch('/api/withdraws/'+enc(id),{method:'PUT',body:up});},
    setWithdraws:function(){return Promise.resolve();},
    getTrades:function(){return apiFetch('/api/trades');},
    getTradesByUser:function(){return apiFetch('/api/trades');},
    createTrade:function(t){return apiFetch('/api/wallet/trade',{method:'POST',body:t,idempotencyKey:idKey('trade')}).then(function(r){if(r.user){memoryUser=r.user;try{if(typeof currentUser!=='undefined')currentUser=r.user;}catch(e){}}return r.trade;});},
    updateTrade:function(id,up){return apiFetch('/api/trades/'+enc(id),{method:'PUT',body:up});},
    settleTrade:function(id){return apiFetch('/api/wallet/trades/'+enc(id)+'/settle',{method:'POST'}).then(function(r){if(r.user){memoryUser=r.user;try{if(typeof currentUser!=='undefined')currentUser=r.user;}catch(e){}}return r;});},
    setTrades:function(){return Promise.resolve();},
    getFunds:function(){return apiFetch('/api/funds');},
    getFundsByUser:function(){return apiFetch('/api/funds');},
    createFund:function(f){return apiFetch('/api/funds',{method:'POST',body:f,idempotencyKey:idKey('fund')});},
    joinFund:function(f){return apiFetch('/api/wallet/fund',{method:'POST',body:f,idempotencyKey:idKey('fundjoin')});},
    updateFund:function(id,up){return apiFetch('/api/funds/'+enc(id),{method:'PUT',body:up});},
    settleFund:function(id){return apiFetch('/api/wallet/funds/'+enc(id)+'/settle',{method:'POST'}).then(function(r){if(r.user){memoryUser=r.user;try{if(typeof currentUser!=='undefined')currentUser=r.user;}catch(e){}}return r;});},
    setFunds:function(){return Promise.resolve();},
    getChats:function(){return apiFetch('/api/chats');},
    getChatsByUser:function(){return apiFetch('/api/chats');},
    createChat:function(c){return apiFetch('/api/chats',{method:'POST',body:c,idempotencyKey:idKey('chat')});},
    deleteChatsByUser:function(userId){return apiFetch('/api/admin/chats?user_id='+enc(userId),{method:'DELETE'});},
    setChats:function(){return Promise.resolve();},
    getKycs:function(){return apiFetch('/api/kycs');},
    createKyc:function(k){return apiFetch('/api/kycs',{method:'POST',body:k,idempotencyKey:idKey('kyc')});},
    updateKyc:function(id,up){return apiFetch('/api/kycs/'+enc(id),{method:'PUT',body:up});},
    setKycs:function(){return Promise.resolve();},
    getAdmins:function(){return apiFetch('/api/admins');},
    createAdmin:function(a){return apiFetch('/api/admins',{method:'POST',body:a});},
    deleteAdmin:function(id){return apiFetch('/api/admins/'+enc(id),{method:'DELETE'});},
    setAdmins:function(){return Promise.resolve();},
    getSettings:function(){return apiFetch('/api/settings');},
    updateSettings:function(up){return apiFetch('/api/settings',{method:'PUT',body:up});},
    setSettings:function(){return Promise.resolve();},
    getTransactions:function(){return apiFetch('/api/transactions');},
    getNotifications:function(){return apiFetch('/api/notifications');},
    uploadFile:function(){return Promise.resolve(null);}
  };
  window.DB=DB;
  window.Auth={ getSession:function(){ return apiFetch('/api/auth/me').then(function(r){return r.user;}).catch(function(){return null;}); } };
  window.BinanceGoldAPI={fetch:apiFetch};

  function syncUser(){
    apiFetch('/api/auth/me').then(function(r){memoryUser=r.user;try{if(typeof currentUser!=='undefined'){currentUser=r.user;updateAuthUI();}}catch(e){}}).catch(function(){});
  }
  if(typeof window.login==='function'){
    window.login=async function(){
      var phone=document.getElementById('loginPhone')?.value.trim(), password=document.getElementById('loginPassword')?.value;
      if(!phone||!password){showToast(t('loginError'));return;}
      try{var r=await apiFetch('/api/auth/login',{method:'POST',body:{phone:phone,password:password}});await setCurrent(r.user);closeModal('authModal');showToast(t('loginSuccess'));updateAuthUI();showTab('home',document.querySelector('[data-tab="home"]'));}
      catch(e){showToast(t('loginError'));}
    };
  }
  if(typeof window.register==='function'){
    window.register=async function(){
      var name=document.getElementById('regName')?.value.trim(), phone=document.getElementById('regPhone')?.value.trim(), password=document.getElementById('regPassword')?.value, confirm=document.getElementById('regConfirmPassword')?.value;
      if(!name||!phone||!password){showToast(t('regError'));return;} if(password!==confirm){showToast(t('passwordMismatch'));return;}
      try{var r=await apiFetch('/api/auth/register',{method:'POST',body:{name:name,phone:phone,password:password}});await setCurrent(r.user);closeModal('authModal');showToast(t('regSuccess'));updateAuthUI();showTab('home',document.querySelector('[data-tab="home"]'));}
      catch(e){showToast(e.status===409?(currentLang==='th'?'เบอร์นี้มีผู้ใช้งานแล้ว':'Phone already registered'):t('regError'));}
    };
  }
  // Member logout is implemented by index.html so the confirmation dialog is shown first.
  // The dialog's confirmLogout() calls the same server-side session endpoint.
  if(typeof window.doLogin==='function'){
    window.doLogin=async function(){
      var u=document.getElementById('loginUsername')?.value.trim(), p=document.getElementById('loginPassword')?.value;
      if(!u||!p){document.getElementById('loginError')?.classList.add('show');return;}
      try{var r=await apiFetch('/api/admin/login',{method:'POST',body:{username:u,password:p}});window.isAdminLoggedIn=true;window.currentAdmin=r.admin;try{if(typeof currentAdmin!=='undefined')currentAdmin=r.admin;}catch(e){}document.getElementById('loginPage').style.display='none';document.getElementById('adminPanel').classList.add('show');document.getElementById('adminDisplayName').textContent=r.admin.name||r.admin.username;showToast('เข้าสู่ระบบสำเร็จ','success');loadDashboard();startAutoRefresh();updateAdminLanguage();applyAdminRoleRestrictions();}
      catch(e){document.getElementById('loginError')?.classList.add('show');}
    };
  }
  window.checkAdminAuth=async function(){
    try{var r=await apiFetch('/api/admin/me');window.isAdminLoggedIn=true;window.currentAdmin=r.admin;try{if(typeof currentAdmin!=='undefined')currentAdmin=r.admin;}catch(e){}document.getElementById('loginPage').style.display='none';document.getElementById('adminPanel').classList.add('show');document.getElementById('adminDisplayName').textContent=r.admin.name||r.admin.username;setTimeout(function(){loadDashboard();startAutoRefresh();updateAdminLanguage();applyAdminRoleRestrictions();},50);}
    catch(e){window.isAdminLoggedIn=false;window.currentAdmin=null;document.getElementById('loginPage').style.display='flex';document.getElementById('adminPanel').classList.remove('show');}
  };
  window.logoutAdmin=async function(){try{await apiFetch('/api/admin/logout',{method:'POST'});}finally{window.isAdminLoggedIn=false;window.currentAdmin=null;window.location.reload();}};
  // Restore server-side member session after the original page has initialized.
  setTimeout(syncUser,0);
})();
