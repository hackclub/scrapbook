import * as dns from "node:dns";
import { BlockList, isIP } from "node:net";
import http from "node:http";
import https from "node:https";

const blocked = new BlockList();
for (const [network, prefix] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.88.99.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["168.63.129.16", 32],
  ["224.0.0.0", 3],
])
  blocked.addSubnet(network, prefix, "ipv4");
for (const [network, prefix] of [
  ["2001::", 23],
  ["2001:db8::", 32],
  ["2002::", 16],
  ["3fff::", 20],
])
  blocked.addSubnet(network, prefix, "ipv6");
const globalIPv6 = new BlockList();
globalIPv6.addSubnet("2000::", 3, "ipv6");

export function isPublicAddress(address) {
  const family = isIP(address);
  if (family === 4) return !blocked.check(address, "ipv4");
  return (
    family === 6 &&
    globalIPv6.check(address, "ipv6") &&
    !blocked.check(address, "ipv6")
  );
}

// Validate the actual socket lookup results rather than checking DNS and then
// letting fetch resolve again. This pins the connection against DNS rebinding.
export function publicLookup(hostname, options, callback) {
  dns.lookup(hostname, { all: true, verbatim: true }, (error, addresses) => {
    if (error) return callback(error);
    if (
      !addresses.length ||
      addresses.some(({ address }) => !isPublicAddress(address))
    ) {
      return callback(new Error("Non-public destination"));
    }
    if (options.all) return callback(null, addresses);
    const address = addresses.find(
      (item) => !options.family || item.family === options.family,
    );
    if (!address) return callback(new Error("No usable address"));
    callback(null, address.address, address.family);
  });
}

export async function publicFetch(value, maxBytes = 5 * 1024 * 1024) {
  const url = new URL(value);
  const hostname = url.hostname.replace(/^\[|\]$/g, "");
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.port ||
    (isIP(hostname) && !isPublicAddress(hostname))
  )
    throw new Error("Invalid public URL");

  return new Promise((resolve, reject) => {
    const transport = url.protocol === "https:" ? https : http;
    const request = transport.get(url, {
      lookup: publicLookup,
      agent: false,
      headers: { "Accept-Encoding": "identity" },
    });
    // Covers DNS, connection establishment and a slow or never-ending body.
    const timer = setTimeout(
      () => request.destroy(new Error("Preview timeout")),
      5000,
    );
    request.on("error", reject);
    request.on("close", () => clearTimeout(timer));
    request.on("response", (response) => {
      if (
        response.statusCode !== 200 ||
        Number(response.headers["content-length"]) > maxBytes ||
        (response.headers["content-encoding"] &&
          response.headers["content-encoding"] !== "identity")
      ) {
        request.destroy(new Error("Invalid preview response"));
        return;
      }
      const chunks = [];
      let size = 0;
      response.on("error", reject);
      response.on("data", (chunk) => {
        size += chunk.length;
        if (size > maxBytes) request.destroy(new Error("Preview too large"));
        else chunks.push(chunk);
      });
      response.on("end", () =>
        resolve(
          new Response(Buffer.concat(chunks), {
            headers: {
              "Content-Type":
                response.headers["content-type"] || "application/octet-stream",
            },
          }),
        ),
      );
    });
  });
}
