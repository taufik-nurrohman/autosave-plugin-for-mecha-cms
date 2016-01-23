(function(w, d, base) {

  // config block
  var speak = base.languages.plugin_autosave,
      id = AUTOSAVE_ID,
      interval = AUTOSAVE_INTERVAL,
      storage = localStorage.getItem('__autosave'),
      forms = d.getElementsByTagName('form'),
      has_forms = forms && forms.length > 0,
      title = d.title,
      date = null,
      body = d.body;

  if (!has_forms) return;

  storage = storage ? JSON.parse(storage) : false;

  // fix incorrect `__autosave` data type
  if (typeof storage !== "object") {
    localStorage.removeItem('__autosave');
  }

  // panel draw block
  (function() {
    var p = d.createElement('div'),
        time = storage[id] && storage[id]['time'] ? storage[id]['time'] : false;
    p.className = 'autosave-panel';
    p.id = 'autosave-panel';
    p.innerHTML = (time && d.getElementsByTagName('form') ? '<h3><strong><i class="fa fa-history"></i> ' + speak.text[0] + '</strong> <span>' + speak.text[1].replace(/%s/g, time) + '</span></h3>' : "") + '<p><button id="autosave-button-s">' + speak.button[0] + '</button> <button id="autosave-button-c">' + speak.button[1] + '</button> <button id="autosave-button-r">' + speak.button[2] + '</button></p>';
    d.body.appendChild(p);
  })();

  // auto save block
  (function() {
    var _panel = d.getElementById('autosave-panel'),
        _save = d.getElementById('autosave-button-s'),
        _clear = d.getElementById('autosave-button-c'),
        _restore = d.getElementById('autosave-button-r'),
        _h = _panel.children[0], input;
    // save
    function save(ret) {
      ret = ret || false;
      if (typeof storage !== "object") storage = {};
      if (typeof storage[id] !== "object") storage[id] = {};
      for (var i = 0, ien = forms.length; i < ien; ++i) {
        if (typeof storage[id][i] !== "object") storage[id][i] = {};
        input = forms[i].getElementsByTagName('*');
        for (var j = 0, jen = input.length; j < jen; ++j) {
          // ignore form input(s) w/o `name` attribute
          // ignore hidden form input(s)
          if (!input[j].name || input[j].type === 'hidden') continue;
          var name = input[j].name;
          // handle `<input name="foo[]">`
          if (name.match(/\[\]$/)) {
            var names = forms[i][name];
            storage[id][i][name] = [];
            for (var k = 0, ken = names.length; k < ken; ++k) {
              // handle `<input type="(checkbox|radio)">`
              if (/^checkbox|radio$/.test(names[k].type)) {
                storage[id][i][name].push(names[k].checked);
              } else {
                if (names[k].value !== "") storage[id][i][name].push(names[k].value);
              }
            }
          } else {
            // handle `<input type="(checkbox|radio)">`
            if (/^checkbox|radio$/.test(input[j].type)) {
              storage[id][i][name] = input[j].checked;
            } else {
              if (input[j].value !== "") storage[id][i][name] = input[j].value;
            }
          }
        }
      }
      date = (new Date()).toLocaleString();
      storage[id]['time'] = date;
      storage[id]['title'] = title;
      localStorage.setItem('__autosave', JSON.stringify(storage));
      _clear.style.display = "";
      _restore.style.display = "";
      _restore.disabled = false;
      base.fire('on_autosave_save', storage);
      return notify(speak.message[0].replace(/%s/g, date)), ret;
    }
    // restore
    function restore() {
      if (typeof storage[id] === "undefined") {
        return notify(speak.message[3]), false;
      }
      delete storage[id]['time'];
      delete storage[id]['title'];
      for (var i in storage[id]) {
        if (typeof forms[i] === "undefined") continue;
        for (var j in storage[id][i]) {
          var v = false;
          // handle `<input name="foo[]">`
          if (typeof storage[id][i][j] === "object") {
            for (var k in forms[i][j]) {
              // ignore hidden form input(s)
              if (!forms[i][j][k] || forms[i][j][k].type === 'hidden') continue;
              v = storage[id][i][j][k];
              if (v && v !== "") {
                forms[i][j][k][/^checkbox|radio$/.test(forms[i][j][k].type) ? 'checked' : 'value'] = v;
              }
            }
          } else {
            // ignore hidden form input(s)
            if (!forms[i][j] || forms[i][j].type === 'hidden') continue;
            v = storage[id][i][j];
            if (v && v !== "") {
              forms[i][j][/^checkbox|radio$/.test(forms[i][j].type) ? 'checked' : 'value'] = v;
            }
          }
        }
      }
      // trigger event on form element(s)
      base.fire('FORM_REFRESH');
      base.fire('on_autosave_restore', storage);
      return notify(speak.message[2]), false;
    }
    // clear
    function clear() {
      delete storage[id];
      localStorage.setItem('__autosave', JSON.stringify(storage));
      _clear.style.display = 'none';
      _restore.disabled = true;
      w.clearInterval(ii);
      base.fire('on_autosave_clear', storage);
      return notify(speak.message[1]), false;
    }
    // notify
    function notify(text) {
      var m = d.createElement('div');
      m.className = 'autosave-message';
      m.id = 'autosave-message';
      m.innerHTML = '<div>' + text + '</div>';
      d.title = text;
      body.appendChild(m);
      base.fire('on_autosave_update', storage);
      w.setTimeout(function() {
        d.title = title;
        if (m.parentNode) body.removeChild(m);
      }, 5000);
    }
    // apply ...
    var ii = interval && !storage[id] ? w.setInterval(save, interval * 1000) : null;
    _save.onclick = function() {
      if (interval) {
        w.clearInterval(ii);
        ii = w.setInterval(save, interval * 1000);
      }
      return save();
    };
    _clear.onclick = clear;
    _restore.onclick = restore;
    _h.onclick = function() {
      _panel.className += ' visible';
    };
    // save on page exit ...
    w.onunload = function() {
      return save(true);
    };
  })();

})(window, document, DASHBOARD);