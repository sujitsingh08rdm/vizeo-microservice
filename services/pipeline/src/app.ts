#!/usr/bin/env node
import dotenv from "dotenv";
dotenv.config();
import chalk from "chalk";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import {
  appBoilerplate,
  gatewayBoilerplate,
  interfaceBoilerplate,
  modelBoilerplate,
  packageBoilerPlate,
  routerBoilderplate,
} from "./util/boilerplate";
import { promisify } from "util";
import { pathToFileURL } from "url";
const log = console.log;

const Exec = promisify(exec);

const validateService = (service: string) => {
  if (!service || service.length === 0) {
    throw new Error("Service name is required");
  }
  const regex = /^[a-zA-Z0-9-]+$/;
  const isValid = regex.test(service);
  if (!isValid) {
    throw new Error("Space or any Symbols not allowed, Please Try Again");
  }

  return service.toLowerCase();
};

const exitApp = (msg: string | null = null) => {
  const message = chalk.bgRedBright.black.bold(msg ? msg : " 👋  Good buy ! ");
  log(message);
  process.exit(0);
};

const makeFolder = (path: string) => {
  const isExist = fs.existsSync(path);
  if (isExist) {
    throw new Error(` ${path.split("\\").pop()} service already exists ! `);
  }
  fs.mkdirSync(path);
};

const copyFiles = (files: string[], inputPath: string, outputPath: string) => {
  files.forEach((file) => {
    fs.copyFileSync(
      path.join(`${inputPath}`, file),
      path.join(`${outputPath}`, file),
    );
  });
};

const getBoilerplate = (file: string, service: string) => {
  if (file === ".router.ts") {
    return routerBoilderplate(service);
  }
  if (file === ".interface.ts") {
    return interfaceBoilerplate(service);
  }
  if (file === ".model.ts") {
    return modelBoilerplate(service);
  }
  return "";
};

const createFiles = (files: string[], service: string, srcPath: string) => {
  files.forEach((file) => {
    const filename = `${service}${file}`;
    const filepath = path.join(srcPath, filename);
    fs.writeFileSync(filepath, getBoilerplate(file, service));
  });
};

const updateLastPort = (pipelinePath: string, newPort: number) => {
  const envFilePath = path.join(pipelinePath, ".env");
  const envData = fs.readFileSync(envFilePath, "utf-8");

  const updated = envData.replace(
    /LAST_PORT\s*=\s*\d+/,
    `LAST_PORT = ${newPort}`,
  );

  fs.writeFileSync(envFilePath, updated);
};

const createEnvForNewService = (
  pipelinePath: string,
  servicePath: string,
  newPort: number,
) => {
  const pipelineEnvPath = path.join(pipelinePath, ".env");
  const newEnvPath = path.join(servicePath, ".env");
  const envData = fs.readFileSync(pipelineEnvPath, "utf-8");
  const stringChangedAfterPort = envData.replace(
    /PORT\s*=\s*\d+/,
    `PORT = ${newPort}`,
  );

  const arr = stringChangedAfterPort.split("\n");
  const modifiedData = arr
    .map((item) => {
      if (item.startsWith("LAST_PORT")) {
        return null;
      }
      if (item.startsWith("SERVER")) {
        return `SERVER = http://localhost:${newPort}\r`;
      }
      return item;
    })
    .filter(Boolean);

  const finalData = modifiedData.join("\n");
  fs.writeFileSync(newEnvPath, finalData);
};

const createDockerfileForNewService = (
  pipelinePath: string,
  servicePath: string,
  newPort: number,
) => {
  const pipelineDockerfilePath = path.join(pipelinePath, "Dockerfile");
  const newDockerfilePath = path.join(servicePath, "Dockerfile");
  const DockerfileData = fs.readFileSync(pipelineDockerfilePath, "utf-8");
  const replacedWithDocker = DockerfileData.replace(
    /EXPOSE\s*\d+/,
    `EXPOSE ${newPort}`,
  );

  fs.writeFileSync(newDockerfilePath, replacedWithDocker);
};

const createPackageForNewService = (service: string, servicePath: string) => {
  const data = packageBoilerPlate(service);
  const newPackagePath = path.join(servicePath, "package.json");
  fs.writeFileSync(newPackagePath, data);
};

