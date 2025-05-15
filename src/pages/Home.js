import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, Link, Text } from '@chakra-ui/react';
import toast from 'react-hot-toast';
import { v4 as uuid } from 'uuid';
// import EditorPage from './EditorPage';


const Home = () => {
  const navigate = useNavigate();
  const [roomID, setroomID] = useState('');
  const [username, setUsername] = useState('');

  function createNewRoom(event){
    event.preventDefault();             

    const id = uuid();
    console.log(id);
    setroomID(id);

    toast.success("New room created successfully!");
  }

  function joinRoom(){
    if (!roomID || !username){
      toast.error("Please fill in all the fields");
      return;
    }

    setUsername(username.trim());

    //redirect to editor page
    navigate(`/editor/${roomID}`, {
      state: { username: username }                 //used to pass data from one page to another (state property of react router navigate function)
    });
  }

  return (
    <Box
      display="flex"
      minHeight="100vh"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      px={{ base: 4, md: 6 }}
      bg="#040910"
      color="azure"
    >
      <Box
        w="100%"
        maxW="30rem"
        p={{ base: 6, md: 10 }}
        borderRadius="8px"
        bg="#0c1522"
        boxShadow="0px 0px 10px rgba(255, 255, 255, 0.5)"
      >
        <Box display="flex" maxWidth="30rem" width="100%" padding="10px"  borderRadius="8px" justifyContent="center" mb={6}>
          <img
            src="/CodeFusionIcon.png"
            alt="code-fusion-icon"
            style={{
              display: 'block', width: '250px', height: '250px' 
            }}
          />
        </Box>

        <form>
          <FormControl mb={4}>
            <FormLabel htmlFor="roomID" color="gray">
              Room ID
            </FormLabel>
            <Input
              id="roomID"
              name="roomID"
              value={roomID}
              onChange={(e) => setroomID(e.target.value)}
              variant="outline"
              placeholder="Enter Room ID"
            />
          </FormControl>

          <FormControl mb={4}>
            <FormLabel htmlFor="username" color="gray">
              Username
            </FormLabel>
            <Input
              id="username"
              name="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outline"
              placeholder="Enter your name"
            />
          </FormControl>

          <Button
            type="submit"
            onClick={joinRoom}
            w="100%"
            mt={2}
            bg="#3ABEF9"
            color="black"
            fontWeight="bold"
            borderRadius="25px"
            _hover={{ bg: '#2aaadf' }}
          >
            Join
          </Button>
        </form>

        <Text textAlign="center" mt={6} color="gray">
          Don't have an invite?
          <br />
          <Link
            as={RouterLink}
            onClick={createNewRoom}
            color="#3ABEF9"
            fontWeight="bold"
            _hover={{ color: '#2761b7' }}
            textDecoration="none"
          >
            Create new room
          </Link>
        </Text>
      </Box>
    </Box>
  );
}

export default Home;






//rafce - boilerplate for react arrow function component with export
//onChange={(e) => {setroomID(e.target.value)} - so that whenever a user types in the roomID, it will be updated in the state
//setroomID(id) in function createNewRoom(event) - to set the new unique roomID in the state