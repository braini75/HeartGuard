'use strict';
// HeartGuard Devices View
// /htdocs/luci-static/resources/view/heartguard/devices.js

'require view';
'require form';
'require uci';
'require rpc';
'require dom';

// Read ARP table to show discovered devices
var callGetARPEntries = rpc.declare({
	object: 'luci',
	method:  'getHostHints',
	expect:  { hosts: {} }
});

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('heartguard'),
			L.resolveDefault(callGetARPEntries(), {})
		]);
	},

	render: function(data) {
		var arp_hosts = data[1] || {};

		var m, s, o;

		m = new form.Map('heartguard', _('HeartGuard – Geräte'),
			_('Weise Geräte (per MAC-Adresse) einem Profil zu. Nur registrierte Geräte erhalten Internetzugang.'));

		// ── Discovered but unregistered devices ───────────────
		var known_macs = [];
		uci.sections('heartguard', 'device', function(sec) {
			if (sec.mac) known_macs.push(sec.mac.toLowerCase());
		});

		var unregistered = Object.keys(arp_hosts).filter(function(mac) {
			return known_macs.indexOf(mac.toLowerCase()) === -1;
		});

		if (unregistered.length > 0) {
			s = m.section(form.NamedSection, '_discovered', 'heartguard',
				'⚠️ ' + _('Unbekannte Geräte im Netz'));
			s.anonymous = true;

			// Display as info block (read-only)
			o = s.option(form.DummyValue, '_info', '');
			o.rawhtml = true;
			o.default = '<div style="background:#f59e0b22;border:1px solid #f59e0b44;border-radius:10px;padding:14px 18px;">' +
				'<strong style="color:#f59e0b;">' + unregistered.length + ' ' + _('unbekannte Geräte gefunden:') + '</strong>' +
				'<ul style="margin:8px 0 0;padding-left:20px;color:#94a3b8;">' +
				unregistered.map(function(mac) {
					var host = arp_hosts[mac] || {};
					return '<li style="font-family:monospace;font-size:13px;">' +
						mac + (host.name ? ' · ' + host.name : '') + '</li>';
				}).join('') +
				'</ul>' +
				'<div style="margin-top:10px;color:#64748b;font-size:12px;">' +
				_('Diese Geräte werden blockiert bis sie einem Profil zugeordnet werden.') +
				'</div></div>';
		}

		// ── Device Table ──────────────────────────────────────
		s = m.section(form.GridSection, 'device', _('Registrierte Geräte'));
		s.addremove = true;
		s.anonymous = true;
		s.nodescriptions = true;
		s.addbtntitle = _('+ Gerät hinzufügen');

		o = s.option(form.Value, 'name', _('Gerätename'));
		o.rmempty = false;
		o.placeholder = _('z.B. Lukas Handy');
		o.width = '20%';

		o = s.option(form.Value, 'mac', _('MAC-Adresse'));
		o.rmempty = false;
		o.datatype = 'macaddr';
		o.placeholder = 'AA:BB:CC:DD:EE:FF';
		o.width = '20%';

		// Auto-fill from ARP
		o.renderWidget = function(section_id, option_index, cfgvalue) {
			var widget = form.Value.prototype.renderWidget.apply(this, arguments);
			// Add ARP entries as autocomplete suggestions
			Object.keys(arp_hosts).forEach(function(mac) {
				var host = arp_hosts[mac];
				var opt = E('option', { value: mac },
					mac + (host.name ? ' (' + host.name + ')' : ''));
			});
			return widget;
		};

		o = s.option(form.ListValue, 'profile', _('Profil'));
		o.rmempty = false;
		o.width = '15%';
		uci.sections('heartguard', 'profile', function(sec) {
			var name = uci.get('heartguard', sec['.name'], 'name') || sec['.name'];
			o.value(sec['.name'], name);
		});

		o = s.option(form.ListValue, 'type', _('Typ'));
		o.value('android', '📱 Android/iOS');
		o.value('windows', '🖥️ Windows');
		o.value('linux',   '🐧 Linux');
		o.width = '15%';

		o = s.option(form.Flag, 'enabled', _('Aktiv'));
		o.default = '1';
		o.width = '8%';

		return m.render();
	}
});
