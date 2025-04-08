const apiURL = 'https://finjudge-backend.onrender.com/api/lead';

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.querySelector('#nome').value.trim();
  const telefone = document.querySelector('#telefone').value.trim();

  // Validações
  if (!nome || !telefone) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  const nomeRegex = /^[A-Za-zÀ-ÿ\s]+$/;
  if (!nomeRegex.test(nome)) {
    alert('O campo "Nome" deve conter apenas letras.');
    return;
  }

  const telefoneRegex = /^[0-9]+$/;
  if (!telefoneRegex.test(telefone)) {
    alert('O campo "Telefone" deve conter apenas números.');
    return;
  }

  try {
    // Primeiro checa se já existe
    const checkResponse = await fetch(`${apiURL}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone })
    });

    const checkData = await checkResponse.json();

    if (checkData.exists) {
      alert('Esse lead já foi registrado.');
      return;
    }

    // Envia o lead
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone })
    });

    if (response.ok) {
      alert('Cadastro realizado com sucesso! Vamos te redirecionar para o WhatsApp.');

      // Redireciona para o WhatsApp
      window.location.href = `https://wa.me/55${telefone}?text=Olá%20${encodeURIComponent(nome)},%20obrigado%20por%20se%20interessar%20pelo%20FinJudge!`;
    } else {
      alert('Erro ao enviar os dados. Tente novamente mais tarde.');
    }

  } catch (err) {
    console.error('Erro ao enviar lead:', err);
    alert('Erro de conexão com o servidor. Verifique sua internet e tente novamente.');
  }
});