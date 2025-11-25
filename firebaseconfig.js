// --- Configuración de Firebase ---
const firebaseConfig = {
  apiKey: "AIzaSyCEM7fa1Erl2NLpM8VTRYCVyHW-cl-JEjw",
  authDomain: "sociosxit-fa932.firebaseapp.com",
  databaseURL: "https://sociosxit-fa932-default-rtdb.firebaseio.com",
  projectId: "sociosxit-fa932",
  storageBucket: "sociosxit-fa932.firebasestorage.app",
  messagingSenderId: "942961938934",
  appId: "1:942961938934:web:8f9e5620253d122a9e77d7"
};

// Inicializar Firebase si no está iniciado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Exportamos las referencias para ser usadas en el otro script
const auth = firebase.auth();
const database = firebase.database(); 
const usersRef = database.ref('users'); 
