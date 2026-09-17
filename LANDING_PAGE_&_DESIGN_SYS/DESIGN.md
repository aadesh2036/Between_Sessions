---
name: Organic Strategic Editorial
colors:
  surface: '#f4faff'
  surface-dim: '#d1dce2'
  surface-bright: '#f4faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eaf5fc'
  surface-container: '#e5eff6'
  surface-container-high: '#dfeaf1'
  surface-container-highest: '#d9e4eb'
  on-surface: '#131d22'
  on-surface-variant: '#3f4948'
  inverse-surface: '#283237'
  inverse-on-surface: '#e8f2f9'
  outline: '#6f7978'
  outline-variant: '#bec9c7'
  surface-tint: '#146965'
  primary: '#00524e'
  on-primary: '#ffffff'
  primary-container: '#176b67'
  on-primary-container: '#9ee9e3'
  inverse-primary: '#89d4ce'
  secondary: '#48626b'
  on-secondary: '#ffffff'
  secondary-container: '#cbe7f2'
  on-secondary-container: '#4e6871'
  tertiary: '#664000'
  on-tertiary: '#ffffff'
  tertiary-container: '#865500'
  on-tertiary-container: '#ffd4a0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#a5f0ea'
  primary-fixed-dim: '#89d4ce'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#00504d'
  secondary-fixed: '#cbe7f2'
  secondary-fixed-dim: '#afcbd5'
  on-secondary-fixed: '#021f26'
  on-secondary-fixed-variant: '#304b53'
  tertiary-fixed: '#ffddb6'
  tertiary-fixed-dim: '#ffb95b'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#643f00'
  background: '#f4faff'
  on-background: '#131d22'
  surface-variant: '#d9e4eb'
  brand-ink: '#17323A'
  brand-primary: '#176B67'
  brand-primary-strong: '#195E5A'
  brand-primary-soft: '#DCEFED'
  brand-primary-softer: '#EDF7F6'
  surface-canvas: '#F7F8F7'
  surface-base: '#FFFFFF'
  surface-warm: '#F0F5F4'
  text-primary: '#172126'
  text-secondary: '#5B6570'
  border-subtle: '#D8DFDE'
  border-focus: '#176B67'
  accent-coral: '#E8856C'
  accent-coral-soft: '#FFF0EC'
  accent-lavender: '#8B7EC8'
  accent-lavender-soft: '#F0EDFB'
  accent-amber: '#D4943A'
  accent-amber-soft: '#FFF6E8'
  success: '#2E7D62'
  success-soft: '#E8F3EE'
  info: '#1E4D63'
  info-soft: '#E3F0F6'
typography:
  display-hero:
    fontFamily: Newsreader
    fontSize: 56px
    fontWeight: '400'
    lineHeight: 64px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Newsreader
    fontSize: 38px
    fontWeight: '400'
    lineHeight: 46px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '400'
    lineHeight: 48px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.06em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-desktop: 2rem
  margin: 1.25rem
  margin-desktop: 4rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
  space-2xl: 4rem
---

# Design System Specification: Keto / Strategic Portfolio Landing Page (Infused with Between Sessions Color Architecture)

## 1. Design Direction & Ethos
- **Aesthetic:** Editorial, organic, high-craft, humanistic enterprise. Refined typography, atmospheric translucent floral/organic gradients reminiscent of the Keto reference image.
- **Constraints:** NO generic AI rounded boxes or sterile bento grid clichés. Avoid curved pill containers or cookie-cutter SaaS cards. Use crisp lines, intentional asymmetry, editorial typographic scale, floating delicate borders, and custom animated SVG artwork.
- **Iconography & Styling:** Adheres strictly to the provided ICON_AND_COLOR_SYSTEM.md specification (`lucide` style SVG stroke 1.75, boxed soft pastel containers, no emojis).

## 2. Color Palette & Tokens
```css
:root {
  /* Brand Foundations */
  --color-brand-ink: #17323A;
  --color-brand-primary: #176B67;
  --color-brand-primary-strong: #195E5A;
  --color-brand-primary-soft: #DCEFED;
  --color-brand-primary-softer: #EDF7F6;

  /* Canvas & Neutrals */
  --color-surface-canvas: #F7F8F7;
  --color-surface-base: #FFFFFF;
  --color-surface-warm: #F0F5F4;
  --color-text-primary: #172126;
  --color-text-secondary: #5B6570;
  --color-border-subtle: #D8DFDE;
  --color-border-focus: #176B67;

  /* Accents from MD */
  --color-accent-coral: #E8856C;
  --color-accent-coral-soft: #FFF0EC;
  --color-accent-lavender: #8B7EC8;
  --color-accent-lavender-soft: #F0EDFB;
  --color-accent-amber: #D4943A;
  --color-accent-amber-soft: #FFF6E8;
  --color-success: #2E7D62;
  --color-success-soft: #E8F3EE;
  --color-info: #1E4D63;
  --color-info-soft: #E3F0F6;

  /* Typography */
  --font-display: 'Plus Jakarta Sans', 'Cabinet Grotesk', -apple-system, sans-serif;
  --font-serif: 'Instrument Serif', 'Newsreader', serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
}
```
