import pg from 'pg';

const DATABASE = process.env.MOTHERDUCK_DATABASE || 'monitor_hub';
const HOST = process.env.MOTHERDUCK_HOST || 'pg.us-east-1-aws.motherduck.com';

/** @type {pg.Pool | null} */
let pool = null;

export function getPool() {
	const token = process.env.MOTHERDUCK_TOKEN;
	if (!token) {
		throw new Error('MOTHERDUCK_TOKEN is not configured');
	}

	if (!pool) {
		pool = new pg.Pool({
			host: HOST,
			port: 5432,
			user: 'postgres',
			password: token,
			database: DATABASE,
			ssl: { rejectUnauthorized: true },
			max: 4,
			connectionTimeoutMillis: 8_000,
			idleTimeoutMillis: 20_000,
			query_timeout: 30_000
		});

		pool.on('error', (err) => {
			console.error('MotherDuck pool error', err);
		});
	}

	return pool;
}

export { DATABASE };
