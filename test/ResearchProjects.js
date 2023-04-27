const { assert } = require("chai");
const crypto = require("crypto");

const ResearchProjects = artifacts.require("./ResearchProjects.sol");
contract('ResearchProjects',(accounts) => {

    describe('Deployment Suite', function () {

        it('should deploy successfully', async function () {

            const contract = await ResearchProjects.deployed();

            const contractAddress = await contract.address;

            assert.notEqual(contractAddress, null);
            assert.notEqual(contractAddress, '');
            assert.notEqual(contractAddress, undefined);

        });

    });

    describe('Hash Suite', function () {

        it('should successfully store and retrieve the same hash', async function () {

            const contract = await ResearchProjects.deployed();

            await contract.addHash("123", "c23628a16e2e1ed24d18ef98a734f98635771a40c5ee5d5c9f9d5e5ed5a5c5d5", {from: accounts[1]});
            await contract.addHash("456", "1b27e20dd92f8e9009dcfc6d54120eaa771fc6a8b7f1dcd1a6b96e6fa09077e9", {from: accounts[1]});
            await contract.addHash("789", "d7e101f6e8a7bfb1e5f5d5e1c5e5e5f9e5d5d5f5e5c5c5d5c5d5d5c5c5d5d5e5", {from: accounts[1]});

            const hash1 = await contract.getHash.call("123");
            const hash2 = await contract.getHash.call("456");
            const hash3 = await contract.getHash.call("789");

            assert.equal(hash1, "c23628a16e2e1ed24d18ef98a734f98635771a40c5ee5d5c9f9d5e5ed5a5c5d5");
            assert.equal(hash2, "1b27e20dd92f8e9009dcfc6d54120eaa771fc6a8b7f1dcd1a6b96e6fa09077e9");
            assert.equal(hash3, "d7e101f6e8a7bfb1e5f5d5e1c5e5e5f9e5d5d5f5e5c5c5d5c5d5d5c5c5d5d5e5");

        });

        it('should correctly identify no data tampering has taken place', async function () {

            const contract = await ResearchProjects.deployed();

            const data = {
                researcherEmail: "abc@email.com",
                title: "What is your hobby",
                responses: ["Football", "Tennis", "Reading"]
            };

            const dataAsJson = JSON.stringify(data);

            const calculatedHash = crypto.createHash("sha256").update(dataAsJson).digest("hex");

            await contract.addHash("9348", calculatedHash, {from: accounts[1]});

            const originalHash = await contract.getHash.call("9348");

            const newHash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");

            assert.equal(originalHash, newHash);

        });

        it('should correctly identify when data tampering has taken place', async function () {

            const contract = await ResearchProjects.deployed();

            const data = {
                researcherEmail: "abc@email.com",
                title: "What is your hobby",
                responses: ["Football", "Tennis", "Reading"]
            };

            const dataAsJson = JSON.stringify(data);

            const calculatedHash = crypto.createHash("sha256").update(dataAsJson).digest("hex");

            await contract.addHash("9193", calculatedHash, {from: accounts[1]});

            const originalHash = await contract.getHash.call("9193");

            data.responses[2] = "Football";

            const newHash = crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");

            assert.notEqual(originalHash, newHash);

        });

    });


    describe('Data Sharing Preferences Suite', function () {

        it('without any change in preferences, it should correctly identify when data should not be shared', async function () {

            const contract = await ResearchProjects.deployed();

            await contract.addParticipant("123", "aaa", false, {from: accounts[1]});
            await contract.addParticipant("123", "bbb", true, {from: accounts[1]});
            await contract.addParticipant("123", "ccc", true, {from: accounts[1]});

            await contract.addParticipant("456", "ddd", false, {from: accounts[1]});
            await contract.addParticipant("456", "eee", false, {from: accounts[1]});
            await contract.addParticipant("456", "fff", true, {from: accounts[1]});

            await contract.addParticipant("789", "ggg", false, {from: accounts[1]});
            await contract.addParticipant("789", "hhh", false, {from: accounts[1]});
            await contract.addParticipant("789", "iii", false, {from: accounts[1]});

            let isSharable123 = await contract.isSharable.call("123");
            let isSharable456 = await contract.isSharable.call("456");
            let isSharable789 = await contract.isSharable.call("789");

            assert.equal(isSharable123, false);
            assert.equal(isSharable456, false);
            assert.equal(isSharable789, false);

        });

        it('without any change in preferences, it should correctly identify when data can be shared', async function () {

            const contract = await ResearchProjects.deployed();

            await contract.addParticipant("7423847", "fhufu", true, {from: accounts[1]});
            await contract.addParticipant("7423847", "weuffh", true, {from: accounts[1]});
            await contract.addParticipant("7423847", "wijei", true, {from: accounts[1]});

            const isSharable = await contract.isSharable.call("7423847");

            assert.equal(isSharable, true);

        });

        it('after a change in preferences, it should correctly identify when data should not be shared', async function () {

            const contract = await ResearchProjects.deployed();

            await contract.addParticipant("eirier", "123", true, {from: accounts[1]});
            await contract.addParticipant("eirier", "456", true, {from: accounts[1]});
            await contract.addParticipant("eirier", "789", true, {from: accounts[1]});

            await contract.setSharingPreference("eirier", "456", false, {from: accounts[1]})

            const isSharable = await contract.isSharable.call("eirier");

            assert.equal(isSharable, false);

        });

        it('after a change in preferences, it should correctly identify when data can be shared', async function () {

            const contract = await ResearchProjects.deployed();

            await contract.addParticipant("fgfdg", "4234", false, {from: accounts[1]});
            await contract.addParticipant("fgfdg", "4555", true, {from: accounts[1]});
            await contract.addParticipant("fgfdg", "2344", true, {from: accounts[1]});

            await contract.setSharingPreference("fgfdg", "4234", true, {from: accounts[1]})

            const isSharable = await contract.isSharable.call("fgfdg");

            assert.equal(isSharable, true);

        });

    });

})
