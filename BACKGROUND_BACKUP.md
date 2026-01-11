# Background Style Backup

This file contains the original background styles before changing to football field design.

## Original Tailwind Config (tailwind.config.ts)

```typescript
backgroundImage: {
  'yard-lines': `repeating-linear-gradient(
    90deg,
    transparent,
    transparent 9%,
    rgba(255, 255, 255, 0.03) 9%,
    rgba(255, 255, 255, 0.03) 10%
  )`,
  'turf-gradient': 'linear-gradient(135deg, #1a4d2e 0%, #0f3820 100%)',
  'stadium-lights': 'radial-gradient(ellipse at top, rgba(251, 191, 36, 0.15) 0%, transparent 60%)',
},
```

## Original globals.css

```css
@layer utilities {
  .bg-yard-pattern {
    background-image: var(--tw-gradient-to), var(--tw-gradient-stops), repeating-linear-gradient(
      90deg,
      transparent,
      transparent 9%,
      rgba(255, 255, 255, 0.03) 9%,
      rgba(255, 255, 255, 0.03) 10%
    );
  }
}
```

## Original Homepage Usage (app/page.tsx)

```html
<div className="min-h-screen bg-turf-gradient bg-yard-pattern">
  {/* Stadium lights effect */}
  <div className="fixed inset-0 bg-stadium-lights pointer-events-none" />
  ...
</div>
```

## To Restore

1. Replace the backgroundImage section in tailwind.config.ts
2. Replace the .bg-yard-pattern in globals.css
3. Use className="bg-turf-gradient bg-yard-pattern" on the homepage
