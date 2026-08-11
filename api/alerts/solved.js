import { getPool } from '../lib/motherduck.js';

function send(res, status, body) {
	res.statusCode = status;
	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-store');
	res.end(JSON.stringify(body));
}

function readBody(req) {
	return new Promise((resolve, reject) => {
		const chunks = [];
		req.on('data', (chunk) => chunks.push(chunk));
		req.on('end', () => {
			try {
				const raw = Buffer.concat(chunks).toString('utf8');
				resolve(raw ? JSON.parse(raw) : {});
			} catch (err) {
				reject(err);
			}
		});
		req.on('error', reject);
	});
}

function truthy(value) {
	if (value === true || value === 1) return true;
	if (value === false || value === 0 || value == null) return false;
	const s = String(value).trim().toLowerCase();
	return s === 'true' || s === 't' || s === '1' || s === 'yes';
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 */
export default async function handler(req, res) {
	if (req.method === 'OPTIONS') {
		res.statusCode = 204;
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		res.end();
		return;
	}

	try {
		const pool = getPool();

		if (req.method === 'GET') {
			const url = new URL(req.url || '', 'http://localhost');
			const idsParam = url.searchParams.get('ids') || '';
			const ids = idsParam
				.split(',')
				.map((id) => id.trim())
				.filter(Boolean)
				.slice(0, 500);

			if (ids.length === 0) {
				return send(res, 400, { error: 'ids query param required (comma-separated alert_id values)' });
			}

			const { rows } = await pool.query(
				`SELECT CAST(alert_id AS VARCHAR) AS alert_id, COALESCE(solved, false) AS solved
				 FROM alerts
				 WHERE CAST(alert_id AS VARCHAR) IN (SELECT UNNEST($1::VARCHAR[]))`,
				[ids]
			);

			/** @type {Record<string, boolean>} */
			const solved = {};
			for (const row of rows) {
				solved[String(row.alert_id)] = truthy(row.solved);
			}

			return send(res, 200, { solved });
		}

		if (req.method === 'POST') {
			const body = await readBody(req);
			const solved = truthy(body.solved);
			const alertId = body.alert_id != null ? String(body.alert_id).trim() : '';

			if (alertId) {
				const result = await pool.query(
					`UPDATE alerts
					 SET solved = $1
					 WHERE alert_id::VARCHAR = $2`,
					[solved, alertId]
				);

				if ((result.rowCount ?? 0) === 0) {
					return send(res, 404, { error: 'Alert not found for alert_id', alert_id: alertId });
				}

				return send(res, 200, { ok: true, alert_id: alertId, solved });
			}

			const hubPartitionDate = body.hub_partition_date != null ? String(body.hub_partition_date) : '';
			const siteId = body.site_id != null ? String(body.site_id) : '';
			const scraper = body.scraper != null ? String(body.scraper) : '';
			const alertType = body.alert_type != null ? String(body.alert_type) : '';
			const checkName = body.check_name != null ? String(body.check_name) : '';
			const detail = body.detail != null ? String(body.detail) : '';
			const fileKey = body.file_key != null ? String(body.file_key) : null;

			if (!hubPartitionDate || !siteId || !scraper || !alertType) {
				return send(res, 400, {
					error: 'Provide alert_id, or hub_partition_date + site_id + scraper + alert_type (+ check_name/detail/file_key)'
				});
			}

			const result = await pool.query(
				`UPDATE alerts
				 SET solved = $1
				 WHERE hub_partition_date::VARCHAR = $2
				   AND site_id::VARCHAR = $3
				   AND scraper::VARCHAR = $4
				   AND alert_type::VARCHAR = $5
				   AND COALESCE(check_name::VARCHAR, '') = COALESCE($6, '')
				   AND COALESCE(detail::VARCHAR, '') = COALESCE($7, '')
				   AND COALESCE(file_key::VARCHAR, '') = COALESCE($8, '')`,
				[solved, hubPartitionDate, siteId, scraper, alertType, checkName, detail, fileKey ?? '']
			);

			if ((result.rowCount ?? 0) === 0) {
				return send(res, 404, { error: 'Alert not found for composite key' });
			}

			return send(res, 200, { ok: true, solved, updated: result.rowCount });
		}

		return send(res, 405, { error: 'Method not allowed' });
	} catch (err) {
		console.error('alerts/solved API error', err);
		return send(res, 500, {
			error: err instanceof Error ? err.message : 'Failed to update alert solved state'
		});
	}
}
