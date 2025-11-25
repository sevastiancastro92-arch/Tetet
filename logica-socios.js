// Configuración de Particles.js
particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 80,
      "density": {
        "enable": true,
        "value_area": 800
      }
    },
    "color": {
      "value": ["#ff006e", "#8338ec", "#3a86ff"] /* Colores neón para las partículas */
    },
    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#000000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "img/github.svg",
        "width": 100,
        "height": 100
      }
    },
    "opacity": {
      "value": 0.5,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 3,
      "random": true,
      "anim": {
        "enable": false,
        "speed": 40,
        "size_min": 0.1,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 150,
      "color": "#8338ec", /* Color neón para las líneas */
      "opacity": 0.4,
      "width": 1
    },
    "move": {
      "enable": true,
      "speed": 2,
      "direction": "none",
      "random": false,
      "straight": false,
      "out_mode": "out",
      "bounce": false,
      "attract": {
        "enable": false,
        "rotateX": 600,
        "rotateY": 1200
      }
    }
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "grab" /* Cambiado a 'grab' para un efecto más interactivo */
      },
      "onclick": {
        "enable": true,
        "mode": "push"
      },
      "resize": true
    },
    "modes": {
      "grab": {
        "distance": 180, /* Aumentado para un área de agarre mayor */
        "line_linked": {
          "opacity": 0.8
        }
      },
      "bubble": {
        "distance": 400,
        "size": 40,
        "duration": 2,
        "opacity": 8,
        "speed": 3
      },
      "repulse": {
        "distance": 200,
        "duration": 0.4
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});

