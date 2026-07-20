const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('app');
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let modified = false;
  content = content.replace(/location=\{([a-zA-Z0-9_]+)\.location\}/g, (match, p1) => {
    modified = true;
    return `location={${p1}.location || (${p1}.address ? \`${${p1}.address.area ? ${p1}.address.area + ', ' : ''}${${p1}.address.city}, ${${p1}.address.state}\` : "")}`;
  });
  
  if (modified) {
    fs.writeFileSync(f, content);
    console.log('Fixed ' + f);
  }
});
