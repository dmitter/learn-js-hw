export default function escapeHTML(str) {
  if (typeof(str) == 'string') {
    return str
      .replace(/&/g, '&')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '<')
      .replace(/>/g, '>');
  }
  return str;
}