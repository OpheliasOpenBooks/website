/* Progressive enhancement: a browser's native install prompt is optional. */
(() => {
  'use strict';
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js', { scope:'./' }).catch(error => console.warn('App registration unavailable:',error)));
  }
  const button=document.querySelector('[data-install-app]');
  const message=document.querySelector('[data-install-message]');
  if (!button) return;
  let installPrompt=null;
  const installed=window.matchMedia('(display-mode: standalone)').matches || Boolean(window.navigator.standalone);
  if(installed){
    button.hidden=true;
    if(message) message.textContent='You have opened the installed Ophelia’s Open Book app.';
    return;
  }
  window.addEventListener('beforeinstallprompt',event=>{
    event.preventDefault();
    installPrompt=event;
    button.hidden=false;
    if(message) message.textContent='Your browser is ready to install Ophelia’s Open Book.';
  });
  button.addEventListener('click',async()=>{
    if(!installPrompt)return;
    const event=installPrompt;installPrompt=null;button.hidden=true;
    try{await event.prompt();const result=await event.userChoice;
      if(result && result.outcome==='accepted'){
        if(message)message.textContent='App installation requested. Look for Ophelia’s icon on your device.';
      }else{
        if(message)message.textContent='You can install later from your browser’s menu.';
      }
    }catch(err){
      if(message)message.textContent='Use your browser’s menu to add Ophelia’s Open Book to your device.';
    }
  });
  window.addEventListener('appinstalled',()=>{
    installPrompt=null;button.hidden=true;
    if(message)message.textContent='Ophelia’s Open Book has been installed on this device.';
  });
})();
