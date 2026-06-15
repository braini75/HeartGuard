include $(TOPDIR)/rules.mk

LUCI_TITLE:=HeartGuard Family Internet Manager
LUCI_DESCRIPTION:=Parental control system with profiles, schedules, MAC-binding and website filtering
LUCI_DEPENDS:=+dnsmasq-full +kmod-nft-core +nftables +cron +luci-base

PKG_NAME:=luci-app-heartguard
PKG_VERSION:=1.0.0
PKG_RELEASE:=1
PKG_LICENSE:=MIT

LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - this is defined in include/package.mk
define Package/luci-app-heartguard/conffiles
/etc/config/heartguard
endef

$(eval $(call BuildPackage,luci-app-heartguard))
