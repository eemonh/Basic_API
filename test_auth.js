async function testAuth() {
    try {
        const baseUrl = 'http://localhost:4000/api';
        let cookieHeader = '';

        console.log("1. Registering user...");
        const registerRes = await fetch(baseUrl + '/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: "testuser_verif6",
                email: "test_verif6@example.com",
                fullName: "Test Verif",
                password: "password123"
            })
        });
        console.log('Register Res:', await registerRes.json());
        
        console.log("2. Logging in...");
        const loginRes = await fetch(baseUrl + '/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: "test_verif6@example.com",
                password: "password123"
            })
        });
        
        const loginData = await loginRes.json();
        console.log('Login Data:', loginData);
        
        const accessToken = loginData.accessToken;
        console.log("Login successful! Access token:", accessToken);
        
        // Extract set-cookie headers
        const setCookie = loginRes.headers.get('set-cookie');
        if (setCookie) {
            cookieHeader = setCookie.split(',').map(c => c.split(';')[0]).join('; ');
        }
        
        console.log("3. Waiting 3 seconds for token to expire...");
        await new Promise(r => setTimeout(r, 3000));
        
        console.log("4. Attempting to fetch current user with expired token...");
        const userResExpired = await fetch(baseUrl + '/users/me', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Cookie': cookieHeader
            }
        });
        
        if (userResExpired.status === 401) {
            console.log(`Received expected error: 401 Unauthorized`);
            
            console.log("5. Attempting to refresh token using cookies...");
            const refreshRes = await fetch(baseUrl + '/users/refresh', {
                method: 'POST',
                headers: {
                    'Cookie': cookieHeader
                }
            });
            
            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                const newAccessToken = refreshData.accessToken;
                console.log("Refresh successful! New Access token:", newAccessToken);
                
                // Update cookies if any
                const newSetCookie = refreshRes.headers.get('set-cookie');
                if (newSetCookie) {
                    cookieHeader = newSetCookie.split(',').map(c => c.split(';')[0]).join('; ');
                }
                
                console.log("6. Retrying fetch current user with NEW token...");
                const userResNew = await fetch(baseUrl + '/users/me', {
                    headers: {
                        'Authorization': `Bearer ${newAccessToken}`,
                        'Cookie': cookieHeader
                    }
                });
                
                const userData = await userResNew.json();
                console.log("Success! Current user:", userData.user.username);
            } else {
                console.log("Refresh failed:", refreshRes.status, await refreshRes.text());
            }
        } else {
            console.log("Unexpected status (should be 401):", userResExpired.status);
            console.log(await userResExpired.text());
        }
        
    } catch (error) {
        console.error("Test failed:", error);
    }
}

testAuth();
