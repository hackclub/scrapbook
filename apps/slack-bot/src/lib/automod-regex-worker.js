import { parentPort } from "node:worker_threads";

parentPort.on("message", ({ id, pattern, text }) => {
  try {
    parentPort.postMessage({
      id,
      matched: new RegExp(pattern, "iu").test(text),
    });
  } catch {
    parentPort.postMessage({ id, matched: false });
  }
});
