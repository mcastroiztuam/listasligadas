document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 0. INTEGRACIÓN CON SUPABASE (V2)
  // ==========================================
  const SUPABASE_URL = 'https://cltqcdulmprwmxurjdrx.supabase.co'; 
  const SUPABASE_ANON_KEY = 'sb_publishable_CNJNIcAjrufwDFAX4stx_Q_MKcFYvzj';

  // Inicializar el cliente de Supabase
  const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // Elementos del DOM para Autenticación
  const authContainer = document.getElementById('auth-container');
  const appContainer = document.getElementById('app-container');
  const authForm = document.getElementById('auth-form');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const btnRegister = document.getElementById('btn-register');
  const btnLogout = document.getElementById('btn-logout');

  // Escuchar cambios en el estado de autenticación de Supabase
  _supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
      // Usuario autenticado: Mostrar app, ocultar login
      authContainer.style.display = 'none';
      appContainer.style.display = 'block';
    } else {
      // Usuario no autenticado: Mostrar login, ocultar app
      authContainer.style.display = 'flex';
      appContainer.style.display = 'none';
    }
  });

  // Manejo del formulario de Login (Submit)
  authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;

    const { error } = await _supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(`Error al iniciar sesión: ${error.message}`);
    } else {
      authForm.reset();
    }
  });

  // Manejo del botón de Registro
  btnRegister.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      alert('Por favor ingresa un correo y contraseña válidos para registrarte.');
      return;
    }

    const { error } = await _supabase.auth.signUp({ email, password });
    if (error) {
      alert(`Error en el registro: ${error.message}`);
    } else {
      alert('¡Usuario registrado con éxito! Si configuraste confirmación por correo, no olvides revisarlo.');
    }
  });

  // Manejo del botón de Cerrar Sesión
  btnLogout.addEventListener('click', async () => {
    const { error } = await _supabase.auth.signOut();
    if (error) alert(`Error al cerrar sesión: ${error.message}`);
  });


  // ==========================================
  // 1. SLIDES ENGINE
  // ==========================================
  const slides = document.querySelectorAll('.slide-content');
  const navItems = document.querySelectorAll('.nav-item');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const slideIndicator = document.getElementById('slideIndicator');
  const progressBar = document.getElementById('progressBar');
  let currentSlide = 0;
  const totalSlides = slides.length;

  function updateSlides() {
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === currentSlide);
    });
    navItems.forEach((n, i) => {
      n.classList.toggle('active', i === currentSlide);
    });
    slideIndicator.textContent = `Diapositiva ${currentSlide + 1} de ${totalSlides}`;
    progressBar.style.width = `${((currentSlide + 1) / totalSlides) * 100}%`;
    btnPrev.disabled = currentSlide === 0;
    btnNext.disabled = currentSlide === totalSlides - 1;
    btnPrev.style.opacity = currentSlide === 0 ? '0.4' : '1';
    btnNext.style.opacity = currentSlide === totalSlides - 1 ? '0.4' : '1';
  }

  btnPrev.addEventListener('click', () => { if (currentSlide > 0) { currentSlide--; updateSlides(); } });
  btnNext.addEventListener('click', () => { if (currentSlide < totalSlides - 1) { currentSlide++; updateSlides(); } });
  navItems.forEach(n => {
    n.addEventListener('click', () => {
      currentSlide = parseInt(n.getAttribute('data-slide'));
      updateSlides();
    });
  });
  updateSlides();

  // ==========================================
  // 2. SIMULADOR — ESTADO
  // ==========================================
  let lista = []; // cada elemento: { dato: number, id: string }
  let nodeIdCounter = 0;

  const simInput = document.getElementById('simInput');
  const nodesRow = document.getElementById('nodesRow');
  const visEmpty = document.getElementById('visEmpty');
  const simConsole = document.getElementById('simConsole');
  const statusPill = document.getElementById('statusPill');
  const nodeCountEl = document.getElementById('nodeCount');

  // ==========================================
  // 3. HELPERS
  // ==========================================
  function log(msg, type = 'muted-log') {
    const line = document.createElement('div');
    line.className = `log-line text-${type}`;
    const now = new Date();
    const t = now.toTimeString().split(' ')[0];
    line.innerHTML = `<span style="opacity:0.4;">[${t}]</span> › ${msg}`;
    simConsole.appendChild(line);
    simConsole.scrollTop = simConsole.scrollHeight;
  }

  function highlight(...ids) {
    document.querySelectorAll('.c-line').forEach(el => el.classList.remove('exec'));
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('exec');
    });
    setTimeout(() => {
      ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('exec');
      });
    }, 1800);
  }

  function getInputVal() {
    const v = parseInt(simInput.value);
    if (isNaN(v)) return Math.floor(Math.random() * 90) + 10;
    return v;
  }

  function clearInput() { simInput.value = ''; }

  // ==========================================
  // 4. RENDER
  // ==========================================
  function render() {
    nodesRow.innerHTML = '';

    if (lista.length === 0) {
      visEmpty.style.display = 'block';
      nodesRow.style.display = 'none';
      statusPill.textContent = 'Vacía';
      statusPill.className = 'status-pill status-empty';
      nodeCountEl.textContent = '0';
      return;
    }

    visEmpty.style.display = 'none';
    nodesRow.style.display = 'flex';
    statusPill.textContent = 'Con datos';
    statusPill.className = 'status-pill status-ok';
    nodeCountEl.textContent = lista.length;

    lista.forEach((node, i) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'vis-node';
      wrapper.id = `vnode-${node.id}`;

      if (i === 0) {
        const headPtr = document.createElement('div');
        headPtr.className = 'head-pointer';
        headPtr.innerHTML = `<span>HEAD</span><span class="down-arrow">↓</span>`;
        wrapper.appendChild(headPtr);
      } else {
        const spacer = document.createElement('div');
        spacer.style.height = '34px';
        wrapper.appendChild(spacer);
      }

      const box = document.createElement('div');
      box.className = 'vis-node-box';

      const datoEl = document.createElement('div');
      datoEl.className = 'vis-node-dato';
      datoEl.textContent = node.dato;

      const sigEl = document.createElement('div');
      sigEl.className = 'vis-node-sig';
      sigEl.textContent = i < lista.length - 1 ? '→' : '⤳';

      box.appendChild(datoEl);
      box.appendChild(sigEl);
      wrapper.appendChild(box);

      const lbl = document.createElement('div');
      lbl.className = 'vis-node-label';
      lbl.textContent = `nodo[${i}]`;
      wrapper.appendChild(lbl);

      nodesRow.appendChild(wrapper);

      if (i < lista.length - 1) {
        const arrow = document.createElement('div');
        arrow.className = 'vis-arrow';
        arrow.textContent = '→';
        nodesRow.appendChild(arrow);
      }
    });

    const nullArrow = document.createElement('div');
    nullArrow.className = 'vis-arrow';
    nullArrow.textContent = '→';
    nodesRow.appendChild(nullArrow);

    const nullBox = document.createElement('div');
    nullBox.className = 'vis-null';
    nullBox.innerHTML = `<div class="vis-null-box">null</div>`;
    nodesRow.appendChild(nullBox);
  }

  function flashNode(index, delay = 100) {
    setTimeout(() => {
      const nodeId = lista[index]?.id;
      if (!nodeId) return;
      const el = document.getElementById(`vnode-${nodeId}`);
      if (!el) return;
      const box = el.querySelector('.vis-node-box');
      if (box) { box.classList.add('highlight'); setTimeout(() => box.classList.remove('highlight'), 800); }
    }, delay);
  }

  // ==========================================
  // 5. OPERACIONES
  // ==========================================
  document.getElementById('btnInsertarInicio').addEventListener('click', () => {
    const dato = getInputVal();
    clearInput();
    highlight('cl-nuevo', 'cl-ins-ini-1', 'cl-ins-ini-2');
    const newNode = { dato, id: `n${nodeIdCounter++}` };
    lista.unshift(newNode);
    render();
    flashNode(0, 50);
    log(`insertarInicio(${dato}) → nuevo nodo al frente. cabeza apunta ahora al nodo ${dato}.`, 'success');
  });

  document.getElementById('btnInsertarFinal').addEventListener('click', () => {
    const dato = getInputVal();
    clearInput();
    if (lista.length === 0) {
      highlight('cl-nuevo', 'cl-ins-fin-check');
    } else {
      highlight('cl-nuevo', 'cl-ins-fin-loop', 'cl-ins-fin-while', 'cl-ins-fin-link');
    }
    const newNode = { dato, id: `n${nodeIdCounter++}` };
    lista.push(newNode);
    render();
    flashNode(lista.length - 1, 50);
    log(`insertarFinal(${dato}) → nuevo nodo al final después de recorrer ${Math.max(0, lista.length - 1)} nodo(s).`, 'info');
  });

  document.getElementById('btnEliminarInicio').addEventListener('click', () => {
    if (lista.length === 0) {
      log('eliminarInicio() → Error: la lista está vacía.', 'danger');
      return;
    }
    highlight('cl-eli-ini-check', 'cl-eli-ini-move');
    const removed = lista[0];

    const el = document.getElementById(`vnode-${removed.id}`);
    if (el) el.classList.add('removing');
    setTimeout(() => {
      lista.shift();
      render();
      log(`eliminarInicio() → nodo con dato ${removed.dato} eliminado. cabeza ahora apunta a ${lista[0] ? lista[0].dato : 'null'}.`, 'warning');
    }, 300);
  });

  document.getElementById('btnEliminarFinal').addEventListener('click', () => {
    if (lista.length === 0) {
      log('eliminarFinal() → Error: la lista está vacía.', 'danger');
      return;
    }
    if (lista.length === 1) {
      highlight('cl-eli-fin-check', 'cl-eli-fin-single');
    } else {
      highlight('cl-eli-fin-loop', 'cl-eli-fin-while', 'cl-eli-fin-null');
    }
    const removed = lista[lista.length - 1];

    const el = document.getElementById(`vnode-${removed.id}`);
    if (el) el.classList.add('removing');
    setTimeout(() => {
      lista.pop();
      render();
      log(`eliminarFinal() → nodo con dato ${removed.dato} eliminado. Recorrió ${lista.length} nodo(s) para llegar al penúltimo.`, 'warning');
    }, 300);
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    lista = [];
    render();
    simConsole.innerHTML = '';
    log('Lista reiniciada. cabeza → null.', 'muted-log');
  });

  simInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btnInsertarInicio').click();
  });

  // Render inicial
  render();
  log('Lista lineal enlazada inicializada. cabeza → null.', 'muted-log');
});
