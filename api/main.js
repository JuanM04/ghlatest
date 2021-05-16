const fetch = require("node-fetch");

const welcomeMessage = `ghlatest
Returns the latest version of a repo.

USAGE:

/user/repo --> v1.0.0
/user/repo/path/to/some/file --> https://raw.githubusercontent.com/user/repo/v1.0.0/install.sh
`;

module.exports = async ({ url }, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Cache-Control",
    "public, no-transform, immutable, max-age=3600"
  );

  if (url === "/" || url === "") {
    res.setHeader("Content-Type", "text/plain");
    res.send(welcomeMessage);
    return;
  }

  if (!/^\/[a-zA-Z0-9]+(-[a-zA-Z0-9]+)*\/[a-zA-Z0-9_-]+/.test(url)) {
    res.status(400).send("Invalid GitHub repo");
    return;
  }

  try {
    const [user, repo, path = null] = url.substr(1).split("/", 3);

    const body = await fetch(
      `https://api.github.com/repos/${user}/${repo}/releases/latest`
    ).then((res) => res.json());

    if (!body.tag_name) throw new Error();

    if (path) {
      res.redirect(
        `https://raw.githubusercontent.com/${user}/${repo}/${body.tag_name}/${path}`
      );
    } else {
      res.send(body.tag_name);
    }
  } catch (error) {
    res.status(500).send("Error");
  }
};
