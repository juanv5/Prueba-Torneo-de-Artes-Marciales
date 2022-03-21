/* eslint-disable no-empty */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
/* eslint-disable no-console */
/*
# MOCK SERVER
## features
- no tiene dependencias
- CORS configurado para aceptar todos los origenes
- auto scaneo de servicios creados
- responde archivos estaticos
- pensado para simular servicios JSON
- super ligero
- todo el codigo en un solo archivo
- configurable
crear directorios de la siguiente forma
## configuración
```
mock-server
    -> mock-server.js
    -> services (carpeta donde van los servicios)
        jwt.js
        user.js
        products.js
    -> static
        config.json // url: localhost:4000/static.config.json
```
### opciones de un servicio
- path: sera la URL con la que haga match
- method: metodo con el que se hara match
- response: funcion que retorna la respuesta sus parametros son:
    - req: request de http de nodejs
    - res: response de http de nodejs
    - querystring: objeto JSON de los parametros pasados en la URI
    - jsonData: sera el body que se envia como JSON
- response: lo que retorna la funcion sera:
    data: es lo que retornara el body como JSON
    status: es esta code HTTP que retornara el servicio
- delay: parametro opcional para hacer que un servicio especifico retorna con retraso la respuesta
*/

const http = require("http");
const url = require("url");
const fs = require("fs");
const path = require("path");

// DEFINE PORT TO MOCK SERVER
const PORT = 3000;
const DELAY_RESPONSE = 200;

const staticPath = path.join(__dirname, "static");
const normalizedPath = path.join(__dirname, "services");
const mimeDict = {
  json: "application/javascript",
  html: "text/html",
  txt: "text/plain",
  css: "text/css",
  js: "application/javascript",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  svg: "image/svg+xml",
  woff: "application/font-woff",
  woff2: "application/font-woff2",
  ttf: "application/font-sfnt",
  eot: "application/vnd.ms-fontobject",
  otf: "application/font-sfnt",
  mp4: "video/mp4",
  webm: "video/webm",
  mp3: "audio/mpeg",
  ogg: "audio/ogg",
  wav: "audio/wav",
  flac: "audio/flac",
  aac: "audio/aac",
  m4a: "audio/mp4",
  mp2: "audio/mpeg",
  m3u8: "application/x-mpegURL",
  m3u: "application/x-mpegURL",
  pls: "application/pls+xml",
  xml: "application/xml",
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  zip: "application/zip",
  rar: "application/x-rar-compressed",
  gz: "application/x-gzip",
  bz2: "application/x-bzip2",
  "7z": "application/x-7z-compressed",
  tar: "application/x-tar",
  m4v: "video/mp4",
  mov: "video/quicktime",
  avi: "video/x-msvideo",
  mkv: "video/x-matroska",
  mpeg: "video/mpeg",
  mpg: "video/mpeg",
  mpe: "video/mpeg",
  m2v: "video/mpeg",
};

// INIT

const init = () => {
  const templateServiceHelloWorld = `module.exports = () => ({
    path: '/hello-world/:id',
    method: 'GET',
    response: (req, res, querystring, data, params) => ({
        data: {
            id: params[0],
            message: 'Hello World',
        },
        status: 200,
    }),
    delay: 500,
});
`;
  const templateStaticHelloWorld = "Hello World";
  if (!fs.existsSync(normalizedPath)) {
    fs.mkdirSync(normalizedPath);
  }

  if (!fs.existsSync(staticPath)) {
    fs.mkdirSync(staticPath);
  }

  fs.writeFile(
    path.join(normalizedPath, "get_hello-world.js"),
    templateServiceHelloWorld,
    (err) => {
      if (err) throw err;
      console.log("Endpoint(GET) /hello-world created");
    }
  );

  fs.writeFile(
    path.join(staticPath, "hello-world.txt"),
    templateStaticHelloWorld,
    (err) => {
      if (err) throw err;
      console.log("File /static/hello-world.txt created");
    }
  );
};
init();

// API

const serviceDiscovery = (req, res, query) => {
  const services = [];
  fs.readdirSync(normalizedPath).forEach((file) => {
    services.push(require(`./services/${file}`)(req, res, query));
  });
  return services;
};

