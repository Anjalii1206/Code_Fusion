import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Button ,Text} from '@chakra-ui/react';
import User from '../components/User';
import CodeEditor from '../components/Editor';
import toast from 'react-hot-toast';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';

const EditorPage = () => {
  const socketRef = useRef(null);                                      //socket Initialization using socketRef
  const location = useLocation();                                      // current location RommId and username
  const reactNavigator = useNavigate();
  const [users, setUsers] = useState([]);
  const { roomID } = useParams();                                      // or window.location.pathname.split('/').pop(); to get the room ID from the URL parameters
  const codeRef = useRef({ code: '', language: '' });
  const [language, setLanguage] = useState('Choose Language');
  const [typingUser, setTypingUser] = useState("");
  // const [output, setOutput] = useState("");

  //useRef : when we want data at multiple render
  //useRef to store the socket connection instance, used to store data that will not trigger a re-render on change unlike useState

  useEffect(() => {
    console.log("Editor page")
    const init = async () => {
      socketRef.current = await initSocket();                          //socketRef.current is the current value of the socketRef, initSocket is async hence await is used, returns a promise
      
      socketRef.current.on('connect_error', err => handleErrors(err)); //connect_error & failed are inbuilt events in socket.io
      socketRef.current.on('connect_failed', err => handleErrors(err));

     
      socketRef.current.on('user-typing', ({ username }) => {
        setTypingUser(username);
        const timeout = setTimeout(() => setTypingUser(null), 2000);
        return () => clearTimeout(timeout);
      });
      function handleErrors(err) {
        console.log('Socket error', err);
        toast.error('Could not connect to the server.');
        reactNavigator('/');
      }

      //send join event to server
      socketRef.current.emit(ACTIONS.JOIN, {
        roomID,
        username: location.state?.username,
      });
      //console.log('userlist', users);

      //listen to joined event
      socketRef.current.on(ACTIONS.JOINED, ({ users, username, socketID }) => {
        if (username && username !== location.state.username) {
          toast.success(`${username} has joined the room.`);
        }
        setUsers(users); //updating the users state with the users received from the server
        //console.log('Updated users', users);

        socketRef.current.emit(ACTIONS.SYNC_CODE, {
          code: codeRef.current.code,
          socketID,
        });

        // socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
        //   language: codeRef.current.language,
        //   socketID,
        // })
      });

      //listen to language change event
      socketRef.current.on(ACTIONS.LANGUAGE_CHANGE, ({ language }) => {
        setLanguage(language);
        if (codeRef.current) {
          codeRef.current.language = language;
        }
        console.log('Language changed to', language);
      });

      // Listen for output changes from the server
      //   socketRef.current.on(ACTIONS.OUTPUT_CHANGE, ({ output }) => {
      //     setOutput(output);
      // });

      //listen to disconnected event
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ username }) => {
        if (username && username !== location.state.username) {
          toast.success(`${username} has left the room.`);
        }
        setUsers((prevUsers) =>
          prevUsers.filter((user) => user.socketID !== socketRef.current.id)
        );
      });
    };

    init();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.LANGUAGE_CHANGE);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, []); //empty array ensures that useEffect is called only once
  
  const handleLanguageChange = newLanguage => {
    //console.log("heLLO")
    setLanguage(newLanguage);
    socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomID,
      language: newLanguage,
    });
  };

  const handleTyping = () => {
    socketRef.current.emit('user-typing', { roomID, username: location.state?.username });
  };
  
  
  async function copyRoomID() {
    try {
      console.log(roomID)
      await navigator.clipboard.writeText(roomID);
      toast.success('Room ID has been copied to clipboard.');
    } catch (err) {
      toast.err('Could not copy room ID to clipboard.');
    }
  }

  const leaveRoom = () => {
    socketRef.current.emit(ACTIONS.DISCONNECTED, {
      username: location.state.username,
      socketID: socketRef.current.id,
    });
    socketRef.current.disconnect();
    reactNavigator('/');
  };



  if (!location.state) {
    reactNavigator('/');
  }

  return (
  <Box
  display="flex"
  flexDirection={{ base: "column", md: "row" }}
  backgroundColor="#040910"
  color="azure"
  height="100vh" overflow="hidden"
>


  {/* Sidebar */}
  <Box
    width={{ base: "100%", md: "50%", lg: "18%" }}
    backgroundColor="#0c1522"
    boxShadow="0px 0px 10px 0px rgba(255, 255, 255, 0.5)"
    display="flex"
    flexDirection="column"
    justifyContent="flex-start"
    alignItems="flex-start"
    padding="15px"
  >
    <Box
  width="100%"
  borderBottom="2px solid #424242"
  paddingBottom={{ base: "5px", md: "5px" }} // Adjust padding for different screen sizes
  marginBottom={{ base: "10px", md: "10px" }} // Adjust margin for different screen sizes
  display="flex"
  justifyContent="center" // Center the image horizontally
>
  <img
    src="/CodeFusionIcon.png"
    alt="icon"
    width={{ base: "60px", md: "70px" }} // Make the image smaller on smaller screens
  />
</Box>

    <Text fontSize="1.1rem" fontWeight="bold" mb="2">
      Connected
    </Text>

    <Box
      display="flex"
      flexDirection="column"
      gap="10px"
      flex="1"
      overflowY="auto"
      width="100%"
    >
      {users.map(user => (
        <User key={user.socketID} username={user.username} />
      ))}
    </Box>

    <Button
      onClick={copyRoomID}
      mt="5px"
      width="100%"
      variant="solid"
      color="white"
      bg="#03AED2"
    >
      Copy Room ID
    </Button>

    <Button
      onClick={leaveRoom}
      mt="5px"
      width="100%"
      variant="solid"
      bg="#FF0000"
      color="white"
    >
      Leave Room
    </Button>
  </Box>

  {/* Editor Section */}
  <Box
        flex="1"
        width="100%"
        minHeight={{ base: "60vh", md: "100vh" }}
        overflow="hidden"
        
      >
      
        <CodeEditor
          socketRef={socketRef}
          roomID={roomID}
          language={language}
          onCodeChange={code => {
            codeRef.current.code = code;
            // Emit typing event when code changes
          }}
          onLanguageChange={handleLanguageChange}
          typingUser={typingUser}
  currentUsername={location.state?.username}
        />
        
      </Box>
</Box>

  );
};

export default EditorPage;
