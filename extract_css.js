const fs = require('fs');
const html = fs.readFileSync('d:/Pekerjaan/Freelance/pwa/WaBlaster/template-classic/index.html', 'utf8');
const m = html.match(/<style>([\s\S]*?)<\/style>/);
if (m) {
  let css = m[1].replace(/url\('assets\//g, "url('/template/wedding/assets/classic/");
  fs.writeFileSync('d:/Pekerjaan/Freelance/pwa/WaBlaster/src/template/wedding/classic-template.css', css, 'utf8');
  console.log('CSS extracted:', css.length, 'chars');
} else {
  console.log('No style found');
}
