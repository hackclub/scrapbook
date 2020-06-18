var table = document.getElementById("leaderboard");
var table2 = document.getElementById("leaderboard2");
var table3 = document.getElementById("leaderboard3");
const url =
  'https://api2.hackclub.com/v0.1/Summer%20of%20Making%20Streaks/Slack%20Accounts?select={"maxRecords": 16,"fields":["Username","Streak Count"],"sort":[{"field": "Streak Count", "direction": "desc"}]}';
fetch(url)
  .then(resp => resp.json())
  .then(function(data) {
    var x = 0;
    for (i in data) {
      x++;
      console.log(x);
    }
    var rowNo = Math.round(x / 2);
    console.log(rowNo);
    for (i in data) {
      if (i <= rowNo - 1) {
        console.log(data[i]["fields"]);
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.style.borderRightWidth = "0px";
        cell1.innerHTML =
          '<a href ="https://scrapbook.hackclub.com/' +
          data[i]["fields"]["Username"] +
          '">' +
          "@" +
          data[i]["fields"]["Username"] +
          "</a>";
        cell2.innerHTML = "🔥 " + data[i]["fields"]["Streak Count"];
        cell2.style.borderLeftWidth = "0px";
      }
      if (i > rowNo - 1) {
        console.log(data[i]["fields"]);
        var row = table2.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        cell1.style.borderRightWidth = "0px";
        cell1.innerHTML =
          '<a href ="https://scrapbook.hackclub.com/' +
          data[i]["fields"]["Username"] +
          '">' +
          "@" +
          data[i]["fields"]["Username"] +
          "</a>";
        cell2.innerHTML = "🔥 " + data[i]["fields"]["Streak Count"];
        cell2.style.borderLeftWidth = "0px";
      }

      console.log(data[i]["fields"]);
      var row = table3.insertRow();
      var cell1 = row.insertCell(0);
      var cell2 = row.insertCell(1);
      cell1.style.borderRightWidth = "0px";
      cell1.innerHTML =
        '<a href ="https://scrapbook.hackclub.com/' +
        data[i]["fields"]["Username"] +
        '">' +
        "@" +
        data[i]["fields"]["Username"] +
        "</a>";
      cell2.innerHTML = "🔥 " + data[i]["fields"]["Streak Count"];
      cell2.style.borderLeftWidth = "0px";
    }
    console.log(data[0]);
  })

  .catch(function(error) {
    console.log(error);
  });

var table2 = document.getElementById("leaderboard2");
