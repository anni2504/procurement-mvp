const filters = { page: 2, limit: 10, search: "" };
const params = new URLSearchParams();
Object.entries(filters).forEach(([k, v]) => {
  if (v !== undefined && v !== null && v !== '') params.set(k, String(v))
})
console.log("QS:", params.toString())
