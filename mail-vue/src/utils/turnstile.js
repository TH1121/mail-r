const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let loadingPromise = null;

function waitUntilReady(timeoutMs) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tick = () => {
      if (window.turnstile?.render) {
        resolve(window.turnstile);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        reject(new Error('turnstile timeout'));
        return;
      }
      setTimeout(tick, 80);
    };
    tick();
  });
}

/** 确保 Turnstile 脚本可用，失败会重新拉取脚本 */
export function ensureTurnstile(timeoutMs = 12000) {
  if (window.turnstile?.render) {
    return Promise.resolve(window.turnstile);
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = new Promise((resolve, reject) => {
    const finishOk = (api) => {
      loadingPromise = null;
      resolve(api);
    };
    const finishErr = (err) => {
      loadingPromise = null;
      reject(err);
    };

    const existing = document.querySelector('script[data-turnstile-api]');
    if (existing) {
      waitUntilReady(timeoutMs).then(finishOk).catch(() => {
        existing.remove();
        try {
          delete window.turnstile;
        } catch (_) {
          window.turnstile = undefined;
        }
        loadingPromise = null;
        ensureTurnstile(timeoutMs).then(finishOk).catch(finishErr);
      });
      return;
    }

    const script = document.createElement('script');
    script.src = TURNSTILE_SRC;
    script.async = true;
    script.defer = true;
    script.dataset.turnstileApi = '1';
    script.onload = () => {
      waitUntilReady(timeoutMs).then(finishOk).catch(finishErr);
    };
    script.onerror = () => {
      script.remove();
      finishErr(new Error('turnstile script error'));
    };
    document.head.appendChild(script);
  });

  return loadingPromise;
}

/**
 * 渲染或重置 Turnstile 组件
 * @returns {Promise<string|null>} widgetId
 */
export async function mountTurnstile(selector, {
  sitekey,
  widgetId = null,
  callback,
  'error-callback': errorCallback,
  'expired-callback': expiredCallback,
} = {}) {
  const api = await ensureTurnstile();
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) {
    throw new Error('turnstile container missing');
  }

  if (widgetId != null) {
    try {
      api.reset(widgetId);
      return widgetId;
    } catch (_) {
      try {
        api.remove?.(widgetId);
      } catch (_) {
        /* ignore */
      }
    }
  }

  el.innerHTML = '';

  return api.render(el, {
    sitekey,
    callback,
    'error-callback': errorCallback,
    'expired-callback': expiredCallback,
  });
}
