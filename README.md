# Descubre Qamarero

Descubre Qamarero is an interactive commercial guide for Qamarero clients. It presents the platform modules, product videos, demos, pricing information, and plan-based views from a single static HTML deployment.

## Technologies Used

- HTML5
- CSS3
- Vanilla JavaScript
- Static MP4 video assets
- Vercel static hosting

## Installation

Clone the repository and open the project folder:

```bash
git clone https://github.com/pauladearmas/descubre-qamarero.git
cd descubre-qamarero
```

No build step or external dependencies are required.

## Local Development

Run a local static server:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Plan Filtering

The guide supports client-specific plan views through URL parameters:

- `?plan=basic` — Basic only
- `?plan=control` — Basic + Control
- `?plan=delivery` — Basic + Delivery
- `?plan=growth` — Basic + Growth
- `?plan=full` — Full guide
- No parameter or invalid values — Full guide

## Deployment

This project is ready to deploy as a static site on Vercel. The production project name is:

```text
descubre-qamarero
```

Expected production URL:

```text
https://descubre-qamarero.vercel.app
```

## Project Structure

```text
.
├── index.html
├── assets/
│   ├── app.js
│   ├── styles.css
│   └── image assets
├── videos/
│   └── product videos
├── docs/
│   └── validation and audit notes
├── README.md
├── LICENSE
├── .gitignore
└── vercel.json
```

## License

Copyright © Qamarero. All rights reserved. See `LICENSE` for details.
