import { LoginResponse } from '../types';
import { session } from '../utils/auth';

const API = 'http://localhost:3001';

const form     = document.querySelector<HTMLFormElement>('form')!;
const feedback = document.getElementById('feedbackText')!;

function togglePassword(): void {
  const input = document.getElementById('passwd') as HTMLInputElement;
  const btn   = document.querySelector<HTMLButtonElement>('.toggle-password')!;
  if (input.type === 'password') {
    input.type = 'text';
    btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
  } else {
    input.type = 'password';
    btn.innerHTML = '<i class="fa-regular fa-eye"></i>';
  }
}

(window as Window & typeof globalThis & { togglePassword: () => void }).togglePassword = togglePassword;

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const user   = (document.getElementById('user')   as HTMLInputElement).value;
  const passwd = (document.getElementById('passwd') as HTMLInputElement).value;
  feedback.textContent = '';

  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, passwd }),
    });
    const data = await res.json() as LoginResponse;

    if (data.error) {
      feedback.textContent = data.error;
      return;
    }

    if (data.token) session.set('token', data.token);
    session.set('user', user);
    session.set('passwd', passwd);
    if (data.rol) session.set('rol', data.rol);

    window.location.href = data.redirect;
  } catch {
    feedback.textContent = 'Error del servidor.';
  }
});
