const apiUrl = 'https://finjudge-backend.onrender.com/api/lead';

// Envio de dados do formulário
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.querySelector('#nome').value;
  const telefone = document.querySelector('#telefone').value;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, telefone })
    });

    const data = await response.json();
    console.log('Resposta do servidor:', data);
  } catch (err) {
    console.error('Erro ao enviar lead:', err);
  }
});const apiUrl = 'https://finjudge-backend.onrender.com/api/lead';

// Exemplo de envio de dados:
document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const nome = document.querySelector('#nome').value;
  const telefone = document.querySelector('#telefone').value;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, telefone })
    });

    const data = await response.json();
    console.log('Resposta do servidor:', data);
  } catch (err) {
    console.error('Erro ao enviar lead:', err);
  }
});
