export const getServiceInPascalCase = (service: string) => {
  const arr = service.split("-");
  const updatedArray = arr.map((item) => {
    let firstChar = item[0].toUpperCase();
    let restChar = item.slice(1);
    return firstChar + restChar;
  });
  return updatedArray.join("");
};

export const appBoilerplate = (service: string, port: number) => {
  return [
    `import dotenv from "dotenv"`,
    `dotenv.config()\n`,
    `import mongoose from "mongoose"`,
    `mongoose`,
    `\t.connect(process.env.DB!)`,
    `\t.then(() => console.log("${service} - DB Running"))`,
    `\t.catch(() => console.log("${service} - DB Failed"))\n`,
    `import express, { Request, Response } from "express"`,
    `import ${getServiceInPascalCase(service)}Router from "./${service}.router"`,
    `import morgan from "morgan"`,
    `import cors from "cors"`,
    `const app = express()\n`,
    `app.listen(process.env.PORT, () => {`,
    `\tconsole.log("${service} service running on - http://localhost:${port}/${service}")`,
    `})\n`,
    `app.use(express.json())`,
    `app.use(express.urlencoded({ extended: false }));`,
    `app.use(cors({ origin: process.env.CLIENT, credentials: true }))\n`,
    `app.use("/${service}", ${getServiceInPascalCase(service)}Router)`,
  ].join("\n");
};

export const routerBoilderplate = (service: string) => {
  return [
    `import { Router, Request, Response } from "express"`,
    `const ${getServiceInPascalCase(service)}Router = Router()\n`,
    `${getServiceInPascalCase(service)}Router.get("/", (req: Request, res: Response) => {`,
    `\tres.json({message: "Hello From ${service} service"})`,
    `})\n`,
    `export default ${getServiceInPascalCase(service)}Router`,
  ].join("\n");
};

export const interfaceBoilerplate = (service: string) => {
  const Provider = getServiceInPascalCase(service);
  return [
    `import { Document } from "mongoose"\n`,
    `export interface ${Provider}ModelInterface extends Document {\n`,
    `\t`,
    `}`,
  ].join("\n");
};

export const modelBoilerplate = (service: string) => {
  const Provider = getServiceInPascalCase(service);
  return [
    `import { Schema, model } from "mongoose"`,
    `import { ${Provider}ModelInterface } from "./${service}.interface"\n`,
    `const schema = new Schema<${Provider}ModelInterface>({\n`,
    `\t`,
    `}, {timestamps: true})\n`,
    `const ${Provider}Model = model<${Provider}ModelInterface>("${Provider}", schema)`,
    `export default ${Provider}Model`,
  ].join("\n");
};

export const packageBoilerPlate = (service: string) => {
  const data = {
    name: service,
    version: "1.0.0",
    main: "index.js",
    scripts: {
      test: 'echo "Error: no test specified" && exit 1',
      dev: "ts-node-dev --respawn --transpile-only src/app.ts",
      build: "tsc",
      start: "node dist/app.js",
    },
    keywords: [],
    author: "",
    license: "ISC",
    description: "",
    dependencies: {
      cors: "^2.8.6",
      dotenv: "^18.0.6",
      express: "^5.2.1",
      mongoose: "^9.11.1",
      morgan: "^1.12.1",
    },
    devDependencies: {
      "@types/cors": "^2.8.19",
      "@types/express": "^5.0.6",
      "@types/morgan": "^1.9.10",
      "@types/node": "^26.6.4",
      "ts-node-dev": "^2.0.0",
      typescript: "^5.9.3",
    },
  };

  return JSON.stringify(data, null, 2);
};

export const gatewayBoilerplate = (service: string, port: number) => {
  return [
    `\n\napp.use("/${service}",createProxyMiddleware({`,
    `\ttarget: "http://localhost:${port}/${service}",`,
    `\tchangeOrigin: true`,
    `}))`,
  ].join("\n");
};