const findService = (serviceList, req, path, querystring, jsonData) => {
  let params = [];
  const activeService = serviceList
    .sort((a, b) => b.path.length - a.path.length)
    .find((s) => {
      const regex = new RegExp(`^${s.path.replace(/:[^\s/]+/g, "([\\w-]+)")}$`);
      const found = path.match(regex);

      if (found) {
        params = found.slice(1);
      }
      return found && s.method === req.method;
    });
  if (activeService) return { activeService, params };
  return { response: () => ({ message: "mock" }), status: 200 };
};

http
  .createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Credentials", true);
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET,HEAD,PUT,PATCH,POST,DELETE"
    );
    res.setHeader("Access-Control-Max-Age", 2592000);

    // OPTIONS return OK
    if (req.method === "OPTIONS") {
      res.end();
      return;
    }

    // favicon return OK
    if (req.url === "/favicon.ico") {
      res.end();
      return;
    }

    /* web server */
    if (req.url === "/index.html" || req.url === "/") {
      const index = fs.readFileSync("src/index.html");
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(index);
      return;
    }

    const urlParse = url.parse(req.url, true);

    // into src
    let validStaticUrl = false;
    let staticUrl = "";
    let dir = "";
    const arrayPath = urlParse.path.split("/").filter((e) => e !== "");
    if (arrayPath && arrayPath.length > 0) {
      validStaticUrl = true;
      staticUrl = urlParse.pathname;
      dir = path.join(__dirname, "src", staticUrl);
    }
    if (`${urlParse.pathname}`.startsWith("/assets")) {
      validStaticUrl = true;
      staticUrl = urlParse.pathname;
      dir = path.join(
        __dirname,
        "src",
        "assets",
        staticUrl.replace("/assets", "")
      );
    }
    if (validStaticUrl) {
      const ext = staticUrl.split(".").reverse()[0];
      const mime = mimeDict[ext] || "text/plain";

      console.log(dir);

      fs.readFile(dir, (err, contents) => {
        if (err) {
          res.statusCode = 404;
          res.end("Not File");
        } else {
          console.log(
            `code:${res.statusCode}     mime:${mime}    path:${staticUrl}`
          );
          // response image
          res.statusCode = 200;
          res.setHeader("Content-Type", mime);
          res.end(contents);
        }
      });
      return;
    }

    /* End Web Server */

    if (`${urlParse.pathname}`.startsWith("/static")) {
      const staticUrl = urlParse.pathname;
      const ext = staticUrl.split(".").reverse()[0];
      const mime = mimeDict[ext] || "text/plain";

      const dir = path.join(
        __dirname,
        "static",
        staticUrl.replace("/static", "")
      );
      fs.readFile(dir, "utf8", (err, contents) => {
        if (err) {
          res.statusCode = 404;
          res.end("Not File");
        } else {
          console.log(
            `code:${res.statusCode}     mime:${mime}    path:${staticUrl}`
          );
          res.statusCode = 200;
          res.setHeader("Content-Type", mime);
          res.end(contents);
        }
      });
      return;
    }

    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString(); // convert Buffer to string
    });
    req.on("end", () => {
      let jsonData = {};
      try {
        jsonData = JSON.parse(body);
      } catch (error) {}
      const querystring = urlParse.query;
      const route = findService(
        serviceDiscovery(),
        req,
        urlParse.pathname,
        querystring,
        jsonData
      );
      res.setHeader("Content-Type", "application/json");

      try {
        const routeResponse = route.activeService.response(
          req,
          res,
          querystring,
          jsonData,
          route.params
        );
        const response = JSON.stringify(routeResponse.data);
        res.statusCode = routeResponse.status;

        if (!res.statusCode) {
          res.statusCode = 500;
        }
        const delayResponse = route.delay || DELAY_RESPONSE;
        setTimeout(() => {
          console.log(
            `method:${req.method}  code:${res.statusCode}   delay:${delayResponse}   path:${urlParse.pathname}`
          );
          res.end(response);
        }, delayResponse);
      } catch (error) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "NOT_FOUND" }));
      }
    });
  })
  .listen(PORT, () => {
    console.log(`Mock server is running in port: ${PORT}`);
  });