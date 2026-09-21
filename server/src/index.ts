/**
 * KKNC Mailer — Server Entry Point
 */

import app from './app.js';
import { config, isDevelopmentMode } from './config/index.js';

// Start server
app.listen(config.server.port, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║           KKNC Mailer — Server Started              ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║  Port:     ${String(config.server.port).padEnd(41)}║`);
  console.log(`║  Mode:     ${isDevelopmentMode() ? 'DEVELOPMENT (no SMTP)'.padEnd(41) : 'PRODUCTION'.padEnd(41)}║`);
  console.log(`║  Client:   ${config.server.clientUrl.padEnd(41)}║`);
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');
  if (isDevelopmentMode()) {
    console.log('⚠  SMTP credentials not configured.');
    console.log('   Emails will be generated but not actually sent.');
    console.log('   Configure .env file with SMTP credentials for production.\n');
  }
});
