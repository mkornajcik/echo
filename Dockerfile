# Use node.js runtime
FROM node:22-alpine

# Set the working directory
WORKDIR /app

# Copy package*.json files into app
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma client
RUN npx prisma generate

# Copy the rest of the code
COPY . .

# Build the TypeScript code and SASS
RUN npm run build
RUN npm run build:sass

# Create necessary directories
RUN mkdir -p dist/public/styles dist/public/images dist/views dist/views/partials

# Copy static files and views to dist directory
RUN cp -r src/public/styles/styles.css dist/public/styles/
RUN cp -r src/public/images/* dist/public/images/ || true
RUN cp -r src/views/* dist/views/
RUN cp -r src/views/partials/* dist/views/partials/

# Expose the port
EXPOSE 3000

# Define command to run the app
CMD npx prisma migrate deploy && node ./dist/index.js