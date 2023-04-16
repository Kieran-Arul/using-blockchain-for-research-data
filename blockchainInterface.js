const { researchProjectsContract } = require("./contracts.js");

const address = '0xc5bDA996ac2D16eE24e0C9F69E44e12f79DDefF3';
const gasLimit = 300000;

async function researchIsSharable(researchId) {

    try {

        return await researchProjectsContract.methods.isSharable(researchId).call();

    } catch (e) {

        console.log(e);
    }

}

async function addResearchParticipant(surveyId, userId) {

    try {

        await researchProjectsContract.methods.addParticipant(surveyId, userId, false).send({ from: address, gas: gasLimit });
        console.log("Participant added");

    } catch (e) {
        console.log(e);
    }

}

async function changeSharingPreference(surveyId, userId, willShare) {

    try {

        await researchProjectsContract.methods.setSharingPreference(surveyId, userId, willShare).send({ from: address, gas: gasLimit });
        console.log("Preference changed");

    } catch (e) {
        console.log(e)
    }

}

async function addResearchHash(surveyId, hash) {

    try {

        await researchProjectsContract.methods.addHash(surveyId, hash).send({ from: address, gas: gasLimit });
        console.log("Hash set");

    } catch (e) {
        console.log(e)
    }

}

async function getResearchHash(surveyId) {

    try {

        return await researchProjectsContract.methods.getHash(surveyId).call();

    } catch (e) {

        console.log(e)
    }

}

// async function main() {
//
//     await addResearchHash("123", "0x333");
//     await addResearchHash("456", "0x444");
//     await addResearchHash("789", "0x555");
//
//     const hash1 = await getResearchHash("123");
//     const hash2 = await getResearchHash("456");
//     const hash3 = await getResearchHash("789");
//
//     console.log("Hash 1: " + hash1);
//     console.log("Hash 2: " + hash2);
//     console.log("Hash 3: " + hash3);
//
//     await addResearchParticipant("123", "aaa");
//     await addResearchParticipant("123", "bbb");
//     await addResearchParticipant("123", "ccc");
//
//     await addResearchParticipant("456", "ddd");
//     await addResearchParticipant("456", "eee");
//     await addResearchParticipant("456", "fff");
//
//     let status123 = await researchIsSharable("123");
//     let status456 = await researchIsSharable("456");
//
//     console.log("Sharing Status 123: " + status123);
//     console.log("Sharing Status 456: " + status456);
//
//     await changeSharingPreference("123", "bbb", true);
//
//     status123 = await researchIsSharable("123");
//     console.log("Sharing Status 123: " + status123);
//
// }
//
// main().then(r => console.log("Completed"))

module.exports = {
    researchIsSharable,
    addResearchParticipant,
    changeSharingPreference,
    addResearchHash,
    getResearchHash
}
