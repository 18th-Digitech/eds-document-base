export default async function decorate(block) {
  const row = block.children[0];
  const col = row.children[1];
  const path = col.children[0].textContent;
  const xfUrl = path;

  try {
    const resp = await fetch(xfUrl, { mode: 'cors' });
    if (resp.ok) {
      const html = await resp.text();
      block.innerHTML = html;
    } else {
      block.innerHTML = '<p>Unable to load experience fragment.</p>';
    }
  } catch (e) {
    console.error('Error loading XF:', e);
    block.innerHTML = '<p>Something went wrong.</p>';
  }
}
