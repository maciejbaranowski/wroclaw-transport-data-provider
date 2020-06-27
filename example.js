const api = require("./index");

const config = {
  stations: [15121, 15153],
  posts: [
    {
      name: "Kleczkowska Tramwaj",
      id: 10606,
    },
    {
      name: "Kleczkowska Autobus",
      id: 10706,
    },
  ],
};

api.getBikeData(config.stations)
  .then(console.log)
  .catch(console.log);

api.getMpkData(config.posts)
  .then((postInfos) =>
    postInfos.forEach((postInfo) => {
      console.log(`Przystanek ${postInfo.name}`);
      postInfo.data.forEach((i) =>
        console.log(
          `Linia ${i.line}, rozkład: ${i.timetableTime}, opoznienie: ${i.delay}, czas rzeczywisty: ${i.realTime} (${i.realTimeDiff})`
        )
      );
    })
  )
  .catch(console.log);
