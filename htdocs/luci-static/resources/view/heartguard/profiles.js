'use strict';
// HeartGuard Profiles View - UCI form-based
// /htdocs/luci-static/resources/view/heartguard/profiles.js

'require view';
'require form';
'require uci';
'require ui';

return view.extend({
	load: function() {
		return uci.load('heartguard');
	},

	render: function() {
		var m, s, o;

		m = new form.Map('heartguard', _('HeartGuard – Profile'),
			_('Verwalte Familienprofile mit Zeitplänen, Website-Filtern und blockierten Kategorien.'));

		// ── Global Settings ───────────────────────────────────
		s = m.section(form.TypedSection, 'heartguard', _('System'));
		s.anonymous = true;

		o = s.option(form.Flag, 'enabled', _('HeartGuard aktiv'));
		o.default = '1';

		o = s.option(form.Flag, 'block_unknown_devices', _('Unbekannte Geräte blockieren'),
			_('Geräte ohne Profil erhalten keinen Internetzugang'));
		o.default = '1';

		o = s.option(form.Flag, 'log_queries', _('DNS-Anfragen protokollieren'));
		o.default = '1';

		// ── Profiles ──────────────────────────────────────────
		s = m.section(form.GridSection, 'profile', _('Profile'));
		s.addremove = true;
		s.anonymous = false;
		s.nodescriptions = true;
		s.addbtntitle = _('+ Neues Profil');

		o = s.option(form.Value, 'name', _('Name'));
		o.rmempty = false;
		o.width = '15%';

		o = s.option(form.Value, 'age', _('Alter'));
		o.datatype = 'uinteger';
		o.width = '8%';

		o = s.option(form.ListValue, 'avatar', _('Avatar'));
		o.value('child', '🧒 Kind');
		o.value('teen',  '👧 Teen');
		o.value('adult', '👤 Erwachsen');
		o.width = '12%';

		o = s.option(form.Flag, 'enabled', _('Aktiv'));
		o.default = '1';
		o.width = '8%';

		// Weekday schedule
		o = s.option(form.Value, 'weekday_start', _('Mo–Fr von'));
		o.datatype = 'string';
		o.placeholder = '15:00';
		o.width = '12%';

		o = s.option(form.Value, 'weekday_end', _('bis'));
		o.datatype = 'string';
		o.placeholder = '20:00';
		o.width = '12%';

		// Weekend schedule
		o = s.option(form.Value, 'weekend_start', _('Sa–So von'));
		o.datatype = 'string';
		o.placeholder = '09:00';
		o.width = '12%';

		o = s.option(form.Value, 'weekend_end', _('bis'));
		o.datatype = 'string';
		o.placeholder = '21:00';
		o.width = '12%';

		// ── Profile Details (expandable) ──────────────────────
		s = m.section(form.TypedSection, 'profile', _('Profil-Details'));
		s.anonymous = false;
		s.addremove = false;

		// Safe search
		o = s.option(form.Flag, 'safesearch', _('SafeSearch & YouTube Restricted'),
			_('Leitet Google, Bing und YouTube auf Safe-Search-Server um — verhindert explizite Inhalte in Suchergebnissen'));
		o.default = '0';
		o.rmempty = true;

		// Blocked categories
		o = s.option(form.MultiValue, 'blocked_categories', _('Blockierte Kategorien'));
		o.value('adult',        _('🔞 Adult / Pornographie'));
		o.value('gambling',     _('🎰 Glücksspiel'));
		o.value('social_media', _('📱 Social Media'));
		o.value('gaming',       _('🎮 Gaming'));
		o.value('streaming',    _('📺 Streaming'));
		o.value('violence',     _('💢 Gewalt'));
		o.value('ads',          _('📢 Werbung & Tracker'));

		// Blocked domains list
		o = s.option(form.DynamicList, 'blocked_domains', _('Gesperrte Domains'),
			_('z.B. youtube.com, tiktok.com'));
		o.datatype = 'hostname';
		o.placeholder = 'example.com';

		// Allowed domains list
		o = s.option(form.DynamicList, 'allowed_domains', _('Immer erlaubt'),
			_('Diese Domains sind immer erreichbar, auch wenn die Kategorie gesperrt ist'));
		o.datatype = 'hostname';
		o.placeholder = 'wikipedia.org';

		// Color
		o = s.option(form.Value, 'color', _('Farbe (Hex)'));
		o.placeholder = '#3b82f6';
		o.rmempty = true;

		return m.render();
	}
});
