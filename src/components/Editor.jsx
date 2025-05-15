import { Box, VStack,Text,Button} from '@chakra-ui/react';
import { Editor } from "@monaco-editor/react";
import { useState, useEffect,useRef } from 'react';
import { CODE_SNIPPETS,EXTENSIONS } from './Constants';
import LanguageSelector from './LanguageSelector';
import ACTIONS from '../Actions';
import Output from '../components/Output';


const CodeEditor = ({socketRef, roomID, onCodeChange, onLanguageChange, typingUser, currentUsername}) => {
  const [value, setValue] = useState({});
  const [language, setLanguage] = useState("Choose Language");
  const editorRef = useRef(null);
  

  const handleEditorChange = (value) => {
    setValue(value);
    onCodeChange(value);
    if(socketRef.current){
      // console.log("working", value)
      socketRef.current.emit(ACTIONS.CODE_CHANGE, {  //it emits the event from C->S || S->C
        roomID: roomID,
        code: value,
      })
      // console.log("Typing event emitted");
      socketRef.current.emit('user-typing', {
        roomID:roomID,
        username: currentUsername,  // send correct username here
      });
    }
  }


  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    onLanguageChange(newLanguage);
    socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomID: roomID,
      language: newLanguage,
    });
  }
  
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const downloadCode = () => {
    if (!language || !value) return;

  const extension = EXTENSIONS[language] || "txt";
  const element = document.createElement("a");
  const file = new Blob([value], { type: "text/plain" });
  element.href = URL.createObjectURL(file);
  element.download = `code.${extension}`;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
  };

  useEffect(() => {
    setValue(CODE_SNIPPETS[language]);
  },[language]);

  //handle code change
  useEffect(()=>{
    if(socketRef.current){
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({code}) => {
        if(code !== value){
          setValue(code);
        }
      });
    }

    return () => {
      if (socketRef.current){
        socketRef.current.off(ACTIONS.CODE_CHANGE);
      }
    }
  }, [socketRef.current]);


  //handle language change
  useEffect(()=>{
    if(socketRef.current){
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({language}) => {
        setLanguage(language);
      });
    }

    return () => {
      if (socketRef.current){
        socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
      }
    }
  }, [socketRef.current]);

  return (
    <Box>
      <VStack
        backgroundColor={"#0c1522"}
        padding={{ base: 2, md: 4 }} // Padding adjusts based on screen size
        spacing={{ base: 4, md: 6 }} // Spacing between elements adjusts with screen size
      >
        {/* Language Selector */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          px="20px"
        >
          <Box display="flex" gap="10px" alignItems="center">
            <LanguageSelector language={language} onSelect={handleLanguageChange} />
            <Button onClick={downloadCode} bg="#22c55e" color="white" _hover={{ bg: "#16a34a" }}>
              Download Code
            </Button>
          </Box>
          {typingUser && (
            <Text fontSize="lg" color="gray.300" fontStyle="italic" marginRight={4} marginTop={2}>
              {typingUser} is typing...
            </Text>
          )}
          </Box>

        {/* Code Editor */}
        <Box
          height={{ base: "50vh", md: "67vh" }} // Adjusted height for smaller screens
          width="100%" // Make the editor take up full width
        >
          <Editor
            height="100%" // Takes full height of its container
            width="100%"  // Takes full width of its container
            theme="vs-dark"
            language={language}
            value={value}
            onMount={handleEditorDidMount}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              automaticLayout: true, // This helps the editor adjust to container size
            }}
          />
        </Box>

        {/* Output Section */}
        <Box
          height={{ base: "25vh", md: "20vh" }} // Adjust height for smaller screens
          width="100%" // Make the output take up full width
        >
          <Output sourceCode={value} language={language} />
        </Box>
      </VStack>
    </Box>
  )
}

export default CodeEditor;

