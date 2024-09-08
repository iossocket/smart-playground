const fs = require('fs');

fs.copyFile("./ignition/deployments/second-deployment/deployed_addresses.json", "./frontend/src/artifacts/deployed_addresses.json", (err) => {
  if (err) {
    console.log("Error Found:", err);
  }
});