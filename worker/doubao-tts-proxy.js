const UPSTREAM = "https://openspeech.bytedance.com";
const DEFAULT_RESOURCE_ID = "seed-tts-2.0";

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const cors = corsHeaders(request, env);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "POST") {
      return json({ message: "Method not allowed" }, 405, cors);
    }

    const upstreamPath = routeToUpstream(requestUrl.pathname);
    if (!upstreamPath) {
      return json({ message: "Not found" }, 404, cors);
    }

    if (!isAllowedOrigin(request, env)) {
      return json({ message: "Origin is not allowed" }, 403, cors);
    }

    const appId = env.DOUBAO_APP_ID;
    const accessKey = env.DOUBAO_ACCESS_KEY;
    const resourceId = env.DOUBAO_RESOURCE_ID || DEFAULT_RESOURCE_ID;

    if (!appId || !accessKey) {
      return json(
        {
          message: "Proxy is missing DOUBAO_APP_ID or DOUBAO_ACCESS_KEY"
        },
        500,
        cors
      );
    }

    const body = await request.text();
    const upstreamResponse = await fetch(`${UPSTREAM}${upstreamPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Api-App-Id": appId,
        "X-Api-Access-Key": accessKey,
        "X-Api-Resource-Id": resourceId,
        "X-Api-Request-Id": crypto.randomUUID()
      },
      body
    });

    const responseHeaders = new Headers(cors);
    responseHeaders.set(
      "Content-Type",
      upstreamResponse.headers.get("Content-Type") || "application/json; charset=utf-8"
    );

    const logId = upstreamResponse.headers.get("X-Tt-Logid");
    if (logId) {
      responseHeaders.set("X-Tt-Logid", logId);
      responseHeaders.set("Access-Control-Expose-Headers", "X-Tt-Logid");
    }

    return new Response(await upstreamResponse.text(), {
      status: upstreamResponse.status,
      headers: responseHeaders
    });
  }
};

function routeToUpstream(pathname) {
  if (pathname === "/submit") {
    return "/api/v3/tts/submit";
  }

  if (pathname === "/query") {
    return "/api/v3/tts/query";
  }

  return "";
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin") || "*";
  const allowedOrigin = env.DOUBAO_ALLOWED_ORIGIN || origin;

  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin"
  };
}

function isAllowedOrigin(request, env) {
  if (!env.DOUBAO_ALLOWED_ORIGIN) {
    return true;
  }

  const origin = request.headers.get("Origin");
  return origin === env.DOUBAO_ALLOWED_ORIGIN;
}

function json(payload, status, headers) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}
