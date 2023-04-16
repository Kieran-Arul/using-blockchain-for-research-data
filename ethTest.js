const { researchProjectsContract } = require("./contracts.js");

const address = '0xc5bDA996ac2D16eE24e0C9F69E44e12f79DDefF3';

researchProjectsContract.methods.addHash("123", "pop").send({ from: address })

    .on("receipt", receipt => {

        console.log("Hash set");

    })
    .on("error", err => {

        console.log(err);

    })

researchProjectsContract.methods.getHash("123").call((err, res) => {

    if (err) {
        console.log(err);
    }

    else {
        console.log(res);
    }

});


researchProjectsContract.methods.addParticipant("123", "ghi", true).send({ from: address })

    .on("receipt", receipt => {

        console.log("Participant added");

    })
    .on("error", err => {

        console.log(err);

    })

researchProjectsContract.methods.setSharingPreference("123", "abc", true).send({ from: address })

    .on("receipt", receipt => {

        console.log("Sharing preference changed");

    })
    .on("error", err => {

        console.log(err);

    })

researchProjectsContract.methods.isSharable("123").call((err, res) => {

    if (err) {
        console.log(err);
    }

    else {
        console.log(res);
    }

});
