'use strict';
// HeartGuard Schedule View

'require view';
'require form';
'require uci';

return view.extend({
	load: function() {
		return uci.load('heartguard');
	},

	render: function() {
		var m, s, o;

		m = new form.Map('heartguard', _('HeartGuard – Zeitpläne'),
			_('Lege fest, wann jedes Profil Internetzugang hat, und wann einzelne Websites erlaubt sind.'));

		// ── Profil-Zeitfenster ────────────────────────────────
		s = m.section(form.TypedSection, 'profile', _('Profil-Zeitfenster'),
			_('Außerhalb dieser Zeiten wird der Internetzugang für das Profil komplett gesperrt.'));
		s.anonymous = false;
		s.addremove = false;

		o = s.option(form.Value, 'weekday_start', _('Mo–Fr von'));
		o.datatype = 'string';
		o.placeholder = '15:00';
		o.rmempty = true;

		o = s.option(form.Value, 'weekday_end', _('Mo–Fr bis'));
		o.datatype = 'string';
		o.placeholder = '20:00';
		o.rmempty = true;

		o = s.option(form.Value, 'weekend_start', _('Sa–So von'));
		o.datatype = 'string';
		o.placeholder = '09:00';
		o.rmempty = true;

		o = s.option(form.Value, 'weekend_end', _('Sa–So bis'));
		o.datatype = 'string';
		o.placeholder = '21:00';
		o.rmempty = true;

		// ── Website-Zeitpläne ─────────────────────────────────
		s = m.section(form.GridSection, 'site_schedule', _('Website-Zeitpläne'),
			_('Websites sind NUR während des angegebenen Zeitfensters erreichbar. Außerhalb wird die Domain blockiert.'));
		s.addremove = true;
		s.anonymous = true;
		s.nodescriptions = true;
		s.addbtntitle = _('+ Website hinzufügen');

		o = s.option(form.ListValue, 'profile', _('Profil'));
		o.rmempty = false;
		o.width = '15%';
		uci.sections('heartguard', 'profile', function(sec) {
			var name = uci.get('heartguard', sec['.name'], 'name') || sec['.name'];
			o.value(sec['.name'], name);
		});

		o = s.option(form.Value, 'domain', _('Domain'));
		o.rmempty = false;
		o.datatype = 'hostname';
		o.placeholder = 'youtube.com';
		o.width = '20%';

		o = s.option(form.Value, 'weekday_start', _('Mo–Fr von'));
		o.datatype = 'string';
		o.placeholder = '15:00';
		o.width = '10%';
		o.rmempty = true;

		o = s.option(form.Value, 'weekday_end', _('bis'));
		o.datatype = 'string';
		o.placeholder = '18:00';
		o.width = '10%';
		o.rmempty = true;

		o = s.option(form.Value, 'weekend_start', _('Sa–So von'));
		o.datatype = 'string';
		o.placeholder = '10:00';
		o.width = '10%';
		o.rmempty = true;

		o = s.option(form.Value, 'weekend_end', _('bis'));
		o.datatype = 'string';
		o.placeholder = '20:00';
		o.width = '10%';
		o.rmempty = true;

		o = s.option(form.Flag, 'enabled', _('Aktiv'));
		o.default = '1';
		o.width = '8%';

		return m.render();
	}
});
