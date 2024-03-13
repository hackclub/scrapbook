import { PrismaClient } from '@prisma/client'
import metrics from '../metrics.js';

// Docs about instantiating `PrismaClient` with Next.js:
// https://pris.ly/d/help/next-js-best-practices

let prisma
function createInstrumentedPrismaClient() {
  return new PrismaClient().$extends({
    // extend prisma client
    // send query metrics and latency
    query: {
      async $allOperations({ operation, model, args, query }) {
        const metricKey = `${operation}_${model}`;
        try {
          const start = performance.now();
          const queryResult = await query(args);
          const time = performance.now() - start;

          // send timing metrics
          metrics.timing(metricKey, time);
          metrics.increment(`success.${metricKey}`, 1);

          return queryResult;
        } catch (err) {
          metrics.increment(`errors.${metricKey}`, 1);
        }
      }
    }
  })
}

if (process.env.NODE_ENV === 'production') {
  prisma = createInstrumentedPrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = createInstrumentedPrismaClient();
  }
  prisma = global.prisma
}

export default prisma
