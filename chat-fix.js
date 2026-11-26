(function(){
function patch(w){
  var d=w.document;
  if(!d||!d.getElementById('composer')||d.getElementById('maro-confirm'))return;
  var st=d.createElement('style');
  st.textContent='#maro-confirm{display:none;width:100%;margin:0 0 8px;padding:12px;border:0;border-radius:14px;background:#25d366;color:#fff;font-weight:700;font-size:15px}#maro-confirm.show{display:block}#maro-confirm[disabled]{opacity:.6}#maro-confirm.ready{animation:mcp 1.6s ease-in-out infinite}@keyframes mcp{50%{transform:scale(1.03)}}';
  d.head.appendChild(st);
  var btn=d.createElement('button');
  btn.id='maro-confirm';btn.type='button';btn.textContent='أكد الطلب وافتح واتساب ↗';
  var comp=d.getElementById('composer');
  comp.parentNode.insertBefore(btn,comp);
  var msgs=d.getElementById('messages'),popup=null,waiting=false,t0=0;
  function show(ready){btn.classList.add('show');if(ready)btn.classList.add('ready')}
  var of=w.fetch;
  w.fetch=function(){
    var p=of.apply(this,arguments);
    try{if(String(arguments[0]).indexOf('/api/chat')>-1){p.then(function(r){return r.clone().json()}).then(function(j){if(j&&!j.error){show(!!j.ready||!!j.handoff)}}).catch(function(){})}}catch(e){}
    return p;
  };
  function finish(card){
    if(!waiting)return;
    var inp=card.querySelector('form input[name=text]'),f=card.querySelector('form');
    if(!inp||!f){waiting=false;btn.disabled=false;if(popup)popup.close();return}
    var uo=new URL(f.action);uo.searchParams.set('text',inp.value);var url=uo.href;
    waiting=false;btn.disabled=false;btn.textContent='أكد الطلب وافتح واتساب ↗';
    if(popup&&!popup.closed){popup.location.href=url}else{w.open(url,'_blank')}
  }
  new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.classList&&n.classList.contains('handoff-card'))finish(n)})})}).observe(msgs,{childList:true});
  btn.onclick=function(){
    if(btn.disabled)return;
    var ta=d.querySelector('textarea');
    try{popup=w.open('about:blank','_blank')}catch(e){popup=null}
    waiting=true;btn.disabled=true;btn.textContent='بجهز ملخص الطلب...';
    ta.value='أكد الطلب';ta.dispatchEvent(new w.Event('input',{bubbles:true}));
    d.getElementById('composer').requestSubmit();
    setTimeout(function(){if(waiting){waiting=false;btn.disabled=false;btn.textContent='أكد الطلب وافتح واتساب ↗';if(popup&&!popup.closed)popup.close()}},40000);
  };
  // show button once the first bot reply appears
  new MutationObserver(function(){if(msgs.querySelector('article.bot'))show(false)}).observe(msgs,{childList:true});
  if(msgs.querySelector('article.bot'))show(false);
}
function find(){
  var fr=document.querySelectorAll('iframe');
  fr.forEach(function(f){
    if(f.title!=='مساعد مطابع الدريني')return;
    function go(){try{patch(f.contentWindow)}catch(e){}}
    f.addEventListener('load',go);go();
    var n=0,iv=setInterval(function(){go();if(++n>20)clearInterval(iv)},500);
  });
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',find);else find();
})();
