# STORY-003 #12: the step-store MCP server as a Docker image (HTTP transport).
# Dev still runs it from source via npx (see .mcp.json) — this is the container path.
FROM node:22-slim

WORKDIR /app

# Install deps first for layer caching. tsx (a devDependency) runs the TS directly.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY steps ./steps

# Bake the embedding model into the image so the first query is fast and offline.
RUN npm run embed -- "warmup" >/dev/null 2>&1

ENV MCP_TRANSPORT=http
ENV MCP_HTTP_PORT=3000
EXPOSE 3000

CMD ["npm", "run", "server"]
