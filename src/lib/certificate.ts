export const generateCertificate = (user: any) => {
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    throw new Error(
      'O bloqueador de pop-ups impediu a geração do certificado. Por favor, permita pop-ups para este site.',
    )
  }

  const name = user.full_name || user.name || 'Observador'
  const level = user.level || 'Nível III - Mobilizador'
  const date = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Certificado de Conclusão - ${name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto:wght@300;400;500&display=swap');
          
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f4f4f5;
            color: #1e293b;
            font-family: 'Roboto', sans-serif;
          }
          .certificate {
            border: 12px solid #1e3a8a;
            padding: 50px;
            background-color: #fff;
            width: 950px;
            height: 650px;
            text-align: center;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            position: relative;
            box-sizing: border-box;
            background-image: radial-gradient(#f8fafc 1px, transparent 1px);
            background-size: 20px 20px;
          }
          .certificate::after {
            content: '';
            position: absolute;
            top: 6px; right: 6px; bottom: 6px; left: 6px;
            border: 2px solid #94a3b8;
            pointer-events: none;
          }
          .header {
            font-size: 46px;
            font-weight: 700;
            color: #1e3a8a;
            text-transform: uppercase;
            letter-spacing: 3px;
            margin-bottom: 15px;
            font-family: 'Playfair Display', serif;
          }
          .subtitle {
            font-size: 22px;
            color: #64748b;
            margin-bottom: 50px;
            font-weight: 300;
            letter-spacing: 1px;
          }
          .presented {
            font-size: 18px;
            margin-bottom: 15px;
            color: #475569;
          }
          .name {
            font-size: 52px;
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 25px;
            font-family: 'Playfair Display', serif;
            position: relative;
            display: inline-block;
            padding: 0 20px 10px 20px;
            border-bottom: 2px solid #cbd5e1;
          }
          .description {
            font-size: 18px;
            line-height: 1.7;
            max-width: 750px;
            margin: 0 auto 50px auto;
            color: #334155;
          }
          .description strong {
            color: #1e3a8a;
          }
          .footer {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 60px;
            padding: 0 60px;
          }
          .signature-block {
            text-align: center;
            width: 250px;
          }
          .signature-line {
            border-top: 1px solid #000;
            margin-bottom: 10px;
          }
          .signature-name {
            font-weight: 500;
            font-size: 16px;
          }
          .date-block {
            font-size: 18px;
            color: #334155;
          }
          .seal {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            width: 80px;
            height: 80px;
            background-color: #fbbf24;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: bold;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            border: 4px dashed #fff;
            outline: 2px solid #fbbf24;
          }
          @media print {
            body { background-color: #fff; }
            .certificate { box-shadow: none; border-color: #1e3a8a; }
            @page { size: landscape; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <div class="header">Certificado de Conclusão</div>
          <div class="subtitle">Jornada Observador Certificado</div>
          
          <div class="presented">Certificamos com orgulho que</div>
          <div class="name">${name}</div>
          
          <div class="description">
            Concluiu com êxito todas as etapas de avaliação e impacto na plataforma da Jornada, 
            acumulando as pontuações e competências necessárias que o(a) qualificam com o título de 
            <strong>${level}</strong>, demonstrando extraordinária liderança e excelência institucional.
          </div>
          
          <div class="seal">ONSV</div>
          
          <div class="footer">
            <div class="date-block">
              Data de Emissão: <br><strong>${date}</strong>
            </div>
            <div class="signature-block">
              <div class="signature-line"></div>
              <div class="signature-name">Coordenação ONSV</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
            }, 800);
          };
        </script>
      </body>
    </html>
  `
  printWindow.document.write(html)
  printWindow.document.close()
}
