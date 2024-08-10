import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Box, Button } from '@chakra-ui/react';
import User from '../components/User';
import CodeEditor from '../components/Editor';
import toast from 'react-hot-toast';
import { initSocket } from '../socket';
import ACTIONS from '../Actions';
import { Socket } from 'socket.io-client';

const EditorPage = () => {
  const socketRef = useRef(null); //socket Initialization using socketRef
  const location = useLocation(); // current location RommId and username
  const reactNavigator = useNavigate();
  const [users, setUsers] = useState([]);
  const { roomID } = useParams();                            // or window.location.pathname.split('/').pop(); to get the room ID from the URL parameters
  const codeRef = useRef({ code: '', language: '' });
  const [language, setLanguage] = useState('Choose Language');
  // const [output, setOutput] = useState("");

  //useRef : when we want data at multiple render
  //useRef to store the socket connection instance, used to store data that will not trigger a re-render on change unlike useState

  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();                          //socketRef.current is the current value of the socketRef, initSocket is async hence await is used, returns a promise
      socketRef.current.on('connect_error', err => handleErrors(err)); //connect_error & failed are inbuilt events in socket.io
      socketRef.current.on('connect_failed', err => handleErrors(err));

      function handleErrors(err) {
        console.log('Socket error', err);
        toast.error('Could not connect to the server.');
        reactNavigator('/');
      }

      //send join event to server
      socketRef.current.emit(ACTIONS.JOIN, {
        roomID: roomID,
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
    console.log("heLLO")
    setLanguage(newLanguage);
    socketRef.current.emit(ACTIONS.LANGUAGE_CHANGE, {
      roomID: roomID,
      language: newLanguage,
    });
  };

  async function copyRoomID() {
    try {
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
      minHeight="100vh"
      backgroundColor="#040910"
      color="azure"
    >
      <Box
        width="16%"
        backgroundColor="#0c1522"
        boxShadow="0px 0px 10px 0px rgba(255, 255, 255, 0.5)"
        display="flex"
        flexDirection="column"
        justifyContent="flex-start"
        alignItems="flex-start"
        alignContent="flex-start"
        padding="15px"
      >
        <img
          src="/CodeFusionIcon.png"
          alt="icon"
          padding="20px"
          style={{ borderBottom: '2px solid #424242' }}
        />
        <br></br>

        {/* <Navbar /><br></br> // */}
        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Connected</h3>
        <br></br>

        <Box
          display="flex"
          flexDirection="column"
          flexWrap="wrap"
          gap="10px"
          flex="1"
          overflowY="auto"
        >
          {users.map(user => (
            <User key={user.socketID} username={user.username} />
          ))}
        </Box>

        <Button
          onClick={copyRoomID}
          marginTop="5px"
          width="100%"
          variant="solid"
          color="white" bg="#03AED2" 
        >
          Copy Room ID
        </Button>
        <br></br>
        <Button
          onClick={leaveRoom}
          marginTop="5px"
          width="100%"
          variant="solid"
          bg="#FF0000" color="white"
        >
          Leave Room
        </Button>
      </Box>

      <Box>
        <CodeEditor
          socketRef={socketRef}
          roomID={roomID}
          language={language}
          onCodeChange={code => {
            codeRef.current.code = code;
          }}
          onLanguageChange={handleLanguageChange}
        />
      </Box>
    </Box>
  );
};

export default EditorPage;
