# FinderZ Android keyboard stability fix

Replace the following project files with the versions in this package:

- `src/components/ui/keyboard-aware-screen.tsx`
- `src/components/ui/app-input.tsx`
- `src/components/ui/password-input.tsx`

Then clear Metro's cache:

```bash
pnpm start --clear
```

## What the patch changes

1. Android no longer uses `KeyboardAvoidingView`; Android's native window resizing handles the keyboard.
2. The keyboard screen excludes the bottom safe-area inset while the keyboard is active.
3. The ScrollView keeps the keyboard open when child controls are tapped.
4. Focus no longer adds a dynamic shadow/elevation to the input.
5. Android TextInput padding and vertical alignment are fixed.
6. Tapping the password visibility icon restores focus to the password field.

## Optional app.json setting for a development/production build

Expo defaults Android to `resize`. You can make it explicit:

```json
{
  "expo": {
    "android": {
      "softwareKeyboardLayoutMode": "resize"
    }
  }
}
```

This is a native configuration. Test its final behavior in a development build, preview build, or production build rather than relying only on Expo Go.
