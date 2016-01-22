(function(base) {

  // config block
  var speak = base.languages.plugin_autosave,
      s = base.segment;

  // panel draw block
  (function(w, d) {
    var p = d.createElement('div'),
        time = localStorage.getItem('__autosave_' + s + '_recent');
    p.className = 'autosave-panel';
    p.id = 'autosave-panel';
    p.innerHTML = (time && d.getElementsByTagName('form') ? '<h3><i class="fa fa-history"></i> ' + speak.text[0] + '<small>' + speak.text[1].replace(/%s/g, time) + '</small></h3>' : "") + '<p><button id="autosave-button-s">' + speak.button[0] + '</button> <button id="autosave-button-c">' + speak.button[1] + '</button> <button id="autosave-button-r">' + speak.button[2] + '</button></p>';
    d.body.appendChild(p);
  })(window, document);

  // auto save block
  (function(w, d) {
    var forms = d.getElementsByTagName('form'),
        has_forms = forms && forms.length > 0,
        body = d.body;
    var _panel = d.getElementById('autosave-panel'),
        _save = d.getElementById('autosave-button-s'),
        _clear = d.getElementById('autosave-button-c'),
        _restore = d.getElementById('autosave-button-r'),
        _title = d.title,
        _h = _panel.children[0];
    if (!has_forms) return;
    var storage = localStorage.getItem('__autosave_' + s),
        input;
    storage = storage ? JSON.parse(storage) : false;
    // first initiation ...
    if (!storage) {
      _clear.style.display = 'none';
      _restore.style.display = 'none';
    }
    // save
    function save(ret) {
      storage = storage || {};
      ret = ret || false;
      for (var i = 0, ien = forms.length; i < ien; ++i) {
        if (typeof storage[i] === "undefined") storage[i] = {};
        input = forms[i].getElementsByTagName('*');
        for (var j = 0, jen = input.length; j < jen; ++j) {
          // ignore form input(s) w/o `name` attribute
          // ignore hidden form input(s)
          if (!input[j].name || input[j].type === 'hidden') continue;
          var name = input[j].name;
          // handle `<input name="foo[]">`
          if (name.match(/\[\]$/)) {
            var names = forms[i][name];
            storage[i][name] = [];
            for (var k = 0, ken = names.length; k < ken; ++k) {
              // handle `<input type="(checkbox|radio)">`
              if (/^checkbox|radio$/.test(names[k].type)) {
                storage[i][name].push(names[k].checked);
              } else {
                if (names[k].value !== "") storage[i][name].push(names[k].value);
              }
            }
          } else {
            // handle `<input type="(checkbox|radio)">`
            if (/^checkbox|radio$/.test(input[j].type)) {
              storage[i][name] = input[j].checked;
            } else {
              if (input[j].value !== "") storage[i][name] = input[j].value;
            }
          }
        }
      }
      localStorage.setItem('__autosave_' + s, JSON.stringify(storage));
      _clear.style.display = "";
      _restore.style.display = "";
      _restore.disabled = false;
      var date = (new Date()).toLocaleString();
      localStorage.setItem('__autosave_' + s + '_recent', date);
      base.fire('on_autosave_save', storage);
      return notify(speak.message[0].replace(/%s/g, date)), ret;
    }
    // restore
    function restore() {
      if (!storage) {
        return notify(speak.message[3]), false;
      }
      var forms = d.getElementsByTagName('form');
      for (var i in storage) {
        if (typeof forms[i] === "undefined") continue;
        for (var j in storage[i]) {
          var v = false;
          if (typeof storage[i][j] === "object") {
            for (var k in forms[i][j]) {
              // ignore hidden form input(s)
              if (!forms[i][j][k] || forms[i][j][k].type === 'hidden') continue;
              v = storage[i][j][k];
              if (v && v !== "") {
                forms[i][j][k][/^checkbox|radio$/.test(forms[i][j][k].type) ? 'checked' : 'value'] = v;
              }
            }
          } else {
            // ignore hidden form input(s)
            if (!forms[i][j] || forms[i][j].type === 'hidden') continue;
            v = storage[i][j];
            if (v && v !== "") {
              forms[i][j][/^checkbox|radio$/.test(forms[i][j].type) ? 'checked' : 'value'] = v;
            }
          }
        }
      }
      if (typeof Zepto === "function") {
        Zepto('input,select,textarea').trigger("change");
      } else if (typeof jQuery === "function") {
        jQuery('input,select,textarea').trigger("change");
      }
      base.fire('on_autosave_restore', storage);
      return notify(speak.message[2]), false;
    }
    // clear
    function clear() {
      localStorage.removeItem('__autosave_' + s);
      localStorage.removeItem('__autosave_' + s + '_recent');
      _clear.style.display = 'none';
      _restore.disabled = true;
      _panel.style.display = 'none';
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
        d.title = _title;
        if (m.parentNode) body.removeChild(m);
      }, 3000);
    }
    // apply ...
    var ii = AUTOSAVE_INTERVAL && !storage ? w.setInterval(save, AUTOSAVE_INTERVAL * 1000) : null;
    _save.onclick = function() {
      if (AUTOSAVE_INTERVAL) {
        w.clearInterval(ii);
        ii = w.setInterval(save, AUTOSAVE_INTERVAL * 1000);
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
  })(window, document);

})(DASHBOARD);