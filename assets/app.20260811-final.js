if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

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
    p.nextElementSibling.textContent = annual ? 'al año · ahorras 2 meses' : 'al mes';
  });
}));

const moduleSelector = document.querySelector('[data-module-selector]');
if (moduleSelector) {
  const checkboxes = [...moduleSelector.querySelectorAll('[data-module-choice]')];
  const summaryTitle = moduleSelector.querySelector('[data-selector-title]');
  const price = moduleSelector.querySelector('[data-selector-price]');
  const period = moduleSelector.querySelector('[data-selector-period]');
  const message = moduleSelector.querySelector('[data-selector-message]');
  const selectedList = moduleSelector.querySelector('[data-selector-list]');
  const cta = moduleSelector.querySelector('[data-selector-cta]');
  const moduleNames = {
    basic: 'Basic',
    control: 'Control',
    growth: 'Growth',
    delivery: 'Delivery'
  };
  const getSelection = () => {
    const extras = checkboxes
      .filter(input => input.dataset.moduleChoice !== 'basic' && input.checked)
      .map(input => input.dataset.moduleChoice);
    return ['basic', ...extras];
  };
  const getMonthlyPrice = count => {
    if (count <= 1) return 119;
    if (count === 2) return 169;
    if (count === 3) return 199;
    return 249;
  };
  const getMessage = count => {
    if (count <= 1) return 'Por 50 € más al mes puedes añadir Growth, Delivery o Control y llevarte un plan más completo.';
    if (count === 2) return 'Por 30 € más al mes puedes llevarte otro módulo y conectar aún más áreas del restaurante.';
    if (count === 3) return 'Ya tienes Basic + 2 módulos. Por 50 € más al mes puedes llevarte el plan Total.';
    return 'Plan Total seleccionado: todos los módulos conectados en una sola plataforma.';
  };
  const updateSelector = () => {
    const selected = getSelection();
    const selectedExtras = selected.filter(name => name !== 'basic');
    const monthly = getMonthlyPrice(selected.length);
    const annualActive = document.querySelector('[data-billing].active')?.dataset.billing === 'annual';
    summaryTitle.textContent = selected.length === 4 ? 'Total' : selected.map(name => moduleNames[name]).join(' + ');
    price.textContent = `${annualActive ? monthly * 10 : monthly} €`;
    period.textContent = annualActive ? 'al año · ahorras 2 meses' : 'al mes · sin IVA';
    message.textContent = getMessage(selected.length);
    selectedList.textContent = selectedExtras.length
      ? `Incluye Basic + ${selectedExtras.map(name => moduleNames[name]).join(' + ')}`
      : 'Incluye Basic';
    cta.href = 'https://wa.me/34634141158?text=' + encodeURIComponent(`Hola, me interesa ${summaryTitle.textContent} por ${monthly} €/mes + IVA`);
  };
  checkboxes.forEach(input => {
    input.addEventListener('change', () => {
      if (input.dataset.moduleChoice === 'basic') input.checked = true;
      updateSelector();
    });
  });
  document.querySelectorAll('[data-billing]').forEach(btn => btn.addEventListener('click', updateSelector));
  updateSelector();
}
