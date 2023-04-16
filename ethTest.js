const { helloWorldContract, researchListContract } = require("./contracts.js");



const address = '0xc5bDA996ac2D16eE24e0C9F69E44e12f79DDefF3';

helloWorldContract.methods.hi().call((err, res) => {

    if (err) {
        console.log(err);
    }

    else {
        console.log(res);
    }

});

helloWorldContract.methods.setA(7).send({ from: address })

    .on("receipt", receipt => {

        console.log("Number set");

    })
    .on("error", err => {

        console.log(err);

    })

helloWorldContract.methods.getA().call((err, res) => {

    if (err) {
        console.log(err);
    }

    else {
        console.log(res);
    }

});