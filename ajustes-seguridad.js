/* ========================================================== */
/* CONFIGURACIÓN Y UTILIDADES */
/* ========================================================== */

// --- Configuración de Firebase ---
const firebaseConfig = {
    apiKey: "AIzaSyCr1-2dIqgxoXBTKYgSusnUZorUICX2Too",
    authDomain: "chatglobal-e9370.firebaseapp.com",
    databaseURL: "https://chatglobal-e9370-default-rtdb.firebaseio.com",
    projectId: "chatglobal-e9370",
    storageBucket: "chatglobal-e9370.firebasestorage.app",
    messagingSenderId: "382420208590",
    appId: "1:382420208590:web:9425fa28c8cdf669adb99f"
};

// Inicializar Firebase si no está iniciado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const database = firebase.database(); 
const usersRef = database.ref('users'); 

// Referencias DOM
const currentUsernameInput = document.getElementById('currentUsername');
const newUsernameInput = document.getElementById('newUsername');
const updateUsernameForm = document.getElementById('updateUsernameForm');
const changePasswordForm = document.getElementById('changePasswordForm');
const changePasswordCard = document.getElementById('changePasswordCard'); 
const currentPasswordInput = document.getElementById('currentPassword'); 
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const statusMessage = document.getElementById('statusMessage');

let currentUser = null;
const sessionUser = sessionStorage.getItem("sociosxit_user"); 

// Validación de sesión compartida
if (!sessionUser) {
    window.location.href = 'index.html'; 
} else {
    currentUsernameInput.value = sessionUser;
}

// Mostrar mensajes
function displayStatus(message, isSuccess = true) {
    statusMessage.textContent = message;
    statusMessage.className = `p-4 rounded-lg mb-4 font-semibold ${isSuccess ? 'bg-green-700 text-white border-2 border-neon-green' : 'bg-red-700 text-white border-2 border-neon-pink'}`;
    statusMessage.classList.remove('hidden');
    setTimeout(() => { statusMessage.classList.add('hidden'); }, 5000);
}

// ==========================================================
// VISIBILIDAD DE TARJETA (BASADA EN RTDB SOLAMENTE)
// ==========================================================

auth.onAuthStateChanged(async user => { 
    if (user) {
        currentUser = user;
        
        if (changePasswordCard) {
            
            if (sessionUser) {
                try {
                    const snapshot = await usersRef.child(sessionUser).once('value');
                    const userData = snapshot.val();
                    
                    // Mostrar si el usuario TIENE una propiedad 'password' y NO es null (asumiendo que es una cuenta manual)
                    const hasManualPassword = userData && userData.password && userData.password !== null; 
                    
                    if (hasManualPassword) {
                        changePasswordCard.style.display = 'block'; 
                    } else {
                        // Oculta la tarjeta si es una cuenta migrada o Google Auth
                        changePasswordCard.style.display = 'none'; 
                    }

                } catch (error) {
                    console.error("Error al verificar el proveedor en RTDB:", error);
                    changePasswordCard.style.display = 'none'; 
                }
            } else {
                 changePasswordCard.style.display = 'none'; 
            }
        }

    } else {
        // Redirigir si la sesión de Firebase Auth no existe
        window.location.href = 'index.html'; 
    }
});

/* ========================================================== */
/* LÓGICA DE ACTUALIZACIÓN DE NOMBRE */
/* ========================================================== */

