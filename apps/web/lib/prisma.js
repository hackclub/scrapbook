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
        const start = performance.now();
        try {
          const queryResult = await query(args);
          const time = performance.now() - start;

          try {
            // send timing metrics
            metrics.timing(metricKey, time);
            metrics.increment(`success.${metricKey}`, 1);
          } catch (metricsErr) {
            console.error('Failed to record Prisma success metric', metricsErr);
          }

          return queryResult;
        } catch (err) {
          try {
            metrics.increment(`errors.${metricKey}`, 1);
          } catch (metricsErr) {
            console.error('Failed to record Prisma error metric', metricsErr);
          }
          throw err;
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
