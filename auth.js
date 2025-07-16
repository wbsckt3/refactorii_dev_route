/**
 * Google SignIn Authentication System
 * Exact implementation from Refactorii - redirects to existing learning map
 */

/**
 * Handle Google Sign-In credential response
 */
async  function handleCredentialResponse(response) {
    // Decode JWT response from Google
    const responsePayload = decodeJwtResponse(response.credential);
    console.log("ID: " + responsePayload.sub);
    console.log('Full Name: ' + responsePayload.name);
    console.log('Given Name: ' + responsePayload.given_name);
    console.log('Family Name: ' + responsePayload.family_name);
    console.log("Image URL: " + responsePayload.picture);
    console.log("Email: " + responsePayload.email);
    
    const email = responsePayload.email;
    
    const FullName = responsePayload.name;
    const GivenName = responsePayload.given_name;
    const FamilyName = responsePayload.family_name;
    const timestampHoy = new Date().getTime();
    const fechaHoy = new Date(timestampHoy);
    const year = '1970';
    const month = '01';
    const day = '01';
    const FechaIngreso = `${year}-${month}-${day}`;
    const ImageURL = responsePayload.picture;
    const Email = responsePayload.email;
    
    const formData = {
        FullName,
        GivenName,
        FamilyName,
        FechaIngreso,
        ImageURL,
        Email
    };
    
    localStorage.setItem("formData", JSON.stringify(formData));
    const ok = await getUserByEmail(responsePayload.email);   // ? devuelve true si se guardó el token    

    if (ok || localStorage.getItem("refactorii_token")) {
      const overlay = document.getElementById("auth-overlay");
      if (overlay) overlay.style.display = "none";
      google.accounts.id.disableAutoSelect();
      google.accounts.id.cancel();
      location.reload();                      
    }
}

/**
 * Decode JWT response from Google
 */
function decodeJwtResponse(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

/**
 * Get user by email from Refactorii API
 */
async function getUserByEmail(email) {
    try {
        const response = await fetch(`https://www.refactorii.com/getOneGoogleSigninUser/${email}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        
        if (!response.ok) {
            const formData = JSON.parse(localStorage.getItem("formData"));
            const nuevoRegistro = await agregarNuevoRegistro(formData);
            if (nuevoRegistro) {
                console.log('Registro creado exitosamente:', nuevoRegistro);
            } else {
                console.error('Error al crear el registro.');
            }
            return null;
        } else {
            const data = await response.json();
            if (data.GoogleSigninUser) {
                if (data.tkn) {
                    const token = data.tkn;
                    // Extract the "exp" from token (UNIX time in seconds)
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const expiry = payload.exp * 1000; // convert to milliseconds
                    localStorage.setItem("refactorii_token", token);
                    localStorage.setItem("token_expiry", expiry);
                    localStorage.setItem("Email", payload.Email);
                }
                return data.GoogleSigninUser;
            } else {
                return null;
            }
        }
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

/**
 * Create new user via Refactorii API
 */
async function agregarNuevoRegistro(registro) {
    try {
        const response = await fetch('https://www.refactorii.com/postOneGoogleSigninUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registro),
        });
        
        if (!response.ok) {
            throw new Error('Error en la solicitud');
        }
        
        const data = await response.json();
        return data.GoogleSigninUser;
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}


// Make function available globally for Google SignIn callback
window.handleCredentialResponse = handleCredentialResponse;