const fs = require('fs');
const path = require('path');

const directoriesToScan = ['app', 'components', 'lib', 'hooks', 'types'];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
      
      // Rename directory if it contains 'customer' or 'Customer'
      const baseName = path.basename(fullPath);
      let newBaseName = baseName.replace(/customer/g, 'landlord').replace(/Customer/g, 'Landlord');
      if (newBaseName !== baseName) {
        const newPath = path.join(path.dirname(fullPath), newBaseName);
        fs.renameSync(fullPath, newPath);
        console.log(`Renamed directory: ${fullPath} -> ${newPath}`);
      }
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.json'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const newContent = content
        .replace(/customer/g, 'landlord')
        .replace(/Customer/g, 'Landlord')
        .replace(/CUSTOMER/g, 'LANDLORD');

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated content in: ${fullPath}`);
      }
      
      // Rename file if its name contains 'customer' or 'Customer'
      const baseName = path.basename(fullPath);
      let newBaseName = baseName.replace(/customer/g, 'landlord').replace(/Customer/g, 'Landlord');
      if (newBaseName !== baseName) {
        const newPath = path.join(path.dirname(fullPath), newBaseName);
        fs.renameSync(fullPath, newPath);
        console.log(`Renamed file: ${fullPath} -> ${newPath}`);
      }
    }
  }
}

for (const dir of directoriesToScan) {
  processDirectory(path.join(__dirname, dir));
}
console.log("Refactoring complete.");
