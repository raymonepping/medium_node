FROM directus/directus:latest

# Switch to root user to install build tools
USER root

# Install build tools using apk (Alpine Linux)
RUN apk update && apk add --no-cache build-base python3

# Install node-gyp globally
RUN npm install -g node-gyp

# Switch back to default user
USER node

# Copy extensions into the container
COPY extensions /directus/extensions

# Ensure environment variables are available in the container
ENV NODE_ENV=production

# Install dependencies for custom hooks
# WORKDIR /directus/extensions/custom-hooks
# RUN npm install
