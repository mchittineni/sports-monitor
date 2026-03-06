const fs = require('fs');
const path = require('path');

const terraformDir = path.resolve(__dirname, '..');
const modulesDir = path.join(terraformDir, 'modules');
const testsDir = path.join(terraformDir, 'tests');

function checkTestCoverage() {
  console.log('--- Terraform Module Test Coverage Check ---');

  if (!fs.existsSync(modulesDir)) {
    console.error(`Modules directory not found at ${modulesDir}`);
    return;
  }

  const modules = fs
    .readdirSync(modulesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  if (modules.length === 0) {
    console.log('No modules found to test.');
    return;
  }

  let missingTests = [];
  let foundTests = [];

  for (const mod of modules) {
    const expectedTestFile = path.join(testsDir, `${mod}.tftest.hcl`);
    if (fs.existsSync(expectedTestFile)) {
      foundTests.push(mod);
    } else {
      missingTests.push(mod);
    }
  }

  const coverage = (foundTests.length / modules.length) * 100;

  console.log(
    `\nCoverage: ${coverage.toFixed(2)}% (${foundTests.length}/${modules.length} modules have tests)`
  );

  console.log('\nVerified Modules:');
  foundTests.forEach((m) => console.log(`  ✅ ${m}`));

  if (missingTests.length > 0) {
    console.log('\nModules Missing Tests:');
    missingTests.forEach((m) => console.log(`  ❌ ${m}`));
    process.exit(1);
  } else {
    console.log('\nAll modules have associated .tftest.hcl files! 🎉');
    process.exit(0);
  }
}

checkTestCoverage();
