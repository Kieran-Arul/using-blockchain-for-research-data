const { helloWorldContract, researchProjectsContract } = require("./contracts.js");

const address = '0xc5bDA996ac2D16eE24e0C9F69E44e12f79DDefF3';

// helloWorldContract.methods.hi().call((err, res) => {
//
//     if (err) {
//         console.log(err);
//     }
//
//     else {
//         console.log(res);
//     }
//
// });

// helloWorldContract.methods.setA(52).send({ from: address })
//
//     .on("receipt", receipt => {
//
//         console.log("Number set");
//
//     })
//     .on("error", err => {
//
//         console.log(err);
//
//     })

// helloWorldContract.methods.getA().call((err, res) => {
//
//     if (err) {
//         console.log(err);
//     }
//
//     else {
//         console.log(res);
//     }
//
// });

// researchProjectsContract.methods.addHash("123", "abc").send({ from: address })
//
//     .on("receipt", receipt => {
//
//         console.log("Hash set");
//
//     })
//     .on("error", err => {
//
//         console.log(err);
//
//     })

// researchProjectsContract.methods.getHash("123").call((err, res) => {
//
//     if (err) {
//         console.log(err);
//     }
//
//     else {
//         console.log(res);
//     }
//
// });

// researchProjectsContract.methods.setSharingPreference("qqq", false).send({ from: address })
//
//     .on("receipt", receipt => {
//
//         console.log("Participant added");
//
//     })
//     .on("error", err => {
//
//         console.log(err);
//
//     })

researchProjectsContract.methods.getSharingPreference("qqq").call((err, res) => {

    if (err) {
        console.log(err);
    }

    else {
        console.log(res);
    }

});
