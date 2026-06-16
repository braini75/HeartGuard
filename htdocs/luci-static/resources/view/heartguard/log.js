'use strict';
// HeartGuard DNS Log View
// /htdocs/luci-static/resources/view/heartguard/log.js

'require view';
'require dom';
'require ui';

return view.extend({
	load: function() {
		return Promise.resolve();
	},

	render: function() {
		var self = this;
		var logContainer = E('div', { id: 'hg-log-container' });
		var filterInput = E('input', {
			type: 'text',
			placeholder: _('Filter (MAC, Domain, Profil...)'),
			style: [
				'background:#111827;border:1px solid #1e2d45;color:#f1f5f9;',
				'border-radius:8px;padding:8px 14px;font-size:13px;',
				'width:300px;margin-right:10px;font-family:monospace;'
			].join(''),
			input: function() { self.applyFilter(this.value); }
		});

		var clearBtn = E('button', {
			style: [
				'background:#ef444422;border:1px solid #ef444444;color:#ef4444;',
				'border-radius:8px;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:700;'
			].join(''),
			click: function() {
				self.logEntries = [];
				self.renderLog([]);
			}
		}, '🗑 ' + _('Log leeren'));

		var pauseBtn = E('button', {
			id: 'hg-pause-btn',
			style: [
				'background:#3b82f622;border:1px solid #3b82f644;color:#3b82f6;',
				'border-radius:8px;padding:8px 16px;cursor:pointer;font-size:13px;font-weight:700;margin-right:8px;'
			].join(''),
			click: function() {
				self.paused = !self.paused;
				this.textContent = self.paused ? '▶ ' + _('Fortsetzen') : '⏸ ' + _('Pausieren');
			}
		}, '⏸ ' + _('Pausieren'));

		self.logEntries = [];
		self.paused = false;

		// Render initial demo entries
		self.logEntries = self.getDemoEntries();
		self.renderLog(self.logEntries);

		return E('div', { style: 'font-family:"Segoe UI",system-ui,sans-serif;' }, [
			E('div', {
				style: [
					'background:#111827;border:1px solid #1e2d45;border-radius:12px;',
					'padding:16px 20px;margin-bottom:16px;',
					'display:flex;align-items:center;gap:10px;flex-wrap:wrap;'
				].join('')
			}, [
				E('h3', { style: 'color:#f1f5f9;margin:0;flex:1;' }, '🌐 ' + _('DNS-Log (Live)')),
				filterInput,
				pauseBtn,
				clearBtn
			]),

			E('div', {
				style: [
					'background:#060910;border:1px solid #1e2d45;border-radius:12px;',
					'overflow:hidden;'
				].join('')
			}, [
				// Table header
				E('div', {
					style: [
						'display:grid;grid-template-columns:80px 1fr 180px 80px 120px;',
						'padding:10px 16px;background:#111827;border-bottom:1px solid #1e2d45;',
						'font-size:11px;font-weight:700;color:#64748b;letter-spacing:0.05em;'
					].join('')
				}, [
					E('span', {}, _('ZEIT')),
					E('span', {}, _('DOMAIN')),
					E('span', {}, _('GERÄT')),
					E('span', {}, _('PROFIL')),
					E('span', {}, _('AKTION'))
				]),
				logContainer
			])
		]);
	},

	getDemoEntries: function() {
		var now = new Date();
		var entries = [
			{ time: '21:03:14', domain: 'youtube.com',     device: 'Lukas Handy',  profile: 'lukas', action: 'BLOCKED', reason: 'Blacklist' },
			{ time: '21:03:10', domain: 'google.com',       device: 'Emma PC',       profile: 'emma',  action: 'ALLOWED', reason: '' },
			{ time: '21:02:55', domain: 'instagram.com',    device: 'Emma Handy',    profile: 'emma',  action: 'ALLOWED', reason: '' },
			{ time: '21:02:40', domain: 'tiktok.com',       device: 'Lukas Handy',  profile: 'lukas', action: 'BLOCKED', reason: 'Blacklist' },
			{ time: '21:02:12', domain: 'wikipedia.org',    device: 'Schul Laptop',  profile: 'lukas', action: 'ALLOWED', reason: 'Whitelist' },
			{ time: '21:01:55', domain: 'onlyfans.com',     device: 'Emma PC',       profile: 'emma',  action: 'BLOCKED', reason: 'Kategorie: Adult' },
			{ time: '21:01:30', domain: 'khanacademy.org',  device: 'Schul Laptop',  profile: 'lukas', action: 'ALLOWED', reason: 'Whitelist' },
			{ time: '21:01:05', domain: 'fortnite.com',     device: 'Lukas Handy',  profile: 'lukas', action: 'BLOCKED', reason: 'Kategorie: Gaming' },
		];
		return entries;
	},

	applyFilter: function(filter) {
		var filtered = this.logEntries.filter(function(e) {
			if (!filter) return true;
			return JSON.stringify(e).toLowerCase().includes(filter.toLowerCase());
		});
		this.renderLog(filtered);
	},

	renderLog: function(entries) {
		var container = document.getElementById('hg-log-container');
		if (!container) return;

		if (entries.length === 0) {
			dom.content(container, E('div', {
				style: 'padding:30px;text-align:center;color:#3d5a7a;font-size:13px;'
			}, _('Keine Einträge')));
			return;
		}

		dom.content(container, entries.slice().reverse().map(function(e) {
			var isBlocked = e.action === 'BLOCKED';
			return E('div', {
				style: [
					'display:grid;grid-template-columns:80px 1fr 180px 80px 120px;',
					'padding:9px 16px;border-bottom:1px solid #0d1420;',
					'font-size:12px;align-items:center;',
					'background:' + (isBlocked ? '#ef444408' : 'transparent') + ';'
				].join('')
			}, [
				E('span', { style: 'color:#3d5a7a;font-family:monospace;' }, e.time),
				E('span', { style: 'color:#f1f5f9;font-family:monospace;' }, e.domain),
				E('span', { style: 'color:#7a9cc0;' }, e.device),
				E('span', {
					style: 'font-size:11px;font-weight:700;color:' + (e.profile === 'lukas' ? '#3b82f6' : '#e84d8a') + ';'
				}, e.profile),
				E('span', {}, E('span', {
					style: [
						'padding:2px 10px;border-radius:10px;font-size:11px;font-weight:700;',
						isBlocked
							? 'background:#ef444422;color:#ef4444;border:1px solid #ef444444;'
							: 'background:#10b98122;color:#10b981;border:1px solid #10b98144;'
					].join('')
				}, isBlocked ? '✗ BLOCK' : '✓ ALLOW'))
			]);
		}));
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
