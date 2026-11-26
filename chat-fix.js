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
  function fallback(users){
    if(!waiting)return;
    users=users.filter(function(t){return t&&t!=='أكد الطلب'});
    waiting=false;btn.disabled=false;btn.textContent='أكد الطلب وافتح واتساب ↗';
    if(!users.length){if(popup)popup.close();return}
    var uo=new URL(d.querySelector('.chat-foot a').href);
    uo.searchParams.set('text','أهلًا مطابع مارو الدريني، ده ملخص طلبي للمراجعة:\n\n'+users.join('\n')+'\n\nده طلب مراجعة، مش حجز مؤكد.');
    if(popup&&!popup.closed){popup.location.href=uo.href}else{w.open(uo.href,'_blank')}
  }
  var of=w.fetch;
  w.fetch=function(){
    var p=of.apply(this,arguments);
    try{if(String(arguments[0]).indexOf('/api/chat')>-1){
      var users=[].map.call(d.querySelectorAll('article.user'),function(a){return a.firstChild?a.firstChild.textContent:a.textContent});
      p.then(function(r){return r.clone().json().then(function(j){return [r,j]})}).then(function(x){var j=x[1];if(j&&!j.error&&x[0].ok){show(!!j.ready||!!j.handoff)}else if(waiting){fallback(users)}}).catch(function(){if(waiting)fallback(users)});
    }}catch(e){}
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
  function norm(x){return String(x||'').toLowerCase().replace(/[\u064B-\u065F\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/ة/g,'ه').replace(/[^\u0621-\u064Aa-z0-9? ؟]/g,' ').replace(/\s+/g,' ').trim()}
  var YES=/(^| )(اكد[\u0621-\u064Aa-z]*|تاكيد[\u0621-\u064Aa-z]*|اشتغل[\u0621-\u064Aa-z]*|اشتغلي|نفذ[\u0621-\u064Aa-z]*|ثبت[\u0621-\u064Aa-z]*|اعتمد[\u0621-\u064Aa-z]*|وافق[\u0621-\u064Aa-z]*|موافق[\u0621-\u064Aa-z]*|كمل الطلب|كمل الاوردر|ابعت الطلب|ابعتو|confirm[\u0621-\u064Aa-z]*|go ahead|proceed)( |$)/;
  var NO=/(^| )(لا|مش|ما|بلاش|الغي[\u0621-\u064Aa-z]*|الغاء|هل|ازاي|امتي|ليه|اي|ايه|كام|فين|لسه|قبل ما|لو)( |$)/;
  function isConfirm(v){var n=norm(v);if(!n||n.length>45||/[?؟]/.test(n))return false;return YES.test(n)&&!NO.test(n)}
  d.getElementById('composer').addEventListener('submit',function(e){
    if(waiting)return;
    var ta=d.querySelector('textarea');
    if(ta&&btn.classList.contains('show')&&isConfirm(ta.value)){e.preventDefault();e.stopImmediatePropagation();btn.onclick()}
  },true);
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
