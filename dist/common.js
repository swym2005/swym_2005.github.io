(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#navigation');
  function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded','false'); }
  menu.addEventListener('click', () => {
    const opened = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded',String(opened));
    navigation.classList.toggle('open',opened);
  });
  navigation.addEventListener('click',event=>{if(event.target.closest('a')) closeMenu();});
  document.addEventListener('click',event=>{if(!event.target.closest('.nav-wrap')) closeMenu();});
  document.addEventListener('keydown',event=>{if(event.key === 'Escape' && menu.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
  window.matchMedia('(min-width:601px)').addEventListener('change',closeMenu);
  const filters = [...document.querySelectorAll('[data-filter]')];
  filters.forEach(button=>button.addEventListener('click',()=>{
    filters.forEach(filter=>{const active=filter===button;filter.classList.toggle('active',active);filter.setAttribute('aria-pressed',String(active));});
    let count=0;
    document.querySelectorAll('#all-projects .case-card').forEach(card=>{
      card.hidden = button.dataset.filter !== 'all' && card.dataset.category !== button.dataset.filter;
      if(!card.hidden) count++;
    });
    document.querySelector('#filter-status').textContent=`${count} ${count===1?'project':'projects'} shown`;
  }));
})();
