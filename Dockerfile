# Air-Gapped Self-Hosted Docker Image for StatementFlow AI ($999 Enterprise Build)
ARG NODE_VERSION=24.14.1-slim

FROM node:${NODE_VERSION} AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:${NODE_VERSION} AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder --chown=node:node /app/out ./out
USER node
EXPOSE 3000
CMD ["node", "-e", "const http=require('http'),fs=require('fs'),path=require('path');const m={'.html':'text/html;charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.ico':'image/x-icon','.json':'application/json','.txt':'text/plain','.xml':'application/xml'};http.createServer((req,res)=>{let u=decodeURIComponent((req.url||'/').split('?')[0]);if(u.endsWith('/'))u+='index.html';let f=path.join('/app/out',path.normalize(u).replace(/^(\\.\\.[\\/\\\\])+/, ''));if(!fs.existsSync(f)&&fs.existsSync(f+'.html'))f+='.html';if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':m[path.extname(f)]||'application/octet-stream','X-Content-Type-Options':'nosniff','X-Frame-Options':'SAMEORIGIN'});fs.createReadStream(f).pipe(res);}).listen(process.env.PORT||3000,'0.0.0.0');"]
