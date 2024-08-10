import { LANGUAGE_VERSIONS } from "./components/Constants";

export const executeCode = async (language, sourceCode) => {
  const version = LANGUAGE_VERSIONS[language];
  const response = await fetch("https://emkc.org/api/v2/piston/execute", {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language: language,
      version: version,
      files: [
        {
          content: sourceCode,
          name: "main.txt" 
        },
      ]})
  });
  const data = await response.json();
  console.log(`response`, data);
  return data;
};