// --- CÓDIGO FIREBASE Y LÓGICA DE LA APP ---
const firebaseConfig = {
  apiKey: "AIzaSyCEM7fa1Erl2NLpM8VTRYCVyHW-cl-JEjw",
  authDomain: "sociosxit-fa932.firebaseapp.com",
  databaseURL: "https://sociosxit-fa932-default-rtdb.firebaseio.com",
  projectId: "sociosxit-fa932",
  storageBucket: "sociosxit-fa932.firebasestorage.app",
  messagingSenderId: "942961938934",
  appId: "1:942961938934:web:8f9e5620253d122a9e77d7"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth(); 
const usersRef = db.ref("users");
const uidMapRef = db.ref("uid_map"); 
const adminLogsRef = db.ref("admin_logs"); // ⭐ Nueva referencia para el admin

const views = ["loginView", "registerView", "usernamePromptView", "linkAccountView"];
const show = (id) => views.forEach(v => document.getElementById(v).classList.toggle("hidden", v !== id));

document.getElementById("goRegister").onclick = () => show("registerView");
document.getElementById("goLogin").onclick = () => show("loginView");
document.getElementById("goLinkAccount").onclick = () => show("linkAccountView");
document.getElementById("goBackToLogin").onclick = () => show("loginView");

let googleUserData = null; 

// --- FUNCIÓN PARA ENVIAR LOGS AL ADMIN (FIREBASE) ---
const sendAdminLog = (username, action) => {
    try {
        const logEntry = adminLogsRef.push(); // Usa push() para crear un ID único
        logEntry.set({
            timestamp: new Date().toISOString(),
            username: username,
            action: action, 
            status: "Success"
        });
        console.log(`Log enviado al admin para ${username}: ${action}`);
    } catch (error) {
        console.error("Error al enviar log al admin:", error);
    }
};
// -----------------------------------------------------

// --- FUNCIONES MODAL ---
const successModal = document.getElementById("successModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const successMessage = document.getElementById("successMessage");

const showModal = (isManualRegistration, username, isLinking = false) => {
    if (isLinking) {
        successMessage.innerHTML = `🎉 ¡Éxito! Tu cuenta (**${username}**) ha sido migrada a Google.<br> Ahora inicia sesión usando el botón de Google.`;
    } else if (isManualRegistration) {
        successMessage.innerHTML = `✅ Tu cuenta (**${username}**) ha sido creada con **éxito**.<br>💾 Tu información de acceso se descargó **automáticamente** en el archivo \`credenciales.txt\`.`;
    } else {
        successMessage.innerHTML = `✅ Has completado tu registro (**${username}**) con **Google** exitosamente.`;
    }
    successModal.classList.remove("hidden");
    setTimeout(() => successModal.classList.add("show"), 10); 
};

const hideModal = () => {
    successModal.classList.remove("show");
    setTimeout(() => {
        successModal.classList.add("hidden");
        // Redirige al dashboard
        sessionStorage.getItem("sociosxit_user") ? window.location.href = "dashboard.html" : show("loginView"); 
    }, 300); 
};

closeModalBtn.onclick = hideModal;

// --- FUNCION PARA DESCARGAR CREDENCIALES ---
function descargarCredenciales(usuario, password) {
  const fecha = new Date();
  const contenido = `🎉 Bienvenido a SociosXIT!\n\nUsuario: ${usuario}\nContraseña: ${password}\nFecha de registro: ${fecha.toLocaleString()}\n\nPor favor, guarda este archivo en un lugar seguro...`;
  const blob = new Blob([contenido], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "credenciales.txt";
  link.click();
}

// --- REGISTRO MANUAL ---
document.getElementById("regBtn").onclick = async () => {
  const user = regUser.value.trim();
  const pass = regPass.value.trim();
  if (!user || !pass) return alert("Completa todos los campos");

  try {
    const snap = await usersRef.child(user).once("value");
    if (snap.exists()) return alert("El usuario ya existe");

    await usersRef.child(user).set({ password: pass, verified: true });

    descargarCredenciales(user, pass);
    sendAdminLog(user, "New Manual Account"); // ⭐ LOG ADMIN
    showModal(true, user); 
  } catch (error) {
    console.error("Error al registrar: ", error);
    alert("Ocurrió un error al registrar: " + error.message);
  }
};

// --- LOGIN MANUAL ---
document.getElementById("loginBtn").onclick = async () => {
  const user = loginUser.value.trim();
  const pass = loginPass.value.trim();
  if (!user || !pass) return alert("Completa todos los campos");

  try {
    const snap = await usersRef.child(user).once("value");
    if (!snap.exists() || snap.val().password !== pass) return alert("Datos incorrectos");
    
    // Verifica si la cuenta ha sido migrada (ya no tiene contraseña)
    if (snap.val().password === null && snap.val().provider && snap.val().provider.startsWith('google')) {
         return alert("Esta cuenta ha sido migrada a Google. Por favor, usa el botón 'Iniciar Sesión con Google'.");
    }

    sessionStorage.setItem("sociosxit_user", user);
    sendAdminLog(user, "Manual Login"); // ⭐ LOG ADMIN
    window.location.href = "dashboard.html";
  } catch (error) {
    console.error("Error al iniciar sesión: ", error);
    alert("Ocurrió un error al iniciar sesión: " + error.message);
  }
};

// --- LÓGICA DE GOOGLE ---
const provider = new firebase.auth.GoogleAuthProvider();

async function signInWithGoogle() {
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    const uid = user.uid; 
    
    const uidSnap = await uidMapRef.child(uid).once("value");

    if (uidSnap.exists()) {
      // Usuario REGRESANDO: Inicia sesión con el nombre de usuario mapeado
      const customUser = uidSnap.val();
      sessionStorage.setItem("sociosxit_user", customUser);
      sendAdminLog(customUser, "Google Login"); // ⭐ LOG ADMIN
      window.location.href = "dashboard.html";

    } else {
      // Usuario NUEVO: Necesita elegir un nombre de usuario
      googleUserData = user; 
      show("usernamePromptView"); 
      // Sugerir un nombre de usuario basado en el nombre de Google
      document.getElementById("promptUser").value = user.displayName ? user.displayName.replace(/\s/g, '').toLowerCase() : user.email.split('@')[0];
    }

  } catch (error) {
    console.error("Error en la autenticación con Google:", error);
    if (error.code === 'auth/popup-closed-by-user') {
        alert("La ventana de inicio de sesión con Google fue cerrada.");
    } else {
        alert("Ocurrió un error al iniciar sesión con Google: " + error.message);
    }
  }
}

// --- PROMPT DE USUARIO (REGISTRO GOOGLE NUEVO) ---
document.getElementById("promptUserBtn").onclick = async () => {
  const customUser = promptUser.value.trim();

  if (!customUser || customUser.length < 3) return alert("Ingresa un usuario válido (mínimo 3 caracteres).");

  try {
    const userSnap = await usersRef.child(customUser).once("value");
    if (userSnap.exists()) return alert(`El usuario '${customUser}' ya existe. Por favor, elige otro.`);
    
    const user = googleUserData;
    const uid = user.uid;

    // 1. Registrar en la base de datos con el nombre de usuario
    await usersRef.child(customUser).set({
      uid: uid,
      email: user.email,
      name: user.displayName || "Google User",
      provider: 'google',
      verified: true,
      registered_at: new Date().toISOString()
    });

    // 2. Crear el mapeo UID -> Nombre de usuario
    await uidMapRef.child(uid).set(customUser);
    sessionStorage.setItem("sociosxit_user", customUser);
    sendAdminLog(customUser, "Google Registration"); // ⭐ LOG ADMIN
    showModal(false, customUser); 

  } catch (error) {
    console.error("Error al finalizar el registro de Google:", error);
    alert("Ocurrió un error al finalizar el registro: " + error.message);
  }
};

// --- LÓGICA DE MIGRACIÓN/REEMPLAZO DE CUENTA ---
document.getElementById("linkAccountBtn").onclick = async () => {
    const user = linkUser.value.trim();
    const pass = linkPass.value.trim();

    if (!user || !pass) return alert("Completa tu usuario y contraseña actuales.");

    try {
        // 1. Validar las credenciales en la Realtime Database (RTDB)
        const snap = await usersRef.child(user).once("value");
        if (!snap.exists() || snap.val().password !== pass) {
            return alert("Usuario o Contraseña manual incorrectos.");
        }
        
        if (snap.val().uid && snap.val().provider && snap.val().provider.startsWith('google')) {
             return alert("Esta cuenta ya ha sido migrada a Google.");
        }

        // 2. Iniciar sesión con Google para obtener las credenciales de destino
        alert(`✅ Credenciales manuales verificadas. Ahora inicia sesión con la cuenta de Google a la que quieres migrar la cuenta '${user}'.`);
        
        // Forzar el login con Google
        const googleResult = await auth.signInWithPopup(provider);
        
        const googleUser = googleResult.user;
        const googleUid = googleUser.uid;
        const googleEmail = googleUser.email;
        const googleDisplayName = googleUser.displayName;

        // 3. Verificar si el UID de Google ya está mapeado a otro usuario en RTDB
        const existingMapping = await uidMapRef.child(googleUid).once("value");
        if (existingMapping.exists() && existingMapping.val() !== user) {
            return alert("🚨 Conflicto de Cuenta: La cuenta de Google seleccionada ya está vinculada a otra cuenta de SocioXIT.");
        }

        // 4. MIGRACIÓN FORZADA: Actualizar el registro del usuario manual con los datos de Google
        await usersRef.child(user).update({
            uid: googleUid,
            email: googleEmail,
            name: googleDisplayName || user,
            provider: 'google_migrated',
            // Eliminamos la contraseña manual
            password: null, 
            migrated_at: new Date().toISOString()
        });

        // 5. Crear el mapeo UID -> Nombre de usuario
        await uidMapRef.child(googleUid).set(user);
        
        // 6. Completar el inicio de sesión y mostrar el éxito
        sessionStorage.setItem("sociosxit_user", user);
        sendAdminLog(user, "Account Migration"); // ⭐ LOG ADMIN
        showModal(false, user, true); 

    } catch (error) {
        console.error("Error en el proceso de migración:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            alert("La ventana de Google fue cerrada. Vuelve a intentarlo.");
        } else {
             alert("Ocurrió un error al migrar la cuenta. Revisa la consola para más detalles.");
        }
    } finally {
        // Aseguramos que el estado de Auth queda limpio
        auth.signOut();
    }
};


// Asignar la función a los botones de Google
document.getElementById("googleLoginBtn").onclick = signInWithGoogle;
document.getElementById("googleRegisterBtn").onclick = signInWithGoogle;
