import { writeFileSync } from 'node:fs';
import { welcomeEmail } from '../dist/welcome-email.js';
const preview = welcomeEmail({ name: 'Alex', email: 'alex@example.com' }, 'https://www.caymancrane.com');
writeFileSync(new URL('../public/welcome-email-preview.html', import.meta.url), preview.html.replace('<title>', '<meta name="robots" content="noindex,nofollow"><title>'));
