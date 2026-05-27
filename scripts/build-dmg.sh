#!/usr/bin/env bash
# Package build/bin/transok.app into a distributable DMG containing:
#   1. transok.app
#   2. /Applications symlink (drag-to-install)
#   3. 修复已损坏.command (xattr -cr fix for unsigned apps)
#
# Usage: build-dmg.sh <arch>
#   <arch>  arm64 | amd64 | universal (used only for naming)
set -euo pipefail

ARCH="${1:-universal}"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_NAME="transok"
APP_PATH="$ROOT_DIR/build/bin/${APP_NAME}.app"
VERSION="$(tr -d '[:space:]' < "$ROOT_DIR/VERSION")"
DIST_DIR="$ROOT_DIR/build/bin/dist"
DMG_PATH="$DIST_DIR/${APP_NAME}-${VERSION}-darwin-${ARCH}.dmg"

if [ ! -d "$APP_PATH" ]; then
  echo "[build-dmg] error: $APP_PATH not found. Run \`wails build\` first." >&2
  exit 1
fi

mkdir -p "$DIST_DIR"

STAGE_DIR="$(mktemp -d -t transok-dmg)"
trap 'rm -rf "$STAGE_DIR"' EXIT

echo "[build-dmg] staging at $STAGE_DIR"

# 1. Copy the app bundle
cp -R "$APP_PATH" "$STAGE_DIR/"

# 2. /Applications symlink
ln -s /Applications "$STAGE_DIR/Applications"

# 3. Fix-damaged .command script
FIX_SCRIPT="$STAGE_DIR/修复已损坏.command"
cat > "$FIX_SCRIPT" <<'CMD_EOF'
#!/usr/bin/env bash
# 修复 macOS 对未签名应用报"已损坏，无法打开"的问题。
# 原理：清除 Gatekeeper 加的 com.apple.quarantine 等扩展属性。
set -e

APP_NAME="transok"
TARGETS=(
  "/Applications/${APP_NAME}.app"
  "$HOME/Applications/${APP_NAME}.app"
)

echo "======================================"
echo "  Transok 修复已损坏应用工具"
echo "======================================"
echo

FOUND=0
for APP in "${TARGETS[@]}"; do
  if [ -d "$APP" ]; then
    echo "[*] 找到应用：$APP"
    echo "[*] 正在清除隔离属性..."
    sudo xattr -cr "$APP"
    echo "[✓] 已修复：$APP"
    FOUND=1
  fi
done

if [ "$FOUND" -eq 0 ]; then
  echo "[!] 未在 /Applications 或 ~/Applications 找到 ${APP_NAME}.app"
  echo "[!] 请先把 ${APP_NAME}.app 拖到 Applications 文件夹后再运行本脚本。"
  echo
  read -n 1 -s -r -p "按任意键关闭窗口..."
  exit 1
fi

echo
echo "完成！现在可以正常打开 ${APP_NAME} 了。"
echo
read -n 1 -s -r -p "按任意键关闭窗口..."
CMD_EOF
chmod +x "$FIX_SCRIPT"

rm -f "$DMG_PATH"

APP_SIZE_MB=$(du -sm "$STAGE_DIR" | awk '{print $1}')
DMG_SIZE_MB=$(( APP_SIZE_MB + 50 ))

echo "[build-dmg] creating $DMG_PATH (${DMG_SIZE_MB}m)"
hdiutil create \
  -volname "${APP_NAME} ${VERSION}" \
  -srcfolder "$STAGE_DIR" \
  -ov \
  -format UDZO \
  -fs HFS+ \
  -size "${DMG_SIZE_MB}m" \
  "$DMG_PATH"

# Zip the raw .app alongside the dmg so both forms are shipped.
APP_ZIP="$DIST_DIR/${APP_NAME}-${VERSION}-darwin-${ARCH}.app.zip"
rm -f "$APP_ZIP"
echo "[build-dmg] zipping app -> $APP_ZIP"
( cd "$ROOT_DIR/build/bin" && ditto -c -k --sequesterRsrc --keepParent "${APP_NAME}.app" "$APP_ZIP" )

echo "[build-dmg] done."
ls -lh "$DMG_PATH" "$APP_ZIP"
