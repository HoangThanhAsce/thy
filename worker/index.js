// Cloudflare Worker in front of the static assets, only for audio files
// (see run_worker_first in wrangler.jsonc). Workers static assets ignore the
// Range header, but Safari on iOS needs 206 partial responses to play media.

export default {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 200) return response;
    const range = request.headers.get("Range");
    if (!range) return withAcceptRanges(response);
    return partial(response, range);
  },
};

function withAcceptRanges(response) {
  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  return new Response(response.body, { status: response.status, headers });
}

async function partial(response, range) {
  const body = await response.arrayBuffer();
  const size = body.byteLength;
  const match = /^bytes=(\d*)-(\d*)$/.exec(range.trim());
  if (!match || (match[1] === "" && match[2] === "")) {
    return withAcceptRanges(new Response(body, response));
  }

  let start;
  let end;
  if (match[1] === "") {
    // suffix range: the last N bytes
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  }

  const headers = new Headers(response.headers);
  headers.set("Accept-Ranges", "bytes");
  if (start >= size || start > end) {
    headers.set("Content-Range", `bytes */${size}`);
    headers.delete("Content-Length");
    return new Response(null, { status: 416, headers });
  }

  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));
  return new Response(body.slice(start, end + 1), { status: 206, headers });
}