if (updateUsernameForm) {
    updateUsernameForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) return displayStatus('Error: Usuario no autenticado.', false);

        const newUsername = newUsernameInput.value.trim();
        if (newUsername.length < 3)
            return displayStatus('El nombre de usuario debe tener al menos 3 caracteres.', false);
        
        const oldUsername = sessionStorage.getItem("sociosxit_user");

        if (newUsername === oldUsername) {
            return displayStatus('El nuevo nombre es el mismo que el actual.', false);
        }

        try {
            // 1. Verificar si el nuevo nombre ya está ocupado
            const snapshot = await usersRef.child(newUsername).once('value');
            if (snapshot.exists()) {
                return displayStatus('El nombre de usuario ya está en uso en la base de datos.', false);
            }

            // 2. Obtener la información completa del nodo antiguo
            const oldUserDataSnapshot = await usersRef.child(oldUsername).once('value');
            if (!oldUserDataSnapshot.exists()) {
                 throw new Error('No se encontró el perfil antiguo en la base de datos.');
            }
            const userData = oldUserDataSnapshot.val();
            
            // Actualiza el campo 'name' si existe
            if (userData.name) { userData.name = newUsername; }
            
            // 3. Crear el nuevo nodo y eliminar el antiguo
            await usersRef.child(newUsername).set(userData);
            await usersRef.child(oldUsername).remove();
            
            // 4. Actualizar el perfil en Firebase Auth y sesión
            await currentUser.updateProfile({ displayName: newUsername });
            sessionStorage.setItem("sociosxit_user", newUsername); 
            
            // 5. Actualización de la UI
            currentUsernameInput.value = newUsername; 
            newUsernameInput.value = '';
            
            displayStatus('¡Nombre de usuario actualizado con éxito y sincronizado con la base de datos!');
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            // Manejar error específico de Firebase Auth si aplica (aunque la lógica principal es RTDB)
            displayStatus(`Error al actualizar nombre: ${error.message}`, false);
        }
    });
}

/* ========================================================== */
/* LÓGICA DE CAMBIO DE CONTRASEÑA (RTDB PURO - SIN EMAILS) */
/* ========================================================== */

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!currentUser) return displayStatus('Error: Usuario no autenticado.', false);
        
        // Obtener valores
        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validaciones
        if (!currentPassword) 
            return displayStatus('Debes ingresar tu contraseña actual.', false);
        
        if (newPassword.length < 6)
            return displayStatus('La nueva contraseña debe tener al menos 6 caracteres.', false);

        if (newPassword !== confirmPassword)
            return displayStatus('Las nuevas contraseñas no coinciden.', false);

        
        const sessionUser = sessionStorage.getItem("sociosxit_user");

        try {
            // 1. Obtener los datos del usuario de la RTDB
            const snapshot = await usersRef.child(sessionUser).once('value');
            const userData = snapshot.val();
            
            if (!userData || !userData.password) {
                // Esta verificación nunca debería fallar si la tarjeta está visible, pero es una buena práctica.
                return displayStatus('Error: La cuenta no tiene una contraseña manual registrada.', false);
            }
            
            // 🛑 2. VERIFICACIÓN DE CONTRASEÑA ACTUAL CONTRA RTDB
            // Advertencia: Tu código usa comparación de texto simple, lo cual es inseguro.
            // Para la seguridad REAL, esto debería ser: await bcrypt.compare(currentPassword, userData.password)
            
            const isPasswordCorrect = (userData.password === currentPassword); 
            
            if (!isPasswordCorrect) {
                return displayStatus('La Contraseña Actual es incorrecta.', false);
            }

            // 🛑 3. ACTUALIZACIÓN DE CONTRASEÑA EN RTDB
            // Advertencia: La nueva contraseña NO ESTÁ HASHEADA antes de guardarse.
            // Para la seguridad REAL, esto debería ser: const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            await usersRef.child(sessionUser).update({
                password: newPassword, // ¡CAMBIA ESTO POR EL PASSWORD HASHEADO!
                updated_at: new Date().toISOString()
            });
            
            // 4. Limpiar campos y mostrar éxito
            currentPasswordInput.value = '';
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';
            
            displayStatus('¡Contraseña actualizada con éxito en la base de datos!', true);
            
        } catch (error) {
            console.error("Error al cambiar contraseña en RTDB:", error);
            displayStatus(`Error interno al actualizar la contraseña: ${error.message}`, false);
        }
    });
}
