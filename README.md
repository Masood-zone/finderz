# FinderZ automatic keyboard scrolling

This patch makes long forms automatically scroll the focused input above the
Android or iOS keyboard.

## 1. Install the Expo-compatible package

```bash
pnpm exec expo install react-native-keyboard-controller
```

## 2. Replace these files

- `src/providers/app-providers.tsx`
- `src/components/ui/keyboard-aware-screen.tsx`

## 3. Clear Metro

```bash
pnpm start --clear
```

Completely close and reopen Expo Go before testing.

## Behaviour

- Tapping Password scrolls Password above the keyboard.
- Tapping Confirm Password scrolls Confirm Password above the keyboard.
- `bottomOffset={32}` keeps 32 pixels of space between the focused input and
  the keyboard.
- Change the offset per screen when needed:

```tsx
<KeyboardAwareScreen bottomOffset={48}>
  ...
</KeyboardAwareScreen>
```
