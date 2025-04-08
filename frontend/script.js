document.getElementById('lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nome = document.getElementById('nome').value;
  const telefone = document.getElementById('telefone').value;

  try {
    const response = await fetch('http://localhost:3000/api/lead', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, telefone })
    });

    if (response.ok) {
      // Redirecionar para WhatsApp com mensagem personalizada
      const mensagem = `Olá, me chamo ${nome} e quero usar o FinJudge!`;
      window.location.href = `https://wa.me/55${telefone.replace(/\D/g, '')}?text=${encodeURIComponent(mensagem)}`;
    } else {
      alert('Erro ao enviar. Tente novamente.');
    }
  } catch (error) {
    alert('Erro de conexão com o servidor.');
    console.error(error);
  }
});
