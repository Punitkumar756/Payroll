async function testAll() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.accessToken;
    if (!token) throw new Error('No token');

    console.log("Fetching Employee 1");
    let res = await fetch('http://localhost:5000/api/employees/1', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("Status:", res.status);
    console.log(await res.json());
  } catch (err) {
    console.error('Error in script', err.message);
  }
}
testAll();
