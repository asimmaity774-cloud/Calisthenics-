import * as fs from 'fs';

let dataContent = fs.readFileSync('src/data.ts', 'utf8');

dataContent = dataContent.replace(/\{\s*name:\s*"([^"]+)",\s*sets:([^}]+)\}/g, (match, name, rest) => {
    const safeName = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    const video_url = `https://example.com/video/${safeName}`;
    return `{ name: "${name}", sets:${rest.trimEnd().replace(/,$/, '')}, video_url: "${video_url}" }`;
});

fs.writeFileSync('src/data.ts', dataContent);
