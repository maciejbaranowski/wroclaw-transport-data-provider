const Axios = require("axios");
const htmlParser = require("node-html-parser");
const urllib = require("urllib");
const moment = require("moment");
moment.locale("pl");

const getBikeData = (stations) => {
  return new Promise((resolve, reject) => {
    const output = [];
    const apiCall = Axios.get("https://wroclawskirower.pl/mapa-stacji/", {});
    apiCall.then((response) => {
      const htmlDocument = htmlParser.parse(response.data);
      for (const station of stations) {
        const stationData = htmlDocument
          .querySelector(`.place-number-${station}`)
          .querySelectorAll("td");
        const name = stationData[1].rawText;
        const numberOfBikes = stationData[2].rawText;
        output.push({name, numberOfBikes});
      }
      resolve(output);
    }).catch(reject);
  });
};

const getMpkData = (posts) => {
  return new Promise((resolve, reject) => {
    const output = [];
    const numberOfCarsPerPost = 5;
    const queryMpkApi = (params) => {
      return urllib.request(`https://62.233.178.84:8088/mobile?${params}`, {
        digestAuth: `android-mpk:g5crehAfUCh4Wust`, //public credentials as used by official app
        rejectUnauthorized: false
      });
    };
    const apiCalls = Promise.all([
      queryMpkApi(`function=getPositions`),
      ...posts.map((post) => queryMpkApi(`function=getPostInfo&symbol=${post.id}`))
    ]);  
    apiCalls.then((responses) => {
      positions = JSON.parse(responses[0].data.toString());
      postInfos = responses.slice(1).map((response) => JSON.parse(response.data.toString()));
      for (const [postIndex, post] of postInfos.entries()) {
        const postOutput = {"name": posts[postIndex].name, "data": []}
        for (const course of post.slice(0, numberOfCarsPerPost)) {
          const position = positions.find((position) => position.course == course.c);
          const timetableTime = moment(course.t);
          const realTime = timetableTime;
          let delay = "brak danych";
          if (position) {
            const delayInSeconds = position.delay / 1000;
            realTime.add(delayInSeconds, 'seconds');
            if (delayInSeconds < 100) 
              delay = delayInSeconds + " sek";
            else
              delay = Math.floor(delayInSeconds / 60) + " min";
          }
          postOutput.data.push({
            line: course.l,
            timetableTime: timetableTime.format('LT'),
            delay: delay,
            realTime: realTime.format('LTS'),
            realTimeDiff: realTime.fromNow()
          })
        }
        output.push(postOutput);      
      }
      resolve(output);
    }).catch(reject);
  });
};

module.exports = {
     getBikeData,
     getMpkData
};
