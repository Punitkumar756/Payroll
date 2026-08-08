import fs from "fs";
import FormData from "form-data";
import fetch from "node-fetch"; // Node 18+ has fetch natively, but just to be sure we'll use global fetch if available

async function testUpload() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.accessToken;
    if (!token) throw new Error('No token');

    console.log("Uploading test file for Employee 1");
    
    // Create a dummy file
    fs.writeFileSync('dummy.pdf', 'dummy content');
    
    const formData = new FormData();
    formData.append("document_name", "Test Document PDF");
    formData.append("file", fs.createReadStream("dummy.pdf"));

    let res = await fetch('http://localhost:5000/api/documents/1', {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${token}`
      },
      body: formData // Form-data will set its own headers
    });
    console.log("Upload Status:", res.status);
    console.log(await res.json());

    console.log("Listing documents for Employee 1");
    let listRes = await fetch('http://localhost:5000/api/documents/1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("List Status:", listRes.status);
    console.log(await listRes.json());
    
  } catch (err) {
    console.error('Error in script', err);
  }
}
testUpload();
