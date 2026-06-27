const fs = require('fs');
const path = require('path');

async function testUpload() {
  const dummyFilePath = path.join(__dirname, 'dummy.png');
  fs.writeFileSync(dummyFilePath, 'dummy image content base64 or just random bytes', 'utf8');

  // We have to build multipart/form-data manually or use fetch
  const formData = new FormData();
  
  // We need to create a Blob from the file
  const fileBuffer = fs.readFileSync(dummyFilePath);
  const fileBlob = new Blob([fileBuffer], { type: 'image/png' });
  
  formData.append('file', fileBlob, 'dummy.png');
  formData.append('type', 'image');

  console.log('Sending request to /api/upload...');
  
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await res.json();
    console.log('Response:', data);
  } catch (err) {
    console.error('Fetch error:', err);
  } finally {
    fs.unlinkSync(dummyFilePath);
  }
}

testUpload();
