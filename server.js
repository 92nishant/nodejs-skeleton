require(`dotenv-safe`).config();
const express = require(`express`);
const bodyParser = require(`body-parser`);
const morgan = require(`morgan`);
const compression = require(`compression`);
const helmet = require(`helmet`);
const cors = require(`cors`);
const passport = require(`passport`);
const app = express();
const i18n = require(`i18n`);
const initMongo = require(`./config/mongo`);
const path = require(`path`);
const fileUpload = require(`express-fileupload`);
const { Server } = require("socket.io");
// Setup express server port from ENV, default: 3000
app.set(`port`, process.env.PORT || 3000);

// Enable only in development HTTP request logger middleware
if (process.env.NODE_ENV === `development`) {
  app.use(morgan(`dev`));
}
app.use(morgan(`dev`));

global.appRoot = path.resolve(__dirname);
global.uploadDir = `uploads/`;
// Redis cache enabled by env variable
if (process.env.USE_REDIS === `true`) {
  const getExpeditiousCache = require(`express-expeditious`);
  const cache = getExpeditiousCache({
    namespace: `expresscache`,
    defaultTtl: `1 minute`,
    engine: require(`expeditious-engine-redis`)({
      redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      },
    }),
  });
  app.use(cache);
}

// for parsing json
app.use(
  bodyParser.json({
    limit: `20mb`,
  })
);
// for parsing application/x-www-form-urlencoded
app.use(
  bodyParser.urlencoded({
    limit: `20mb`,
    extended: true,
  })
);

// i18n
i18n.configure({
  locales: [`en`, `es`],
  directory: `${__dirname}/locales`,
  defaultLocale: `en`,
  objectNotation: true,
});
app.use(i18n.init);
app.use(fileUpload());
// Init all other stuff
app.use(cors());
app.use(passport.initialize());
app.use(compression());
app.use(helmet());
app.use(express.static(`public`));
app.set(`views`, path.join(__dirname, `views`));
app.engine(`html`, require(`ejs`).renderFile);
app.set(`view engine, html`);
app.use(require(`./app/routes`));

const server = app.listen(app.get("port"));
// Init MongoDB
initMongo();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
io.on(`connection`, (socket) => {
  console.log(`New Connection: ${socket.id}`);
  socket.on(`userAddedSuccess`, (data) => {
    socket.broadcast.emit(`userAdded`, data);
  });
});
module.exports = app; // for testing
