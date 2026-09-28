const SESSION_COOKIE = 'prepos_session=d0c5ba40acd88f9933f8170a63a6a5151c9ea492646ec6294c9b3359e072e4d8';
const BASE_URL = 'http://localhost:3002';

interface RouteMetric {
  route: string;
  status: number;
  timeMs: number;
  sizeBytes: number;
}

async function measureRoute(route: string, auth = true): Promise<RouteMetric> {
  const headers: Record<string, string> = {};
  if (auth) {
    headers['Cookie'] = SESSION_COOKIE;
  }
  
  const start = performance.now();
  const res = await fetch(`${BASE_URL}${route}`, { headers });
  const text = await res.text();
  const timeMs = performance.now() - start;

  return {
    route,
    status: res.status,
    timeMs,
    sizeBytes: Buffer.byteLength(text, 'utf8'),
  };
}

async function run() {
  console.log('Testing routes on ' + BASE_URL + '...');

  const routes = [
    { route: '/auth/sign-in', auth: false },
    { route: '/dashboard', auth: true },
    { route: '/dashboard/dsa', auth: true },
    { route: '/dashboard/core-cs', auth: true },
    { route: '/dashboard/companies', auth: true },
    { route: '/dashboard/revision', auth: true },
    { route: '/dashboard/profile', auth: true },
    { route: '/dashboard/dsa/problem/array-element-frequency-counter', auth: true },
  ];

  console.log('\n--- FIRST LOAD (Cold) ---');
  for (const item of routes) {
    const metric = await measureRoute(item.route, item.auth);
    console.log(`${metric.route.padEnd(60)} | Status: ${metric.status} | Time: ${metric.timeMs.toFixed(1)} ms | Size: ${(metric.sizeBytes / 1024).toFixed(1)} KB`);
  }

  console.log('\n--- SUBSEQUENT LOAD (Warm / Navigation) ---');
  for (const item of routes) {
    const metric = await measureRoute(item.route, item.auth);
    console.log(`${metric.route.padEnd(60)} | Status: ${metric.status} | Time: ${metric.timeMs.toFixed(1)} ms | Size: ${(metric.sizeBytes / 1024).toFixed(1)} KB`);
  }
}

run().catch(console.error);
