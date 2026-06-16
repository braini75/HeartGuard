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
			_('Lege fest, wann jedes Profil Internetzugang hat. Außerhalb dieser Zeiten wird der Zugang automatisch gesperrt.'));

		s = m.section(form.TypedSection, 'profile', _('Profil-Zeitpläne'));
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

		return m.render();
	}
});
