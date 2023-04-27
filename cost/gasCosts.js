const { addResearchParticipant, changeSharingPreference, addResearchHash } = require("../blockchainInterface.js");

const surveyId1 = "61667c81d0f6c5e6e5a20b5d";
const userId1 = "61440fa184c2977f8c23853b";
const hash1 = "e45d3e7f3a3c4666e78271c776d9a7b35c1b7e714c26f2e7a2378f546c6bca28";

const surveyId2 = "618d1dc08039ca08a5161fa1";
const userId2 = "61909ec95476c628bb9ef449";
const hash2 = "83787c5f7e2f45ed1d7fa1f87047e9f0d00e6a8899010ec697c50f93ab8f864a";

async function main() {

    await addResearchParticipant(surveyId1, userId1);
    console.log("\n")

    await changeSharingPreference(surveyId1, userId1, true);
    console.log("\n")

    await addResearchHash(surveyId1, hash1);
    console.log("\n")

    await addResearchParticipant(surveyId2, userId2);
    console.log("\n")

    await changeSharingPreference(surveyId2, userId2, true);
    console.log("\n")

    await addResearchHash(surveyId2, hash2);
    console.log("\n")
}

main()
    .then(() => console.log("Finished logging gas costs"))
    .catch(err => console.log(err));