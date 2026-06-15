'use strict';
// HeartGuard Overview View
// /htdocs/luci-static/resources/view/heartguard/overview.js

'require view';
'require uci';
'require rpc';
'require poll';
'require dom';

// RPC calls to backend
var callGetArpTable = rpc.declare({
	object: 'network',
	method: 'get_proto_handlers',
	expect: {}
});

var callHeartguardStatus = rpc.declare({
	object: 'heartguard',
	method: 'status',
	expect: { result: {} }
});

function renderStatusBadge(active) {
	var badge = E('span', {
		class: 'badge ' + (active ? 'badge-success' : 'badge-danger'),
		style: [
			'display:inline-flex;align-items:center;gap:5px;',
			'padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;',
			'background:' + (active ? '#10b98122' : '#ef444422') + ';',
			'color:' + (active ? '#10b981' : '#ef4444') + ';',
			'border:1px solid ' + (active ? '#10b98144' : '#ef444444') + ';'
		].join('')
	}, [
		E('span', {
			style: [
				'width:6px;height:6px;border-radius:50%;display:inline-block;',
				'background:' + (active ? '#10b981' : '#ef4444') + ';'
			].join('')
		}),
		active ? _('Online') : _('Offline')
	]);
	return badge;
}

function renderProfileCard(profile_id, profile_data, devices) {
	var now = new Date();
	var isWeekend = (now.getDay() === 0 || now.getDay() === 6);
	var currentTime = now.getHours() * 60 + now.getMinutes();

	var startStr = isWeekend ? profile_data.weekend_start : profile_data.weekday_start;
	var endStr   = isWeekend ? profile_data.weekend_end   : profile_data.weekday_end;

	function timeToMins(t) {
		if (!t) return 0;
		var parts = t.split(':');
		return parseInt(parts[0]) * 60 + parseInt(parts[1]);
	}

	var allowed = (profile_data.enabled === '1') &&
	              (currentTime >= timeToMins(startStr)) &&
	              (currentTime <= timeToMins(endStr));

	var avatarMap = { 'child': '🧒', 'teen': '👧', 'adult': '👤' };
	var avatar = avatarMap[profile_data.avatar] || '👤';

	var profileDevices = devices.filter(function(d) {
		return d.profile === profile_id;
	});

	var card = E('div', {
		class: 'cbi-section',
		style: [
			'background:#111827;border:1px solid #1e2d45;border-radius:12px;',
			'padding:18px;margin-bottom:12px;',
			'border-top:3px solid ' + (profile_data.color || '#3b82f6') + ';'
		].join('')
	}, [
		E('div', { style: 'display:flex;justify-content:space-between;align-items:center;' }, [
			E('div', { style: 'display:flex;align-items:center;gap:12px;' }, [
				E('span', { style: 'font-size:32px;' }, avatar),
				E('div', {}, [
					E('strong', { style: 'color:#f1f5f9;font-size:16px;' }, profile_data.name || profile_id),
					E('div', { style: 'color:#64748b;font-size:12px;margin-top:2px;' },
						(profile_data.age ? profile_data.age + ' Jahre · ' : '') +
						profileDevices.length + ' ' + _('Gerät(e)') + ' · ' +
						(startStr || '??') + '–' + (endStr || '??') + ' Uhr'
					)
				])
			]),
			E('div', { style: 'display:flex;align-items:center;gap:10px;' }, [
				E('span', {
					style: [
						'padding:4px 14px;border-radius:20px;font-size:12px;font-weight:700;',
						'background:' + (allowed ? '#10b98122' : '#ef444422') + ';',
						'color:' + (allowed ? '#10b981' : '#ef4444') + ';',
						'border:1px solid ' + (allowed ? '#10b98144' : '#ef444444') + ';'
					].join('')
				}, allowed ? '✓ Internet OK' : '✗ Gesperrt')
			])
		]),
		profileDevices.length > 0 ? E('div', { style: 'margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;' },
			profileDevices.map(function(d) {
				return E('span', {
					style: 'font-size:11px;color:#94a3b8;background:#0a0f1e;padding:3px 10px;border-radius:6px;border:1px solid #1e2d45;'
				}, (d.type === 'android' ? '📱' : d.type === 'windows' ? '🖥️' : '🐧') + ' ' + d.name);
			})
		) : null
	]);

	return card;
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('heartguard')
		]);
	},

	render: function() {
		var self = this;

		// Read config
		var global_cfg = uci.get('heartguard', 'global') || {};
		var enabled = uci.get('heartguard', 'global', 'enabled') !== '0';

		// Collect profiles
		var profiles = {};
		uci.sections('heartguard', 'profile', function(s) {
			profiles[s['.name']] = s;
		});

		// Collect devices
		var devices = [];
		uci.sections('heartguard', 'device', function(s) {
			devices.push(s);
		});

		var now = new Date();
		var timeStr = now.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
		var dateStr = now.toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long' });

		// Header
		var header = E('div', {
			style: [
				'background:linear-gradient(135deg,#111827,#0a0f1e);',
				'border:1px solid #1e2d45;border-radius:16px;',
				'padding:24px;margin-bottom:24px;',
				'display:flex;justify-content:space-between;align-items:center;'
			].join('')
		}, [
			E('div', {}, [
				E('div', { style: 'display:flex;align-items:center;gap:12px;margin-bottom:6px;' }, [
					E('span', { style: 'font-size:28px;' }, '🛡️'),
					E('h2', { style: 'color:#f1f5f9;margin:0;font-size:22px;' }, 'HeartGuard')
				]),
				E('div', { style: 'color:#64748b;font-size:13px;' }, dateStr + ' · ' + timeStr + ' Uhr')
			]),
			E('div', {
				style: [
					'padding:10px 20px;border-radius:10px;font-weight:700;font-size:14px;cursor:pointer;',
					enabled
						? 'background:#10b98122;border:1px solid #10b98144;color:#10b981;'
						: 'background:#ef444422;border:1px solid #ef444444;color:#ef4444;'
				].join('')
			}, enabled ? '● SYSTEM AKTIV' : '● SYSTEM INAKTIV')
		]);

		// Stats row
		var onlineDevices = devices.filter(function(d) { return d.enabled === '1'; }).length;
		var activeProfiles = Object.values(profiles).filter(function(p) { return p.enabled === '1'; }).length;

		var stats = E('div', {
			style: 'display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px;'
		}, [
			['👥', _('Profile'), Object.keys(profiles).length, '#e84d8a'],
			['✅', _('Aktiv'), activeProfiles, '#10b981'],
			['📱', _('Geräte'), devices.length, '#3b82f6'],
			['🟢', _('Registriert'), onlineDevices, '#f59e0b']
		].map(function(item) {
			return E('div', {
				style: [
					'background:#111827;border:1px solid #1e2d45;border-radius:12px;',
					'padding:16px;display:flex;align-items:center;gap:12px;'
				].join('')
			}, [
				E('div', {
					style: [
						'width:40px;height:40px;border-radius:10px;font-size:18px;',
						'display:flex;align-items:center;justify-content:center;',
						'background:' + item[3] + '22;border:1px solid ' + item[3] + '44;'
					].join('')
				}, item[0]),
				E('div', {}, [
					E('div', { style: 'color:#64748b;font-size:11px;' }, item[1]),
					E('div', { style: 'color:#f1f5f9;font-size:20px;font-weight:700;' }, String(item[2]))
				])
			]);
		}));

		// Warning if disabled
		var warning = !enabled ? E('div', {
			style: [
				'padding:14px 20px;border-radius:10px;margin-bottom:20px;',
				'background:#f59e0b22;border:1px solid #f59e0b44;color:#f59e0b;font-size:13px;'
			].join('')
		}, '⚠️ HeartGuard ist deaktiviert – alle Geräte haben uneingeschränkten Internetzugang!') : null;

		// Profile cards
		var profileSection = E('div', {}, [
			E('h3', { style: 'color:#94a3b8;font-size:16px;margin:0 0 14px;' }, _('Profile & Status')),
			E('div', {},
				Object.keys(profiles).map(function(pid) {
					return renderProfileCard(pid, profiles[pid], devices);
				})
			)
		]);

		// Apply button
		var applyBtn = E('div', { style: 'margin-top:20px;' }, [
			E('button', {
				class: 'btn cbi-button cbi-button-apply',
				style: [
					'background:#e84d8a22;border:1px solid #e84d8a66;color:#e84d8a;',
					'padding:10px 24px;border-radius:8px;font-weight:700;cursor:pointer;'
				].join(''),
				click: function() {
					return Promise.resolve()
						.then(function() { return uci.save(); })
						.then(function() { return L.resolveDefault(callHeartguardStatus()); })
						.catch(function(err) {
							ui.addNotification(null, E('p', _('Reload triggered. Changes applied.')));
						});
				}
			}, '⟳ ' + _('Regeln neu laden'))
		]);

		return E('div', { style: 'font-family:"Segoe UI",system-ui,sans-serif;' }, [
			header,
			warning,
			stats,
			profileSection,
			applyBtn
		]);
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
