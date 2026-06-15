# HeartGuard CI/CD

Drei Workflows bauen und veröffentlichen `luci-app-heartguard` automatisch.

## Workflows

### `build.yml` — Haupt-Build

Wird ausgelöst bei:
- Push auf `main`
- Versionstag (`v1.2.3`)
- Pull Request auf `main`
- Manuell (Actions → Run workflow)

**Was passiert:**

```
lint ──→ build (parallel, 4 Architekturen) ──→ release (nur bei Tag)
```

| Schritt | Was |
|---------|-----|
| **lint** | shellcheck, UCI-Syntax, JSON-Validierung |
| **build** | OpenWrt SDK herunterladen (gecacht), .ipk kompilieren |
| **release** | Alle .ipks + Changelog + SHA256 als GitHub Release |

**Unterstützte Architekturen:**

| Target | Arch | Router-Beispiele |
|--------|------|-----------------|
| `ath79/generic` | mips_24kc | TP-Link Archer C7, GL.iNet AR300M |
| `ramips/mt7621` | mipsel_24kc | GL.iNet MT1300, TP-Link EAP615 |
| `x86/64` | x86_64 | PC-Router, Proxmox VM |
| `mediatek/filogic` | aarch64 | GL.iNet MT6000, Xiaomi AX3000T |

---

### `update-sdk.yml` — Automatisches SDK-Update

Läuft jeden Montag um 06:00 UTC. Prüft ob eine neue stabile OpenWrt-Version verfügbar ist und öffnet automatisch einen PR.

---

### `pr-check.yml` — PR-Schnellprüfung

Schnelles Feedback auf Pull Requests ohne vollen SDK-Build (~30s statt ~15min):
- Pflichtdateien vorhanden?
- JSON valide?
- Makefile vollständig?

---

## Release erstellen

```bash
# Version in Makefile erhöhen
vim Makefile
# PKG_VERSION:=1.1.0

git add Makefile
git commit -m "chore: release v1.1.0"
git tag v1.1.0
git push origin main --tags
```

→ GitHub Actions baut alle .ipks und erstellt automatisch ein Release mit Download-Links.

---

## Neue Router-Architektur hinzufügen

In `.github/workflows/build.yml` unter `matrix.include` ergänzen:

```yaml
- target: bcm27xx
  subtarget: bcm2711
  arch: aarch64_cortex-a72
  description: "Raspberry Pi 4 mit OpenWrt"
```

Alle verfügbaren Targets: https://downloads.openwrt.org/releases/

---

## Secrets

Keine externen Secrets nötig. Der `GITHUB_TOKEN` ist automatisch verfügbar.

Für eigenen Package-Feed später nötig:
- `FEED_DEPLOY_KEY` — SSH-Key für Feed-Repository
