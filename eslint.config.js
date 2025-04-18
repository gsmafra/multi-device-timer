module.exports = [
  {
    languageOptions: {
      ecmaVersion: 'latest', // Or your desired ECMAScript version
      sourceType: 'script', // Or 'module'
      globals: {
        ...require('globals').browser, // Add browser globals
        ...require('globals').es2021, // Add ES2021 globals
        // Add other environments as needed (e.g., node: require('globals').node)
      },
    },
    rules: {
      // Your rules here
    },
  },
];