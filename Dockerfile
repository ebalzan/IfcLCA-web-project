# Link
# https://medium.com/@ganiilhamirsyadi/dockerize-react-native-expo-app-152c1e65e76c

# Use an official lightweight Node.js image
FROM node:lts-slim

# Build-time arguments (available during build)
ARG NODE_ENV=development
ARG PORT=3000

# Runtime environment variables (available at runtime)
ENV NODE_ENV=$NODE_ENV
ENV PORT=$PORT

EXPOSE $PORT 3001 3002

# Create nodejs group and nextjs user with proper setup
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs -s /bin/bash -m nextjs

# Set up global npm packages for the nextjs user
ENV NPM_CONFIG_PREFIX=/home/nextjs/.npm-global
ENV PATH=/home/nextjs/.npm-global/bin:$PATH

# Install necessary system dependencies
RUN apt-get update && \
    apt-get install -y qemu-user-static && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set working directory and set ownership
RUN mkdir -p /opt/ifclca-development && \
    chown nextjs:nodejs /opt/ifclca-development
WORKDIR /opt/ifclca-development

# Switch to nextjs user
USER nextjs

# Copy only package files first for caching layer benefits
COPY --chown=nextjs:nodejs package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY --chown=nextjs:nodejs . .

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
# COPY --chown=nextjs:nodejs /opt/ifclca-development/public ./public
# COPY --chown=nextjs:nodejs /opt/ifclca-development/.next/static ./.next/static


CMD ["npm", "run", "dev"]
