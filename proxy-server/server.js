
// Servidor proxy para a API Datajud - contorna limitações de CORS
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json());

// API Key para o Datajud
const API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

// Rota principal para busca de jurisprudência
app.post('/api/datajud/search', async (req, res) => {
  try {
    const { tribunal, termo, filtros } = req.body;
    
    // URL base da API Datajud para o tribunal específico
    const datajudUrl = `https://api-publica.datajud.cnj.jus.br/${tribunal}/_search`;
    
    // Construir a consulta Elasticsearch
    const queryBody = {
      size: 50, // Aumento para retornar mais resultados, similar à imagem de referência
      query: {
        multi_match: {
          query: termo,
          fields: ["*"],
          type: "best_fields",
          fuzziness: "AUTO"
        }
      },
      // Ordenação por relevância e data mais recente
      sort: [
        { "_score": { "order": "desc" } },
        { "@timestamp": { "order": "desc" } }
      ]
    };
    
    // Se houver filtros específicos, adiciona-os à consulta
    if (filtros) {
      // Implementar filtros adicionais aqui quando necessário
      // Ex: filtros por data, órgão julgador, etc.
    }
    
    console.log(`Consultando API Datajud: ${datajudUrl}`);
    console.log(`Termo de busca: ${termo}`);
    
    // Requisição para a API Datajud
    const response = await fetch(datajudUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `APIKey ${API_KEY}`
      },
      body: JSON.stringify(queryBody)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erro da API Datajud: ${response.status} - ${errorText}`);
      return res.status(response.status).json({ 
        error: `Erro na API Datajud: ${response.status}`,
        details: errorText
      });
    }
    
    // Processa a resposta da API
    const data = await response.json();
    console.log(`Resultados encontrados: ${data.hits?.total?.value || 0}`);
    
    // Retorna os dados para o cliente
    return res.json(data);
    
  } catch (error) {
    console.error('Erro no servidor proxy:', error);
    return res.status(500).json({ 
      error: 'Erro interno no servidor proxy',
      message: error.message
    });
  }
});

// Rota de verificação de saúde do servidor
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor proxy Datajud funcionando' });
});

// Porta onde o servidor estará rodando
const PORT = process.env.PORT || 3500;

app.listen(PORT, () => {
  console.log(`Servidor proxy Datajud rodando na porta ${PORT}`);
  console.log(`URL base: http://localhost:${PORT}/api/datajud/search`);
});
