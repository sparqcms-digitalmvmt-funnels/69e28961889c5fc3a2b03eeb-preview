
(function () {
  var CONTACT_URL = "https://app-cms-api-proxy-staging-001.azurewebsites.net/contact";
  var APPKEY      = "685435949a3a8c5ffb4854ef";
  var TO          = "support@buyevergreen.co";
  var FUNNEL_ID   = "69e28961889c5fc3a2b03eeb";

  function byId(id) {
    return (
      document.getElementById(id) ||
      document.querySelector('[id^="' + id + '-"], [id^="' + id + '__"]')
    );
  }

  var $email   = byId('cf-email');
  var $phone   = byId('cf-phone');
  var $name    = byId('cf-name');
  var $subject = byId('cf-subject');
  var $message = byId('cf-message');
  var $submit  = byId('cf-submit');
  var $msg     = byId('cf-msg');

  function showMsg(text, isError) {
    if (!$msg) return;
    $msg.textContent = text || '';
    $msg.style.color = isError ? '#c0392b' : '';
  }

  function setLoading(on) {
    if (!$submit) return;
    $submit.disabled = !!on;
    $submit.textContent = on ? 'Sending...' : 'Send';
  }

  function validate() {
    var email = ($email && $email.value || '').trim();
    var phone = ($phone && $phone.value || '').trim();
    var subject = ($subject && $subject.value || '').trim();
    var message = ($message && $message.value || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showMsg('Please enter a valid email address.', true);
      if ($email) $email.focus();
      return null;
    }

    if (phone && !/^\d{10}$/.test(phone.replace(/\D/g, ''))) {
      showMsg('Phone number must be 10 digits.', true);
      if ($phone) $phone.focus();
      return null;
    }

    if (subject !== undefined && $subject && $subject.value.trim() === '') {
      showMsg('Subject cannot be blank.', true);
      if ($subject) $subject.focus();
      return null;
    }

    if (!message) {
      showMsg('Message cannot be blank.', true);
      if ($message) $message.focus();
      return null;
    }

    return { email, phone: phone || undefined, subject: subject || undefined, message };
  }

  async function submitContact(ev) {
    if (ev) ev.preventDefault();

    var fields = validate();
    if (!fields) return;

    showMsg('');
    setLoading(true);

    var name = ($name && $name.value || '').trim();
    var body = Object.assign(
      {
        email: fields.email,
        to: TO,
        appkey: APPKEY,
        funnelId: FUNNEL_ID,
        website: '', // honeypot — stays empty for real users
      },
      name ? { name: name } : {},
      fields.phone ? { phone: fields.phone } : {},
      fields.subject ? { subject: fields.subject } : {},
      { message: fields.message }
    );

    try {
      var res = await fetch(CONTACT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        var errText = '';
        try { errText = await res.text(); } catch (_) {}
        throw new Error(errText || ('HTTP ' + res.status));
      }

      showMsg('Your message has been sent. We\'ll be in touch soon.');
      setLoading(false);
      if ($subject) $subject.value = '';
      if ($message) $message.value = '';
    } catch (err) {
      console.error('[ContactForm]', err);
      showMsg('Something went wrong. Please try again.', true);
      setLoading(false);
    }
  }

  if ($submit) {
    $submit.addEventListener('click', submitContact);
    var $form = $submit.closest('form');
    if ($form) $form.addEventListener('submit', submitContact);
  }

  [$email, $phone, $subject].forEach(function (el) {
    if (!el) return;
    el.addEventListener('keydown', function (ev) {
      if (ev.key === 'Enter') submitContact(ev);
    });
  });
})();
