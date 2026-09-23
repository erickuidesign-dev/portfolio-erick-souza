/* Lead form: inline validation, accessible messages and submission to the configured endpoint.
   The form is a normal <form> with native validation attributes, so it still works without this
   script. All visible texts come from data-* attributes written by the build (content.py). */
(() => {
  const form = document.getElementById('lead-form');
  if (!form) return;

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const TIMEOUT_MS = 15000;
  const text = form.dataset;
  const status = form.querySelector('.lead-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const controls = [...form.elements].filter((el) => el.id.startsWith('lead-') && el.name !== 'website');

  form.noValidate = true;

  const setError = (control, message) => {
    const box = document.getElementById(`${control.id}-error`);
    control.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (!box) return;
    box.textContent = message;
    box.hidden = !message;
  };

  const validate = (control) => {
    const value = control.value.trim();
    let message = '';
    if (control.type === 'checkbox') {
      if (control.required && !control.checked) message = text.msgConsent;
    } else if (control.required && !value) {
      message = text.msgRequired;
    } else if (control.type === 'email' && value && !EMAIL_PATTERN.test(value)) {
      message = text.msgEmail;
    }
    setError(control, message);
    return message === '';
  };

  const showStatus = (message, isError) => {
    status.textContent = message;
    status.classList.toggle('is-error', isError);
    status.setAttribute('role', isError ? 'alert' : 'status');
    status.hidden = false;
  };

  const setBusy = (busy) => {
    submitButton.disabled = busy;
    submitButton.textContent = busy ? text.msgSending : text.submitLabel;
    form.setAttribute('aria-busy', String(busy));
  };

  const showSuccess = () => {
    const box = document.createElement('div');
    const title = document.createElement('h3');
    const body = document.createElement('p');
    box.className = 'lead-success';
    box.tabIndex = -1;
    box.setAttribute('role', 'status');
    title.className = 'display';
    title.textContent = text.successTitle;
    body.textContent = text.successText;
    box.append(title, body);
    form.replaceChildren(box);
    box.focus();
  };

  // Clear a field's error as soon as the visitor fixes it.
  controls.forEach((control) => {
    const revalidate = () => { if (control.getAttribute('aria-invalid') === 'true') validate(control); };
    control.addEventListener('input', revalidate);
    control.addEventListener('change', revalidate);
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.hidden = true;

    const results = controls.map(validate);
    if (results.includes(false)) {
      controls.find((control) => control.getAttribute('aria-invalid') === 'true').focus();
      return;
    }
    // Honeypot: a real visitor never sees this field. Bots that fill it get a fake success and nothing is sent.
    if (form.elements.website.value) { showSuccess(); return; }
    // No destination yet: say so plainly rather than pretending the message went anywhere.
    const endpoint = form.getAttribute('action');
    if (!endpoint) { showStatus(text.msgUnconfigured, true); return; }

    setBusy(true);
    const data = new FormData(form);
    data.delete('website');
    data.append('page', window.location.href);
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`The form service answered ${response.status}`);
      showSuccess();
    } catch (error) {
      showStatus(text.msgError, true);
    } finally {
      window.clearTimeout(timer);
      setBusy(false);
    }
  });
})();
