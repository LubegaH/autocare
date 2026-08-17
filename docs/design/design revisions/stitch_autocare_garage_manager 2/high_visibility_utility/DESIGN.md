---
name: Industrial Neo-Brutalist
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#3f4945'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#707975'
  outline-variant: '#bfc9c4'
  surface-tint: '#29695b'
  primary: '#00342b'
  on-primary: '#ffffff'
  primary-container: '#004d40'
  on-primary-container: '#7ebdac'
  inverse-primary: '#94d3c1'
  secondary: '#825500'
  on-secondary: '#ffffff'
  secondary-container: '#feaa00'
  on-secondary-container: '#684300'
  tertiary: '#232f35'
  on-tertiary: '#ffffff'
  tertiary-container: '#39454b'
  on-tertiary-container: '#a5b2ba'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#afefdd'
  primary-fixed-dim: '#94d3c1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#065043'
  secondary-fixed: '#ffddb3'
  secondary-fixed-dim: '#ffb950'
  on-secondary-fixed: '#291800'
  on-secondary-fixed-variant: '#624000'
  tertiary-fixed: '#d7e4ec'
  tertiary-fixed-dim: '#bbc8d0'
  on-tertiary-fixed: '#111d23'
  on-tertiary-fixed-variant: '#3c494f'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
  warning-light: '#fff8e1'
  border-black: '#000000'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.05em
  status-number:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '800'
    lineHeight: 24px
spacing:
  unit: 4px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The brand identity is "Industrial Neo-Brutalist"—a raw, functional, and high-impact aesthetic designed for the automotive and logistics industries. It prioritizes utility and immediate clarity through intentional "unrefined" elements.

The style is characterized by:
- **Hard-Edged Geometry:** Rejection of soft curves in favor of sharp, 90-degree corners.
- **High Structural Contrast:** Heavy black borders (2px) that define every container and interactive element.
- **Urgency & Precision:** Bold, uppercase typography and a "flat" depth model that suggests speed and mechanical reliability.
- **Tactile Feedback:** Use of "active translation" where buttons physically shift 2px on the Y-axis when pressed, mimicking a mechanical switch.

## Colors
The palette is rooted in industrial safety and garage aesthetics. 

- **Primary:** A deep "British Racing Green" (#004d40) used for core branding and success states.
- **Secondary:** A high-visibility "Warning Amber" (#ffab00) used for alerts, pending actions, and financial indicators.
- **Neutral:** A stark, cool-grey scale (#f9f9f9 to #eeeeee) provides the canvas, ensuring that the heavy black borders remain the primary structural drivers.
- **Functional Accents:** Crimson is reserved strictly for "Parts Hold" or "Error" states to ensure immediate visual triage.

## Typography
The system uses **Inter** exclusively to maintain a utilitarian, Swiss-style clarity. 

- **Weight & Casing:** Headlines and labels should predominantly use **Uppercase** and **Extra Bold/Black** weights to reinforce the brutalist aesthetic.
- **Information Hierarchy:** Statistical numbers use a specific `status-number` role for high-glanceability in workshop environments. 
- **Legibility:** Letter spacing is increased for small labels and decreased slightly for large display headings to maintain tension.

## Layout & Spacing
The layout follows a **Fixed Grid** philosophy on desktop with a maximum width of 1280px (7xl), transitioning to a fluid layout on mobile devices.

- **Rhythm:** All spacing is derived from a 4px base unit. 16px (stack-md) is the standard spacing for internal card padding and element grouping.
- **The "Bento" Grid:** For dashboard stats, use a responsive grid that collapses from 4 columns (desktop) to 2 columns (mobile) with consistent 16px gutters.
- **Safe Zones:** Mobile layouts require a bottom safe zone (96px) to account for the persistent Navigation Bar.

## Elevation & Depth
This system explicitly avoids shadows and blurs. Depth is communicated through **structural stacking** and **color blocking**:

- **Zero Elevation:** All elements sit on the same plane (z-0).
- **Hard Borders:** Depth is defined by a 2px solid stroke (#000000). 
- **Active State (The "Press"):** Rather than a shadow change, interactive elements use a `translate-y-[2px]` transform to simulate being physically pressed into the surface.
- **Layering:** Backgrounds use `#f9f9f9`, while secondary containers use `#eeeeee` to create subtle separation without relying on light-source metaphors.

## Shapes
The shape language is strictly **Sharp (0px)**. 
- Every button, card, input, and avatar must use square corners. 
- The only exception is the internal iconography (Material Symbols), which provides the only organic curves in the UI, serving as a focal point against the rigid grid.

## Components
- **Buttons:** Must have a 2px black border, uppercase bold text, and no rounded corners. Primary buttons use `primary-container` background; secondary buttons use the `background` color.
- **Alert Cards:** Use high-contrast colored borders (e.g., `neo-brutalist-border-amber`) and a light tinted background of the same hue to denote urgency.
- **Timeline:** A vertical 2px black line connects status nodes. Nodes are square 24x24px boxes with centered icons.
- **Stats Cards:** Minimalist blocks with a `label-bold` category at the top and a large `display-lg` value in the center.
- **Navigation:** Persistent bottom bar on mobile with 2px top border. Active states are indicated by swapping the background and text colors (Inversion).