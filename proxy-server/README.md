
# Servidor Proxy para API Datajud

Este servidor atua como intermediário entre o frontend e a API do Datajud, contornando as limitações de CORS impostas pelos navegadores.

## Configuração

1. Instale as dependências:
```
npm install
```

2. Inicie o servidor:
```
npm start
```

O servidor estará disponível em http://localhost:3500

## Endpoints

- **POST /api/datajud/search**: Repassa consultas para a API do Datajud
- **GET /health**: Verifica se o servidor está funcionando

## Uso com o frontend

Certifique-se de que o frontend está configurado para usar este proxy em vez de chamar diretamente a API do Datajud.
