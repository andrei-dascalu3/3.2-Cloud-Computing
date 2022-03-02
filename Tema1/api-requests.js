const http = require("http"),
  https = require("https"),
  fs = require("fs"),
  request = require("request"),
  axios = require("axios"),
  config = require("./config.json");
readline = require("readline");

let imgLink = "",
  imgName = "",
  memeName = "",
  quote = "",
  topText = "",
  bottomText = "",
  Stream = require("stream").Transform;

let startTime, endTime;

const displayHtml = (res, path) => {
  fs.readFile(path, "utf8", (err, data) => {
    if (err === null) {
      res.write(data);
    } else {
      res.writeHead(500, { "Content-Type": "text/html" });
    }
    return res.end();
  });
};

readLogfile = async () => {
  const logFs = fs.createReadStream(config.logFileName);
  const rl = readline.createInterface({
    input: logFs,
    crlfDelay: Infinity,
  });

  let imgLatList = [],
    quoteLatList = [],
    memePostLatList = [],
    memeGetLatList = [];

  for await (const line of rl) {
    elems = line.split(" : ");
    if (elems.includes(config.apis["image-generator"].baseUrl)) {
      imgLatList.push(Number(elems[4].split(" ")[0]));
    } else if (elems.includes(config.apis["quote-generator"].baseUrl)) {
      quoteLatList.push(Number(elems[4].split(" ")[0]));
    } else if (elems.includes(config.apis["meme-generator"].baseUrl)) {
      if (elems[2] === "GET") {
        memeGetLatList.push(Number(elems[4].split(" ")[0]));
      } else {
        memePostLatList.push(Number(elems[4].split(" ")[0]));
      }
    }
  }
  return [imgLatList, quoteLatList, memePostLatList, memeGetLatList];
};

const requestHandler = (req, res) => {
  const url = req.url;
  if (url === "/") {
    displayHtml(res, config.indexPath);
  }
  if (url === "/my-meme?") {
    getImage(res);
  }
  if (url === "/metrics?") {
    drawChart(res);
  }
  if (url === "/metrics/data") {
    readLogfile().then((data) => {
      res.write(JSON.stringify(data));
      res.end();
    });
  }
};
module.exports = { handler: requestHandler };

let getQuote = (res) => {
  let date_ob = new Date();
  startTime = performance.now();
  axios.get(config.apis["quote-generator"].baseUrl).then((r) => {
    endTime = performance.now();
    quote = r.data.content;
    console.log("Quote: " + quote);
    words = quote.split(" ");
    const half = Math.ceil(words.length / 2);
    topText = words.slice(0, half).join(" ");
    bottomText = words.slice(-half).join(" ");
    addLogRecord(
      date_ob.toLocaleString(),
      config.apis["quote-generator"].baseUrl,
      "GET",
      quote,
      endTime - startTime
    );
    getMeme(res);
  });
};

let getImage = (res) => {
  let apiUrl = config.apis["image-generator"].baseUrl;
  let date_ob = new Date();
  startTime = performance.now();
  axios.get(apiUrl).then((r) => {
    endTime = performance.now();
    imgLink = r.request.res.responseUrl;
    console.log(imgLink);
    imgName = "images/" + imgLink.split("hmac=")[1].replace("_", "-") + ".jpg";
    addLogRecord(
      date_ob.toLocaleString(),
      config.apis["image-generator"].baseUrl,
      "GET",
      imgLink,
      endTime - startTime
    );
    downloadImg(imgLink, imgName, res);
  });
};

let drawChart = (res) => {
  displayHtml(res, config.metricsPath);
};

let getMeme = (res) => {
  const options = {
    method: "GET",
    url: "https://ronreiter-meme-generator.p.rapidapi.com/meme",
    qs: {
      top: topText,
      bottom: bottomText,
      meme: memeName,
      font_size: "30",
      font: "Impact",
    },
    headers: {
      "x-rapidapi-host": "ronreiter-meme-generator.p.rapidapi.com",
      "x-rapidapi-key": config.apis["meme-generator"].apiKey,
      useQueryString: true,
    },
    encoding: null,
  };
  let date_ob = new Date();
  startTime = performance.now();
  request(options, (err, response, body) => {
    endTime = performance.now();
    if (err) {
      throw new Error(err);
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write(
      '<html><body><h2>Your meme</h2><img src="data:image/jpeg;base64,'
    );
    res.write(Buffer.from(body).toString("base64"));
    res.end('"/></body></html>');
    addLogRecord(
      date_ob.toLocaleString(),
      config.apis["meme-generator"].baseUrl,
      "GET",
      response.statusCode,
      endTime - startTime
    );
  });
};

let downloadImg = (url, filename, res) => {
  https
    .request(url, (r) => {
      let data = new Stream();
      r.on("data", (chunk) => {
        data.push(chunk);
      });

      r.on("end", () => {
        fs.writeFileSync(filename, data.read());
        uploadImg(filename, res);
      });
    })
    .end();
};

let uploadImg = (imgName, res) => {
  const options = {
    method: "POST",
    url: "https://ronreiter-meme-generator.p.rapidapi.com/images",
    headers: {
      "content-type":
        "multipart/form-data; boundary=---011000010111000001101001",
      "x-rapidapi-host": "ronreiter-meme-generator.p.rapidapi.com",
      "x-rapidapi-key": config.apis["meme-generator"].apiKey,
      useQueryString: true,
    },
    formData: {
      image: {
        value: fs.createReadStream(imgName),
        options: { filename: imgName, contentType: "application/octet-stream" },
      },
    },
  };
  let date_ob = new Date();
  startTime = performance.now();
  request(options, (err, body) => {
    endTime = performance.now();
    if (err) {
      throw new Error(err);
    }
    memeName = imgName.split("/")[1].split(".jpg")[0].replace("_", "-");
    console.log("Meme name: " + memeName);
    addLogRecord(
      date_ob.toLocaleString(),
      config.apis["meme-generator"].baseUrl,
      "POST",
      body.statusCode,
      endTime - startTime
    );
    getQuote(res);
  });
};

let addLogRecord = (start, req, method, res, lat) => {
  fs.open(config.logFileName, "r", function (err, fd) {
    if (err) {
      fs.writeFile(config.logFileName, config.logHeader, function (err) {
        if (err) {
          console.log(err);
        }
      });
    }
  });
  record =
    start + " : " + req + " : " + method + " : " + res + " : " + lat + " ms\n";
  fs.appendFile(config.logFileName, record, (err) => {
    if (err) throw err;
  });
};
