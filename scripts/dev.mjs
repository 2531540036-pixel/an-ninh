// Respect the host/port supplied by the managed preview launcher.
const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const hostIndex = args.indexOf("--host");
if (portIndex !== -1) {
  const port = Number(args[portIndex + 1]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Cổng khởi chạy không hợp lệ.");
  }
  process.env.PORT = String(port);
}
if (hostIndex !== -1) {
  const host = args[hostIndex + 1];
  if (!["127.0.0.1", "localhost", "0.0.0.0"].includes(host)) {
    throw new Error("Địa chỉ khởi chạy không hợp lệ.");
  }
  process.env.HOST = host;
}
await import("../server.mjs");
