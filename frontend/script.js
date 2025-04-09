const apiURL = 'https://finjudge-backend.onrender.com/api/lead';

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.querySelector('#nome').value.trim();
  const telefone = document.querySelector('#telefone').value.trim();
  const erroNome = document.querySelector('#erroNome');
  const erroTelefone = document.querySelector('#erroTelefone');

  // Limpa mensagens anteriores
  erroNome.textContent = '';
  erroTelefone.textContent = '';
  erroNome.style.display = 'none';
  erroTelefone.style.display = 'none';

  let temErro = false;

  // Validação do nome
  if (!nome) {
    erroNome.textContent = 'O campo "Nome" é obrigatório.';
    erroNome.style.display = 'block';
    temErro = true;
  } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(nome)) {
    erroNome.textContent = 'O campo "Nome" deve conter apenas letras.';
    erroNome.style.display = 'block';
    temErro = true;
  }

  // Validação do telefone
  if (!telefone) {
    erroTelefone.textContent = 'O campo "Telefone" é obrigatório.';
    erroTelefone.style.display = 'block';
    temErro = true;
  } else if (!/^[0-9]{10,13}$/.test(telefone)) {
    erroTelefone.textContent = 'O campo "Telefone" deve conter apenas números válidos.';
    erroTelefone.style.display = 'block';
    temErro = true;
  }

  if (temErro) return;

  try {
    // Verifica duplicidade
    const checkResponse = await fetch(`${apiURL}/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone })
    });

    const checkData = await checkResponse.json();

    if (checkData.exists) {
      erroTelefone.textContent = 'Esse lead já foi registrado.';
      erroTelefone.style.display = 'block';
      return;
    }

    // Envia lead
    const response = await fetch(apiURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, telefone })
    });

    if (!response.ok) {
      throw new Error('Erro ao enviar os dados.');
    }

    const data = await response.json();
    console.log('Resposta do servidor:', data);

    // Redireciona para o WhatsApp com o número fixo do bot
    const mensagem = `🎉 Quero começar a usar o FinJudge!`;
    const numeroBot = '554799464149'; // número do bot no formato internacional (sem +)
    const urlWhatsApp = `https://wa.me/${numeroBot}?text=${encodeURIComponent(mensagem)}`;
    window.location.href = urlWhatsApp;

  } catch (err) {
    console.error('Erro ao enviar lead:', err);
    erroTelefone.textContent = 'Erro ao enviar os dados. Tente novamente.';
    erroTelefone.style.display = 'block';
  }
});