// Lucide ships ESM-only; tests only need a named View per icon.
const { createElement } = require('react');
const { View } = require('react-native');

const cache = {};
module.exports = new Proxy({}, {
  get(_, name) {
    if (name === '__esModule') return true;
    if (typeof name !== 'string') return undefined;
    if (!cache[name]) {
      cache[name] = (props) => createElement(View, { testID: `icon-${name}`, iconColor: props.color });
      cache[name].displayName = name;
    }
    return cache[name];
  },
});
