# Cipherforge · Secure Offline Data Storage

<p align="center">
<img src="https://www.qrclip.io/img/blog/034/000.webp" alt="Cipherforge Logo" width="50%">  <br>
  <strong>Robust encryption meets the simplicity of QR codes.</strong>
  <br>
  Transform and safeguard your data in offline QR codes for easy, secure retrieval.
  <br>
  <a href="https://cipherforge.com">cipherforge.com</a>
</p>

## Table of Contents
- [What Is Cipherforge?](#what-is-cipherforge)
- [Why Use Cipherforge?](#why-use-cipherforge)
- [Features](#features)
- [Screenshots](#screenshots)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Build & Run Locally](#build--run-locally)
  - [Building Web Workers](#building-web-workers)
- [Usage](#usage)
- [Common Use Cases](#common-use-cases)
- [Deployment](#deployment)
- [License](#license)
- [Contributing](#contributing)
- [Support & Contact](#support--contact)

## What Is Cipherforge?

Cipherforge is a practical solution for secure offline data storage, developed by QRClip. It combines robust encryption with the simplicity of QR codes, allowing you to:

- Encrypt text or small files
- Generate one or multiple QR codes representing the data
- Print those QR codes for offline, physical storage
- Decrypt your data locally, ensuring privacy and security

No continuous cloud support or external servers are required. This makes it perfect for passwords, 2FA tokens, crypto keys, or emergency backups.

To learn more about the technology and encryption methods behind Cipherforge, check out our detailed [Cipherforge Blog Post](https://www.qrclip.io/blog/cipherforge-encrypted-qr-code-data-storage-system).

You can also try the app directly at [cipherforge.com](https://cipherforge.com).

## Why Use Cipherforge?

In today's digital world, the security of sensitive data is crucial, yet often we overlook the need for physical, accessible backups. Cipherforge addresses this gap by:

- **Combining Digital & Physical Security**: Encrypted QR codes bridge the gap between digital encryption and tangible storage
- **Ensuring Data Availability**: Access your data even when digital systems fail or are compromised
- **Maintaining Privacy**: All encryption happens locally - your data never leaves your device
- **Providing Simplicity**: Complex security made accessible through an intuitive interface

## Features

- **Secure Encryption**: Utilizes XChaCha20-Poly1305 for robust data protection
- **Flexible Security Options**: Choose between password-only, key-only, or combined password & key methods
- **Offline by Design**: App runs locally, data never leaves your device
- **User-Friendly**: Simple interface for both encoding and decoding
- **Multiple QR Codes**: Automatically splits large data across multiple QR codes if needed
- **PDF Generation**: Export your codes in PDF form for easy printing
- **Open Source**: Contribute, audit, or build from source—transparency fosters trust

## Screenshots

<p align="center">
<img src="https://www.qrclip.io/img/blog/034/001.webp" alt="Cipherforge Decoding Screen" width="40%">  &nbsp; &nbsp;
 <img src="https://www.qrclip.io/img/blog/034/002.webp" alt="Cipherforge Encoding Screen" width="40%"></p>

## Getting Started

### Prerequisites

- Node.js (v16.14+ recommended) or an alternative environment (if applicable)
- npm or yarn (for installing dependencies)
- A modern browser for local usage (Chrome, Firefox, Safari, etc.)

### Installation

Clone the repository:
```bash
git clone https://github.com/qrclip/cipherforge.git
cd cipherforge
```

Install dependencies:
```bash
npm install
# or
yarn install
```

### Build & Run Locally

Development mode:
```bash
npm run start
```
Access the app locally at http://localhost:4200.

Production build:
```bash
npm run build
```
Note: After this command completes, you'll have a dist folder ready to deploy.

### Building Web Workers

Cipherforge uses two separate subprojects to handle intensive tasks in background threads:

- **cipherforge-crypto-worker** – Handles encryption and decryption logic
- **cipherforge-qr-read-worker** – Handles QR code encoding and decoding

Each subproject, when built, compiles a dedicated web worker and then copies the resulting bundle into the main app's assets folder. This allows the main Cipherforge application to seamlessly offload tasks to these workers without blocking the user interface.

#### Steps to Build

1. Navigate to the subproject folder (e.g., `cd cipherforge-crypto-worker`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build and copy to assets:
   ```bash
   npm run build2app
   ```
   This command compiles the web worker code and automatically places it into the main app's assets directory.

Repeat the same steps for `cipherforge-qr-read-worker` if you need to update or modify the QR code logic.

Note: The repository already includes pre-built worker files in assets. You only need to perform these build steps if you plan on modifying or updating the worker code.

## Usage

### Encoding Data

1. Open Cipherforge in your browser
2. Select "Encode" from the main menu
3. Enter text or upload a small file
4. Choose your encryption method:
  - Password-only: Set a strong password
  - Key-only: Generate a random encryption key
  - Both: Combine password and key for maximum security
5. Click "ENCODE" to generate your QR code(s)
6. Export as PDF or individual images
7. Print and store the codes in a secure physical location

### Decoding Data

1. Select "Decode" from the main menu
2. Either scan printed QR codes via camera or load image files
3. Enter the correct password/key to decrypt
4. View and save your retrieved data

For a detailed tutorial with screenshots and technical breakdown, check out our official [Cipherforge Blog Post](https://www.qrclip.io/blog/cipherforge-encrypted-qr-code-data-storage-system).

## Common Use Cases

Cipherforge is ideal for:

- **Password Managers**: Securely store master passwords or recovery codes
- **Cryptocurrency**: Backup wallet seeds and private keys
- **Two-Factor Authentication**: Store recovery codes for 2FA/MFA services
- **Emergency Information**: Store critical personal or medical data
- **Sensitive Documents**: Backup small confidential files
- **Legal Documents**: Secure storage of wills, contracts, or deeds

## Deployment

CipherForge is available as a Docker image with Caddy server for automatic SSL:

```bash
# Pull and run the official image
docker run -p 80:80 -p 443:443 -v ./Caddyfile:/etc/caddy/Caddyfile qrclip/cipherforge
```

Or use Docker Compose:

```bash
# Using the pre-built image
docker-compose -f docker-compose-caddy.yaml up -d
```

For detailed deployment instructions and alternative options, see [DEPLOYMENT.md](DEPLOYMENT.md).

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

For major changes, please open an issue first to discuss what you would like to change.

## Support & Contact

- Official Website: [QRClip.io](https://QRClip.io)
- Blog & Updates: [QRClip Blog](https://qrclip.io/blog)
- Email: hello@qrclip.io

If you encounter any issues, feel free to [open an issue](https://github.com/qrclip/cipherforge/issues) or reach out via email. We appreciate your feedback!

---

Thanks for visiting and happy encrypting!
