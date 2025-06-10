const os = require('os');

/**
 * COLYSEUS CLOUD WARNING:
 * ----------------------
 * PLEASE DO NOT UPDATE THIS FILE MANUALLY AS IT MAY CAUSE DEPLOYMENT ISSUES
 */

module.exports = {
  apps : [{
    name: "metaverse-backend",
    script: 'build/index.js',
    time: true,
    watch: false,
    instances: 1,
    exec_mode: 'fork',
    wait_ready: false,
    env_production: {
      NODE_ENV: 'production'
    }
  }],
};

