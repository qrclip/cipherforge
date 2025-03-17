# CipherForge Deployment Guide

CipherForge is primarily distributed as a Docker image with Caddy server, which automatically handles SSL certificate provisioning.

## Official Docker Image

The simplest way to deploy CipherForge:

```bash
# Pull and run with Docker
docker run -p 80:80 -p 443:443 -v ./Caddyfile:/etc/caddy/Caddyfile qrclip/cipherforge
```

Or with Docker Compose:

```bash
# Using docker-compose
docker-compose -f docker-compose-caddy.yaml up -d
```

## Caddyfile Configuration

You'll need to provide a Caddyfile with your domain configuration:

```
yourdomain.com {
    root * /srv
    file_server
    try_files {path} /index.html
    tls your@email.com
}
```

For local development or internal networks, you can use:

```
localhost {
    root * /srv
    file_server
    try_files {path} /index.html
}
```

## Alternative Deployment Options

While we officially support and recommend the Caddy version, the repository includes Dockerfiles for alternative setups if you prefer to build them yourself:
(credit to dangr)
- `Dockerfile.nginx.noSSL` - Basic Nginx without SSL
- `Dockerfile.nginx.selfsigned` - Nginx with self-signed certificates

### Building Alternative Images

```bash
# Nginx (no SSL)
docker build -f Dockerfile.nginx.noSSL -t cipherforge:nginx-nossl .

# Nginx (self-signed SSL)
docker build -f Dockerfile.nginx.selfsigned -t cipherforge:nginx-selfsigned .
```
These Nginx configurations were contributed by dangr, to whom we extend our thanks for expanding the deployment options.

## Why Caddy?

We chose Caddy as our primary deployment option because:

1. **Automatic HTTPS** - Caddy automatically obtains and renews SSL certificates
2. **Simple configuration** - Minimal configuration required
3. **Camera access** - Modern browsers require HTTPS for camera access

## Security Considerations

- CipherForge performs all encryption client-side
- No data ever leaves your browser
- HTTPS is required for camera access in modern browsers
