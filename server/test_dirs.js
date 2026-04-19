const path = require('path');
console.log('CWD:', process.cwd());
console.log('__dirname:', __dirname);
const documentDir = path.resolve(__dirname, 'public', 'uploads', 'documents');
console.log('Resolving documents relative to CWD:', documentDir);

const middlewareDir = path.join(__dirname, 'middleware');
const documentDirFromMiddleware = path.resolve(middlewareDir, '..', 'public', 'uploads', 'documents');
console.log('Resolving documents from middleware (as in uploadMiddleware.js):', documentDirFromMiddleware);
