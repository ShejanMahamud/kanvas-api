# Express TypeScript Starter CLI 🚀

[![NPM Version](https://img.shields.io/npm/v/express-ts-starter-cli.svg)](https://www.npmjs.com/package/express-ts-starter-cli)

[![License](https://img.shields.io/npm/l/express-ts-starter-cli.svg)](https://github.com/shejanmahamud/express-ts-starter-cli/blob/main/LICENSE)

[![Downloads](https://img.shields.io/npm/dt/express-ts-starter-cli.svg)](https://www.npmjs.com/package/express-ts-starter-cli)

A powerful and easy-to-use CLI tool to kickstart your **Express.js + TypeScript + Mongoose(Default)** projects in seconds. Save time and focus on building amazing features without worrying about the boilerplate!

---

## ✨ Features

- **TypeScript Support**: Get started with a fully typed Express.js project.

- **Mongoose Integration**: Built-in support for MongoDB with Mongoose models.

- **Customizable Templates**: Generate projects tailored to your needs.

- **Zero Hassle**: Pre-configured with best practices like `eslint` and `prettier`.

- **Scalable Structure**: Designed for small to large projects.

- **Interactive CLI**: Guides you through the setup with a beautiful and intuitive interface.

---

## 🚀 Installation

Install the CLI globally via npm:

```bash

npm  install  -g  express-ts-starter-cli

```

or

```bash
npx express-ts-starter-cli

```

---

## 🛠️ Usage

Run the following command to create a new project:

```bash

express-ts-starter

```

The CLI will guide you through the setup with options like:

- Choosing a project name

- Setting up environment variables

---

## 🗂️ Project Structure

The generated project will have the following structure:

```

my-express-project/

├── src/
│ ├── app/
│   ├── app.ts
│   ├── server.ts
│ ├── middlewares/
| ├── controllers/
│ ├── routes/
│ ├── models/
│ ├── helpers/
│ ├── types/
│ ├── utils/
├── .prettierrc
├── .eslint.config.mjs
├── .env
├── package.json
└── tsconfig.json

```

### Key Features

- **Controllers**: Keep your logic modular and organized.

- **Models**: Keep your mongoose models here.

- **Helpers**: Keep your helpers function here.

- **Routes**: Define application endpoints cleanly.

- **Middleware**: Add custom Express middlewares effortlessly.

- **Types**: Keep your typescript types here.

- **Utils**: Keep your utility functions here.

---

## 📦 What’s Included?

When you use the CLI, you'll get:

- **TypeScript Config**: Pre-configured `tsconfig.json` for seamless development.

- **Express Setup**: Pre-configured `expressjs` .

- **Environment Management**: `.env` file support for configuration.

- **Mongoose Models**: Boilerplate for defining schemas and connecting to MongoDB.

---

## 🌟 Why Choose This Starter?

- **Time-Saving**: Set up your project in seconds.

- **Best Practices**: Industry-standard configurations for scalability and maintainability.

- **Community-Driven**: Actively maintained and improved.

- **MongoDB Ready**: Jumpstart your database integration with Mongoose.

---

## 🧪 Example

To test if everything is working, run the development server:

```bash

npm run dev

```

Open [http://localhost:3000](http://localhost:3000) in your browser. You’ll see a welcoming API response!

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Open issues for feature requests or bugs.

- Submit pull requests to improve the CLI.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).

---

## 🙋 Support

If you encounter any issues or have questions, feel free to open an issue on [GitHub](https://github.com/ShejanMahamud/express-ts-starter-cli/issues).

---

> Made with ❤️ by [Shejan Mahamud](https://github.com/ShejanMahamud).
