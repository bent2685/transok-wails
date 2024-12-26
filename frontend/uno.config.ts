import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";
import presetAnimations from "unocss-preset-animations";
import { builtinColors, presetShadcn } from "unocss-preset-shadcn";
/**
 * unocss配置
 */
export default defineConfig({
  theme: {
    /**
     * 颜色预设
     */
    colors: {
      pri: "hsl(var(--primary-color))",
      bg0: "hsl(var(--bg-0))",
      menu: "hsl(var(--nav-menu))",
      border: "hsl(var(--border-color))",
      text: "hsl(var(--text))",
      text2: "hsl(var(--text-2))",
      bg: "hsl(var(--bg))",
      bg2: "hsl(var(--bg-2))",
      warn: "hsl(var(--warning))",
    },
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetShadcn(builtinColors.map((c) => ({ color: c }))),
    presetAnimations() as never,
    presetIcons({
      collections: {
        tabler: () =>
          import("@iconify-json/tabler").then((i) => i.icons as never),
      },
      scale: 1.2,
    }),
  ],
  content: {
    pipeline: {
      include: [
        // the default
        /\.(vue|svelte|[jt]sx|mdx?|astro|elm|php|phtml|html)($|\?)/,
        // include js/ts files
        "src/**/*.{js,ts}",
      ],
    },
  },
  transformers: [transformerVariantGroup(), transformerDirectives()],
  shortcuts: [
    {
      "flex-center": "flex items-center justify-center",
      "nav-h": "h-[var(--nav-h)]",
      divider: "h-1px bg-border w-full my-3 opacity-50",
      tap: "active:scale-90",
    },
  ],
});
