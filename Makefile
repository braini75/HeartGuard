include $(TOPDIR)/rules.mk

LUCI_TITLE:=HeartGuard Family Internet Manager
LUCI_DESCRIPTION:=Parental control system with profiles, schedules, MAC-binding and website filtering
LUCI_DEPENDS:=+dnsmasq +kmod-nft-core +nftables +luci-base +libubox +jsonfilter

PKG_NAME:=luci-app-heartguard
PKG_VERSION:=1.1.0
PKG_RELEASE:=1
PKG_LICENSE:=GPL-2.0-only

LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

define Package/luci-app-heartguard/install
	$(INSTALL_DIR) $(1)/www
	$(CP) ./htdocs/* $(1)/www/
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./root/etc/init.d/heartguard $(1)/etc/init.d/
	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./root/etc/config/heartguard $(1)/etc/config/
	$(INSTALL_DIR) $(1)/etc/heartguard/blocklists
	$(INSTALL_DIR) $(1)/etc/crontabs
	$(INSTALL_DIR) $(1)/usr/sbin
	$(INSTALL_BIN) ./root/usr/sbin/heartguard-update-blocklists $(1)/usr/sbin/
	$(INSTALL_BIN) ./root/usr/sbin/heartguard-schedule $(1)/usr/sbin/
	$(INSTALL_DIR) $(1)/usr/share/luci/menu.d
	$(INSTALL_DATA) ./root/usr/share/luci/menu.d/luci-app-heartguard.json $(1)/usr/share/luci/menu.d/
	$(INSTALL_DIR) $(1)/usr/share/rpcd/acl.d
	$(INSTALL_DATA) ./root/usr/share/rpcd/acl.d/luci-app-heartguard.json $(1)/usr/share/rpcd/acl.d/
	$(INSTALL_DIR) $(1)/usr/libexec/rpcd
	$(INSTALL_BIN) ./root/usr/libexec/rpcd/heartguard $(1)/usr/libexec/rpcd/
endef

define Package/luci-app-heartguard/conffiles
/etc/config/heartguard
endef

$(eval $(call BuildPackage,luci-app-heartguard))
