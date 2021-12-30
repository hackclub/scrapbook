// Edit here: https://codepen.io/lachlanjc/pen/MWKpvZP?editors=0011
function displayScrapbookUsername(username, customDomain) {
  fetch('https://scrapbook.hackclub.com/api/users/' + username + "/").then(function (res) {
    return res.json();
  }).then(function (data) {
    return data.profile.streakCount;
  }).then(function (streak) {
    const href = customDomain || `https://scrapbook.hackclub.com/${username}`;
    document.body.insertAdjacentHTML('beforeend', "<a class=\"scrapbookButton\" href=\"".concat(href, "\">\uD83D\uDD25 ").concat(streak, "</a>\n<style>\n.scrapbookButton {\nposition: fixed; bottom: 24px; right: 24px; border-radius: 50%; height: 64px; width: 64px; font-size: 20px; font-weight: 600; color: #fff; font-family: system-ui, Roboto, Helvetica, sans-serif; line-height: 64px; background-color: #1f2d3d; text-align: center; text-decoration: none; transition: .125s background-color ease-in-out;\n}\n.scrapbookButton:hover, .scrapbookButton:focus { background-color: #f7ff00; color: #1d201d; }\n.scrapbookButton:focus { outline: none; box-shadow: 0 0 10px rgba(51, 142, 218, 1), 0 0 10px rgba(51, 142, 218,1); }\n</style>"));
  }).catch(function (error) {
    console.error(error);
  });
}
