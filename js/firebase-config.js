// Configuração do Firebase - SUAS CREDENCIAIS
const firebaseConfig = {
    apiKey: "AIzaSyAxnUgSH1YKfV9I-hjgjEHzMl1oW3r4MAE",
    authDomain: "portal-c53ae.firebaseapp.com",
    projectId: "portal-c53ae",
    storageBucket: "portal-c53ae.firebasestorage.app",
    messagingSenderId: "335833040980",
    appId: "1:335833040980:web:aa7d7e9fb71f78436785c1"
};

// Inicializar Firebase (versão compatibilidade)
firebase.initializeApp(firebaseConfig);

// Referências aos serviços do Firebase
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Exportar referências
window.firebaseApp = {
    auth: auth,
    db: db,
    storage: storage
};