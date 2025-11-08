import * as fs from "fs";

function resolveRefs(originalObj, obj, currentPath = "") {
  if (typeof obj !== "object" || obj === null) {
    return obj;
  }

  if (obj.hasOwnProperty("$ref") && obj.$ref.includes("/properties/")) {
    const refPath = obj["$ref"].replace("#/", "").split("/");
    const value = refPath.reduce((acc, key) => acc[key], originalObj);
    return resolveRefs(originalObj, value, currentPath);
  }

  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      obj[i] = resolveRefs(originalObj, obj[i], currentPath + "/" + i);
    }
    return obj;
  }

  const result = {};
  for (let key in obj) {
    result[key] = resolveRefs(originalObj, obj[key], currentPath + "/" + key);
  }
  return result;
}

try {
  const data = fs.readFileSync("./src/specs/sor.json");
  const parsedData = JSON.parse(data);
  const spec = resolveRefs(parsedData, parsedData);
  fs.writeFileSync(
    "./src/specs/sor.updated.json",
    JSON.stringify(spec, null, 2)
  );
  console.log('✅ SOR spec preprocessed successfully');
} catch (error) {
  console.error('❌ Failed to preprocess SOR spec:', error.message);
  throw error;
}
