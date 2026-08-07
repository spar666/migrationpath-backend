const ds = require('/tmp/distcheck/database/data-source.js').default;
console.log('loaded OK');
console.log('migrations:', ds.options.migrations);
console.log('entities:', ds.options.entities);
const g = require('glob');
