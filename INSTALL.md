# HeartGuard – Installationsanleitung für OpenWrt

## Voraussetzungen

- OpenWrt **24.10** oder neuer (ältere Versionen ≥ 21.02 funktionieren auch)
- Mind. **16 MB Flash**, **128 MB RAM** empfohlen
- SSH-Zugang zum Router
- Internetverbindung auf dem Router (für Package-Download)

---

## 1. Abhängigkeiten installieren

```bash
opkg update

# Pflicht-Pakete
opkg install dnsmasq-full        # dnsmasq mit nftset-Support (ersetzt Standard-dnsmasq!)
opkg install kmod-nft-core       # nftables Kernel-Modul
opkg install nftables            # nftables Userspace-Tool
opkg install kmod-nf-conntrack   # Verbindungsverfolgung (für Session-Drop)

# LuCI (falls noch nicht vorhanden)
opkg install luci-base
opkg install luci-mod-admin-full
opkg install rpcd

# WICHTIG: Standard dnsmasq durch dnsmasq-full ersetzen
opkg remove dnsmasq
opkg install dnsmasq-full
```

> ⚠️ **Hinweis**: `dnsmasq-full` wird benötigt, weil nur diese Version
> den `dhcp-mac=` Tag-Filter unterstützt der für MAC-basiertes Filtering nötig ist.

---

## 2. HeartGuard Package installieren

### Option A: Direkt vom Package-Feed (empfohlen)

```bash
# Feed hinzufügen
echo "src/gz heartguard https://heartguard.example.com/packages" >> /etc/opkg/customfeeds.conf
opkg update
opkg install luci-app-heartguard
```

### Option B: Manuell als .ipk

```bash
# .ipk auf den Router kopieren (von deinem PC)
scp luci-app-heartguard_1.0.0_all.ipk root@192.168.1.1:/tmp/

# Auf dem Router installieren
ssh root@192.168.1.1
opkg install /tmp/luci-app-heartguard_1.0.0_all.ipk
```

### Option C: Dateien direkt kopieren (Development)

```bash
# Repository auf PC klonen
git clone https://github.com/yourname/luci-app-heartguard

# Dateien auf Router kopieren
scp -r luci-app-heartguard/root/* root@192.168.1.1:/
scp -r luci-app-heartguard/htdocs/* root@192.168.1.1/www/

# Auf Router: Berechtigungen setzen
ssh root@192.168.1.1 "
  chmod +x /etc/init.d/heartguard
  chmod +x /usr/sbin/heartguard-schedule
  chmod +x /usr/sbin/heartguard-update-blocklists
"
```

---

## 3. Ersteinrichtung

```bash
# HeartGuard-Dienst aktivieren und starten
/etc/init.d/heartguard enable
/etc/init.d/heartguard start

# LuCI-Session neu laden (damit das Plugin erscheint)
/etc/init.d/rpcd restart
/etc/init.d/uhttpd restart

# Blocklisten initialisieren
/usr/sbin/heartguard-update-blocklists
```

---

## 4. Router-Konfiguration (einmalig)

### DHCP: DNS auf Router erzwingen

Alle Geräte müssen den Router als DNS-Server nutzen.
Im OpenWrt LuCI unter **Network → DHCP and DNS**:

```bash
# Oder per UCI:
uci set dhcp.@dnsmasq[0].port=53
uci set dhcp.@dnsmasq[0].domain=lan
uci commit dhcp
/etc/init.d/dnsmasq restart
```

### Firewall: Externen DNS blockieren (Bypass-Schutz)

```bash
# Verhindert dass Kinder eigene DNS-Server nutzen
# Network → Firewall → Traffic Rules → Neue Regel:
uci add firewall rule
uci set firewall.@rule[-1].name='Block external DNS'
uci set firewall.@rule[-1].src='lan'
uci set firewall.@rule[-1].dest='wan'
uci set firewall.@rule[-1].dest_port='53'
uci set firewall.@rule[-1].proto='tcpudp'
uci set firewall.@rule[-1].target='REJECT'
uci commit firewall
/etc/init.d/firewall restart
```

### Bekannte DoH-Server blockieren

