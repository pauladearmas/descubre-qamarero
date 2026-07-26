if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const initialPath = location.pathname + location.search;
let keepInitialScroll = true;
let initialScrollLock = null;
function resetInitialScroll() {
  if (location.hash) history.replaceState(null, '', initialPath);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}
function stopInitialScrollLock() {
  keepInitialScroll = false;
  if (initialScrollLock) clearInterval(initialScrollLock);
}
['wheel','touchstart','keydown','mousedown','pointerdown'].forEach(eventName => {
  window.addEventListener(eventName, stopInitialScrollLock, { once:true, passive:true });
});
function startInitialScrollLock() {
  resetInitialScroll();
  initialScrollLock = setInterval(() => {
    if (!keepInitialScroll) return;
    resetInitialScroll();
  }, 80);
  setTimeout(() => {
    if (initialScrollLock) clearInterval(initialScrollLock);
    if (keepInitialScroll) resetInitialScroll();
  }, 7000);
}
resetInitialScroll();
window.addEventListener('DOMContentLoaded', startInitialScrollLock);
window.addEventListener('pageshow', startInitialScrollLock);
window.addEventListener('load', () => {
  resetInitialScroll();
  requestAnimationFrame(resetInitialScroll);
  setTimeout(resetInitialScroll, 1200);
  setTimeout(resetInitialScroll, 3500);
});

const planFilters = {
  basic: ['basic'],
  control: ['basic','control'],
  delivery: ['basic','delivery'],
  growth: ['basic','growth']
};
const planSearchParams = new URLSearchParams(window.location.search);
const planParams = planSearchParams.getAll('plan');
const planParam = planParams.length === 1 ? planParams[0].trim().toLowerCase() : '';
const activePlanList = Object.prototype.hasOwnProperty.call(planFilters, planParam) ? planFilters[planParam] : null;
const activePlanSet = activePlanList ? new Set(activePlanList) : null;
function applyPlanVisibility() {
  document.documentElement.dataset.planView = activePlanSet ? planParam : 'full';
  document.querySelectorAll('[data-plan]').forEach(element => {
    const elementPlans = (element.dataset.plan || '').split(/\s+/).filter(Boolean);
    const shouldHide = activePlanSet && !elementPlans.some(plan => activePlanSet.has(plan));
    element.classList.toggle('plan-hidden', Boolean(shouldHide));
    element.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
  });
  document.querySelectorAll('[data-plan-any]').forEach(element => {
    const elementPlans = (element.dataset.planAny || '').split(/\s+/).filter(Boolean);
    const shouldHide = activePlanSet && !elementPlans.some(plan => activePlanSet.has(plan));
    element.classList.toggle('plan-hidden', Boolean(shouldHide));
    element.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
  });
  document.querySelectorAll('[data-plan-scope="full"]').forEach(element => {
    const shouldHide = Boolean(activePlanSet);
    element.classList.toggle('plan-hidden', shouldHide);
    element.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
  });
  const activeModule = document.querySelector('.module-view.active');
  if (activeModule && activeModule.classList.contains('plan-hidden')) {
    moduleViews.forEach(view => view.classList.remove('active'));
    const basicModule = document.getElementById('module-basic');
    if (basicModule) basicModule.classList.add('active');
  }
}

const moduleViews = [...document.querySelectorAll('.module-view')];
function openModule(name) {
  const target = document.getElementById('module-' + name);
  if (target && target.classList.contains('plan-hidden')) return;
  moduleViews.forEach(v => v.classList.toggle('active', v.id === 'module-' + name));
  if (target) target.scrollIntoView({behavior:'smooth',block:'start'});
}
applyPlanVisibility();
document.querySelectorAll('[data-open-module]').forEach(btn => btn.addEventListener('click', () => openModule(btn.dataset.openModule)));

const deferredHardwareFrame = document.querySelector('.hardware-frame[data-src]');
if (deferredHardwareFrame) {
  const loadHardwareFrame = () => {
    if (!deferredHardwareFrame.src) deferredHardwareFrame.src = deferredHardwareFrame.dataset.src;
  };
  if ('IntersectionObserver' in window) {
    const hardwareObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        loadHardwareFrame();
        hardwareObserver.disconnect();
      }
    }, { rootMargin: '300px' });
    hardwareObserver.observe(deferredHardwareFrame);
  } else {
    window.addEventListener('scroll', loadHardwareFrame, { once:true, passive:true });
  }
}

const modal = document.getElementById('videoModal');
const videoTitle = document.getElementById('videoTitle');
const localVideo = document.getElementById('localVideo');
document.querySelectorAll('.video-button').forEach(btn => btn.addEventListener('click', () => {
  const url = btn.dataset.url;
  videoTitle.textContent = btn.dataset.title || 'Vídeo';
  const isLocalVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
  localVideo.pause();
  localVideo.removeAttribute('src');
  localVideo.load();
  localVideo.style.display = 'none';
  if (isLocalVideo) {
    localVideo.src = url;
    localVideo.style.display = 'block';
    localVideo.load();
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden','false');
}));
function closeVideo() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden','true');
  localVideo.pause();
  localVideo.removeAttribute('src');
  localVideo.load();
  localVideo.style.display = 'none';
}
document.getElementById('closeVideo').addEventListener('click', closeVideo);
modal.addEventListener('click', e => { if(e.target === modal) closeVideo(); });
document.addEventListener('keydown', e => { if(e.key === 'Escape') closeVideo(); });

const checkCompat = document.getElementById('checkCompat');
if (checkCompat) checkCompat.addEventListener('click', () => {
  const type = document.getElementById('deviceType').value;
  const system = document.getElementById('deviceSystem').value;
  const box = document.getElementById('compatResult');
  box.style.display='block';
  if(!type || !system) {
    box.textContent='Selecciona el tipo de equipo y el sistema o conexión para continuar.';
    return;
  }
  const compatible = ['Windows','Android','USB / LAN','WiFi'].includes(system);
  box.innerHTML = compatible
    ? '<strong>Probablemente compatible.</strong><br>Qamarero funciona con muchas configuraciones de ' + type + '. Confirma marca, modelo y conexiones con el equipo técnico antes de instalar.'
    : '<strong>Necesita revisión técnica.</strong><br>La compatibilidad con ' + system + ' depende del modelo y del uso previsto. Envíanos una foto o la referencia del equipo.';
});

document.querySelectorAll('[data-billing]').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('[data-billing]').forEach(b => b.classList.toggle('active', b === btn));
  const annual = btn.dataset.billing === 'annual';
  document.querySelectorAll('.price').forEach(p => {
    p.textContent = (annual ? p.dataset.annual : p.dataset.monthly) + ' €';
    p.nextElementSibling.textContent = annual ? 'al año · equivalente a 12 mensualidades' : 'al mes';
  });
}));
