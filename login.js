document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();
            const rememberMe = document.getElementById('remember').checked;
            
            // Validação mais robusta
            if(!username || !password) {
                showError('Please fill in all fields');
                return;
            }
            
            // Simulação de login
            console.log('Login attempt with:', { 
                username, 
                rememberMe 
            });
            
            // Feedback visual
            const button = document.querySelector('.login-button');
            button.textContent = 'Logging in...';
            button.disabled = true;
            
            // Simula um delay de rede
            setTimeout(() => {
                // Redirecionamento (substitua pela lógica real)
                window.location.href = 'dashboard.html';
            }, 1500);
        });
    }
});

function showError(message) {
    // Remove erros anteriores
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    // Cria e exibe nova mensagem de erro
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = '#ff6b6b';
    errorElement.style.marginBottom = '1rem';
    errorElement.style.textAlign = 'center';
    
    const form = document.querySelector('.login-form');
    form.insertBefore(errorElement, form.firstChild);
}