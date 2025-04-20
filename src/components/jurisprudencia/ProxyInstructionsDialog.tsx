
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Código do servidor proxy, usado como exemplo no dialog
const codeProxyExpress = `
// arquivo: server.js
import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors());

const API_KEY = "cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==";

app.post('/api/datajud/search', async (req, res) => {
  const { tribunal, termo } = req.body;
  const url = \`https://api-publica.datajud.cnj.jus.br/\${tribunal}/_search\`;

  const queryBody = {
    size: 50,
    query: {
      multi_match: {
        query: termo,
        fields: ["*"],
        type: "best_fields",
        fuzziness: "AUTO"
      }
    },
    sort: [
      { "_score": { "order": "desc" } },
      { "@timestamp": { "order": "desc" } }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`APIKey \${API_KEY}\`
      },
      body: JSON.stringify(queryBody)
    });

    if (!response.ok) {
      throw new Error(\`Status \${response.status} – \${await response.text()}\`);
    }

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error('Erro ao chamar Datajud:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(\`Proxy Datajud rodando na porta \${PORT}\`));
`;

interface ProxyInstructionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProxyInstructionsDialog({
  open,
  onOpenChange,
}: ProxyInstructionsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Implementação do Proxy para a API Datajud</DialogTitle>
          <DialogDescription>
            Siga estas instruções para implementar um servidor proxy que contorne as limitações de CORS
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-md font-semibold mb-2">1. Crie um servidor proxy em Node.js/Express</h3>
            <div className="bg-muted p-3 rounded-md overflow-x-auto">
              <pre className="text-xs"><code>{codeProxyExpress}</code></pre>
            </div>
            <p className="text-sm mt-2">
              Salve este código como <code>server.js</code> e instale as dependências com:
              <br />
              <code className="bg-muted p-1 rounded text-xs">npm install express node-fetch cors</code>
            </p>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-2">2. Ajuste o frontend para usar o proxy</h3>
            <p className="text-sm">
              Altere os endpoints do seu React/Vue/Angular para enviar as requisições para seu proxy, por exemplo <code>/api/datajud/search</code> ao invés de chamar o domínio do Datajud diretamente.<br />
              O corpo da requisição deve incluir <code>tribunal</code> e <code>termo</code> conforme o exemplo.
            </p>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-2">3. Execute o servidor proxy</h3>
            <p className="text-sm">
              Execute o servidor com: <code className="bg-muted p-1 rounded text-xs">node server.js</code><br />
              Seu proxy estará disponível em <code className="bg-muted p-1 rounded text-xs">http://localhost:3500/api/datajud/search</code>
            </p>
          </div>

          <div className="flex justify-between items-center border-t pt-4 mt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>

            <Button
              variant="outline"
              className="flex gap-2 items-center"
              onClick={() => {
                const blob = new Blob([codeProxyExpress], { type: 'text/javascript' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'datajud-proxy-server.js';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-4 w-4" />
              Baixar código do servidor
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
