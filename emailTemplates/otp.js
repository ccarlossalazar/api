import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const templatePath = path.join(__dirname,'otp', 'otp_template.html');

function loadOtpTemplate(code) {
  const rawHtml = fs.readFileSync(templatePath, 'utf-8');
  return rawHtml.replace('{{CODE}}', code);
}

export default loadOtpTemplate;