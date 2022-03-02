const axios = require("axios"),
    async = require("async"),
    config = require("./config.json");

// no. of parallel requests
const reqCount = 4,
    batchCount = 5;

const task = () => {
    axios.get(config.appUrl);
};
const tasks = Array(reqCount).fill(task);
for(let i = 1; i <= batchCount; ++i){
    async.parallel(tasks);
}
