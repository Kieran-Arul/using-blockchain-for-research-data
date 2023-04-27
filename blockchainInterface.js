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

        await researchProjectsContract.methods.addParticipant(surveyId, userId, false).send({ from: address, gas: gasLimit })
            .on('receipt', receipt => {
                console.log("Participant added");
                console.log("Gas used to add research participant: " + receipt.gasUsed);
            })


    } catch (e) {
        console.log(e);
    }

}

async function changeSharingPreference(surveyId, userId, willShare) {

    try {

        await researchProjectsContract.methods.setSharingPreference(surveyId, userId, willShare).send({ from: address, gas: gasLimit })
            .on('receipt', receipt => {
                console.log("Data sharing reference changed");
                console.log("Gas used to add change sharing preference: " + receipt.gasUsed)
            })


    } catch (e) {
        console.log(e)
    }

}

async function addResearchHash(surveyId, hash) {

    try {

        await researchProjectsContract.methods.addHash(surveyId, hash).send({ from: address, gas: gasLimit })
            .on('receipt', receipt => {
                console.log("Hash set")
                console.log("Gas used to set hash: " + receipt.gasUsed)
            })

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

module.exports = {
    researchIsSharable,
    addResearchParticipant,
    changeSharingPreference,
    addResearchHash,
    getResearchHash
}
