// Dev server: serves src/ as native ES modules (no bundling). Portraits load from src/assets/portraits.
import { createStaticServer } from './static-server.js';
const port = Number(process.env.PORT || 4175);
createStaticServer('src', port).then(() => console.log('INAD dev: open http://127.0.0.1:' + port + '/'));
