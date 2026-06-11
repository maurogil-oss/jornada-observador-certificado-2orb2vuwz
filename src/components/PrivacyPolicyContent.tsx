export function PrivacyPolicyContent() {
  return (
    <div className="space-y-6 text-sm text-foreground/90">
      <section>
        <h3 className="text-lg font-bold mb-2 text-foreground">1. Coleta de Dados</h3>
        <p className="mb-2">
          Coletamos os seguintes dados pessoais para a criação do seu perfil na plataforma:
        </p>
        <ul className="list-disc pl-5 space-y-1 mb-2">
          <li>
            <strong>Identificação:</strong> Nome completo, Apelido / Nome Social, CPF ou documento
            estrangeiro e RG.
          </li>
          <li>
            <strong>Contato:</strong> Endereço de e-mail.
          </li>
          <li>
            <strong>Dados Demográficos:</strong> Cidade, Estado, País e CEP.
          </li>
          <li>
            <strong>Dados Profissionais:</strong> Local de trabalho e Turma.
          </li>
          <li>
            <strong>Dados de Atividade:</strong> Submissões realizadas, pontuações e níveis
            alcançados na Jornada.
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2 text-foreground">2. Finalidade</h3>
        <p>
          Os dados coletados têm como objetivo principal viabilizar a sua participação na Jornada do
          Observador Certificado. Isso inclui a criação de perfil, ranqueamento, avaliação de
          submissões e emissão de certificados oficiais ao concluir etapas.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2 text-foreground">3. Segurança dos Dados</h3>
        <p>
          Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais
          contra acesso, alteração, divulgação ou destruição não autorizados. Seus dados são
          armazenados de forma segura em ambiente de nuvem protegido.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2 text-foreground">4. Retenção</h3>
        <p>
          Seus dados pessoais serão retidos enquanto sua conta estiver ativa na plataforma ou pelo
          tempo que for necessário para a manutenção dos registros de certificação e auditorias de
          desempenho.
        </p>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-2 text-foreground">5. Direitos do Usuário</h3>
        <p>
          Você tem o direito de solicitar o acesso, a correção ou a exclusão de seus dados pessoais
          armazenados. Caso deseje exercer algum desses direitos, entre em contato com os
          administradores da plataforma.
        </p>
      </section>
    </div>
  )
}
