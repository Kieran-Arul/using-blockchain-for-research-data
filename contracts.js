const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

const fs = require("fs");

const helloWorldRaw = fs.readFileSync("./build/contracts/HelloWorld.json");
const helloWorldParsed = JSON.parse(helloWorldRaw);
const helloWorldABI = helloWorldParsed.abi;

const researchProjectsRaw = fs.readFileSync("./build/contracts/ResearchProjects.json");
const researchProjectsParsed = JSON.parse(researchProjectsRaw);
const researchProjectsABI = researchProjectsParsed.abi;

const helloWorldContract = new web3.eth.Contract(helloWorldABI, '0x2b3A0DC33aa501E1e3a0da9DC045A8BEAc6f2626');
const researchProjectsContract = new web3.eth.Contract(researchProjectsABI, '0x3f832FfDF8a7548A1bec52B801BD44e240f95FF1');

module.exports = { helloWorldContract, researchProjectsContract };