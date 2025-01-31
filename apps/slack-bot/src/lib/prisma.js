import Prisma from "@prisma/client";
import metrics from "../metrics.js";

let prisma = new Prisma.PrismaClient().$extends({
  // extend prisma client
  // to send query metrics such as latency & failures
  query: {
    async $allOperations({ operation, model, args, query }) {
      const metricKey = `${operation}_${model}`;
      try {
        const start = performance.now();
        const queryResult = await query(args);
        const time = performance.now() - start;

        metrics.timing(metricKey, time);

        return queryResult;
      } catch (err) {
        metrics.increment(`errors.${metricKey}`, 1);
      }
      return;
    }
  }
});

export default prisma;
