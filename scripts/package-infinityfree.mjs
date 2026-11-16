import { chmodSync, cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const dist = join(root, 'dist');
const source = join(root, 'hosting/infinityfree/htdocs');
const output = resolve(process.argv[2] || join(root, 'hosting/infinityfree/build/htdocs'));
if (!output.startsWith(join(root, 'hosting/infinityfree/build') + '/') && !output.startsWith('/tmp/anninh-')) throw new Error('Thư mục xuất không hợp lệ.');
rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });
cpSync(source, output, { recursive: true, filter: p => {
  const relative = p.slice(source.length + 1).replaceAll('\\', '/');
  return !relative.startsWith('_private/') || relative.endsWith('/.htaccess') || relative === '_private/uploads';
}});
for (const name of ['assets','fonts','company-images']) {
  rmSync(join(output, name), { recursive: true, force: true });
  cpSync(join(dist,name),join(output,name),{recursive:true});
}
cpSync(join(dist,'index.html'),join(output,'_app/template.html'));
function check(dir) {
  chmodSync(dir, 0o755);
  for (const name of readdirSync(dir)) {
    const path = join(dir,name);
    if (statSync(path).isDirectory()) check(path);
    else {
      chmodSync(path, 0o644);
      const size = statSync(path).size;
      const limit = name === '.htaccess' ? 10000 : /\.(?:php|html|js)$/i.test(name) ? 1000000 : 10000000;
      if (size > limit) throw new Error('Tệp vượt giới hạn InfinityFree: ' + path);
      if (name === 'config.php' || name === 'installed.lock') throw new Error('Không được đóng gói dữ liệu riêng tư.');
    }
  }
}
check(output);
const defaults = JSON.parse(readFileSync(join(output,'_app/defaults.json'),'utf8'));
if (!defaults.name || !defaults.about || !Object.hasOwn(defaults,'tagline')) throw new Error('Thiếu cấu hình công ty mặc định.');
console.log('Đã tạo bộ cài InfinityFree: ' + output);