```bash
# Verhindert DNS-over-HTTPS Bypass (Google, Cloudflare, etc.)
for ip in 8.8.8.8 8.8.4.4 1.1.1.1 1.0.0.1 9.9.9.9 149.112.112.112; do
  uci add firewall rule
  uci set firewall.@rule[-1].name="Block DoH $ip"
  uci set firewall.@rule[-1].src='lan'
  uci set firewall.@rule[-1].dest='wan'
  uci set firewall.@rule[-1].dest_ip="$ip"
  uci set firewall.@rule[-1].dest_port='443'
  uci set firewall.@rule[-1].proto='tcp'
  uci set firewall.@rule[-1].target='REJECT'
done
uci commit firewall
/etc/init.d/firewall restart
```

---

## 5. Geräte konfigurieren (MAC-Adressen)

### MAC-Adresse eines Geräts herausfinden

**Im LuCI Dashboard:**
→ Status → DHCP Leases → MAC-Spalte ablesen

**Per SSH:**
```bash
# ARP-Tabelle anzeigen (zeigt alle Geräte im Netz)
cat /proc/net/arp

# Oder mit ip:
ip neigh show
```

**Auf dem Gerät selbst:**
```bash
# Android: Einstellungen → WLAN → Gerätename → WLAN-MAC-Adresse
# Windows: ipconfig /all → Physische Adresse
# Linux:   ip link show | grep ether
```

### Gerät in HeartGuard eintragen

**Im LuCI:** HeartGuard → Geräte → Gerät hinzufügen

**Per UCI:**
```bash
uci add heartguard device
uci set heartguard.@device[-1].name="Lukas Handy"
uci set heartguard.@device[-1].mac="A1:B2:C3:D4:E5:F6"
uci set heartguard.@device[-1].profile="lukas"
uci set heartguard.@device[-1].type="android"
uci set heartguard.@device[-1].enabled="1"
uci commit heartguard
/etc/init.d/heartguard reload
```

---

## 6. Blocklisten automatisch aktualisieren

```bash
# Cron-Job für tägliches Update um 3:00 Uhr
echo "0 3 * * * /usr/sbin/heartguard-update-blocklists" >> /etc/crontabs/root
/etc/init.d/cron enable
/etc/init.d/cron restart
```

---

## 7. Troubleshooting

### HeartGuard-Status prüfen

```bash
# Service-Status
/etc/init.d/heartguard status

# Logs anzeigen
logread | grep heartguard

# Generierte dnsmasq-Config prüfen
cat /etc/dnsmasq.d/heartguard.conf

# nftables-Regeln prüfen
nft list table inet heartguard

# DNS-Test für ein Gerät simulieren
dig @127.0.0.1 youtube.com
```

### Häufige Probleme

| Problem | Lösung |
|---|---|
| LuCI-Plugin erscheint nicht | `rpcd` und `uhttpd` neu starten |
| DNS-Filterung greift nicht | Prüfe ob `dnsmasq-full` installiert ist (nicht `dnsmasq`) |
| Gerät wird nicht erkannt | MAC im ARP-Table prüfen: `ip neigh` |
| Zeitplan greift nicht | Timezone in System → System prüfen |
| Kind umgeht Filter | Port-53-Firewall-Regel prüfen; DoH-IPs blockieren |

---

## 8. Deinstallation

```bash
/etc/init.d/heartguard stop
/etc/init.d/heartguard disable
opkg remove luci-app-heartguard

# Optional: Konfiguration löschen
rm /etc/config/heartguard
rm -rf /etc/heartguard/
```

---

## Dateistruktur des Packages

```
luci-app-heartguard/
├── Makefile                          ← OpenWrt Build-System
├── root/
│   ├── etc/
│   │   ├── config/heartguard         ← UCI-Konfiguration
│   │   ├── init.d/heartguard         ← Dienst-Skript (procd)
│   │   └── heartguard/
│   │       └── blocklists/           ← Domain-Blocklisten je Kategorie
│   └── usr/
│       ├── sbin/
│       │   ├── heartguard-schedule         ← Zeitplan-Enforcement
│       │   └── heartguard-update-blocklists ← Blocklisten-Update
│       └── share/
│           ├── luci/menu.d/          ← LuCI Menü-Einträge
│           └── rpcd/acl.d/           ← Berechtigungen
└── htdocs/
    └── luci-static/resources/view/heartguard/
        ├── overview.js               ← Dashboard
        ├── profiles.js               ← Profil-Verwaltung
        ├── devices.js                ← Geräte-Verwaltung
        ├── schedule.js               ← Zeitpläne
        └── log.js                    ← DNS-Log
```
