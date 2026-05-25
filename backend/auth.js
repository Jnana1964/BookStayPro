// Check authentication state
document.addEventListener('DOMContentLoaded', function() {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  // Redirect logic
  if (token && user) {
    if (window.location.pathname.includes('login.html') || 
        window.location.pathname.includes('register.html')) {
      window.location.href = user.role === 'admin' ? 'admin.html' : 'user.html';
    }
  } else {
    if (window.location.pathname.includes('admin.html') || 
        window.location.pathname.includes('user.html') ||
        window.location.pathname.includes('booking.html') ||
        window.location.pathname.includes('profile.html')) {
      window.location.href = 'login.html';
    }
  }
  
  // Logout functionality
  const logoutBtn = document.getElementById('logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }
  
  // Login form handling
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          window.location.href = data.user.role === 'admin' ? 'admin.html' : 'user.html';
        } else {
          alert(data.error || 'Login failed');
        }
      } catch (error) {
        console.error('Login error:', error);
        alert('Network error. Please try again.');
      }
    });
  }
});