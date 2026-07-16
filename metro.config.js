const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Expo Router writes compiled API functions here. They are build output, not
// source input, so Metro must not index its own generated server bundles.
config.resolver.blockList = [
  ...(Array.isArray(config.resolver.blockList)
    ? config.resolver.blockList
    : config.resolver.blockList
      ? [config.resolver.blockList]
      : []),
  /^(?:\.expo[\\/]server)(?:[\\/]|$)/,
];

module.exports = withNativewind(config);
