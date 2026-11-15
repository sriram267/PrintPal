export async function onRequest(context) {
  const url = new URL(context.request.url);
  const targetUrl = `https://printpal-api.onrender.com${url.pathname}${url.search}`;
  
  // Forward request with all headers, method, and body
  const newRequest = new Request(targetUrl, {
    method: context.request.method,
    headers: context.request.headers,
    body: context.request.body,
    redirect: "follow",
    duplex: "half"
  });

  return fetch(newRequest);
}
