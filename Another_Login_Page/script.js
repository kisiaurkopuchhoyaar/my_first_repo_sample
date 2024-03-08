const username = Document.getElementById('username');
const password = Document.getElementById('password');
const login = Document.getElementById('login');

login.addEventListener('submit', (e) => {
    e.preventDefault();
    if (username.value == 'admin' && password.value == 'password') {
        windows.alert('login successful');
    } else {
        windows.alert('login failed');
    }
})