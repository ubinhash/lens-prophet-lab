task("registerC", "Registers the ExampleC contract for gasback")
    .addPositionalParam("contractAddress", "The address of the ExampleC contract to register")
    .setAction(async (taskArgs, hre) => {
        const { contractAddress } = taskArgs;

        const [address] = await hre.ethers.getSigners();

        const gasback = await hre.ethers.getContractAt("Gasback", 0xdF329d59bC797907703F7c198dDA2d770fC45034);

        const tx = await gasback.register(address, contractAddress);
        await tx.wait(1);

        console.log("ExampleC registered! Tx hash: ", tx.hash);
    });
