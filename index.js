const Axios = require("axios");
const htmlParser = require("node-html-parser");
const urllib = require("urllib");

const config = {
  stations: [15121, 15153],
  posts: [
    {
      name: "Kleczkowska T",
      id: 10606,
    },
    {
      name: "Kleczkowska A",
      id: 10706,
    },
  ]
};

const getBikeData = (stations) => {
  const apiCall = Axios.get("https://wroclawskirower.pl/mapa-stacji/", {});
  apiCall.then((response) => {
    const htmlDocument = htmlParser.parse(response.data);
    for (const station of config.stations) {
      const stationData = htmlDocument
        .querySelector(`.place-number-${station}`)
        .querySelectorAll("td");
      const name = stationData[1].rawText;
      const numberOfBikes = stationData[2].rawText;
      console.log(`${name}: ${numberOfBikes}`);
    }
  });
};

const getMpkData = (posts) => {
  const queryMpkApi = (params) => {
    return urllib.request(`https://62.233.178.84:8088/mobile?${params}`, {
      digestAuth: `android-mpk:g5crehAfUCh4Wust`,
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
    for (const post of postInfos) {
      for (const course of post) {
        const position = positions.find((position) => position?.course === course.c);

        console.log(`Linia ${course.l}, rozkład: ${course.t}, opoznienie: ${position.delay}`)
      }      
    }
  });
};

getBikeData(config.stations);
getMpkData(config.posts);


// module.exports = {
//     getBikeData,
//     getMpkData
// }
