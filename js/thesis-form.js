/*************************************************
 *  Thesis enquiry form (thesis/index.html).
 *
 *  Sends the form as JSON to Web3Forms, which emails it to the address its
 *  access key was created for. Spam protection: the hidden "botcheck"
 *  honeypot (Web3Forms drops submissions that tick it) and Web3Forms' own
 *  spam filter.
 **************************************************/

(function () {
  var ENDPOINT = 'https://api.web3forms.com/submit';
  var FALLBACK = 'Please write to me directly at philipp.schicho[at]unige.ch.';

  var form = document.getElementById('thesis-form');
  var status = document.getElementById('tf-status');
  var button = form.querySelector('button[type=submit]');

  function setStatus(text, kind) {
    status.textContent = text;
    status.className = 'thesis-status mt-3 mb-0' + (kind ? ' is-' + kind : '');
  }

  // Multiple checked topics share one name: join them into a single field.
  function payload() {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = key in data ? data[key] + ', ' + value : value;
    });
    data.subject = 'Thesis enquiry from ' + data.name;
    return data;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    button.disabled = true;
    setStatus('Sending…');
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload())
    })
      .then(function (response) { return response.json(); })
      .then(function (json) {
        if (!json.success) {
          throw new Error(json.message || (json.body && json.body.message) || 'unknown error');
        }
        form.reset();
        setStatus('Thank you! Your enquiry has been sent, and I will get back to you soon.', 'success');
      })
      .catch(function (error) {
        setStatus('Sorry, your enquiry could not be sent (' + error.message + '). ' + FALLBACK, 'error');
      })
      .then(function () {
        button.disabled = false;
      });
  });
})();
