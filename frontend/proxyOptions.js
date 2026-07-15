import path from 'path';
import fs from 'fs';

function getCommonSiteConfig() {
  let currentDir = path.resolve('.')
  // traverse up till we find frappe-bench with sites directory
  while (currentDir !== '/') {
    if (
      fs.existsSync(path.join(currentDir, 'sites')) &&
      fs.existsSync(path.join(currentDir, 'apps'))
    ) {
      let configPath = path.join(currentDir, 'sites', 'common_site_config.json')
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath))
      }
      return null
    }
    currentDir = path.resolve(currentDir, '..')
  }
  return null
}

const config = getCommonSiteConfig()
const webserver_port = Number(process.env.VITE_BACKEND_PORT ?? (config ? config.webserver_port : 8000))
const backendHost = process.env.VITE_BACKEND_HOST ?? '127.0.0.1'
const siteNameOverride = process.env.VITE_SITE_NAME
const backendUrl = `http://${backendHost}:${webserver_port}`
if (!config && !process.env.VITE_BACKEND_PORT) {
  console.log('No common_site_config.json or VITE_BACKEND_PORT found, using default port 8000')
}

export default {
	'^/(app|api|assets|files|private|socket.io)': {
		target: backendUrl,
		ws: true,
		changeOrigin: false,
		secure: false,
		headers: siteNameOverride ? { Host: siteNameOverride } : undefined,
		router: () => backendUrl
	}
};

