const { assert } = require("chai");

const ResearchProjects = artifacts.require("./ResearchProjects.sol");
contract('ResearchProjects',(accounts) => {

    describe('Deployment Suite', function () {

        it('should deploy successfully', async function () {

            const contract = await ResearchProjects.deployed();

            const contractAddress = await contract.address;

            assert.notEqual(contractAddress, '');
            assert.notEqual(contractAddress, undefined);
            assert.notEqual(contractAddress, null);
            assert.notEqual(contractAddress, '0x0')

        });

    });

    describe('Hash Suite', function () {

        it('should successfully store and retrieve the correct hash', async function () {

            const contract = await ResearchProjects.deployed();

            await contract.addHash("123", "ABC", {from: accounts[1]});
            await contract.addHash("456", "AFD", {from: accounts[1]});
            await contract.addHash("789", "B89D", {from: accounts[1]});
            await contract.addHash("838", "4CA7", {from: accounts[1]});

            const hash1 = await contract.getHash.call("123");
            const hash2 = await contract.getHash.call("456");
            const hash3 = await contract.getHash.call("789");
            const hash4 = await contract.getHash.call("838");

            assert.equal(hash1, "ABC");
            assert.equal(hash2, "AFD");
            assert.equal(hash3, "B89D");
            assert.equal(hash4, "4CA7");

        });

    });


    describe('Data Sharing Preferences Suite', function () {

        it('should correctly identify which surveys can be shared', async function () {

            const contract = await ResearchProjects.deployed();

            await contract.addParticipant("123", "aaa", false, {from: accounts[1]});
            await contract.addParticipant("123", "bbb", true, {from: accounts[1]});
            await contract.addParticipant("123", "ccc", true, {from: accounts[1]});

            await contract.addParticipant("456", "ddd", true, {from: accounts[1]});
            await contract.addParticipant("456", "eee", true, {from: accounts[1]});
            await contract.addParticipant("456", "fff", true, {from: accounts[1]});

            let isSharable123 = await contract.isSharable.call("123");
            let isSharable456 = await contract.isSharable.call("456");

            assert.equal(isSharable123, false);
            assert.equal(isSharable456, true);

        });

        it('should correctly identify which surveys can be shared after change in preference', async function () {

            const contract = await ResearchProjects.deployed();

            await contract.setSharingPreference("123", "aaa", true, {from: accounts[1]});
            await contract.setSharingPreference("456", "eee", false, {from: accounts[1]});

            const isSharable123 = await contract.isSharable.call("123");
            const isSharable456 = await contract.isSharable.call("456");

            assert.equal(isSharable123, true);
            assert.equal(isSharable456, false);

        });

    });

})
