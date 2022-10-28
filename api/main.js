export const config = {
  runtime: "experimental-edge",
};

/**
 * @param {Request} req
 * @returns {Promise<Response>}
 */
async function handler(req) {
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "public, no-transform, immutable, max-age=3600",
    "Content-Type": "text/plain",
  });

  const url = new URL(req.url).pathname;

  if (url === "/" || url === "") {
    return new Response(
      `ghlatest
Returns the latest version of a repo.

USAGE:

/user/repo --> v1.0.0
/user/repo/path/to/some/file --> https://raw.githubusercontent.com/user/repo/v1.0.0/install.sh
    `,
      { headers }
    );
  }

  if (!/^\/[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\/[a-zA-Z0-9_-]+/.test(url)) {
    return new Response("Invalid GitHub repo", { status: 400, headers });
  }

  try {
    const [user, repo, path = null] = url.slice(1).split("/", 3);

    const body = await fetch(
      `https://api.github.com/repos/${user}/${repo}/releases/latest`
    ).then((res) => res.json());

    if (!body.tag_name) {
      return new Response(
        "The repo doesn't exist, or it doesn't have any release",
        { status: 404, headers }
      );
    }

    if (path) {
      headers.set(
        "Location",
        `https://raw.githubusercontent.com/${user}/${repo}/${body.tag_name}/${path}`
      );
      return new Response(null, { status: 302, headers });
    } else {
      return new Response(body.tag_name, { headers });
    }
  } catch (error) {
    console.error(error);
    return new Response("Unexpected Error", { status: 500, headers });
  }
}

export default handler;