const getNewPort = (pipelinePath: string) => {
  const envPath = path.join(pipelinePath, ".env");
  const envData = fs.readFileSync(envPath, "utf-8");
  const arr = envData.split("\n");
  const lastPortLine = arr.find((line) => {
    return line.trimStart().startsWith("LAST_PORT");
  });
  const regExpForPortValue = /LAST_PORT\s*=\s*(\d+)/;
  const lastPort = parseInt(
    lastPortLine?.match(regExpForPortValue)?.[1] as string,
  );
  const newPort = lastPort + 1;
  return newPort;
};

const addGateway = (
  gatewayPath: string,
  serviceName: string,
  newPort: number,
) => {
  const data = gatewayBoilerplate(serviceName, newPort);
  const input = path.join(gatewayPath, "src", "app.ts");
  fs.appendFileSync(input, data);
};

const addServer = async (gatewayPath: string, serviceName: string) => {
  const main = path.resolve(gatewayPath, "../../");

  const inputPath = path.join(main, "src", "servers.json");

  const { default: servers } = await import(pathToFileURL(inputPath).href, {
    with: { type: "json" },
  });
  servers.push(serviceName);
  fs.writeFileSync(inputPath, JSON.stringify(servers, null, 2));
};

const app = async () => {
  try {
    const welcomeMessage = chalk.bgMagenta.whiteBright.bold(
      "\n--- ✨ Welcome Team! ✨ ---\n",
    );
    log(welcomeMessage);

    const { service } = await inquirer.prompt({
      type: "input",
      name: "service",
      message: chalk.blue("Enter Service Name || to exit App write :q\n"),
    });
    if (service === ":q") {
      exitApp();
    }

    if (service === "pipeline") {
      exitApp(" 🙅  Pipeline word is reserved, Please use different name. 🙅 ");
    }

    const serviceName = validateService(service);
    const currentDir = path.join(process.cwd(), "services"); 
    const appPath = __dirname;
    const rootPath = currentDir;
    const pipelinePath = path.resolve(appPath, "../");
    const gatewayPath = path.join(currentDir, "gateway");
    const servicePath = path.join(rootPath, serviceName);
    const srcPath = path.join(servicePath, "src");
    const appFilePath = path.join(srcPath, "app.ts");

    const filesListForCopy = ["tsconfig.json"];

    const filesListForCreate = [
      ".controller.ts",
      ".service.ts",
      ".model.ts",
      ".interface.ts",
      ".enum.ts",
      ".middleware.ts",
      ".dto.ts",
      ".router.ts",
    ];

    // service folder
    makeFolder(servicePath);

    // src folder inside service
    makeFolder(srcPath);

    // change last port in pipeline
    const newPort = getNewPort(pipelinePath);

    // creating app.ts
    fs.writeFileSync(
      appFilePath,
      appBoilerplate(serviceName, newPort),
      "utf-8",
    );

    updateLastPort(pipelinePath, newPort);

    // Create ENV for new service
    createEnvForNewService(pipelinePath, servicePath, newPort);

    // Create Dockerfile for new service
    createDockerfileForNewService(pipelinePath, servicePath, newPort);

    // Create package for new service
    createPackageForNewService(service, servicePath);

    // copy all required files for typescript
    copyFiles(filesListForCopy, pipelinePath, servicePath);

    // creating required files for start coding
    createFiles(filesListForCreate, serviceName, srcPath);

    // Adding gateway
    addGateway(gatewayPath, serviceName, newPort);

    // adding server
    await addServer(gatewayPath, serviceName);

    log(
      chalk.bgGreen.black.bold(" 🚀 Installing Depedencies.. Please wait ✋ "),
    );
    await Exec("npm install", { cwd: servicePath });
    log(
      chalk.bgYellow.black.bold(
        `\n SUCCESS - ${serviceName} created successfully!`,
      ),
    );
    log(
      chalk.bgBlue.white.bold(
        "Browser to service folder and run 'npm run dev'",
      ),
    );
    exitApp();
  } catch (error) {
    if (error instanceof Error) {
      log(chalk.bgRed.white.bold(` ✖️  Error - ${error.message} `));
    }
    app();
  }
};

app();
