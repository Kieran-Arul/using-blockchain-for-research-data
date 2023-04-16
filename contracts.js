const Web3 = require("web3");
const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:8545"));

const fs = require("fs");

const helloWorldRaw = fs.readFileSync("./build/contracts/HelloWorld.json");
const helloWorldParsed = JSON.parse(helloWorldRaw);
const helloWorldABI = helloWorldParsed.abi;

const researchListRaw = fs.readFileSync("./build/contracts/ResearchList.json");
const researchListParsed = JSON.parse(researchListRaw);
const researchListABI = researchListParsed.abi;

const helloWorldContract = new web3.eth.Contract(helloWorldABI, '0x2b3A0DC33aa501E1e3a0da9DC045A8BEAc6f2626');
const researchListContract = new web3.eth.Contract(researchListABI, '0x55762a9aE747Afd06FF3AC6225cc7F4D8eb73949');

module.exports = { helloWorldContract, researchListContract };