/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Bun from "bun";
import Yahoo from "yahoo-finance2";

const y = new Yahoo();

function applyCors(res: Response) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  return res;
}

function startServer() {
  const production = Bun.env.BUN_PROD === "true";

  const server = Bun.serve({
    development: !production,
    routes: {
      "/api/us10y": {
        GET: async () => {
          const {
            regularMarketTime,
            regularMarketPrice,
            regularMarketPreviousClose,
          } = await y.quote("^TNX");

          const price = Number(
            regularMarketPrice ?? regularMarketPreviousClose,
          );
          const timestamp = Number(regularMarketTime);

          if (Number.isNaN(timestamp)) {
            return applyCors(
              Response.json(
                {
                  error: "response from Yahoo did not return a valid timestamp",
                },
                { status: 500 },
              ),
            );
          }
          if (Number.isNaN(price)) {
            return applyCors(
              Response.json({ error: "^TNX was not found" }, { status: 404 }),
            );
          }
          return applyCors(Response.json({ price, timestamp }));
        },
      },
    },
    hostname: "localhost",
    port: 3001,
  });

  console.info(`server is listening for connections on ${server.url}`);
}

startServer();
